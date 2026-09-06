require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const supabase = require('./supabaseClient');
const { allActivities, tecnologiaActivities, sharedProfile, klassenConfig, schoolYears, subjects, levels } = require('./data');
const { kmkTrainingQuestions } = require('./kmk_training_questions');
const { part2Competencies } = require('./training_competencies');
const defaultAgentTools = require('./default_agent_tools');
const { generateInstrumentAI, getAIStatus } = require('./services/ai_service');
const instrumentStore = require('./services/instrument_store');
const fsp = fs.promises;

// ─── Helper: timeout guard for async ops (evita que Supabase cuelgue la petición) ───
// Lanza si `promise` no resuelve dentro de `ms` ms. Úsese con try/catch.
function withTimeout(promise, ms, label = 'operación') {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout (${ms}ms) en ${label}`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ─── Helper: escrituras JSON atómicas y serializadas por archivo ───
// - No bloquean el event loop (fs.promises en vez de writeFileSync).
// - Atómicas: escribe a *.tmp y renombra (evita archivos a medias / corruptos).
// - Serializadas por ruta: cierra la race read-modify-write entre peticiones.
const _fileQueues = new Map();
function _enqueue(filePath, task) {
    const prev = _fileQueues.get(filePath) || Promise.resolve();
    const next = prev.catch(() => {}).then(task);
    _fileQueues.set(filePath, next);
    // Limpia la cola cuando se vacía para no retener referencias.
    next.finally(() => { if (_fileQueues.get(filePath) === next) _fileQueues.delete(filePath); });
    return next;
}
async function _writeJsonAtomic(filePath, dataObj) {
    const tmp = `${filePath}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(dataObj, null, 2), 'utf8');
    await fsp.rename(tmp, filePath);
}

const pendingTeachersFile = path.join(__dirname, 'data', 'pending_teachers.json');
if (!fs.existsSync(pendingTeachersFile)) {
    if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
    fs.writeFileSync(pendingTeachersFile, JSON.stringify([]));
}

const teacherRolesFile = path.join(__dirname, 'data', 'teacher_roles.json');
if (!fs.existsSync(teacherRolesFile)) {
    if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
    fs.writeFileSync(teacherRolesFile, JSON.stringify({}));
}

const localCacheFile = path.join(__dirname, 'data', 'local_activity_responses.json');
if (!fs.existsSync(localCacheFile)) {
    if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
    fs.writeFileSync(localCacheFile, JSON.stringify({}), 'utf8');
}

function readLocalCache() {
    try {
        if (fs.existsSync(localCacheFile)) {
            return JSON.parse(fs.readFileSync(localCacheFile, 'utf8'));
        }
    } catch (e) {
        // JSON corrupto: NO devolver {} para que luego se sobrescriba a ciegas.
        // Preservamos una copia para recuperación manual y registramos el fallo.
        console.error('Error reading local cache (¿corrupto?):', e.message);
        try {
            const bak = `${localCacheFile}.corrupt-${Date.now()}.bak`;
            fs.copyFileSync(localCacheFile, bak);
            console.error('Copia del cache corrupto guardada en:', bak);
        } catch (copyErr) {
            console.error('No se pudo respaldar el cache corrupto:', copyErr.message);
        }
    }
    return {};
}

// Escritura serializada y atómica (no bloquea el event loop).
function writeLocalCache(cache) {
    return _enqueue(localCacheFile, () => _writeJsonAtomic(localCacheFile, cache))
        .catch(e => console.error('Error writing local cache:', e.message));
}

// Read-modify-write serializado: lee el cache MÁS RECIENTE dentro de la cola
// y escribe atómicamente, evitando que peticiones concurrentes se pisen.
function updateLocalCache(mutator) {
    return _enqueue(localCacheFile, async () => {
        const cache = readLocalCache();
        await mutator(cache);
        await _writeJsonAtomic(localCacheFile, cache);
    });
}

const challengeToolsFile = path.join(__dirname, 'data', 'challenge_tools_config.json');
if (!fs.existsSync(challengeToolsFile)) {
    if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
    fs.writeFileSync(challengeToolsFile, JSON.stringify({}));
}

function readChallengeToolsConfig() {
    try {
        if (fs.existsSync(challengeToolsFile)) {
            return JSON.parse(fs.readFileSync(challengeToolsFile, 'utf8'));
        }
    } catch (e) {
        console.error('Error reading challenge tools config:', e);
    }
    return {};
}

function writeChallengeToolsConfig(config) {
    return _enqueue(challengeToolsFile, () => _writeJsonAtomic(challengeToolsFile, config))
        .catch(e => console.error('Error writing challenge tools config:', e.message));
}

// Helper: detect level from student class_name (e.g. "4D" -> "4", default "1")
function getStudentLevel(className) {
    if (!className) return '1';
    const match = className.match(/\d+/);
    return match ? match[0] : '1';
}

function getActivitiesForClass(activities, className) {
    if (!activities) return [];
    const grade = parseInt(getStudentLevel(className), 10);
    return activities.map(act => {
        const cloned = { ...act };
        const evidenceKey = `evidence_k${grade}`;
        if (cloned[evidenceKey]) {
            cloned.evidence = cloned[evidenceKey];
        } else if (grade >= 12 && cloned.evidence_k12) {
            cloned.evidence = cloned.evidence_k12;
        } else if (grade <= 2 && cloned.evidence_k2) {
            cloned.evidence = cloned.evidence_k2;
        }
        return cloned;
    });
}

function getActivityForClass(activity, className) {
    if (!activity) return null;
    return getActivitiesForClass([activity], className)[0];
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// ─── Middleware: attach student info to every request ───
app.use(async (req, res, next) => {
    res.locals.student = null;
    const studentId = req.cookies.student_id;
    if (studentId && supabase) {
        try {
            // Parallel fetch of student and profile response (avatar).
            // withTimeout evita que una llamada lenta/caída a Supabase cuelgue
            // TODA la petición (incluido /api/save) -> causa raíz del "se queda guardando".
            const [studentRes, profileRes] = await withTimeout(Promise.all([
                supabase.from('students').select('*').eq('id', studentId).single(),
                supabase.from('activity_responses').select('data').eq('student_id', studentId).eq('activity_id', 'profile').maybeSingle()
            ]), 4000, 'middleware student fetch');
            if (studentRes.data && !studentRes.error) {
                const student = studentRes.data;
                if (profileRes.data && profileRes.data.data && profileRes.data.data.profile_photo) {
                    student.profile_photo = profileRes.data.data.profile_photo;
                }
                res.locals.student = student;
            }
        } catch (e) {
            // Timeout o error de Supabase: NO colgar la petición. Continuar con el
            // fallback de cookie para que el alumno pueda seguir guardando localmente.
            console.error('Middleware student fetch falló, usando fallback de cookie:', e.message);
            try {
                const cookieData = JSON.parse(req.cookies.student_data || '{}');
                if (cookieData.id) res.locals.student = cookieData;
            } catch (_) { /* ignore */ }
        }
    } else if (studentId) {
        try {
            const cookieData = JSON.parse(req.cookies.student_data || '{}');
            if (cookieData.id) {
                res.locals.student = cookieData;
            }
        } catch (e) { /* ignore */ }
    }

    // Try loading avatar from local cache if student is active but profile_photo is not set
    if (res.locals.student && !res.locals.student.profile_photo && studentId) {
        try {
            const cache = readLocalCache();
            if (cache[studentId] && cache[studentId]['profile'] && cache[studentId]['profile'].data && cache[studentId]['profile'].data.profile_photo) {
                res.locals.student.profile_photo = cache[studentId]['profile'].data.profile_photo;
            }
        } catch (e) { /* ignore */ }
    }
    next();
});

// ─── Auth guard middleware ───
function requireLogin(req, res, next) {
    if (!res.locals.student) return res.redirect('/login');
    next();
}

// ─── Admin guard middleware ───
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'medienpass2526';
function requireAdmin(req, res, next) {
    if (req.cookies.admin_auth === 'true') return next();
    return res.redirect('/admin/login');
}

// ─── Any Login guard middleware (for Docs/Manuals) ───
function requireAnyLogin(req, res, next) {
    if (req.cookies.teacher_auth === 'true') {
        try {
            if (req.cookies.teacher_data) {
                const t = JSON.parse(req.cookies.teacher_data);
                const rolesPath = path.join(__dirname, 'data', 'teacher_roles.json');
                if (fs.existsSync(rolesPath)) {
                    const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
                    t.role = roles[(t.email || '').toLowerCase()] || t.role || 'profesor';
                } else {
                    t.role = t.role || 'profesor';
                }
                res.locals.teacher = t;
            } else {
                res.locals.teacher = { username: 'Docente', role: 'profesor' };
            }
        } catch (e) { res.locals.teacher = { username: 'Docente', role: 'profesor' }; }
    }

    if (req.cookies.admin_auth === 'true') {
        res.locals.userRole = 'admin';
        if (req.cookies.admin_user && !res.locals.teacher) {
            try { res.locals.teacher = JSON.parse(req.cookies.admin_user); } catch(e){}
        }
        return next();
    }
    if (req.cookies.teacher_auth === 'true') {
        res.locals.userRole = 'teacher';
        return next();
    }
    if (res.locals.student) {
        res.locals.userRole = 'student';
        return next();
    }
    return res.redirect('/login?error=Debes+iniciar+sesión+para+acceder+a+los+manuales+y+documentación+oficial');
} 

// ─── Teacher menu route ───
app.get('/teacher/menu', requireAnyLogin, (req, res) => {
    // Render the new teacher menu view
    res.render('teacher/menu', {
        user: res.locals.teacher,
        userRole: res.locals.userRole
    });
});


// Helper: get unique class names from DB
async function getUniqueClasses() {
    if (!supabase) return [];
    try {
        const { data } = await supabase.from('students').select('class_name');
        return [...new Set((data || []).map(s => s.class_name))].filter(Boolean).sort();
    } catch (e) { return []; }
}

// ════════════════════════════════════════
// LOGIN ROUTES
// ════════════════════════════════════════
app.get('/login', async (req, res) => {
    if (res.locals.student) return res.redirect('/');
    const uniqueClasses = await getUniqueClasses();
    return res.render('login', { error: req.query.error || null, klassenConfig, uniqueClasses });
});

app.get('/api/student/code/:className/:code', async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('class_name', req.params.className)
            .eq('student_code', req.params.code)
            .single();
        if (error || !data) return res.json({ success: false });
        return res.json({ success: true, student: data });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.post('/login', async (req, res) => {
    const { username, class_name, student_code } = req.body;
    const uniqueClasses = await getUniqueClasses();
    if (!username || !username.trim()) {
        return res.render('login', { error: 'Por favor ingresa tu nombre / Bitte gib deinen Namen ein.', klassenConfig, uniqueClasses });
    }
    
    if (!student_code || !student_code.trim()) {
        return res.render('login', { error: 'Por favor ingresa tu código / Bitte gib deinen Code ein.', klassenConfig, uniqueClasses });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanClass = (class_name || '4D').trim();
    const cleanCode = student_code.trim();

    if (supabase) {
        try {
            let { data: student } = await supabase
                .from('students')
                .select('*')
                .eq('username', cleanUsername)
                .eq('class_name', cleanClass)
                .eq('student_code', cleanCode)
                .single();

            if (!student) {
                return res.render('login', { error: 'Datos incorrectos o código no válido.', klassenConfig, uniqueClasses });
            }

            res.cookie('student_id', student.id, {
                maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax'
            });
            return res.redirect('/');
        } catch (e) {
            console.error('Login error:', e);
            return res.render('login', { error: 'Error de conexión. Intenta de nuevo.', klassenConfig, uniqueClasses });
        }
    } else {
        const localId = 'local_' + Date.now();
        const student = { id: localId, username: cleanUsername, class_name: cleanClass, student_code: cleanCode };
        res.cookie('student_id', localId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
        res.cookie('student_data', JSON.stringify(student), { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
        return res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('student_id');
    res.clearCookie('student_data');
    res.redirect('/login');
});

// ════════════════════════════════════════
// DASHBOARD ROUTE
// ════════════════════════════════════════
app.get('/', requireLogin, async (req, res) => {
    const year = req.query.year || '2526';
    const studentLevel = getStudentLevel(res.locals.student.class_name);
    const requestedLevel = req.query.level || '1';
    const rawActivities = allActivities[requestedLevel] || [];
    
    // Resolve dynamically based on student's class name
    const activities = getActivitiesForClass(rawActivities, res.locals.student.class_name);

    // Resolve all activities for all levels (1 to 6)
    const allResolvedActivities = {};
    for (let lvl = 1; lvl <= 6; lvl++) {
        const rawLvlActs = allActivities[String(lvl)] || [];
        allResolvedActivities[lvl] = getActivitiesForClass(rawLvlActs, res.locals.student.class_name);
    }

    // Load subject config for this student's class
    let subjectConfig = {};
    const configPath = path.join(__dirname, 'subject_config.json');
    try {
        if (fs.existsSync(configPath)) {
            subjectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) { /* no config yet */ }
    const studentClass = res.locals.student.class_name; // e.g. "4A"
    const enabledSubjects = subjectConfig[studentClass] || {};

    // Load level config for this student's class
    let levelConfig = {};
    const levelConfigPath = path.join(__dirname, 'level_config.json');
    try {
        if (fs.existsSync(levelConfigPath)) {
            const allLevelConfig = JSON.parse(fs.readFileSync(levelConfigPath, 'utf8'));
            levelConfig = allLevelConfig[studentClass] || {};
        }
    } catch (e) { /* no config yet */ }
    // Enforce Level Lock: if the requested level is not enabled, hide activities
    let activeActivities = activities;
    let activeTechActivities = tecnologiaActivities.filter(a => a.level === requestedLevel);

    if (levelConfig[requestedLevel] !== true) {
        activeActivities = [];
        activeTechActivities = [];
    }

    const studentId = res.locals.student.id;
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    let rawProgress = {};

    const getCompletedCount = (actId, itemData) => {
        let activity = null;
        for (const [lvl, acts] of Object.entries(allActivities)) {
            const found = acts.find(a => a.id === actId);
            if (found) { activity = found; break; }
        }
        if (!activity && actId === 'profile') {
            activity = sharedProfile;
        }

        if (activity) {
            const resolved = getActivityForClass(activity, studentClass);
            const evidenceIds = (resolved.evidence || []).map(e => e.id);
            const fields = itemData ? Object.keys(itemData).filter(k => {
                if (!evidenceIds.includes(k)) return false;
                const val = itemData[k];
                if (typeof val === 'boolean') return val;
                if (typeof val === 'string') return val.trim().length > 0;
                return false;
            }) : [];
            return fields.length;
        } else {
            const fields = itemData ? Object.keys(itemData).filter(k => {
                const val = itemData[k];
                if (typeof val === 'boolean') return val;
                if (typeof val === 'string') return val.trim().length > 0;
                return false;
            }) : [];
            return fields.length;
        }
    };

    if (isLocal) {
        const cache = readLocalCache();
        if (cache[studentId]) {
            Object.keys(cache[studentId]).forEach(actId => {
                const item = cache[studentId][actId];
                rawProgress[actId] = {
                    fieldsCompleted: getCompletedCount(actId, item.data),
                    updatedAt: item.updated_at
                };
            });
        }
    } else if (supabase) {
        try {
            const { data } = await supabase
                .from('activity_responses')
                .select('activity_id, data, updated_at')
                .eq('student_id', studentId);
            (data || []).forEach(item => {
                rawProgress[item.activity_id] = {
                    fieldsCompleted: getCompletedCount(item.activity_id, item.data),
                    updatedAt: item.updated_at
                };
            });
        } catch (e) { /* silently ignore */ }
    }

    res.render('index', {
        activities: activeActivities,
        tecnologiaActivities: getActivitiesForClass(tecnologiaActivities, res.locals.student.class_name),
        allResolvedActivities,
        student: res.locals.student,
        sharedProfile,
        klassenConfig,
        schoolYears,
        currentYear: year,
        currentLevel: requestedLevel,
        studentLevel,
        subjects,
        levels,
        allActivities,
        enabledSubjects,
        levelConfig,
        progress: rawProgress
    });
});

// ════════════════════════════════════════
// Helper: reduce full teacher name to "Primer Nombre Primer Apellido"
function formatTeacherName(fullName) {
    if (!fullName || fullName === 'NO APLICA') return fullName;
    const parts = fullName.trim().split(/\s+/);
    // Return first 2 words (first name + first last name)
    return parts.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ════════════════════════════════════════
// PROFILE ROUTE (shared across all Retos)
// ════════════════════════════════════════
app.get('/profile', requireLogin, (req, res) => {
    let teacherConfig = {};
    let allTeachers = [];
    try {
        const configPath = require('path').join(__dirname, 'class_teacher_config.json');
        if (require('fs').existsSync(configPath)) {
            const allConfig = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
            const rawConfig = allConfig[res.locals.student.class_name] || {};
            // Format each teacher name to "Primer Nombre Primer Apellido"
            for (let subj in rawConfig) {
                teacherConfig[subj] = formatTeacherName(rawConfig[subj]);
            }
            
            const pSet = new Set();
            for(let cls in allConfig) {
                for(let subj in allConfig[cls]) {
                    pSet.add(formatTeacherName(allConfig[cls][subj]));
                }
            }
            allTeachers = Array.from(pSet).sort();
        }
    } catch (e) { }

    res.render('activity', { 
        activity: sharedProfile, 
        student: res.locals.student, 
        currentYear: '2526', 
        section: 'profile',
        teacherConfig,
        allTeachers,
        challengeToolsConfig: {},
        defaultAgentTools: {}
    });
});

// ════════════════════════════════════════
// ACTIVITY ROUTES
// ════════════════════════════════════════
app.get('/activity/:year/:id', requireLogin, (req, res) => {
    const year = req.params.year || '2526';
    // Search across all levels for the activity
    let activity = null;
    let actLevel = null;
    for (const [lvl, acts] of Object.entries(allActivities)) {
        const found = acts.find(a => a.id === req.params.id);
        if (found) { activity = found; actLevel = lvl; break; }
    }
    if (!activity) return res.status(404).send('Activity not found');
    const resolvedActivity = getActivityForClass(activity, res.locals.student.class_name);
    
    const challengeToolsConfig = readChallengeToolsConfig();
    res.render('activity', { 
        activity: resolvedActivity, 
        student: res.locals.student, 
        currentYear: year, 
        section: resolvedActivity.subject || 'medienpass',
        challengeToolsConfig,
        defaultAgentTools
    });
});

app.get('/tecnologia/:id', requireLogin, (req, res) => {
    let activity = tecnologiaActivities.find(a => a.id === req.params.id);
    if (!activity) {
        for (const [lvl, acts] of Object.entries(allActivities)) {
            const found = acts.find(a => a.id === req.params.id);
            if (found) { activity = found; break; }
        }
    }
    if (!activity) return res.status(404).send('Activity not found');
    
    const resolvedActivity = getActivityForClass(activity, res.locals.student.class_name);
    const challengeToolsConfig = readChallengeToolsConfig();
    
    res.render('activity', { 
        activity: resolvedActivity, 
        student: res.locals.student, 
        currentYear: '2526', 
        section: 'tecnologia',
        challengeToolsConfig,
        defaultAgentTools
    });
});

app.get('/activity/:id', requireLogin, (req, res) => {
    res.redirect('/activity/2526/' + req.params.id);
});

// ════════════════════════════════════════
// API: SAVE / LOAD / PROGRESS
// ════════════════════════════════════════
app.post('/api/save/:activityId', requireLogin, async (req, res) => {
    const { activityId } = req.params;
    const studentId = res.locals.student.id;
    const formData = req.body;
    const period = req.body.period || 1;
    const schoolYear = req.body.school_year || '2627';
    const updatedAt = new Date().toISOString();

    // 1. Guardado local serializado y atómico (sin race read-modify-write).
    updateLocalCache(cache => {
        if (!cache[studentId]) cache[studentId] = {};
        cache[studentId][activityId] = {
            data: formData,
            period: period,
            school_year: schoolYear,
            updated_at: updatedAt,
            syncPending: !!supabase   // se limpia cuando Supabase confirme
        };
    }).catch(e => console.error('Local cache save error:', e.message));

    // 2. Respuesta inmediata para que la UI no se quede esperando.
    res.json({ success: true, message: 'Guardado localmente.', localOnly: true });

    // 3. Sincronización con Supabase en segundo plano (con timeout).
    if (supabase) {
        (async () => {
            try {
                const { error } = await withTimeout(supabase
                    .from('activity_responses')
                    .upsert({
                        student_id: studentId,
                        activity_id: activityId,
                        data: formData,
                        period: period,
                        school_year: schoolYear,
                        updated_at: updatedAt
                    }, { onConflict: 'student_id,activity_id' }), 8000, 'supabase upsert');
                if (error) {
                    console.error('Supabase upsert error:', error.message);
                } else {
                    // Confirmado en BD: limpiar la marca de pendiente.
                    updateLocalCache(cache => {
                        if (cache[studentId] && cache[studentId][activityId]) {
                            cache[studentId][activityId].syncPending = false;
                        }
                    }).catch(() => {});
                }
            } catch (e) {
                // Timeout o excepción: el registro local queda con syncPending=true
                // para diagnóstico / reintento posterior.
                console.error('Supabase async exception:', e.message);
            }
        })();
    }
});

app.get('/api/load/:activityId', requireLogin, async (req, res) => {
    const { activityId } = req.params;
    const studentId = res.locals.student.id;

    let localData = null;
    let localUpdatedAt = null;

    // Load from local cache
    let localSyncPending = false;
    try {
        const cache = readLocalCache();
        if (cache[studentId] && cache[studentId][activityId]) {
            localData = cache[studentId][activityId].data;
            localUpdatedAt = cache[studentId][activityId].updated_at;
            localSyncPending = cache[studentId][activityId].syncPending === true;
        }
    } catch (e) {
        console.error('Error reading local cache on load:', e);
    }

    // Si hay datos pendientes de sincronizar, intentar reintentar el upsert ahora (sin bloquear).
    if (localSyncPending && supabase && localData) {
        (async () => {
            try {
                const { error } = await withTimeout(supabase
                    .from('activity_responses')
                    .upsert({
                        student_id: studentId,
                        activity_id: activityId,
                        data: localData,
                        updated_at: localUpdatedAt || new Date().toISOString()
                    }, { onConflict: 'student_id,activity_id' }), 8000, 'syncPending retry');
                if (!error) {
                    updateLocalCache(c => {
                        if (c[studentId] && c[studentId][activityId]) {
                            c[studentId][activityId].syncPending = false;
                        }
                    }).catch(() => {});
                } else {
                    console.error('syncPending retry error:', error.message);
                }
            } catch (e) {
                console.error('syncPending retry exception:', e.message);
            }
        })();
    }

    let supabaseData = null;
    let supabaseUpdatedAt = null;

    // Load from Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('activity_responses')
                .select('data, updated_at')
                .eq('student_id', studentId)
                .eq('activity_id', activityId)
                .maybeSingle();

            if (!error && data) {
                supabaseData = data.data;
                supabaseUpdatedAt = data.updated_at;
            }
        } catch (e) {
            console.error('Supabase load error:', e);
        }
    }

    // Merge strategy: combine both datasets, prioritizing the newest one
    let finalData = {};
    let finalUpdatedAt = null;

    if (localData && supabaseData) {
        const localTime = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;
        const supabaseTime = supabaseUpdatedAt ? new Date(supabaseUpdatedAt).getTime() : 0;

        if (localTime >= supabaseTime) {
            finalData = { ...supabaseData, ...localData };
            finalUpdatedAt = localUpdatedAt;
        } else {
            finalData = { ...localData, ...supabaseData };
            finalUpdatedAt = supabaseUpdatedAt;
        }
    } else if (localData) {
        finalData = localData;
        finalUpdatedAt = localUpdatedAt;
    } else if (supabaseData) {
        finalData = supabaseData;
        finalUpdatedAt = supabaseUpdatedAt;
    }

    return res.json({ success: true, data: finalData, updated_at: finalUpdatedAt });
});

app.get('/api/progress', requireLogin, async (req, res) => {
    const studentId = res.locals.student.id;
    const studentClass = res.locals.student.class_name;
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    const getCompletedCount = (actId, itemData) => {
        let activity = null;
        for (const [lvl, acts] of Object.entries(allActivities)) {
            const found = acts.find(a => a.id === actId);
            if (found) { activity = found; break; }
        }
        if (!activity && actId === 'profile') {
            activity = sharedProfile;
        }

        if (activity) {
            const resolved = getActivityForClass(activity, studentClass);
            const evidenceIds = (resolved.evidence || []).map(e => e.id);
            const fields = itemData ? Object.keys(itemData).filter(k => {
                if (!evidenceIds.includes(k)) return false;
                const val = itemData[k];
                if (typeof val === 'boolean') return val;
                if (typeof val === 'string') return val.trim().length > 0;
                return false;
            }) : [];
            return fields.length;
        } else {
            const fields = itemData ? Object.keys(itemData).filter(k => {
                const val = itemData[k];
                if (typeof val === 'boolean') return val;
                if (typeof val === 'string') return val.trim().length > 0;
                return false;
            }) : [];
            return fields.length;
        }
    };

    if (isLocal) {
        const cache = readLocalCache();
        if (cache[studentId]) {
            const progress = {};
            Object.keys(cache[studentId]).forEach(actId => {
                const item = cache[studentId][actId];
                progress[actId] = {
                    fieldsCompleted: getCompletedCount(actId, item.data),
                    updatedAt: item.updated_at
                };
            });
            return res.json({ success: true, progress });
        }
    }

    if (!supabase) return res.json({ success: true, progress: {} });

    try {
        const { data, error } = await supabase
            .from('activity_responses')
            .select('activity_id, data, updated_at')
            .eq('student_id', studentId);

        if (error) return res.status(500).json({ success: false, progress: {} });

        const progress = {};
        (data || []).forEach(item => {
            progress[item.activity_id] = {
                fieldsCompleted: getCompletedCount(item.activity_id, item.data),
                updatedAt: item.updated_at
            };
        });

        return res.json({ success: true, progress });
    } catch (e) {
        return res.status(500).json({ success: false, progress: {} });
    }
});

// 
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: null });
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    if (!password) {
        return res.render('admin/login', { error: 'Por favor ingresa la contraseña.' });
    }

    // 1. Master fallback / Superadmin bypass
    if ((email === 'admin' || email === 'admin@colegioaleman.edu.co' || !email) && password === ADMIN_PASSWORD) {
        res.cookie('admin_auth', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
        res.cookie('admin_user', JSON.stringify({ email: 'admin@colegioaleman.edu.co', role: 'admin', first_name: 'Administrador', last_name: 'Global' }), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
        return res.redirect('/admin');
    }

    if (!email) {
        return res.render('admin/login', { error: 'Por favor ingresa tu correo institucional.' });
    }

    // 2. Validate against Supabase teachers table & teacher_roles.json
    if (supabase) {
        try {
            let cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.includes('@')) {
                cleanEmail += '@colegioaleman.edu.co';
            }
            const cleanPassword = password.trim();

            const { data: teacher, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('email', cleanEmail)
                .eq('doc_number', cleanPassword)
                .single();

            if (teacher) {
                // Check extra role
                const rolesPath = path.join(__dirname, 'data', 'teacher_roles.json');
                let extraRole = 'profesor';
                if (fs.existsSync(rolesPath)) {
                    const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
                    extraRole = roles[(teacher.email || '').toLowerCase()] || 'profesor';
                }

                if (extraRole === 'desarrollador' || extraRole === 'coordinador' || extraRole === 'directivo' || extraRole === 'admin') {
                    res.cookie('admin_auth', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
                    res.cookie('admin_user', JSON.stringify({ 
                        email: teacher.email, 
                        role: extraRole, 
                        first_name: teacher.first_name, 
                        last_name: teacher.last_name,
                        id: teacher.id
                    }), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
                    
                    // Also set teacher cookies so that if they go to /docs/technical or /teacher/training, they are fully recognized as teacher/desarrollador
                    const teacherData = {
                        last_name: teacher.last_name,
                        subject: teacher.subject,
                        email: teacher.email,
                        doc_number: teacher.doc_number,
                        id: teacher.id,
                        role: extraRole
                    };
                    res.cookie('teacher_auth', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
                    res.cookie('teacher_data', JSON.stringify(teacherData), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });

                    return res.redirect('/admin');
                } else {
                    return res.render('admin/login', { error: 'Acceso denegado: Tu perfil actual (' + extraRole.toUpperCase() + ') no tiene permisos de Administración. Solo Desarrolladores, Coordinadores y Directivos pueden acceder.' });
                }
            } else {
                return res.render('admin/login', { error: 'Correo institucional o contraseña incorrectos.' });
            }
        } catch (e) {
            console.error('Admin login error:', e);
            return res.render('admin/login', { error: 'Error al iniciar sesión en administración.' });
        }
    } else {
        return res.render('admin/login', { error: 'Conexión a base de datos no disponible.' });
    }
});
app.get('/admin/logout', (req, res) => {
    res.clearCookie('admin_auth');
    res.clearCookie('admin_user');
    res.clearCookie('teacher_auth');
    res.clearCookie('teacher_data');
    res.redirect('/admin/login');
});

// Admin Dashboard
app.get('/admin', requireAdmin, async (req, res) => {
    let students = [];
    if (supabase) {
        try {
            const { data } = await supabase.from('students').select('*');
            students = data || [];
            
            function getSortName(name) {
                if (!name) return '';
                const parts = name.trim().toUpperCase().split(/\s+/);
                if (parts.length > 2) {
                    return parts.slice(-2).join(' ') + ' ' + parts.slice(0, -2).join(' ');
                }
                return name.toUpperCase();
            }

            students.sort((a, b) => {
                if (a.class_name < b.class_name) return -1;
                if (a.class_name > b.class_name) return 1;
                
                const nameA = getSortName(a.full_name || a.username);
                const nameB = getSortName(b.full_name || b.username);
                return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
            });

            let currentClass = null;
            let counter = 1;
            students.forEach(s => {
                if (s.class_name !== currentClass) {
                    currentClass = s.class_name;
                    counter = 1;
                }
                s.list_number = counter++;
            });
            
        } catch (e) { /* ignore */ }
    }
    res.render('admin/dashboard', {
        students,
        klassenConfig,
        tecnologiaActivities,
        subjects,
        levels,
        schoolYears
    });
});

// API: Bulk add students
app.post('/api/admin/students/bulk', requireAdmin, async (req, res) => {
    const { students } = req.body; // Array of { username, class_name, full_name, code }
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });

    try {
        const records = students.map(s => ({
            username: s.username.trim().toLowerCase(),
            class_name: s.class_name.trim(),
            full_name: s.full_name?.trim() || null,
            student_code: s.code?.trim() || null
        }));

        const { data, error } = await supabase
            .from('students')
            .upsert(records, { onConflict: 'username,class_name' })
            .select();

        if (error) {
            console.error('Bulk insert error:', error);
            return res.json({ success: false, message: error.message });
        }

        return res.json({ success: true, count: data?.length || 0 });
    } catch (e) {
        console.error('Bulk insert error:', e);
        return res.json({ success: false, message: e.message });
    }
});

// API: Delete student
app.delete('/api/admin/students/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        await supabase.from('activity_responses').delete().eq('student_id', req.params.id);
        await supabase.from('students').delete().eq('id', req.params.id);
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get all students data for reports
app.get('/api/admin/reports/:className', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await supabase
            .from('students')
            .select('*')
            .eq('class_name', req.params.className)
            .order('username');

        if (!students || students.length === 0) {
            return res.json({ success: true, students: [], activities: [] });
        }

        const studentIds = students.map(s => s.id);
        const { data: responses } = await supabase
            .from('activity_responses')
            .select('*')
            .in('student_id', studentIds);

        // Combine all activities for lookup
        const level = getStudentLevel(req.params.className);
        const reportActivities = [
            ...(allActivities[level] || []),
            ...(tecnologiaActivities ? tecnologiaActivities.filter(a => a.level == level) : [])
        ];

        return res.json({
            success: true,
            students,
            responses: responses || [],
            activities: reportActivities.map(a => ({ id: a.id, title: a.title, stars: a.stars || 0, evidence: a.evidence?.length || 0 }))
        });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get PSP Indicators data per class
app.get('/api/admin/psp-indicators/:className', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        // Fetch students in class
        const { data: students } = await supabase
            .from('students')
            .select('*')
            .eq('class_name', req.params.className)
            .order('username');

        if (!students || students.length === 0) {
            return res.json({ success: true, students: [] });
        }

        const studentIds = students.map(s => s.id);
        const { data: responses } = await supabase
            .from('activity_responses')
            .select('*')
            .in('student_id', studentIds);

        // Fetch registered teachers for eval status
        const { data: teachers } = await supabase.from('teachers').select('*');
        const registeredTeachers = teachers || [];

        const results = students.map(st => {
            const studentResp = (responses || []).filter(r => r.student_id === st.id);

            // Extract Teacher Name from Profile
            let teacherName = 'Sin asigar';
            const profileResp = studentResp.find(r => r.activity_id === 'profile');
            if (profileResp && profileResp.data) {
                const teachersNames = [];
                Object.keys(profileResp.data).forEach(key => {
                    if (key.startsWith('teacher_') && profileResp.data[key]) {
                        if (!teachersNames.includes(profileResp.data[key])) {
                            teachersNames.push(profileResp.data[key]);
                        }
                    }
                });
                if (teachersNames.length > 0) teacherName = teachersNames.join(', ');
            }

            // Check if teacher passed evaluation
            let evalStatus = false;
            // Simplistic match: Check if any registered teacher's full name matches the name found in Profile
            for (let tn of teacherName.split(', ')) {
                const match = registeredTeachers.find(rt => (rt.first_name + ' ' + rt.last_name).toUpperCase() === tn.toUpperCase());
                if (match && match.training_completed) { evalStatus = true; break; }
            }

            // Calculate Retos 1-6 progress 
            // We check how many reto_* the student started.
            let retosStarted = 0;
            const uniqueRetos = new Set();
            studentResp.forEach(r => {
                if (r.activity_id && r.activity_id.startsWith('reto')) {
                    // Extract the reto number (e.g., roto1_aleman -> reto1)
                    const retoLevel = r.activity_id.split('_')[0];
                    uniqueRetos.add(retoLevel);
                }
            });
            retosStarted = uniqueRetos.size;

            // Progress percentage (out of 6 max retos)
            const progress = Math.min(100, Math.round((retosStarted / 6) * 100));

            return {
                id: st.id,
                name: st.full_name || st.username,
                teacher: teacherName,
                evaluation_passed: evalStatus,
                retosCompleted: retosStarted,
                progress: progress
            };
        });

        return res.json({
            success: true,
            students: results
        });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get PSP Matrix data (Klassen vs Matrices)
app.get('/api/admin/psp-matrix', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await supabase.from('students').select('id, class_name');
        if (!students) return res.json({ success: true, matrix: {} });

        const { data: responses } = await supabase.from('activity_responses').select('student_id, activity_id');
        if (!responses) return res.json({ success: true, matrix: {} });

        const matrix = {};

        // Pre-initialize structure
        const uniqueClasses = [...new Set(students.map(s => s.class_name))].filter(Boolean).sort();
        uniqueClasses.forEach(cName => {
                matrix[cName] = {};
                subjects.forEach(s => {
                    matrix[cName][s.id] = { sumProgress: 0, studentCount: 0 };
                });
            });

        // Group students by class
        const classStudents = {};
        students.forEach(st => {
            if (!classStudents[st.class_name]) classStudents[st.class_name] = [];
            classStudents[st.class_name].push(st.id);
        });

        // Calculate averages
        Object.keys(classStudents).forEach(className => {
            if (!matrix[className]) return;
            const sIds = classStudents[className];

            subjects.forEach(subj => {
                let totalClassProgress = 0;

                sIds.forEach(sId => {
                    const subjResps = responses.filter(r => r.student_id === sId && r.activity_id.endsWith('_' + subj.id) && r.activity_id.startsWith('reto'));
                    const uniqueRetos = new Set(subjResps.map(r => r.activity_id.split('_')[0]));
                    const studentProgress = (uniqueRetos.size / 6) * 100;
                    totalClassProgress += studentProgress;
                });

                const avg = sIds.length > 0 ? Math.round(totalClassProgress / sIds.length) : 0;
                matrix[className][subj.id].avg = avg;
                matrix[className][subj.id].studentCount = sIds.length;
            });
        });

        return res.json({ success: true, matrix });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get Teacher Reports
app.get('/api/admin/teacher-reports', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        // Fetch all students to cross reference classes
        const { data: students } = await supabase.from('students').select('id, class_name');
        if (!students) return res.json({ success: true, teachers: [] });

        // Fetch profile responses
        const { data: profiles } = await supabase.from('activity_responses').select('student_id, data').eq('activity_id', 'profile');
        if (!profiles) return res.json({ success: true, teachers: [] });

        const teacherMap = {}; // { 'Teacher Name': Set(class_names) }

        profiles.forEach(p => {
            const st = students.find(s => s.id === p.student_id);
            if (!st || !p.data) return;

            Object.keys(p.data).forEach(key => {
                if (key.startsWith('teacher_') && p.data[key]) {
                    const tName = p.data[key].toUpperCase();
                    if (!teacherMap[tName]) teacherMap[tName] = new Set();
                    teacherMap[tName].add(st.class_name);
                }
            });
        });

        const teacherList = Object.keys(teacherMap).map(t => {
            return {
                name: t,
                groupsCount: teacherMap[t].size,
                groups: Array.from(teacherMap[t]).join(', ')
            };
        }).sort((a, b) => b.groupsCount - a.groupsCount);

        return res.json({ success: true, teachers: teacherList });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get subject configuration per Klasse
app.get('/api/admin/subject-config', requireAdmin, (req, res) => {
    const configPath = path.join(__dirname, 'subject_config.json');
    try {
        if (fs.existsSync(configPath)) {
            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return res.json({ success: true, config: data });
        }
        return res.json({ success: true, config: {} });
    } catch (e) {
        return res.json({ success: true, config: {} });
    }
});

// API: Save subject configuration
app.post('/api/admin/subject-config', requireAdmin, async (req, res) => {
    const configData = req.body;
    const configPath = path.join(__dirname, 'subject_config.json');
    try {
        await _enqueue(configPath, () => _writeJsonAtomic(configPath, configData));
        return res.json({ success: true, message: 'Configuración guardada' });
    } catch (e) {
        console.error('Save subject config error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get level configuration per Klasse
app.get('/api/admin/level-config', requireAdmin, (req, res) => {
    const configPath = path.join(__dirname, 'level_config.json');
    try {
        if (fs.existsSync(configPath)) {
            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return res.json({ success: true, config: data });
        }
        return res.json({ success: true, config: {} });
    } catch (e) {
        return res.json({ success: true, config: {} });
    }
});

// API: Save level configuration
app.post('/api/admin/level-config', requireAdmin, async (req, res) => {
    const configData = req.body;
    const configPath = path.join(__dirname, 'level_config.json');
    try {
        await _enqueue(configPath, () => _writeJsonAtomic(configPath, configData));
        return res.json({ success: true, message: 'Configuración guardada' });
    } catch (e) {
        console.error('Save level config error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get i18n configuration (runs file in safe vm sandbox)
app.get('/api/admin/i18n', requireAdmin, (req, res) => {
    const configPath = path.join(__dirname, 'public/js/i18n.js');
    try {
        if (!fs.existsSync(configPath)) {
            return res.json({ success: false, message: 'Archivo i18n no encontrado' });
        }
        const content = fs.readFileSync(configPath, 'utf8');
        
        // Use VM to safely evaluate the file content and extract the i18n variable
        const vm = require('vm');
        const sandbox = { i18n: null, window: {}, module: { exports: {} } };
        try {
            // Evaluamos el archivo directamente. Al proveer 'window' y 'module' en el sandbox, 
            // el código de i18n.js se ejecutará sin errores de referencia.
            vm.runInNewContext(content + '\n; _result = i18n;', sandbox);
            const i18nObj = sandbox._result || sandbox.i18n || sandbox.window.i18n;
            if (i18nObj) {
                return res.json({ success: true, i18n: i18nObj });
            }
        } catch (e) {
            console.error('Error parsing i18n with VM:', e);
        }
        
        return res.json({ success: false, message: 'No se pudo procesar el archivo de traducciones' });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Save i18n configuration
app.post('/api/admin/i18n', requireAdmin, async (req, res) => {
    const payload = req.body;
    const configPath = path.join(__dirname, 'public/js/i18n.js');
    try {
        const newScript = `/**\n * i18n.js - UI translations for MedienPass App\n * Contains all interface strings in German, English, and Spanish\n */\nconst i18n = ${JSON.stringify(payload, null, 4)};\n\n// Make available globally\nif (typeof window !== 'undefined') {\n    window.i18n = i18n;\n}\nif (typeof module !== 'undefined' && module.exports) {\n    module.exports = i18n;\n}\n`;
        // i18n.js es texto (no JSON), usamos escritura atómica simple vía tmp→rename.
        await _enqueue(configPath, async () => {
            const tmp = `${configPath}.tmp`;
            await fsp.writeFile(tmp, newScript, 'utf8');
            await fsp.rename(tmp, configPath);
        });
        return res.json({ success: true, message: 'Traducciones guardadas' });
    } catch (e) {
        console.error('Save i18n error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get teacher extra roles mapping
app.get('/api/admin/teacher-roles', requireAdmin, (req, res) => {
    const rolesPath = path.join(__dirname, 'data', 'teacher_roles.json');
    try {
        if (fs.existsSync(rolesPath)) {
            const data = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
            return res.json({ success: true, roles: data });
        }
        return res.json({ success: true, roles: {} });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Save teacher extra role
app.post('/api/admin/teacher-roles', requireAdmin, async (req, res) => {
    const { email, role } = req.body;
    const rolesPath = path.join(__dirname, 'data', 'teacher_roles.json');
    try {
        let currentRoles = {};
        if (fs.existsSync(rolesPath)) {
            currentRoles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
        }
        const lowerEmail = (email || '').trim().toLowerCase();
        if (lowerEmail) {
            if (role && role !== 'profesor') {
                currentRoles[lowerEmail] = role;
            } else {
                delete currentRoles[lowerEmail];
            }
            await _enqueue(rolesPath, () => _writeJsonAtomic(rolesPath, currentRoles));
        }
        return res.json({ success: true, message: 'Rol asignado correctamente' });
    } catch (e) {
        console.error('Save teacher role error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get teacher mapping configuration
app.get('/api/admin/teacher-mapping', requireAdmin, (req, res) => {
    const configPath = path.join(__dirname, 'class_teacher_config.json');
    try {
        if (fs.existsSync(configPath)) {
            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return res.json({ success: true, config: data });
        }
        return res.json({ success: true, config: {} });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Save teacher mapping configuration
app.post('/api/admin/teacher-mapping', requireAdmin, async (req, res) => {
    const configData = req.body;
    const configPath = path.join(__dirname, 'class_teacher_config.json');
    try {
        await _enqueue(configPath, () => _writeJsonAtomic(configPath, configData));
        return res.json({ success: true, message: 'Mapeo de profesores guardado' });
    } catch (e) {
        console.error('Save teacher mapping error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});




// ════════════════════════════════════════
// EXECUTIVE DASHBOARD ROUTES
// ════════════════════════════════════════
app.get('/admin/executive', requireAdmin, (req, res) => {
    res.render('admin/executive-dashboard');
});

// API: KPIs for Executive Dashboard
app.get('/api/admin/kpis', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await supabase.from('students').select('id, class_name');
        const { data: teachers } = await supabase.from('teachers').select('*');
        const { data: responses } = await supabase.from('activity_responses').select('*');
        const { data: incidents } = await supabase.from('incidents').select('*');
        const { data: devices } = await supabase.from('devices').select('*');

        const totalStudents = students?.length || 0;
        const totalTeachers = teachers?.length || 0;
        const certifiedTeachers = teachers?.filter(t => t.training_completed)?.length || 0;
        const totalDevices = devices?.length || 0;
        const openIncidents = incidents?.filter(i => i.status === 'open')?.length || 0;

        // Calculate students with progress
        const studentsWithProgress = new Set(responses?.map(r => r.student_id) || []).size;
        const progressRate = totalStudents > 0 ? Math.round((studentsWithProgress / totalStudents) * 100) : 0;
        const teachersCertified = totalTeachers > 0 ? Math.round((certifiedTeachers / totalTeachers) * 100) : 0;

        return res.json({
            success: true,
            kpis: {
                totalStudents,
                progressRate,
                teachersCertified,
                totalDevices,
                openIncidents
            }
        });
    } catch (e) {
        console.error('KPIs error:', e);
        return res.json({ success: false });
    }
});

// API: Progress by Klasse
app.get('/api/admin/progress-by-klasse', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const year = req.query.year || '2627';
        const { data: students } = await supabase.from('students').select('id, class_name');
        const { data: responses } = await supabase.from('activity_responses').select('*').eq('school_year', year);

        const klasseStats = {};
        klassenConfig.klassen.forEach(k => {
            klassenConfig.kurse.forEach(kurs => {
                const className = k + kurs;
                const classStudents = students?.filter(s => s.class_name === className) || [];
                const studentIds = classStudents.map(s => s.id);
                const activeStudents = new Set(
                    responses?.filter(r => studentIds.includes(r.student_id)).map(r => r.student_id) || []
                ).size;
                const progress = classStudents.length > 0 
                    ? Math.round((activeStudents / classStudents.length) * 100) 
                    : 0;
                klasseStats[className] = progress;
            });
        });

        const data = Object.entries(klasseStats).map(([klasse, progress]) => ({ klasse, progress }));
        return res.json({ success: true, data });
    } catch (e) {
        return res.json({ success: false });
    }
});

// API: Progress by Subject
app.get('/api/admin/progress-by-subject', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const year = req.query.year || '2627';
        const { data: responses } = await supabase.from('activity_responses').select('*').eq('school_year', year);

        const subjectCounts = {};
        subjects.forEach(s => subjectCounts[s.id] = 0);
        
        responses?.forEach(r => {
            subjects.forEach(s => {
                if (r.activity_id?.includes('_' + s.id)) {
                    subjectCounts[s.id]++;
                }
            });
        });

        const data = subjects.map(s => ({
            subject: s.name.es,
            count: subjectCounts[s.id]
        }));
        return res.json({ success: true, data });
    } catch (e) {
        return res.json({ success: false });
    }
});

// API: Students without progress
app.get('/api/admin/students-without-progress', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const year = req.query.year || '2627';
        const { data: students } = await supabase.from('students').select('*');
        const { data: responses } = await supabase.from('activity_responses').select('student_id').eq('school_year', year);

        const activeStudentIds = new Set(responses?.map(r => r.student_id) || []);
        const noProgress = students?.filter(s => !activeStudentIds.has(s.id)) || [];

        return res.json({
            success: true,
            students: noProgress.map(s => ({
                id: s.id,
                name: s.full_name || s.username,
                class: s.class_name
            }))
        });
    } catch (e) {
        return res.json({ success: false });
    }
});

// API: Student profile (Reto 0)
app.get('/api/admin/student-profile/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No database' });
    try {
        const studentId = req.params.id;
        
        const { data: student, error: err1 } = await supabase
            .from('students')
            .select('full_name, username, class_name')
            .eq('id', studentId)
            .single();
            
        if (err1) throw err1;

        const { data: response } = await supabase
            .from('activity_responses')
            .select('data')
            .eq('student_id', studentId)
            .eq('activity_id', 'profile')
            .single();

        return res.json({ 
            success: true, 
            student: student || {},
            profileData: response?.data || null 
        });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Pending teachers
app.get('/api/admin/pending-teachers', requireAdmin, (req, res) => {
    try {
        let pending = [];
        if (fs.existsSync(pendingTeachersFile)) {
            pending = JSON.parse(fs.readFileSync(pendingTeachersFile, 'utf8'));
        }
        return res.json({ success: true, pending });
    } catch(e) {
        return res.json({ success: false, pending: [] });
    }
});

app.post('/api/admin/approve-teacher/:id', requireAdmin, async (req, res) => {
    try {
        let pending = [];
        if (fs.existsSync(pendingTeachersFile)) {
            pending = JSON.parse(fs.readFileSync(pendingTeachersFile, 'utf8'));
        }
        const idx = pending.findIndex(p => p.id === req.params.id);
        if (idx === -1) return res.json({ success: false, message: 'Solicitud no encontrada' });
        
        const teacherData = pending[idx];
        
        if (supabase) {
            const { data: existing } = await supabase.from('teachers').select('id').eq('doc_number', teacherData.doc_number).single();
            if (existing) {
                 await supabase.from('teachers').update({
                     first_name: teacherData.first_name,
                     last_name: teacherData.last_name,
                     email: teacherData.email
                 }).eq('id', existing.id);
            } else {
                 await supabase.from('teachers').insert({
                     doc_number: teacherData.doc_number,
                     first_name: teacherData.first_name,
                     last_name: teacherData.last_name,
                     email: teacherData.email,
                     subject: ''
                 });
            }
        }
        
        pending.splice(idx, 1);
        await _enqueue(pendingTeachersFile, () => _writeJsonAtomic(pendingTeachersFile, pending));

        return res.json({ success: true, message: 'Profesor aprobado e insertado.' });
    } catch(e) {
        return res.json({ success: false, message: e.message });
    }
});

app.post('/api/admin/reject-teacher/:id', requireAdmin, async (req, res) => {
    try {
        let pending = [];
        if (fs.existsSync(pendingTeachersFile)) {
            pending = JSON.parse(fs.readFileSync(pendingTeachersFile, 'utf8'));
        }
        pending = pending.filter(p => p.id !== req.params.id);
        await _enqueue(pendingTeachersFile, () => _writeJsonAtomic(pendingTeachersFile, pending));
        return res.json({ success: true, message: 'Solicitud rechazada.' });
    } catch(e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Teachers status
app.get('/api/admin/teachers-status', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase.from('teachers').select('*');
        const pending = teachers?.filter(t => !t.training_completed) || [];
        
        return res.json({
            success: true,
            total: teachers?.length || 0,
            certified: teachers?.filter(t => t.training_completed)?.length || 0,
            pending: pending.map(t => ({
                name: t.first_name + ' ' + t.last_name,
                subject: t.subject,
                score: t.training_score
            }))
        });
    } catch (e) {
        return res.json({ success: false });
    }
});

// ════════════════════════════════════════
// INVENTORY ROUTES
// ════════════════════════════════════════
app.get('/admin/inventory', requireAdmin, (req, res) => {
    res.render('admin/inventory');
});

app.get('/api/devices', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { location, status } = req.query;
        let query = supabase.from('devices').select('*').order('serial_number');
        
        if (location) query = query.eq('location', location);
        if (status) query = query.eq('status', status);
        
        const { data, error } = await query;
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, devices: data || [] });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.post('/api/devices', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { serial_number, type, brand, model, location, status, notes } = req.body;
        
        const { data, error } = await supabase
            .from('devices')
            .insert({ serial_number, type, brand, model, location, status: status || 'available', notes })
            .select();

        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, device: data?.[0] });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.put('/api/devices/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { serial_number, type, brand, model, location, status, notes } = req.body;
        
        const { error } = await supabase
            .from('devices')
            .update({ serial_number, type, brand, model, location, status, notes })
            .eq('id', req.params.id);

        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false });
    }
});

// API: Get all records from a DB table
app.get('/api/admin/db-records/:table', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers', 'devices', 'incidents', 'multimedia_products', 'activity_responses'];
    const { table } = req.params;
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Tabla no permitida' });
    }
    try {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, records: data || [] });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Update a single record by id in a DB table
app.post('/api/admin/db-records/:table/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers', 'devices', 'incidents', 'multimedia_products'];
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Tabla no permitida' });
    }
    try {
        // Remove read-only fields
        const updates = { ...req.body };
        delete updates.id;
        delete updates.created_at;
        const { error } = await supabase.from(table).update(updates).eq('id', id);
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Create a new record in a DB table
app.post('/api/admin/db-records/:table', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers', 'devices', 'incidents', 'multimedia_products'];
    const { table } = req.params;
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Tabla no permitida' });
    }
    try {
        const { data, error } = await supabase.from(table).insert(req.body).select();
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, record: data?.[0] });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Delete a record from a DB table
app.delete('/api/admin/db-records/:table/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers', 'devices', 'incidents', 'multimedia_products'];
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Tabla no permitida' });
    }
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// ════════════════════════════════════════
// TEACHER ROUTES (PORTAL DOCENTE - CAPACITACIÓN)
// ════════════════════════════════════════
app.get('/teacher/login', (req, res) => {
    if (req.cookies.teacher_auth === 'true') return res.redirect('/teacher/training');
    res.render('teacher/login', { error: null, subjects });
});

app.post('/api/teacher/register', async (req, res) => {
    try {
        const { first_name, last_name, email, doc_number } = req.body;
        if (!first_name || !last_name || !email || !doc_number) {
            return res.json({ success: false, message: 'Faltan campos obligatorios' });
        }
        
        let pending = [];
        try { pending = JSON.parse(fs.readFileSync(pendingTeachersFile, 'utf8')); } catch(e) {}
        
        if (pending.find(p => p.doc_number === doc_number || p.email === email)) {
            return res.json({ success: false, message: 'Ya existe una solicitud pendiente para este documento o correo.' });
        }

        pending.push({
            id: Date.now().toString(),
            first_name, last_name, email, doc_number,
            date: new Date().toISOString()
        });

        await _enqueue(pendingTeachersFile, () => _writeJsonAtomic(pendingTeachersFile, pending));
        return res.json({ success: true, message: 'Registro enviado para aprobación.' });
    } catch(e) {
        return res.json({ success: false, message: 'Error en el servidor.' });
    }
});

app.post('/teacher/login', async (req, res) => {
    console.log('--- TEACHER LOGIN ATTEMPT ---');
    console.log('req.body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('teacher/login', { error: 'Por favor ingresa tu correo y contraseña.', subjects });
    }

    if (supabase) {
        try {
            let cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.includes('@')) {
                cleanEmail += '@colegioaleman.edu.co';
            }
            const cleanPassword = password.trim();
            const { data: teacher, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('email', cleanEmail)
                .eq('doc_number', cleanPassword)
                .single();

            if (teacher) {
                const rolesPath = path.join(__dirname, 'data', 'teacher_roles.json');
                let extraRole = 'profesor';
                if (fs.existsSync(rolesPath)) {
                    const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
                    extraRole = roles[(teacher.email || '').toLowerCase()] || 'profesor';
                }

                const teacherData = {
                    last_name: teacher.last_name,
                    subject: teacher.subject,
                    email: teacher.email,
                    doc_number: teacher.doc_number,
                    id: teacher.id,
                    role: extraRole
                };
                res.cookie('teacher_auth', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
                res.cookie('teacher_data', JSON.stringify(teacherData), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
                return res.redirect('/teacher/training');
            } else {
                return res.render('teacher/login', { error: 'Correo institucional o contraseña incorrectos.', subjects });
            }
        } catch (e) {
            console.error('Teacher login error:', e);
            return res.render('teacher/login', { error: 'Error al iniciar sesión.', subjects });
        }
    } else {
        return res.render('teacher/login', { error: 'Supabase no configurado.', subjects });
    }
});

// Middleware for teacher auth
function requireTeacher(req, res, next) {
    if (req.cookies.teacher_auth === 'true' && req.cookies.teacher_data) {
        try {
            const t = JSON.parse(req.cookies.teacher_data);
            const rolesPath = path.join(__dirname, 'data', 'teacher_roles.json');
            if (fs.existsSync(rolesPath)) {
                const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
                t.role = roles[(t.email || '').toLowerCase()] || t.role || 'profesor';
            } else {
                t.role = t.role || 'profesor';
            }
            res.locals.teacher = t;
            return next();
        } catch (e) { }
    }
    // En rutas de API se responde JSON: un redirect 302 devuelve HTML y rompe
    // el res.json() del cliente con un error genérico poco descriptivo.
    if (req.path.startsWith('/api/')) {
        return res.status(401).json({ success: false, error: 'Sesión de docente expirada. Vuelve a iniciar sesión.' });
    }
    return res.redirect('/teacher/login');
}
app.get('/teacher/logout', (req, res) => {
    res.clearCookie('teacher_auth');
    res.clearCookie('teacher_data');
    res.redirect('/teacher/login');
});

app.get('/teacher/training', requireTeacher, (req, res) => {
    res.render('teacher/training', { part2Competencies });
});

app.get('/teacher/worksheets', requireTeacher, (req, res) => {
    res.render('teacher/worksheets');
});

app.get('/teacher/evaluation', requireTeacher, (req, res) => {
    res.render('teacher/evaluation');
});

app.post('/teacher/evaluation', requireTeacher, async (req, res) => {
    // Basic validation of answers
    const { q1, q2, q3, q4, q5 } = req.body;
    let correct = 0;
    if (q1 === 'B') correct++; // Evaluar y analizar = Área 1
    if (q2 === 'D') correct++; // Proteger medio ambiente = Área 4.4
    if (q3 === 'A') correct++; // Interactuar, compartir = Área 2
    if (q4 === 'C') correct++; // Resolver problemas tcs = Área 5.1
    if (q5 === 'B') correct++; // Objetivo: Empoderar

    const score = (correct / 5) * 100;

    // Save score to DB
    if (supabase && res.locals.teacher) {
        try {
            await supabase.from('teachers').update({ 
                training_score: score, 
                training_completed: score >= 75,
                training_date: new Date().toISOString()
            }).eq('doc_number', res.locals.teacher.doc_number);
        } catch (e) { }
    }

    const feedback = score >= 75 ? '¡Excelente trabajo!' : 'Te sugerimos revisar nuevamente el material de estudio.';
    res.render('teacher/evaluation', { success: true, score: score, feedback: feedback });
});

app.get('/teacher/klasse2-activity', requireTeacher, (req, res) => {
    res.render('teacher/klasse2-activity');
});

app.get('/teacher/knowledge-test', requireTeacher, (req, res) => {
    res.render('teacher/knowledge_test', { score: null });
});

app.post('/teacher/knowledge-test', requireTeacher, async (req, res) => {
    const { q1, q2, q3, q4, q5, q6 } = req.body;
    let correct = 0;
    if (q1 === 'C') correct++; 
    if (q2 === 'B') correct++; 
    if (q3 === 'B') correct++; 
    if (q4 === 'C') correct++; 
    if (q5 === 'B') correct++; 
    if (q6 === 'B') correct++; 
    
    const score = Math.round((correct / 6) * 100);
    const passed = score >= 75;

    if (supabase && res.locals.teacher) {
        try {
            await supabase.from('teacher_kmk_tests').insert({
                teacher_id: res.locals.teacher.id,
                score: score,
                passed: passed
            });
            await supabase.from('teachers').update({ 
                training_score: score,
                training_completed: passed
            }).eq('id', res.locals.teacher.id);
        } catch (e) {
            console.error('Error saving kmk test:', e);
        }
    }

    res.render('teacher/knowledge_test', { score: score, passed: passed });
});

app.get('/teacher/logout', (req, res) => {
    res.clearCookie('teacher_auth');
    res.clearCookie('teacher_data');
    res.redirect('/teacher/login');
});

// ════════════════════════════════════════
// PROGRESS DASHBOARD & CHALLENGES PRINT ROUTES
// ════════════════════════════════════════

app.get('/teacher/download-challenges', requireTeacher, (req, res) => {
    const levelVal = parseInt(req.query.level, 10) || 5;
    const lang = (req.query.lang || 'es').toLowerCase();

    // Map allActivities to resolve evidence based on levelVal
    const resolvedActivities = {};
    for (const [lvl, acts] of Object.entries(allActivities)) {
        resolvedActivities[lvl] = acts.map(act => {
            const cloned = { ...act };
            const evidenceKey = `evidence_k${levelVal}`;
            const targetEvidence = cloned[evidenceKey] || cloned.evidence_k5 || cloned.evidence || [];
            cloned.evidence = targetEvidence;
            return cloned;
        });
    }

    res.render('teacher/challenges-print', { 
        sharedProfile, 
        allActivities: resolvedActivities,
        level: levelVal,
        lang: lang
    });
});

app.get('/teacher/student-preview', requireTeacher, (req, res) => {
    const challengeToolsConfig = readChallengeToolsConfig();
    res.render('teacher/student-preview', { 
        sharedProfile, 
        allActivities, 
        subjects, 
        klassenConfig,
        challengeToolsConfig,
        defaultAgentTools
    });
});

app.post('/api/teacher/challenge-tools', requireTeacher, (req, res) => {
    const { grade, subject, challenge, description } = req.body;
    if (!grade || !subject || !challenge) {
        return res.status(400).json({ success: false, error: 'Parámetros incompletos' });
    }
    const config = readChallengeToolsConfig();
    const key = `${grade}_${subject}_${challenge}`;
    config[key] = description || '';
    writeChallengeToolsConfig(config);
    return res.json({ success: true });
});

// ════════════════════════════════════════
// API: 3-OPTION INSTRUMENTS MANAGEMENT & AI
// ════════════════════════════════════════
app.get('/api/instruments/:grade/:subject/:reto', requireTeacher, (req, res) => {
    const { grade, subject, reto } = req.params;
    const custom = instrumentStore.getCustomInstrument(grade, subject, reto);
    if (custom) {
        return res.json({ success: true, custom: true, data: custom });
    }
    return res.json({ success: true, custom: false, data: null });
});

app.post('/api/instruments/save', requireTeacher, (req, res) => {
    const { grade, subject, reto, mode, questions } = req.body;
    if (!grade || !subject || !reto || !questions) {
        return res.status(400).json({ success: false, error: 'Datos incompletos.' });
    }
    const saved = instrumentStore.saveCustomInstrument(grade, subject, reto, mode, questions);
    return res.json({ success: true, saved });
});

app.post('/api/instruments/reset', requireTeacher, (req, res) => {
    const { grade, subject, reto } = req.body;
    if (!grade || !subject || !reto) {
        return res.status(400).json({ success: false, error: 'Parámetros incompletos.' });
    }
    instrumentStore.resetToDefault(grade, subject, reto);
    return res.json({ success: true, message: 'Restablecido al modo automático del sistema.' });
});

// Estado de la integración con Google Gemini (diagnóstico para la UI docente)
app.get('/api/instruments/ai-status', requireTeacher, (req, res) => {
    return res.json({ success: true, ...getAIStatus() });
});

app.post('/api/instruments/generate-ai', requireTeacher, async (req, res) => {
    const { grade, subject, reto, prompt, lang, currentQuestions } = req.body;
    if (!reto) {
        return res.status(400).json({ success: false, error: 'Faltan parámetros obligatorios (reto).' });
    }

    const retoNum = parseInt(reto, 10) || 1;
    const effectiveGrade = parseInt(grade, 10) || 5;
    const currentSub = (subject || 'aleman').toLowerCase();

    // Las preguntas enviadas por el editor tienen prioridad; si no llegan, se
    // toman las preguntas base del Reto/Grado/Asignatura desde data.js
    let baseQuestions = (Array.isArray(currentQuestions) && currentQuestions.length > 0) ? currentQuestions : [];
    if (baseQuestions.length === 0) {
        const acts = allActivities[String(retoNum)] || [];
        const activeAct = acts.find(a => a.subject === currentSub) || acts[0];
        if (activeAct) {
            const evidenceKey = `evidence_k${effectiveGrade}`;
            baseQuestions = activeAct[evidenceKey] || activeAct.evidence_k5 || activeAct.evidence || [];
        }
    }

    try {
        const result = await generateInstrumentAI({
            grade: effectiveGrade,
            subject: currentSub,
            retoNum,
            prompt,
            lang: lang || 'es',
            currentQuestions: baseQuestions
        });

        return res.json({
            success: true,
            questions: result.questions,
            source: result.source,
            model: result.model,
            warning: result.warning,
            reto: retoNum,
            totalQuestions: result.questions.length
        });
    } catch (e) {
        console.error('AI generation error:', e);
        return res.status(500).json({ success: false, error: e.message || 'Error al generar preguntas con IA.' });
    }
});


app.get('/teacher/progress', requireTeacher, (req, res) => {
    res.render('teacher/progress', { teacher: res.locals.teacher, sharedProfile, allActivities });
});

app.get('/api/teacher/progress/:className', requireTeacher, async (req, res) => {
    const { className } = req.params;
    if (!supabase) return res.status(500).json({ success: false, error: 'No database connection' });

    try {
        const { data: students, error: sErr } = await supabase
            .from('students')
            .select('*')
            .ilike('class_name', className)
            .order('username', { ascending: true });

        if (sErr) throw sErr;

        if (!students || students.length === 0) {
            return res.json({ success: true, progress: [] });
        }

        const studentIds = students.map(s => s.id);

        const { data: responses, error: rErr } = await supabase
            .from('activity_responses')
            .select('*')
            .in('student_id', studentIds);

        if (rErr) throw rErr;

        const progressMap = {};
        students.forEach(s => {
            progressMap[s.id] = {
                student: s,
                retos: {
                    0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null
                },
                stars: 0,
                starsCount: 0
            };
        });

        function getRetoNum(actId) {
            if (actId === 'profile') return 0;
            const match = actId.match(/^reto(\d+)/);
            if (match) return parseInt(match[1]);
            return null;
        }

        responses.forEach(r => {
            const sId = r.student_id;
            if (progressMap[sId]) {
                const rNum = getRetoNum(r.activity_id);
                if (rNum !== null) {
                    progressMap[sId].retos[rNum] = r.data;

                    if (rNum >= 1 && rNum <= 6 && r.data && r.data.star_rating) {
                        const sVal = parseInt(r.data.star_rating);
                        if (!isNaN(sVal) && sVal > 0) {
                            progressMap[sId].stars += sVal;
                            progressMap[sId].starsCount += 1;
                        }
                    }
                }
            }
        });

        const result = Object.values(progressMap).map(item => {
            const avgStars = item.starsCount > 0 ? Math.round(item.stars / item.starsCount) : 0;
            let evalStatus = 'Sin evaluar';
            let evalColor = 'bg-gray-100 text-gray-800';

            if (avgStars >= 4) {
                evalStatus = 'Aprobado (' + avgStars + ' ⭐)';
                evalColor = 'bg-green-100 text-green-800';
            } else if (avgStars >= 2) {
                evalStatus = 'En proceso (' + avgStars + ' ⭐)';
                evalColor = 'bg-yellow-100 text-yellow-800';
            } else if (avgStars === 1) {
                evalStatus = 'Debe mejorar (1 ⭐)';
                evalColor = 'bg-red-100 text-red-800';
            }

            return {
                student: item.student,
                retos: item.retos,
                avgStars: avgStars,
                evalStatus: evalStatus,
                evalColor: evalColor
            };
        });

        res.json({ success: true, progress: result });
    } catch (e) {
        console.error('Error fetching teacher progress:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ════════════════════════════════════════
// TROUBLESHOOTING & BITACORA ROUTES
// ════════════════════════════════════════
app.get('/teacher/troubleshooting', requireTeacher, (req, res) => {
    res.render('teacher/troubleshooting');
});

app.get('/teacher/bitacora', requireTeacher, (req, res) => {
    res.render('teacher/bitacora', { teacher: res.locals.teacher });
});

// API: Incidents (CRUD)
app.get('/api/incidents', requireTeacher, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    const teacherId = res.locals.teacher?.id;
    const teacherRole = res.locals.teacher?.role || 'profesor';
    try {
        const { status, classroom } = req.query;
        let query = supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(100);

        // Profesores solo ven sus propios incidentes; coordinadores/directivos/admins ven todos.
        const isAdmin = ['admin', 'desarrollador', 'coordinador', 'directivo'].includes(teacherRole);
        if (!isAdmin && teacherId) {
            query = query.eq('reporter_id', teacherId);
        }

        if (status) query = query.eq('status', status);
        if (classroom) query = query.eq('classroom', classroom);

        const { data, error } = await query;
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, incidents: data || [] });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.post('/api/incidents', requireTeacher, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    // reporter_id siempre viene del profesor autenticado, nunca del cliente.
    const reporterId = res.locals.teacher?.id;
    try {
        const { classroom, device_type, priority, description } = req.body;

        const { data, error } = await supabase
            .from('incidents')
            .insert({
                classroom,
                device_type,
                priority: priority || 'media',
                description,
                reporter_id: reporterId,
                status: 'open'
            })
            .select();

        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, incident: data?.[0] });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.put('/api/incidents/:id', requireTeacher, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    const teacherId = res.locals.teacher?.id;
    const teacherRole = res.locals.teacher?.role || 'profesor';
    const isAdmin = ['admin', 'desarrollador', 'coordinador', 'directivo'].includes(teacherRole);
    try {
        const { status } = req.body;
        let updateQuery = supabase.from('incidents')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id);

        // Profesores solo pueden actualizar sus propios incidentes.
        if (!isAdmin && teacherId) {
            updateQuery = updateQuery.eq('reporter_id', teacherId);
        }

        const { error } = await updateQuery;
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false });
    }
});

// NOTA: las rutas /api/instruments/save, /reset y /generate-ai se registran una
// sola vez más arriba (con requireTeacher, usando services/instrument_store.js).
// Aquí existían copias duplicadas que Express nunca ejecutaba, porque siempre
// atiende la primera ruta registrada que coincide con la URL.

// ════════════════════════════════════════
// KMK TRAINING ROUTES
// ════════════════════════════════════════

// API: Get KMK training questions (for quiz)
app.get('/api/kmk-training/questions', (req, res) => {
    return res.json({ success: true, questions: kmkTrainingQuestions });
});

// API: Submit completed KMK training (teacher marks themselves as trained)
app.post('/api/kmk-training/complete', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'Sin Supabase' });
    const { teacher_id, score, total, subject_assigned } = req.body;
    if (!teacher_id) return res.status(400).json({ success: false, message: 'teacher_id requerido' });
    try {
        const { error } = await supabase.from('teachers')
            .update({
                training_completed: true,
                training_date: new Date().toISOString().split('T')[0],
                training_score: score,
                subject_assigned: subject_assigned || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', teacher_id);
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, message: 'Capacitación registrada correctamente' });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get KMK training stats by subject (for monitoring charts)
app.get('/api/admin/kmk-training-stats', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase.from('teachers').select('*');
        if (!teachers) return res.json({ success: true, stats: [], total: 0, trained: 0 });

        const total = teachers.length;
        const trainedTeachers = teachers.filter(t => t.training_completed);
        const trained = trainedTeachers.length;
        const coveragePct = total > 0 ? Math.round((trained / total) * 100) : 0;

        // Group by subject_assigned
        const subjectMap = {};
        subjects.forEach(s => {
            subjectMap[s.id] = { subjectId: s.id, subjectName: s.name.es, icon: s.icon, total: 0, trained: 0, teachers: [] };
        });
        // Add a catch-all for unassigned
        subjectMap['_otros'] = { subjectId: '_otros', subjectName: 'Sin asignatura', icon: '📋', total: 0, trained: 0, teachers: [] };

        teachers.forEach(t => {
            const subj = t.subject_assigned || t.subject || '_otros';
            // Try to match to known subject IDs
            const matchKey = subjects.find(s => s.id === subj || s.name.es.toLowerCase() === (subj || '').toLowerCase())
                ? (subjects.find(s => s.id === subj || s.name.es.toLowerCase() === (subj || '').toLowerCase())).id
                : '_otros';
            if (!subjectMap[matchKey]) subjectMap['_otros'].total++;
            else {
                subjectMap[matchKey].total++;
                if (t.training_completed) {
                    subjectMap[matchKey].trained++;
                    subjectMap[matchKey].teachers.push({
                        id: t.id,
                        name: ((t.first_name || '') + ' ' + t.last_name).trim(),
                        date: t.training_date,
                        score: t.training_score
                    });
                }
            }
        });

        const stats = Object.values(subjectMap).filter(s => s.total > 0).map(s => ({
            ...s,
            pct: s.total > 0 ? Math.round((s.trained / s.total) * 100) : 0
        }));

        return res.json({ success: true, stats, total, trained, coveragePct });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get trained teachers list with details
app.get('/api/admin/kmk-trained-teachers', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase
            .from('teachers')
            .select('id, first_name, last_name, subject, subject_assigned, training_completed, training_date, training_score')
            .order('last_name');
        return res.json({ success: true, teachers: teachers || [] });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// ════════════════════════════════════════
// MULTIMEDIA PRODUCTS ROUTES
// ════════════════════════════════════════

// API: Student saves a multimedia product
app.post('/api/student/multimedia-product', requireLogin, async (req, res) => {
    if (!supabase) return res.json({ success: true, localOnly: true });
    const studentId = res.locals.student.id;
    const { activity_id, subject, product_type, description, link, image_url } = req.body;
    if (!activity_id || !subject || !product_type) {
        return res.status(400).json({ success: false, message: 'Campos requeridos: activity_id, subject, product_type' });
    }
    try {
        // Upsert by student_id + activity_id
        const { data: existing } = await supabase
            .from('multimedia_products')
            .select('id')
            .eq('student_id', studentId)
            .eq('activity_id', activity_id)
            .single();

        let error;
        if (existing) {
            ({ error } = await supabase.from('multimedia_products')
                .update({ subject, product_type, description, link, image_url, updated_at: new Date().toISOString() })
                .eq('id', existing.id));
        } else {
            ({ error } = await supabase.from('multimedia_products')
                .insert({ student_id: studentId, activity_id, subject, product_type, description, link, image_url }));
        }
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Load student multimedia product for an activity
app.get('/api/student/multimedia-product/:activityId', requireLogin, async (req, res) => {
    if (!supabase) return res.json({ success: false, data: null });
    try {
        const { data } = await supabase
            .from('multimedia_products')
            .select('*')
            .eq('student_id', res.locals.student.id)
            .eq('activity_id', req.params.activityId)
            .single();
        return res.json({ success: true, data: data || null });
    } catch (e) {
        return res.json({ success: true, data: null });
    }
});

// API: Admin — multimedia stats per subject
app.get('/api/admin/multimedia-stats', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await supabase.from('students').select('id');
        const { data: products } = await supabase.from('multimedia_products').select('*');
        const totalStudents = students ? students.length : 0;

        const subjectStats = {};
        subjects.forEach(s => {
            subjectStats[s.id] = { subjectId: s.id, subjectName: s.name.es, icon: s.icon, color: s.color, count: 0, studentSet: new Set(), products: [] };
        });

        (products || []).forEach(p => {
            const key = p.subject;
            if (!subjectStats[key]) return;
            subjectStats[key].count++;
            subjectStats[key].studentSet.add(p.student_id);
            subjectStats[key].products.push(p);
        });

        const stats = Object.values(subjectStats).map(s => ({
            subjectId: s.subjectId,
            subjectName: s.subjectName,
            icon: s.icon,
            color: s.color,
            totalProducts: s.count,
            uniqueStudents: s.studentSet.size,
            pct: totalStudents > 0 ? Math.round((s.studentSet.size / totalStudents) * 100) : 0,
            products: s.products.slice(0, 50) // limit for response size
        }));

        return res.json({ success: true, stats, totalStudents });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Admin — list all multimedia products with details
app.get('/api/admin/multimedia-products', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: products } = await supabase
            .from('multimedia_products')
            .select('*, students(full_name, username, class_name)')
            .order('created_at', { ascending: false })
            .limit(500);
        return res.json({ success: true, products: products || [] });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Admin — Get Reto 0 Diagnostic Stats
app.get('/api/admin/reto0-stats', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await supabase.from('students').select('id, class_name');
        const { data: responses } = await supabase.from('activity_responses').select('*').eq('activity_id', 'profile');
        
        if (!responses || !students) return res.json({ success: true, stats: {} });

        const totalStudents = students.length;
        const completedCount = responses.length;
        const completionPct = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

        // Group by class
        const classStats = {};
        const uniqueClasses = [...new Set(students.map(s => s.class_name))].filter(Boolean).sort();
        
        uniqueClasses.forEach(cls => {
            const classStudents = students.filter(s => s.class_name === cls);
            const classResponses = responses.filter(r => classStudents.some(s => s.id === r.student_id));
            classStats[cls] = {
                total: classStudents.length,
                completed: classResponses.length,
                pct: classStudents.length > 0 ? Math.round((classResponses.length / classStudents.length) * 100) : 0
            };
        });

        // Question analysis (eval_q1 to eval_q20)
        const questions = [];
        const correctOptions = {
            eval_q1: "1", eval_q2: "0", eval_q3: "1", eval_q4: "2", eval_q5: "1",
            eval_q6: "1", eval_q7: "0", eval_q8: "1", eval_q9: "0", eval_q10: "0",
            eval_q11: "1", eval_q12: "1", eval_q13: "0", eval_q14: "1", eval_q15: "1",
            eval_q16: "0", eval_q17: "1", eval_q18: "0", eval_q19: "1", eval_q20: "1"
        };

        let totalPassing = 0;
        responses.forEach(r => {
            let correctCount = 0;
            for (let i = 1; i <= 20; i++) {
                const qId = 'eval_q' + i;
                if (r.data && String(r.data[qId]) === correctOptions[qId]) {
                    correctCount++;
                }
            }
            if (correctCount >= 16) totalPassing++;
        });

        const passingPct = totalStudents > 0 ? Math.round((totalPassing / totalStudents) * 100) : 0;

        for (let i = 1; i <= 20; i++) {
            const qId = 'eval_q' + i;
            let answeredCount = 0;
            responses.forEach(r => {
                if (r.data && r.data[qId] != null) answeredCount++;
            });
            questions.push({
                id: qId,
                answered: answeredCount,
                pct: completedCount > 0 ? Math.round((answeredCount / completedCount) * 100) : 0
            });
        }

        return res.json({
            success: true,
            totalStudents,
            completedCount,
            completionPct,
            totalPassing,
            passingPct,
            classStats,
            questions
        });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// ─── Portal de Documentación y Manuales ───
app.get('/docs', requireAnyLogin, (req, res) => {
    if (res.locals.userRole === 'student') {
        return res.redirect('/profile');
    }
    res.render('docs/user', { userRole: res.locals.userRole, student: res.locals.student, teacher: res.locals.teacher, error: req.query.error || null });
});

app.get('/docs/technical', requireAnyLogin, (req, res) => {
    let isDev = false;
    if (res.locals.userRole === 'admin') isDev = true;
    if (res.locals.teacher && res.locals.teacher.role === 'desarrollador') isDev = true;

    if (!isDev) {
        return res.redirect('/docs?error=Acceso+Restringido%3A+El+Manual+Técnico+es+de+uso+exclusivo+para+el+perfil+Desarrollador.');
    }
    res.render('docs/technical', { userRole: res.locals.userRole, student: res.locals.student, teacher: res.locals.teacher });
});

app.get('/docs/user', requireAnyLogin, (req, res) => {
    res.redirect('/docs');
});

// ─── Start Server ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    if (!supabase) {
        console.log('📌 Running in LOCAL mode. Configure .env for Supabase cloud storage.');
    }
});
