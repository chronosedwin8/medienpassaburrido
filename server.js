require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const supabase = require('./supabaseClient');
const { allActivities, tecnologiaActivities, sharedProfile, reto0BySubject, getReto0ForSubject, getVisualReto0, registerSubjectActivities, legacyReto0Questions, klassenConfig, subjects, levels } = require('./data');
const { picturesOf, visualCompetences } = require('./data_visual');
const { getReto0Study, isSimpleGrade, buildSimpleReto0Questions, getSimpleReto0Study } = require('./data_reto0_quiz');
const teacherTest = require('./data_teacher_test');
const { getKmkQuestions } = require('./kmk_training_questions_i18n');
const { part2Competencies } = require('./training_competencies');
const { agentToolsFor } = require('./default_agent_tools');
const instrumentStore = require('./services/instrument_store');
const { KMK_AREAS } = require('./data_kmk_competences');
const i18nStore = require('./services/i18n_store');
const { searchText, splitStudentName } = require('./services/admin_search');
const retoResults = require('./services/reto_result');
const subjectStore = require('./services/subject_store'); // aplica data/subjects_config.json a `subjects`
const classLevels = require('./services/class_levels');
const evidenceLinks = require('./services/evidence_links');
const indicators = require('./services/indicators');
const campaign = require('./services/campaign');
const mailer = require('./services/mailer');
const access = require('./services/access');
const teacherCourses = require('./services/teacher_courses');
const noProgress = require('./services/no_progress');
const teacherSubjects = require('./services/teacher_subjects');
const userGuide = require('./services/user_guide');
const techManual = require('./services/tech_manual');
const yearStore = require('./services/school_years'); // año escolar en curso y lista de años (data/school_years.json)
const displayName = require('./services/display_name');
const phidias = require('./services/phidias');               // matrícula: nombres completos y cursos
const studentDirectory = require('./services/student_directory'); // Supabase al día con Phidias
const microsoftSso = require('./services/microsoft_sso');     // ingreso con la cuenta de Microsoft
const assignments = require('./services/assignments');
const { reto0ProgressBySubject } = require('./services/reto0_progress'); // botones 1-5 del Reto 0       // actividades asignadas a estudiantes o cursos
assignments.init(supabase);
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

// ─── Helper: lee TODAS las filas de una consulta a Supabase ───
// Supabase devuelve máx. 1000 filas por petición y corta el resto SIN error
// (con 1194 estudiantes el panel mostraba solo 1000). Pagina con .range() hasta el final.
// `buildQuery` debe crear una consulta NUEVA en cada llamada, p. ej.
//   selectAll(() => supabase.from('students').select('id, class_name'))
// Devuelve { data, error } igual que una consulta normal.
const SUPABASE_PAGE_SIZE = 1000;
async function selectAll(buildQuery) {
    const rows = [];
    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
        const { data, error } = await buildQuery()
            .order('id', { ascending: true }) // orden estable entre páginas
            .range(from, from + SUPABASE_PAGE_SIZE - 1);
        if (error) return { data: null, error };
        rows.push(...(data || []));
        if (!data || data.length < SUPABASE_PAGE_SIZE) return { data: rows, error: null };
    }
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

const pendingTeachersFile = process.env.PENDING_TEACHERS_FILE
    ? path.resolve(process.env.PENDING_TEACHERS_FILE)
    : path.join(__dirname, 'data', 'pending_teachers.json');
if (!fs.existsSync(pendingTeachersFile)) {
    if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
    fs.writeFileSync(pendingTeachersFile, JSON.stringify([]));
}

// Roles por correo (desarrollador, directivo, coordinador). Se leen en cada petición (services/access.js).
const teacherRolesFile = process.env.TEACHER_ROLES_FILE
    ? path.resolve(process.env.TEACHER_ROLES_FILE)
    : path.join(__dirname, 'data', 'teacher_roles.json');
if (!fs.existsSync(teacherRolesFile)) {
    fs.mkdirSync(path.dirname(teacherRolesFile), { recursive: true });
    fs.writeFileSync(teacherRolesFile, JSON.stringify({}));
}
const roleOfEmail = email => access.roleOf(teacherRolesFile, email);

// Segmentos de cada docente por correo (Administración › Docentes): { correo: ['primaria'] }
const teacherSegmentsFile = process.env.TEACHER_SEGMENTS_FILE
    ? path.resolve(process.env.TEACHER_SEGMENTS_FILE)
    : path.join(__dirname, 'data', 'teacher_segments.json');

function readTeacherSegments() {
    try {
        return JSON.parse(fs.readFileSync(teacherSegmentsFile, 'utf8'));
    } catch (e) {
        return {};
    }
}

// Docentes exentos de la capacitación KMK (Inicio › Docentes pendientes de certificación):
// { correo: { reason, by, date } }. No cuentan en el indicador de profesores capacitados.
const teacherExemptionsFile = process.env.TEACHER_EXEMPTIONS_FILE
    ? path.resolve(process.env.TEACHER_EXEMPTIONS_FILE)
    : path.join(__dirname, 'data', 'teacher_exemptions.json');

function readTeacherExemptions() {
    try {
        return JSON.parse(fs.readFileSync(teacherExemptionsFile, 'utf8')) || {};
    } catch (e) {
        return {};
    }
}
const isExemptTeacher = (exemptions, teacher) => !!exemptions[String((teacher && teacher.email) || '').trim().toLowerCase()];

// Cambios de materia de los docentes hechos desde el panel (para poder revisarlos o deshacerlos)
const teacherSubjectLogFile = process.env.TEACHER_SUBJECT_LOG_FILE
    ? path.resolve(process.env.TEACHER_SUBJECT_LOG_FILE)
    : path.join(__dirname, 'data', 'teacher_subject_changes.json');

// Docentes eliminados desde el panel: copia completa de cada uno (con sus pruebas KMK, rol,
// segmentos y excepción) para poder volver a crearlo si se borró por error.
const teacherDeletionsFile = process.env.TEACHER_DELETIONS_FILE
    ? path.resolve(process.env.TEACHER_DELETIONS_FILE)
    : path.join(__dirname, 'data', 'teacher_deletions.json');

// Materias habilitadas por clase (Administración › Configuración): { K5A: { aleman: true } }
const SUBJECT_CONFIG_FILE = process.env.CLASS_SUBJECTS_FILE
    ? path.resolve(process.env.CLASS_SUBJECTS_FILE)
    : path.join(__dirname, 'subject_config.json');

// Mapeo de profesores por clase (Administración › Mapeo de profesores)
const classTeacherConfigFile = process.env.CLASS_TEACHER_CONFIG_FILE
    ? path.resolve(process.env.CLASS_TEACHER_CONFIG_FILE)
    : path.join(__dirname, 'class_teacher_config.json');

function readClassTeacherConfig() {
    try {
        if (fs.existsSync(classTeacherConfigFile)) return JSON.parse(fs.readFileSync(classTeacherConfigFile, 'utf8'));
    } catch (e) {
        console.error('Error leyendo class_teacher_config.json:', e.message);
    }
    return {};
}

// El mapeo usa claves como "KLASSE 6 (K6A)"; las clases de los estudiantes se llaman "K6A" o "6A".
// Las tres dan "6A".
function classKey(name) {
    const text = String(name || '').toUpperCase();
    const inParens = /\(([^)]+)\)/.exec(text);
    return (inParens ? inParens[1] : text).replace(/^KLASSE/, '').replace(/\s+/g, '').replace(/^K(?=\d)/, '');
}

function teachersForClass(config, className) {
    const key = classKey(className);
    const match = Object.keys(config).find(k => classKey(k) === key);
    return match ? config[match] : {};
}

const localCacheFile = process.env.LOCAL_ACTIVITY_CACHE_FILE
    ? path.resolve(process.env.LOCAL_ACTIVITY_CACHE_FILE)
    : path.join(__dirname, 'data', 'local_activity_responses.json');
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
    const grade = classLevels.questionGrade(className);
    return activities.map(act => {
        const cloned = { ...act };
        const evidence = retoEvidenceFor(cloned, grade);
        if (evidence) cloned.evidence = evidence;
        // «Misión OASIS» (Ready Player One) es para K7-K12: en Primaria (K3-K6) no se muestra
        if (grade >= 3 && grade <= 6) delete cloned.theme;
        return cloned;
    });
}

// Preguntas de un reto 1-6 para un grado (K2 a K12): la versión que editaron los docentes en
// "Configura tus Retos del 0 al 6" o, si no hay, la del sistema (el Reto 0 usa reto0ForGrade). La usan la página del reto, la
// calificación, el cuadernillo impreso y el progreso del docente. null si la actividad no tiene
// preguntas por grado.
function retoEvidenceFor(activity, grade) {
    const g = Math.min(12, Math.max(2, parseInt(grade, 10) || 2));
    const n = retoResults.retoNumber(activity.id);
    const custom = n >= 1 && activity.subject ? instrumentStore.getCustomQuestions(g, activity.subject, n) : null;
    return custom || activity[`evidence_k${g}`] || null;
}

function getActivityForClass(activity, className) {
    if (!activity) return null;
    return getActivitiesForClass([activity], className)[0];
}

// Orden de las listas de clase: "NOMBRES APELLIDO1 APELLIDO2" se ordena por los apellidos
function sortNameKey(name) {
    if (!name) return '';
    const parts = name.trim().toUpperCase().split(/\s+/);
    if (parts.length > 2) {
        return parts.slice(-2).join(' ') + ' ' + parts.slice(0, -2).join(' ');
    }
    return name.toUpperCase();
}

// Reto 0-6 tal como lo ve un estudiante de esa clase (null si la actividad no es un reto).
// El Reto 0 ("profile") tiene una evaluación por materia: hace falta la materia.
function findRetoActivity(activityId, className, subject) {
    const n = retoResults.retoNumber(activityId);
    if (n === null) return null;
    if (n === 0) return classLevels.isVisualClass(className) ? getVisualReto0(validSubject(subject)) : reto0ForGrade(subject, classLevels.questionGrade(className));
    const activity = (allActivities[String(n)] || []).find(a => a.id === activityId);
    return getActivityForClass(activity, className);
}

// Reto 0 de una materia para un grado (K3-K12): las preguntas 1 a 9 (datos y preguntas abiertas)
// son las del sistema; la evaluación (desde la pregunta 10) es la que editaron los docentes en
// "Configura tus Retos del 0 al 6" para ese grado y materia, o la del sistema si no hay.
function reto0ForGrade(subject, grade) {
    let base = getReto0ForSubject(validSubject(subject));
    const g = parseInt(grade, 10);
    // K3, K4 y K5: Reto 0 con frases cortas y ejemplos sencillos (mismos ids y posiciones)
    if (isSimpleGrade(g)) {
        base = {
            ...base,
            evidence: [...base.evidence.filter(item => !item.quiz), ...buildSimpleReto0Questions(base.subject)],
            study: getSimpleReto0Study(base.subject)
        };
    }
    const custom = g >= 3 && g <= 12 ? instrumentStore.getCustomQuestions(g, base.subject, 0) : null;
    if (!custom) return base;
    return { ...base, evidence: [...base.evidence.filter(item => !item.quiz), ...custom] };
}

function validSubject(subject) {
    return subjects.some(s => s.id === subject) ? subject : 'individuos';
}

// ¿Ganó el reto? Para el Reto 0 también reconoce la evaluación anterior de 28 preguntas.
function computeRetoResult(activityId, className, data, subject) {
    const activity = findRetoActivity(activityId, className, subject);
    if (!activity) return null;
    return retoResults.retoResult(activity, data, { legacyQuestions: legacyReto0Questions });
}

// Reto 0 ganado o no en cada materia, con lo guardado en "profile"
function reto0StatusBySubject(profileData, className) {
    const status = {};
    subjects.forEach(s => {
        const result = computeRetoResult('profile', className, profileData || {}, s.id);
        status[s.id] = !!(result && result.won);
    });
    return status;
}

// Detrás del nginx de CapRover: req.protocol y req.secure salen de X-Forwarded-Proto (dirección de retorno del SSO)
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Páginas y archivos comprimidos (gzip): el inicio pasa de cientos de KB a unos pocos
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '5mb' }));

// ─── Cookies de sesión firmadas ───
// Sin firma, cualquiera podía crear a mano `admin_auth=true` o un `teacher_data` falso
// y entrar sin contraseña. Las cookies de sesión se escriben con { signed: true } y se
// leen SOLO desde req.signedCookies (una cookie alterada o sin firma se ignora).
// Si falta COOKIE_SECRET se usa uno temporal: funciona, pero cada reinicio cierra las sesiones.
const COOKIE_SECRET = process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.COOKIE_SECRET) {
    console.warn('⚠️  COOKIE_SECRET no está definido en .env: las sesiones se cerrarán cada vez que se reinicie el servidor.');
}
app.use(cookieParser(COOKIE_SECRET));

// ─── Idioma de la interfaz ───
// Los botones DE/EN/ES guardan la elección en la cookie `lang` (public/js/lang.js) y vale
// para los tres portales. Con ella el servidor entrega la página ya traducida:
// locals.t(clave) en las vistas (locals.t y no t: algunos bucles EJS usan `t` como
// variable) y res.locals.t en los mensajes; i18nScripts() carga los diccionarios.
app.use((req, res, next) => {
    const lang = i18nStore.normalizeLang(req.cookies.lang);
    res.locals.lang = lang;
    res.locals.t = key => i18nStore.translate(key, lang);
    res.locals.i18nScripts = () => i18nStore.scriptTags(req.path);
    // Año escolar en curso (Administración › Año escolar): lo muestran la barra del estudiante y el panel
    const activeYear = yearStore.activeYear();
    res.locals.schoolYear = { id: activeYear, label: yearStore.labelOf(activeYear) };
    next();
});

// Nombre del estudiante para las vistas: { full, first, initial } (services/display_name.js)
app.locals.studentNames = displayName.studentNames;

// Alemán e Inglés se muestran por defecto en su idioma (de / en). Si en la sesión el estudiante
// eligió otro idioma para esa materia (cookie lang_<materia>, la escribe /js/lang.js), se respeta.
// La página lo marca en <body> (partials/header.ejs) para que el navegador no la cambie al cargar.
const NATIVE_LANG = { aleman: 'de', ingles: 'en' };
function useSubjectLang(req, res, subject) {
    const native = NATIVE_LANG[subject];
    if (!native) return;
    const chosen = req.cookies && req.cookies['lang_' + subject];
    const lang = i18nStore.LANGS.includes(chosen) ? chosen : native;
    res.locals.lang = lang;
    res.locals.t = key => i18nStore.translate(key, lang);
    res.locals.nativeLang = { subject, lang };
}

// Subcompetencia KMK de una pregunta ("1.2" -> { id, name: { de, en, es }, area }), para la etiqueta
// que muestra en cada pregunta de los retos qué competencia trabaja (data_kmk_competences.js)
// Área KMK de un reto 1-6 (con su dimensión de inteligencia artificial); null en el Reto 0
app.locals.kmkArea = level => {
    const n = parseInt(level, 10);
    return n >= 1 && n <= 6 ? KMK_AREAS[n - 1] : null;
};
// Dibujos de fondo de cada pregunta de los retos 1-6 (views/activity.ejs, .quiz-deco): el de la materia
// y 3 de la competencia del reto, que van rotando de una pregunta a otra
const QUIZ_DECOR = {
    1: ['🔍', '📁', '🗂️', '🌐', '📚', '🔖'],
    2: ['💬', '🤝', '📨', '👥', '🛡️', '📣'],
    3: ['🎨', '🎬', '✏️', '🧩', '📸', '🎵'],
    4: ['🔒', '🛡️', '🔑', '🧘', '🌿', '⏰'],
    5: ['🛠️', '💡', '⚙️', '🧠', '🤖', '🔧'],
    6: ['📊', '🧭', '🔎', '📰', '🤖', '⚖️']
};
app.locals.quizDecor = (level, subject, n) => {
    const set = QUIZ_DECOR[parseInt(level, 10)] || QUIZ_DECOR[1];
    const start = (Number(n) - 1) % set.length;
    const pics = picturesOf(subject) || {};
    return [pics.topic || '⭐', set[start], set[(start + 1) % set.length], set[(start + 2) % set.length]];
};
app.locals.kmkSubcompetence = id => {
    const area = KMK_AREAS.find(a => a.subs.some(sub => sub.id === id));
    const sub = area && area.subs.find(s => s.id === id);
    return sub ? { id: sub.id, name: sub.name, area: area.name } : null;
};

// ─── Middleware: attach student info to every request ───
app.use(async (req, res, next) => {
    res.locals.student = null;
    const studentId = req.signedCookies.student_id;
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
                const cookieData = JSON.parse(req.signedCookies.student_data || '{}');
                if (cookieData.id) res.locals.student = cookieData;
            } catch (_) { /* ignore */ }
        }
    } else if (studentId) {
        try {
            const cookieData = JSON.parse(req.signedCookies.student_data || '{}');
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
// Sesión del panel: cookies firmadas admin_auth y admin_user (correo). El perfil se lee en
// teacher_roles.json en cada petición: si la cuenta ya no es desarrollador, directivo ni
// coordinador, la sesión del panel deja de valer en el siguiente clic.
function adminSession(req) {
    if (req.signedCookies.admin_auth !== 'true') return null;
    let user = {};
    try { user = JSON.parse(req.signedCookies.admin_user || '{}'); } catch (e) { return null; }
    const role = roleOfEmail(user.email);
    if (!access.isPanelRole(role)) return null;
    return { ...user, role, perms: access.permissionsOf(role) };
}

function requireAdmin(req, res, next) {
    const admin = adminSession(req);
    if (admin) {
        res.locals.admin = admin;
        return next();
    }
    if (req.signedCookies.admin_auth === 'true') {
        res.clearCookie('admin_auth');
        res.clearCookie('admin_user');
    }
    return res.redirect('/admin/login');
}

// Ruta del panel con un permiso (services/access.js). Sin permiso: 403 en la API, el panel en páginas.
function allow(permission) {
    return (req, res, next) => requireAdmin(req, res, () => {
        if (res.locals.admin.perms[permission]) return next();
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(403).json({ success: false, code: 'forbidden', message: res.locals.t('srv_sin_permiso') });
        }
        return res.redirect('/admin');
    });
}
const devOnly = allow('configure'); // solo el desarrollador

// ─── Any Login guard middleware (for Docs/Manuals) ───
function requireAnyLogin(req, res, next) {
    if (req.signedCookies.teacher_auth === 'true') {
        try {
            if (req.signedCookies.teacher_data) {
                const t = JSON.parse(req.signedCookies.teacher_data);
                t.role = roleOfEmail(t.email);
                res.locals.teacher = t;
            } else {
                res.locals.teacher = { username: 'Docente', role: 'profesor' };
            }
        } catch (e) { res.locals.teacher = { username: 'Docente', role: 'profesor' }; }
    }

    const admin = adminSession(req);
    if (admin) {
        res.locals.userRole = 'admin';
        res.locals.adminRole = admin.role;
        if (!res.locals.teacher) res.locals.teacher = admin;
        return next();
    }
    if (req.signedCookies.teacher_auth === 'true') {
        res.locals.userRole = 'teacher';
        return next();
    }
    if (res.locals.student) {
        res.locals.userRole = 'student';
        return next();
    }
    return res.redirect('/login?error=Debes+iniciar+sesión+para+acceder+a+los+manuales+y+documentación+oficial');
} 

// ─── Dirección antigua del menú docente ───
// La vista teacher/menu ya no existe (respondía 500): lleva al inicio de cada portal.
app.get('/teacher/menu', requireAnyLogin, (req, res) => {
    const home = res.locals.userRole === 'admin' ? '/admin' : res.locals.userRole === 'teacher' ? '/teacher/training' : '/';
    res.redirect(home);
});


// Clases de una lista de nombres: una opción por clase con nivel (K5C y "5C" son la misma;
// «sinact» y otras sin nivel no salen), en orden natural (KKP, PK, KIN, K1A … K12C)
function loginClassList(names) {
    const keys = new Set();
    (names || []).forEach(name => {
        if (classLevels.classInfo(name)) keys.add(classLevels.loginClassName(name));
    });
    return [...keys].sort(phidias.classOrder);
}

// Clases de la lista de ingreso y de los informes: las de Phidias; si Phidias no responde, las de Supabase
async function getLoginClasses() {
    if (phidias.configured()) {
        try {
            const list = await phidias.classes();
            if (list.length) return list.map(c => c.class_name);
        } catch (e) { /* se usa Supabase */ }
    }
    if (!supabase) return [];
    try {
        const { data } = await selectAll(() => supabase.from('students').select('class_name'));
        return loginClassList((data || []).map(s => s.class_name));
    } catch (e) { return []; }
}
const getUniqueClasses = getLoginClasses;

// Estudiante que entra con clase + código.
// 1. Phidias (si está configurado): el código debe ser de esa clase; el registro de Supabase se
//    crea o se pone al día (services/student_directory.js).
// 2. Sin Phidias: Supabase, con la clase escrita con y sin K ("K5C" y "5C"). Si hay dos registros,
//    gana el de la clase con K.
async function findStudentForLogin(className, code) {
    const cleanCode = String(code || '').trim();
    if (!/^\d{1,8}$/.test(cleanCode) || !supabase) return null;
    const wanted = classLevels.loginClassName(className);
    if (phidias.configured()) {
        try {
            const ph = await phidias.findByCode(cleanCode);
            if (ph) return ph.class_name === wanted ? await studentDirectory.ensureStudent(supabase, ph, { reason: 'ingreso con código' }) : null;
        } catch (e) {
            console.error('Ingreso con Phidias falló, se usa Supabase:', e.message);
        }
    }
    const variants = classLevels.classNameVariants(className);
    const { data } = await supabase.from('students').select('*')
        .in('class_name', variants).eq('student_code', cleanCode);
    const rows = data || [];
    return rows.find(r => r.class_name === wanted) || rows[0] || null;
}

function setStudentSession(res, student) {
    res.cookie('student_id', student.id, {
        maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true
    });
}

// ════════════════════════════════════════
// LOGIN ROUTES
// ════════════════════════════════════════
app.get('/login', async (req, res) => {
    if (res.locals.student) return res.redirect('/');
    const uniqueClasses = await getLoginClasses();
    return res.render('login', { error: req.query.error ? String(req.query.error).slice(0, 300) : null, klassenConfig, uniqueClasses, ssoEnabled: microsoftSso.configured() });
});

app.get('/api/student/code/:className/:code', async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const student = await findStudentForLogin(req.params.className, req.params.code);
        if (!student) return res.json({ success: false });
        // Solo lo que muestra la página de ingreso
        return res.json({ success: true, student: {
            username: student.username, class_name: student.class_name, full_name: student.full_name
        } });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.post('/login', async (req, res) => {
    const { class_name, student_code } = req.body;
    const uniqueClasses = await getLoginClasses();
    const fail = key => res.render('login', { error: res.locals.t(key), klassenConfig, uniqueClasses, ssoEnabled: microsoftSso.configured() });
    if (!student_code || !String(student_code).trim()) return fail('srv_ingresa_codigo');
    if (!class_name || !String(class_name).trim()) return fail('srv_ingresa_nombre');

    if (!supabase) return fail('srv_sin_base_datos');
    try {
        const student = await findStudentForLogin(class_name, student_code);
        if (!student) return fail('srv_datos_incorrectos');
        setStudentSession(res, student);
        return res.redirect('/');
    } catch (e) {
        console.error('Login error:', e);
        return fail('srv_error_conexion');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('student_id');
    res.clearCookie('student_data');
    res.redirect('/login');
});

// ════════════════════════════════════════
// INGRESO CON MICROSOFT (SSO, services/microsoft_sso.js)
// Un solo botón para todos: el correo decide el perfil.
//   - Docente registrado (tabla teachers) o con perfil del panel (teacher_roles.json): portal
//     docente y, si tiene perfil, también el panel. Desde /admin/login?perfil=... va al panel.
//   - Estudiante: su código es el correo (3255@colegioaleman.edu.co) y Phidias dice su curso.
// ════════════════════════════════════════
const SSO_COOKIE = 'ms_login';
const SSO_TARGETS = ['student', 'teacher', 'admin'];

app.get('/auth/microsoft', (req, res) => {
    if (!microsoftSso.configured()) return res.redirect('/login?error=' + encodeURIComponent(res.locals.t('srv_sso_no_configurado')));
    const as = SSO_TARGETS.includes(req.query.as) ? req.query.as : 'student';
    const perfil = access.PROFILES.includes(req.query.perfil) ? req.query.perfil : null;
    const login = microsoftSso.newLoginState({ as, perfil });
    res.cookie(SSO_COOKIE, JSON.stringify(login), { maxAge: 10 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true, secure: req.secure });
    return res.redirect(microsoftSso.authorizeUrl(login, microsoftSso.redirectUri(req)));
});

function ssoFailPage(as, perfil) {
    if (as === 'admin') return '/admin/login' + (perfil ? `?perfil=${perfil}&` : '?') + 'error=';
    if (as === 'teacher') return '/teacher/login?error=';
    return '/login?error=';
}

function setTeacherSession(req, res, teacher, role) {
    const cookie = { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true };
    res.cookie('teacher_auth', 'true', cookie);
    res.cookie('teacher_data', JSON.stringify({
        first_name: teacher.first_name, last_name: teacher.last_name, subject: teacher.subject,
        email: teacher.email, id: teacher.id, role
    }), cookie);
    if (!req.cookies.lang) {
        const subj = (teacher.subject || '').toLowerCase();
        res.cookie('lang', subj === 'aleman' ? 'de' : subj === 'ingles' ? 'en' : 'es', { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    }
}

function setAdminSession(res, teacher, role) {
    const cookie = { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true };
    res.cookie('admin_auth', 'true', cookie);
    res.cookie('admin_user', JSON.stringify({
        email: teacher.email, role, first_name: teacher.first_name, last_name: teacher.last_name, id: teacher.id
    }), cookie);
}

app.get('/auth/microsoft/callback', async (req, res) => {
    let login = null;
    try { login = JSON.parse(req.signedCookies[SSO_COOKIE] || 'null'); } catch (e) { login = null; }
    res.clearCookie(SSO_COOKIE);
    const as = (login && login.as) || 'student';
    const perfil = login && login.perfil;
    const failWith = message => res.redirect(ssoFailPage(as, perfil) + encodeURIComponent(message));
    const failTo = key => failWith(res.locals.t(key));

    if (req.query.error) {
        console.warn('SSO Microsoft:', req.query.error, req.query.error_description || '');
        return failTo('srv_sso_cancelado');
    }
    if (!login || !req.query.code || req.query.state !== login.state) return failTo('srv_sso_sesion_vencida');

    let identity;
    try {
        const tokens = await microsoftSso.exchangeCode(String(req.query.code), login.verifier, microsoftSso.redirectUri(req));
        identity = microsoftSso.identityFromIdToken(tokens.id_token, { nonce: login.nonce });
    } catch (e) {
        console.error('SSO Microsoft: no se pudo validar el ingreso:', e.message);
        return failTo('srv_sso_error');
    }
    if (!supabase) return failTo('srv_sin_base_datos');

    try {
        const email = identity.email;
        const role = roleOfEmail(email);
        const isStudentEmail = !!phidias.codeFromEmail(email);
        let teacher = null;
        if (!isStudentEmail) {
            const { data } = await supabase.from('teachers').select('*').ilike('email', email).limit(1);
            teacher = (data && data[0]) || null;
        }

        // Docentes y perfiles del panel
        if (teacher || access.isPanelRole(role)) {
            const [first, ...rest] = (identity.name || email.split('@')[0]).split(' ');
            const person = teacher || { email, first_name: first, last_name: rest.join(' '), subject: '', id: null };
            if (as === 'admin') {
                const decision = access.checkProfile(role, perfil || role);
                if (decision === 'not_panel') return failWith(res.locals.t('srv_acceso_denegado').replace('{rol}', String(role || 'profesor').toUpperCase()));
                if (decision === 'mismatch') return failWith(res.locals.t('srv_perfil_distinto').replace('{perfil}', res.locals.t('adm_role_' + role)));
            }
            setTeacherSession(req, res, person, role);
            if (access.isPanelRole(role)) setAdminSession(res, person, role);
            if (as === 'admin' || !teacher) return res.redirect('/admin');
            return res.redirect('/teacher/training');
        }

        // Estudiantes: Phidias por correo (código institucional o correo registrado)
        const ph = await phidias.findByEmail(email).catch(() => null);
        if (ph) {
            const student = await studentDirectory.ensureStudent(supabase, ph, { reason: 'ingreso con Microsoft' });
            setStudentSession(res, student);
            return res.redirect('/');
        }
        // Sin Phidias: un estudiante ya registrado con ese código
        const code = phidias.codeFromEmail(email);
        if (code) {
            const { data: rows } = await supabase.from('students').select('*').eq('student_code', code);
            const student = studentDirectory.pickRow(rows || [], null);
            if (student && student.class_name !== studentDirectory.INACTIVE) {
                setStudentSession(res, student);
                return res.redirect('/');
            }
        }
        console.warn('SSO Microsoft: cuenta sin perfil en la app:', email);
        return failWith(res.locals.t('srv_sso_sin_perfil').replace('{correo}', email));
    } catch (e) {
        console.error('SSO Microsoft: error al abrir la sesión:', e);
        return failTo('srv_sso_error');
    }
});

// Las 7 paradas del Medienpass visual en una materia: Reto 0 y retos 1 a 6
function visualStops(subject, className, storedData, levelConfig) {
    const competences = visualCompetences(subject);
    return retoIdsForSubject(subject).map((id, n) => {
        const data = storedData[id] || {};
        const result = computeRetoResult(id, className, data, subject);
        return {
            n,
            icon: n === 0 ? '🚀' : competences[n - 1].icon,
            title: n === 0 ? null : competences[n - 1].title,
            href: n === 0 ? `/profile?subject=${encodeURIComponent(subject)}` : `/activity/${yearStore.activeYear()}/${id}`,
            won: !!(result && result.won),
            started: hasRetoAnswers(id, data, subject),
            locked: false // retos siempre disponibles (level_config.json ya no bloquea)
        };
    });
}

// Lo que necesita la vista del Medienpass visual para un reto (o la vista previa del docente)
function visualRetoLocals(activity, { preview = false } = {}) {
    const n = retoResults.retoNumber(activity.id);
    return {
        activity,
        section: 'visual',
        preview,
        reto: n,
        pictures: picturesOf(activity.subject),
        competence: n > 0 ? visualCompetences(activity.subject)[n - 1] : null,
        subjectName: (subjects.find(s => s.id === activity.subject) || {}).name || { es: '', de: '', en: '' }
    };
}

// ════════════════════════════════════════
// MATRÍCULA (Phidias) Y ACTIVIDADES ASIGNADAS
// API para docentes y panel (cookies de sesión). Respuestas JSON { success, ... }.
//   GET    /api/roster/classes                       cursos con su número de estudiantes
//   GET    /api/roster/classes/:className/students   estudiantes de un curso (código y nombre)
//   GET    /api/assignments                          asignaciones (?mine=1, ?class=K5A, ?subject=)
//   POST   /api/assignments                          crea { title, subject, retos:[0..6], class_names:[], student_codes:[], due_date, note }
//   GET    /api/assignments/:id                      una asignación con sus destinatarios
//   PUT    /api/assignments/:id                      cambia sus datos (quien la creó o el panel)
//   POST   /api/assignments/:id/targets              { add:{classes,students}, remove:{classes,students} }
//   POST   /api/assignments/:id/archive              la archiva (no se borra)
//   GET    /api/assignments/:id/progress             avance de cada destinatario en cada reto
//   GET    /api/student/assignments                  las del estudiante que entró, con su avance
//   GET    /api/admin/phidias/status · /sync-preview · POST /api/admin/phidias/sync (desarrollador)
// ════════════════════════════════════════

// Docente o perfil del panel que hace la petición
function staffUser(req) {
    const admin = adminSession(req);
    let teacher = null;
    if (req.signedCookies.teacher_auth === 'true') {
        try { teacher = JSON.parse(req.signedCookies.teacher_data || 'null'); } catch (e) { teacher = null; }
    }
    if (!admin && !teacher) return null;
    const who = admin || teacher;
    return {
        email: String(who.email || '').toLowerCase(),
        name: [who.first_name, who.last_name].filter(Boolean).join(' ').trim(),
        panel: !!admin,
        role: admin ? admin.role : roleOfEmail(who.email)
    };
}

function requireStaff(req, res, next) {
    const user = staffUser(req);
    if (!user) {
        if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ success: false, code: 'login', message: res.locals.t('srv_sesion_requerida') });
        return res.redirect('/teacher/login');
    }
    res.locals.staff = user;
    next();
}

const subjectIds = () => subjects.map(s => s.id);

async function rosterStudents() {
    if (phidias.configured()) {
        try { return (await phidias.roster()).students.map(phidias.publicView); } catch (e) { /* Supabase */ }
    }
    if (!supabase) return [];
    const { data } = await selectAll(() => supabase.from('students').select('student_code, username, full_name, class_name'));
    return (data || []).filter(s => classLevels.classInfo(s.class_name)).map(s => ({
        code: String(s.student_code || s.username || '').trim(),
        full_name: s.full_name || s.username,
        class_name: classLevels.loginClassName(s.class_name)
    }));
}

app.get('/api/roster/classes', requireStaff, async (req, res) => {
    try {
        let list = [];
        if (phidias.configured()) {
            try { list = await phidias.classes(); } catch (e) { list = []; }
        }
        if (!list.length) {
            const counts = {};
            (await rosterStudents()).forEach(s => { counts[s.class_name] = (counts[s.class_name] || 0) + 1; });
            list = Object.keys(counts).sort(phidias.classOrder).map(c => ({ class_name: c, count: counts[c] }));
        }
        res.json({ success: true, source: phidias.configured() ? 'phidias' : 'supabase', classes: list });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.get('/api/roster/classes/:className/students', requireStaff, async (req, res) => {
    try {
        const key = classLevels.loginClassName(req.params.className);
        const students = (await rosterStudents()).filter(s => s.class_name === key)
            .sort((a, b) => String(a.full_name).localeCompare(String(b.full_name), 'es', { sensitivity: 'base' }));
        res.json({ success: true, class_name: key, students });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Asignación con nombres legibles para la vista
function describeAssignment(a, roster) {
    const recipients = roster ? assignments.recipients(a, roster) : null;
    return {
        ...a,
        retos: (a.activity_ids || []).map(assignments.retoNumberOf).filter(n => n !== null),
        subject_name: (subjects.find(s => s.id === a.subject) || {}).name || null,
        recipients_count: recipients ? recipients.length : undefined
    };
}

app.get('/api/assignments', requireStaff, async (req, res) => {
    try {
        const user = res.locals.staff;
        let list = await assignments.list({ includeArchived: req.query.archived === '1' });
        if (req.query.mine === '1' || (!user.panel && req.query.all !== '1')) list = list.filter(a => assignments.canEdit(a, user));
        if (req.query.class) {
            const key = classLevels.loginClassName(req.query.class);
            list = list.filter(a => (a.class_names || []).includes(key));
        }
        if (req.query.subject) list = list.filter(a => a.subject === req.query.subject);
        const roster = await rosterStudents();
        res.json({ success: true, storage: (await assignments.status()).backend, assignments: list.map(a => describeAssignment(a, roster)) });
    } catch (e) {
        console.error('Asignaciones:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/assignments', requireStaff, async (req, res) => {
    const { errors, value } = assignments.normalize(req.body || {}, { subjectIds: subjectIds() });
    if (errors.length) return res.status(400).json({ success: false, code: 'invalid', fields: errors, message: res.locals.t('srv_asignacion_incompleta') });
    try {
        if (!value.title) {
            const subj = (subjects.find(s => s.id === value.subject) || {}).name || {};
            value.title = `${subj[res.locals.lang] || subj.es || value.subject} · Reto ${value.activity_ids.map(assignments.retoNumberOf).join(', ')}`;
        }
        const saved = await assignments.create(value, { by: res.locals.staff, schoolYear: yearStore.activeYear() });
        res.json({ success: true, assignment: describeAssignment(saved, await rosterStudents()) });
    } catch (e) {
        console.error('Crear asignación:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

async function loadEditable(req, res) {
    const a = await assignments.get(req.params.id);
    if (!a) { res.status(404).json({ success: false, code: 'not_found' }); return null; }
    if (!assignments.canEdit(a, res.locals.staff)) { res.status(403).json({ success: false, code: 'forbidden', message: res.locals.t('srv_sin_permiso') }); return null; }
    return a;
}

app.get('/api/assignments/:id', requireStaff, async (req, res) => {
    try {
        const a = await assignments.get(req.params.id);
        if (!a) return res.status(404).json({ success: false, code: 'not_found' });
        const roster = await rosterStudents();
        res.json({ success: true, assignment: describeAssignment(a, roster), recipients: assignments.recipients(a, roster), editable: assignments.canEdit(a, res.locals.staff) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.put('/api/assignments/:id', requireStaff, async (req, res) => {
    try {
        const a = await loadEditable(req, res);
        if (!a) return;
        const merged = { ...a, ...req.body, retos: req.body.retos || a.activity_ids };
        const { errors, value } = assignments.normalize(merged, { subjectIds: subjectIds() });
        if (errors.length) return res.status(400).json({ success: false, code: 'invalid', fields: errors, message: res.locals.t('srv_asignacion_incompleta') });
        const saved = await assignments.update(a.id, { ...value, title: value.title || a.title });
        res.json({ success: true, assignment: describeAssignment(saved, await rosterStudents()) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/assignments/:id/targets', requireStaff, async (req, res) => {
    try {
        const a = await loadEditable(req, res);
        if (!a) return;
        const targets = assignments.changeTargets(a, req.body || {});
        if (!targets.class_names.length && !targets.student_codes.length) {
            return res.status(400).json({ success: false, code: 'invalid', fields: ['targets'], message: res.locals.t('srv_asignacion_incompleta') });
        }
        const saved = await assignments.update(a.id, targets);
        res.json({ success: true, assignment: describeAssignment(saved, await rosterStudents()) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/assignments/:id/archive', requireStaff, async (req, res) => {
    try {
        const a = await loadEditable(req, res);
        if (!a) return;
        const saved = await assignments.update(a.id, { active: req.body && req.body.active === true });
        res.json({ success: true, assignment: saved });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Estado de cada reto de la asignación para unas respuestas guardadas: 'won' | 'started' | 'pending'
function assignmentStatus(a, className, responsesByActivity) {
    return (a.activity_ids || []).map(activityId => {
        const data = (responsesByActivity[activityId] && responsesByActivity[activityId].data) || {};
        const result = computeRetoResult(activityId, className, data, a.subject);
        const status = result && result.won ? 'won' : hasRetoAnswers(activityId, data, a.subject) ? 'started' : 'pending';
        return { activity_id: activityId, reto: assignments.retoNumberOf(activityId), status, percent: result && typeof result.pct === 'number' ? Math.round(result.pct) : null };
    });
}

function retoHref(activityId, subject) {
    return activityId === 'profile' ? `/profile?subject=${encodeURIComponent(subject)}` : `/activity/${yearStore.activeYear()}/${activityId}`;
}

app.get('/api/assignments/:id/progress', requireStaff, async (req, res) => {
    try {
        const a = await assignments.get(req.params.id);
        if (!a) return res.status(404).json({ success: false, code: 'not_found' });
        const recipients = assignments.recipients(a, await rosterStudents());
        const codes = recipients.map(r => r.code).filter(Boolean);
        let rows = [];
        let responses = [];
        if (supabase && codes.length) {
            for (let i = 0; i < codes.length; i += 300) {
                const { data } = await supabase.from('students').select('id, student_code, class_name').in('student_code', codes.slice(i, i + 300));
                rows.push(...(data || []));
            }
            const ids = rows.map(r => r.id);
            for (let i = 0; i < ids.length; i += 200) {
                const { data } = await supabase.from('activity_responses').select('student_id, activity_id, data')
                    .in('student_id', ids.slice(i, i + 200)).in('activity_id', a.activity_ids);
                responses.push(...(data || []));
            }
        }
        const byStudent = new Map();
        responses.forEach(r => {
            if (!byStudent.has(r.student_id)) byStudent.set(r.student_id, {});
            byStudent.get(r.student_id)[r.activity_id] = r;
        });
        const result = recipients.map(rec => {
            const row = studentDirectory.pickRow(rows.filter(r => String(r.student_code).trim() === rec.code), rec.class_name);
            const statuses = assignmentStatus(a, rec.class_name || (row && row.class_name), row ? byStudent.get(row.id) || {} : {});
            return { ...rec, registered: !!row, retos: statuses, done: statuses.every(s => s.status === 'won') };
        });
        res.json({ success: true, assignment: describeAssignment(a), students: result,
            summary: { total: result.length, done: result.filter(r => r.done).length, started: result.filter(r => !r.done && r.retos.some(s => s.status !== 'pending')).length } });
    } catch (e) {
        console.error('Avance de la asignación:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// Asignaciones del estudiante con su avance (inicio del estudiante)
async function studentAssignments(student) {
    const list = await assignments.forStudent(student);
    if (!list.length) return [];
    const ids = [...new Set(list.flatMap(a => a.activity_ids || []))];
    let responses = [];
    if (supabase && student.id && !String(student.id).startsWith('local_')) {
        const { data } = await supabase.from('activity_responses').select('activity_id, data').eq('student_id', student.id).in('activity_id', ids);
        responses = data || [];
    }
    const byActivity = {};
    responses.forEach(r => { byActivity[r.activity_id] = r; });
    return list.map(a => ({
        id: a.id, title: a.title, subject: a.subject, due_date: a.due_date, note: a.note,
        subject_name: (subjects.find(s => s.id === a.subject) || {}).name || null,
        by: a.created_by_name || '',
        retos: assignmentStatus(a, student.class_name, byActivity).map(s => ({ ...s, href: retoHref(s.activity_id, a.subject) }))
    }));
}

app.get('/api/student/assignments', requireLogin, async (req, res) => {
    try {
        res.json({ success: true, assignments: await studentAssignments(res.locals.student) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Página de asignaciones (docentes y panel)
app.get('/teacher/assignments', requireStaff, (req, res) => {
    res.render('teacher/assignments', {
        teacher: res.locals.staff.panel ? { ...(adminSession(req) || {}) } : JSON.parse(req.signedCookies.teacher_data || '{}'),
        staff: res.locals.staff,
        subjectList: subjects.filter(s => subjectStore.isActive(s.id)).map(s => ({ id: s.id, name: s.name }))
    });
});

// ── Matrícula de Phidias en el panel ──
app.get('/admin/phidias', allow('lists'), (req, res) => {
    res.render('admin/phidias', { isDeveloper: !!res.locals.admin.perms.configure });
});

app.get('/api/admin/phidias/status', allow('lists'), async (req, res) => {
    res.json({ success: true, phidias: await phidias.status(), assignments: await assignments.status(), sso: { configured: microsoftSso.configured() } });
});

async function phidiasSyncPlan(force) {
    const { students } = await phidias.roster({ force });
    const { data, error } = await selectAll(() => supabase.from('students').select('id, username, class_name, student_code, full_name'));
    if (error) throw error;
    return { plan: studentDirectory.buildPlan(data || [], students), students };
}

app.get('/api/admin/phidias/sync-preview', devOnly, async (req, res) => {
    if (!supabase || !phidias.configured()) return res.status(400).json({ success: false, message: res.locals.t('srv_phidias_no_configurado') });
    try {
        const { plan } = await phidiasSyncPlan(req.query.refresh === '1');
        res.json({ success: true, plan, phidias: await phidias.status() });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post('/api/admin/phidias/sync', devOnly, async (req, res) => {
    if (!supabase || !phidias.configured()) return res.status(400).json({ success: false, message: res.locals.t('srv_phidias_no_configurado') });
    try {
        const { plan, students } = await phidiasSyncPlan(true);
        const only = req.body && Array.isArray(req.body.only) ? new Set(req.body.only) : null; // 'create','update','deactivate'
        if (only) ['create', 'update', 'deactivate'].forEach(k => { if (!only.has(k)) plan[k] = []; });
        const result = await studentDirectory.applyPlan(supabase, plan, students, { by: res.locals.admin.email });
        res.json({ success: true, result, plan });
    } catch (e) {
        console.error('Sincronización Phidias:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// Reto para el JavaScript del inicio: { id, level, subject, fields } (fields = preguntas + competencias)
function slimActivity(activity) {
    return {
        id: activity.id,
        level: String(activity.level),
        subject: activity.subject,
        fields: (activity.evidence ? activity.evidence.length : 0) + (activity.competencies ? activity.competencies.length : 0)
    };
}
// Reto para la tarjeta del inicio: id, materia, ícono y título en los tres idiomas
function cardActivity(activity) {
    const title = typeof activity.title === 'object' && activity.title
        ? activity.title : { es: String(activity.title || ''), de: String(activity.title || ''), en: String(activity.title || '') };
    return { id: activity.id, subject: activity.subject, icon: activity.icon, title };
}

// ════════════════════════════════════════
// DASHBOARD ROUTE
// ════════════════════════════════════════
app.get('/', requireLogin, async (req, res) => {
    // El estudiante trabaja siempre en el año en curso (lo fija el desarrollador en Administración › Año escolar)
    const year = yearStore.activeYear();
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
    const configPath = SUBJECT_CONFIG_FILE;
    try {
        if (fs.existsSync(configPath)) {
            subjectConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (e) { /* no config yet */ }
    const studentClass = res.locals.student.class_name; // e.g. "K4A"
    // Clase sin configuración, o escrita sin K ("5A"): todas las materias habilitadas
    const enabledSubjects = classLevels.classNameVariants(studentClass).map(c => subjectConfig[c]).find(Boolean) || {};

    // Load level config for this student's class
    let levelConfig = {};
    const levelConfigPath = path.join(__dirname, 'level_config.json');
    try {
        if (fs.existsSync(levelConfigPath)) {
            const allLevelConfig = JSON.parse(fs.readFileSync(levelConfigPath, 'utf8'));
            levelConfig = allLevelConfig[studentClass] || {};
        }
    } catch (e) { /* no config yet */ }
    // Los retos están siempre disponibles: level_config.json ya no bloquea ninguno (solicitud 16)
    const activeActivities = activities;

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

    let profileData = null; // Reto 0: un registro con las evaluaciones de todas las materias
    const storedData = {};
    if (isLocal) {
        const cache = readLocalCache();
        if (cache[studentId]) {
            Object.keys(cache[studentId]).forEach(actId => {
                const item = cache[studentId][actId];
                rawProgress[actId] = {
                    fieldsCompleted: getCompletedCount(actId, item.data),
                    updatedAt: item.updated_at
                };
                storedData[actId] = item.data;
                if (actId === 'profile') profileData = item.data;
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
                storedData[item.activity_id] = item.data;
                if (item.activity_id === 'profile') profileData = item.data;
            });
        } catch (e) { /* silently ignore */ }
    }
    const reto0Status = reto0StatusBySubject(profileData, studentClass);

    // Prekínder, Kinder, K1 y K2: Medienpass visual, sin leer ni escribir
    if (classLevels.isVisualClass(studentClass)) {
        const available = subjects.filter(s => s.active !== false && enabledSubjects[s.id] !== false);
        const selected = available.find(s => s.id === req.query.subject) || null;
        if (selected) useSubjectLang(req, res, selected.id); // Alemán e Inglés en su idioma
        return res.render('visual/home', {
            student: res.locals.student,
            section: 'visual',
            subjects: available,
            pictureOf: id => picturesOf(id).topic,
            selected,
            stops: selected ? visualStops(selected.id, studentClass, storedData, levelConfig) : []
        });
    }

    // Avance real del Reto 0 en cada materia (botón del Reto 0 en el inicio)
    const reto0Progress = {};
    subjects.forEach(s => {
        const p = reto0ProgressBySubject(profileData || {}, s.id, { won: !!reto0Status[s.id] });
        reto0Progress[s.id] = { done: p.done, pct: p.pct };
    });
    // Inicio liviano: de cada reto solo lo que usa la página (antes iban todas las preguntas de
    // todos los grados, 9 MB).
    const slimRetos = {};
    const retoCards = {};
    for (let lvl = 1; lvl <= 6; lvl++) {
        retoCards[lvl] = (allResolvedActivities[lvl] || []).map(cardActivity);
        slimRetos[lvl] = (allResolvedActivities[lvl] || []).map(slimActivity);
    }
    let assignedActivities = [];
    try {
        assignedActivities = await withTimeout(studentAssignments(res.locals.student), 4000, 'asignaciones del estudiante');
    } catch (e) {
        console.error('Asignaciones del estudiante:', e.message);
    }

    res.render('index', {
        activities: activeActivities,
        // Las 4 actividades viejas tech_* ya no salen: los retos de Tecnología son los de /activity
        tecnologiaActivities: [],
        slimRetos,
        retoCards,
        reto0Progress,
        assignedActivities,
        student: res.locals.student,
        klassenConfig,
        currentYear: year,
        currentLevel: requestedLevel,
        studentLevel,
        subjects,
        levels,
        enabledSubjects,
        levelConfig,
        progress: rawProgress,
        reto0Status
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
        const allConfig = readClassTeacherConfig();
        const rawConfig = teachersForClass(allConfig, res.locals.student.class_name);
        // Format each teacher name to "Primer Nombre Primer Apellido"
        for (let subj in rawConfig) {
            teacherConfig[subj] = formatTeacherName(rawConfig[subj]);
        }

        const pSet = new Set();
        for (let cls in allConfig) {
            for (let subj in allConfig[cls]) {
                pSet.add(formatTeacherName(allConfig[cls][subj]));
            }
        }
        allTeachers = Array.from(pSet).sort();
    } catch (e) { }

    const studentSubject = req.query.subject || (req.cookies && req.cookies.currentSubject) || 'individuos';
    useSubjectLang(req, res, validSubject(studentSubject)); // Alemán e Inglés en su idioma
    if (classLevels.isVisualClass(res.locals.student.class_name)) {
        return res.render('visual/reto', { student: res.locals.student, ...visualRetoLocals(getVisualReto0(validSubject(studentSubject))) });
    }
    const profileActivity = reto0ForGrade(studentSubject, classLevels.questionGrade(res.locals.student.class_name));

    res.render('activity', { 
        activity: profileActivity, 
        student: res.locals.student,
        currentYear: yearStore.activeYear(),
        section: 'profile',
        teacherConfig,
        allTeachers,
        reto0BySubject,
        // Combo de materias del Reto 0: las activas (y la que se está viendo)
        reto0Subjects: subjects.filter(s => s.active !== false || s.id === profileActivity.subject),
        challengeToolsConfig: {},
        defaultAgentTools: {}
    });
});

// ════════════════════════════════════════
// ACTIVITY ROUTES
// ════════════════════════════════════════
app.get('/activity/:year/:id', requireLogin, (req, res) => {
    if (req.params.id === 'profile') {
        const qSubj = req.query.subject ? `?subject=${encodeURIComponent(req.query.subject)}` : '';
        return res.redirect(`/profile${qSubj}`);
    }
    // El año de la dirección es solo informativo: se trabaja y se guarda en el año en curso
    const year = yearStore.activeYear();
    // Search across all levels for the activity
    let activity = null;
    let actLevel = null;
    for (const [lvl, acts] of Object.entries(allActivities)) {
        const found = acts.find(a => a.id === req.params.id);
        if (found) { activity = found; actLevel = lvl; break; }
    }
    if (!activity) return res.status(404).send('Activity not found');
    const resolvedActivity = getActivityForClass(activity, res.locals.student.class_name);
    useSubjectLang(req, res, resolvedActivity.subject); // Alemán e Inglés en su idioma

    if (classLevels.isVisualClass(res.locals.student.class_name)) {
        return res.render('visual/reto', { student: res.locals.student, ...visualRetoLocals(resolvedActivity) });
    }

    const challengeToolsConfig = readChallengeToolsConfig();
    res.render('activity', {
        activity: resolvedActivity,
        student: res.locals.student,
        currentYear: year,
        section: resolvedActivity.subject || 'medienpass',
        challengeToolsConfig,
        defaultAgentTools: agentToolsFor(resolvedActivity.subject)
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
        currentYear: yearStore.activeYear(),
        section: 'tecnologia',
        challengeToolsConfig,
        defaultAgentTools: agentToolsFor(resolvedActivity.subject)
    });
});

app.get('/activity/:id', requireLogin, (req, res) => {
    res.redirect(`/activity/${yearStore.activeYear()}/${encodeURIComponent(req.params.id)}`);
});

// ════════════════════════════════════════
// API: SAVE / LOAD / PROGRESS
// ════════════════════════════════════════
// Lo guardado de una actividad: combina el caché local y Supabase; gana lo más reciente.
async function readStoredResponse(studentId, activityId) {
    let localData = null;
    let localUpdatedAt = null;
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

    let supabaseData = null;
    let supabaseUpdatedAt = null;
    if (supabase) {
        try {
            const { data, error } = await withTimeout(supabase
                .from('activity_responses')
                .select('data, updated_at')
                .eq('student_id', studentId)
                .eq('activity_id', activityId)
                .maybeSingle(), 6000, 'supabase load');
            if (!error && data) {
                supabaseData = data.data;
                supabaseUpdatedAt = data.updated_at;
            }
        } catch (e) {
            console.error('Supabase load error:', e.message);
        }
    }

    const { data, updatedAt } = mergeStored(localData, localUpdatedAt, supabaseData, supabaseUpdatedAt);
    return { data, updatedAt, localData, localUpdatedAt, localSyncPending };
}

// Combina lo guardado en el caché local y en Supabase; gana lo más reciente.
function mergeStored(localData, localUpdatedAt, supabaseData, supabaseUpdatedAt) {
    if (localData && supabaseData) {
        const localTime = localUpdatedAt ? new Date(localUpdatedAt).getTime() : 0;
        const supabaseTime = supabaseUpdatedAt ? new Date(supabaseUpdatedAt).getTime() : 0;
        return localTime >= supabaseTime
            ? { data: { ...supabaseData, ...localData }, updatedAt: localUpdatedAt }
            : { data: { ...localData, ...supabaseData }, updatedAt: supabaseUpdatedAt };
    }
    if (localData) return { data: localData, updatedAt: localUpdatedAt };
    if (supabaseData) return { data: supabaseData, updatedAt: supabaseUpdatedAt };
    return { data: {}, updatedAt: null };
}

// Lo guardado de varias actividades de un estudiante: caché local y una sola consulta a Supabase
async function readStoredResponses(studentId, activityIds) {
    let cache = {};
    try { cache = readLocalCache()[studentId] || {}; } catch (e) { console.error('Error reading local cache on load:', e); }
    const remote = {};
    if (supabase) {
        try {
            const { data, error } = await withTimeout(supabase
                .from('activity_responses')
                .select('activity_id, data, updated_at')
                .eq('student_id', studentId)
                .in('activity_id', activityIds), 6000, 'supabase load set');
            if (!error) (data || []).forEach(row => { remote[row.activity_id] = row; });
        } catch (e) {
            console.error('Supabase load error:', e.message);
        }
    }
    const stored = {};
    activityIds.forEach(id => {
        const local = cache[id] || {};
        const row = remote[id] || {};
        stored[id] = mergeStored(local.data || null, local.updated_at || null, row.data || null, row.updated_at || null);
    });
    return stored;
}

// ─── Medienpass de una materia: los 7 retos (0 a 6) del estudiante ───
// El cuadro "Certificado Medienpass" (partials/reto-certificate.ejs) y el correo institucional
// solo se habilitan cuando el estudiante ganó los 7 retos de la materia (80 % en cada uno).
// `stored` = { activityId: { data, updatedAt } } de readStoredResponses.
function medienpassFrom(student, subject, stored) {
    subject = validSubject(subject);
    let email = '';
    let emailDate = '';
    let completedAt = '';
    const retos = retoIdsForSubject(subject).map((id, n) => {
        const { data = {}, updatedAt = null } = stored[id] || {};
        const result = computeRetoResult(id, student.class_name, data || {}, subject);
        const won = !!(result && result.won);
        if (won && (updatedAt || '') > completedAt) completedAt = updatedAt || '';
        if (data && data.institutional_email && (updatedAt || '') >= emailDate) {
            email = data.institutional_email;
            emailDate = updatedAt || '';
        }
        return { n, won, kind: result ? result.kind : null, score: result ? result.score : 0,
            max: result ? result.max : 0, pct: result ? result.pct : 0 };
    });
    const wonCount = retos.filter(r => r.won).length;
    const complete = wonCount === retos.length;
    const info = subjects.find(s => s.id === subject) || {};
    return {
        subject, subjectName: info.name || null, icon: info.icon || '',
        wonCount, total: retos.length, complete, retos,
        email: complete ? email : '', completedAt: complete ? (completedAt || null) : null
    };
}

// Materia de un reto: la del Reto 0 abierto (?subject=) o la de la actividad (reto3_ingles -> ingles)
function retoSubjectOf(activityId, retoActivity, subject) {
    if (activityId === 'profile') return validSubject(subject);
    return validSubject((retoActivity && retoActivity.subject) || String(activityId).replace(/^reto[1-6]_/, ''));
}

app.post('/api/save/:activityId', requireLogin, async (req, res) => {
    const { activityId } = req.params;
    const studentId = res.locals.student.id;
    let formData = req.body;
    const period = req.body.period || 1;
    // Las respuestas quedan en el año en curso (Administración › Año escolar)
    const schoolYear = yearStore.activeYear();
    const updatedAt = new Date().toISOString();

    // El Reto 0 es un solo registro para todas las materias: lo que llega se combina con lo
    // guardado para no borrar las respuestas de las otras materias.
    let subject = null;
    if (activityId === 'profile') {
        subject = validSubject(formData && formData.reto0_subject);
        const stored = await readStoredResponse(studentId, activityId);
        formData = { ...stored.data, ...formData };
    }

    // Retos 0-6: resultado calculado aquí. El correo institucional solo se acepta cuando el
    // estudiante completó los 7 retos (0 a 6) de la materia y es del colegio; si no, queda el
    // correo que ya estaba guardado y se avisa (el resto se guarda igual).
    const retoActivity = findRetoActivity(activityId, res.locals.student.class_name, subject);
    const retoResult = retoActivity ? computeRetoResult(activityId, res.locals.student.class_name, formData, subject) : null;
    let emailError = null;
    let medienpass = null;
    if (retoActivity) {
        const retoSubject = retoSubjectOf(activityId, retoActivity, subject);
        const stored = await readStoredResponses(studentId, retoIdsForSubject(retoSubject));
        const previousEmail = ((stored[activityId] || {}).data || {}).institutional_email || '';
        const withThisSave = () => ({ ...stored, [activityId]: { data: formData, updatedAt } });
        const complete = medienpassFrom(res.locals.student, retoSubject, withThisSave()).complete;
        if (formData && typeof formData.institutional_email === 'string') {
            const email = retoResults.normalizeEmail(formData.institutional_email);
            if (!email) formData.institutional_email = '';
            else if (!complete) {
                if (email !== previousEmail) emailError = 'not_complete';
                formData.institutional_email = previousEmail;
            } else if (!retoResults.isInstitutionalEmail(email)) {
                emailError = 'invalid';
                formData.institutional_email = previousEmail;
            } else formData.institutional_email = email;
        }
        medienpass = medienpassFrom(res.locals.student, retoSubject, withThisSave());
    }

    // 1. Guardado local serializado y atómico (sin race read-modify-write).
    try {
        await updateLocalCache(cache => {
            if (!cache[studentId]) cache[studentId] = {};
            cache[studentId][activityId] = {
                data: formData,
                period: period,
                school_year: schoolYear,
                updated_at: updatedAt,
                syncPending: !!supabase
            };
        });
    } catch (e) {
        console.error('Local cache save error:', e.message);
        return res.status(500).json({ success: false, message: 'No se pudo guardar la respuesta localmente.' });
    }

    // 2. Confirm local persistence before acknowledging the save.
    const saved = { success: true, message: 'Guardado localmente.', localOnly: true };
    if (retoActivity) Object.assign(saved, { retoResult, institutionalEmail: formData.institutional_email || '', emailError, medienpass });
    if (activityId === 'profile') saved.reto0Progress = reto0ProgressBySubject(formData, subject, { won: !!(retoResult && retoResult.won) });
    res.json(saved);

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

    const stored = await readStoredResponse(studentId, activityId);
    const { localData, localUpdatedAt, localSyncPending } = stored;

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

    // Reto 0: el resultado es el de la materia abierta (?subject=)
    const loaded = { success: true, data: stored.data, updated_at: stored.updatedAt };
    if (retoResults.retoNumber(activityId) !== null) {
        loaded.retoResult = computeRetoResult(activityId, res.locals.student.class_name, stored.data, req.query.subject);
        if (activityId === 'profile') {
            loaded.reto0Progress = reto0ProgressBySubject(stored.data || {}, validSubject(req.query.subject), { won: !!(loaded.retoResult && loaded.retoResult.won) });
        }
        // Los 7 retos de la materia: el cuadro del certificado aparece solo si están todos ganados
        const retoActivity = findRetoActivity(activityId, res.locals.student.class_name, req.query.subject);
        if (retoActivity) {
            const retoSubject = retoSubjectOf(activityId, retoActivity, req.query.subject);
            const set = await readStoredResponses(studentId, retoIdsForSubject(retoSubject));
            set[activityId] = { data: stored.data, updatedAt: stored.updatedAt };
            loaded.medienpass = medienpassFrom(res.locals.student, retoSubject, set);
        }
    }
    return res.json(loaded);
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
// Ingreso al panel por perfil: /admin/login muestra los tres perfiles y /admin/login?perfil=coordinador
// el formulario de ese perfil. La cuenta debe tener en teacher_roles.json el perfil que eligió.
const loginProfile = value => (access.PROFILES.includes(String(value || '')) ? String(value) : null);

app.get('/admin/login', (req, res) => {
    if (adminSession(req)) return res.redirect('/admin');
    res.render('admin/login', { error: req.query.error ? String(req.query.error).slice(0, 300) : null, profile: loginProfile(req.query.perfil), profiles: access.PROFILES, email: '', ssoEnabled: microsoftSso.configured() });
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body || {};
    const profile = loginProfile(req.body && req.body.profile);
    const fail = (message, keepProfile = profile) => res.render('admin/login', {
        error: message, profile: keepProfile, profiles: access.PROFILES, email: String(email || '').trim().slice(0, 120)
    });
    if (!profile) return fail(res.locals.t('srv_elige_perfil'), null);
    if (!password) return fail(res.locals.t('srv_ingresa_documento'));
    if (!email) return fail(res.locals.t('srv_ingresa_correo'));

    // Sin clave maestra: solo entran docentes (tabla teachers) con un perfil del panel en
    // teacher_roles.json, y por el botón de ese perfil.
    if (!supabase) return fail(res.locals.t('srv_sin_base_datos'));
    try {
        let cleanEmail = String(email).trim().toLowerCase();
        if (!cleanEmail.includes('@')) cleanEmail += '@colegioaleman.edu.co';
        const cleanPassword = String(password).trim();

        const { data: teacher } = await supabase
            .from('teachers')
            .select('*')
            .eq('email', cleanEmail)
            .eq('doc_number', cleanPassword)
            .single();
        if (!teacher) return fail(res.locals.t('srv_credenciales_admin'));

        const role = roleOfEmail(teacher.email);
        const decision = access.checkProfile(role, profile);
        if (decision === 'not_panel') {
            const label = role === 'profesor' ? res.locals.t('adm_rol_badge_profesor') : role;
            return fail(res.locals.t('srv_acceso_denegado').replace('{rol}', label.toUpperCase()));
        }
        // Las credenciales son correctas: se le indica por cuál botón entrar
        if (decision === 'mismatch') {
            return fail(res.locals.t('srv_perfil_distinto').replace('{perfil}', res.locals.t('adm_role_' + role)));
        }

        const cookie = { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true };
        res.cookie('admin_auth', 'true', cookie);
        res.cookie('admin_user', JSON.stringify({
            email: teacher.email,
            role,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            id: teacher.id
        }), cookie);

        // También la sesión docente, para entrar a la capacitación y a los manuales sin otro ingreso
        res.cookie('teacher_auth', 'true', cookie);
        res.cookie('teacher_data', JSON.stringify({
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            subject: teacher.subject,
            email: teacher.email,
            id: teacher.id,
            role
        }), cookie);
        return res.redirect('/admin');
    } catch (e) {
        console.error('Admin login error:', e);
        return fail(res.locals.t('srv_error_login_admin'));
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
    const admin = res.locals.admin;
    // El código del estudiante es su clave de ingreso: solo lo recibe el desarrollador
    const studentColumns = admin.perms.configure ? '*' : 'id, username, full_name, class_name, created_at';
    let students = [];
    if (supabase) {
        try {
            const { data } = await selectAll(() => supabase.from('students').select(studentColumns));
            students = data || [];

            students.sort((a, b) => {
                if (a.class_name < b.class_name) return -1;
                if (a.class_name > b.class_name) return 1;

                const nameA = sortNameKey(a.full_name || a.username);
                const nameB = sortNameKey(b.full_name || b.username);
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
                // Para los buscadores de Administración › Estudiantes
                const { names, surnames } = splitStudentName(s.full_name || s.username);
                s.search = { code: admin.perms.configure ? searchText(s.student_code) : '', names, surnames };
            });

        } catch (e) { /* ignore */ }
    }

    // Clases para el mapeo de profesores: las de los estudiantes y las de Configuración
    let mappingClasses = [];
    if (admin.perms.configure) {
        let subjectConfig = {};
        try { subjectConfig = JSON.parse(fs.readFileSync(SUBJECT_CONFIG_FILE, 'utf8')); } catch (e) { /* sin configuración */ }
        const keys = new Set([...students.map(s => s.class_name), ...Object.keys(subjectConfig)]
            .map(teacherCourses.canonicalClass).filter(Boolean));
        mappingClasses = [...keys].map(teacherCourses.mappingKeyFor);
    }

    res.render('admin/dashboard', {
        adminUser: admin, // nombre y perfil para la barra superior (el perfil, leído de teacher_roles.json)
        access: { role: admin.role, perms: admin.perms, isDeveloper: !!admin.perms.configure },
        mappingClasses,
        students,
        klassenConfig,
        tecnologiaActivities,
        subjects: subjectStore.activeSubjects(), // combos y Configuración: solo las activas
        allSubjects: subjects, // Administración › Materias
        levels,
        schoolYears: yearStore.list(), // filtro de año de Inicio; el en curso viene marcado
        activeSchoolYear: yearStore.activeYear()
    });
});

// API: Bulk add students
app.post('/api/admin/students/bulk', devOnly, async (req, res) => {
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
app.delete('/api/admin/students/:id', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        await supabase.from('activity_responses').delete().eq('student_id', req.params.id);
        await supabase.from('students').delete().eq('id', req.params.id);
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// ─── Retos 0-6 de cada estudiante en una materia (Certificados y Avance retos) ───
// Ganado: 80 % o más (computeRetoResult). En curso: guardó respuestas de ese reto en esa materia
// y todavía no lo gana (en el Reto 0, respuestas de la evaluación de esa materia).
function retoIdsForSubject(subject) {
    return ['profile', ...[1, 2, 3, 4, 5, 6].map(n => `reto${n}_${subject}`)];
}

function hasRetoAnswers(activityId, data, subject) {
    if (activityId === 'profile' && data.reto0_subject === subject) return true;
    const belongs = key => activityId !== 'profile' || key.startsWith(`r0_${subject}_`) || key.startsWith(`r0v_${subject}_`);
    return Object.entries(data).some(([key, value]) => belongs(key) && key !== 'institutional_email'
        && value !== '' && value !== null && value !== false && value !== undefined);
}

function indexResponses(responses) {
    const index = new Map();
    (responses || []).forEach(r => index.set(`${r.student_id}|${r.activity_id}`, r));
    return index;
}

function studentRetoStatus(student, index, subject) {
    let email = '';
    let emailDate = '';
    const retos = retoIdsForSubject(subject).map((id, n) => {
        const resp = index.get(`${student.id}|${id}`);
        const data = (resp && resp.data) || {};
        // El Reto 0 se califica con la evaluación de esta materia
        const result = resp ? computeRetoResult(id, student.class_name, data, subject) : null;
        const won = !!(result && result.won);
        if (won && data.institutional_email && (resp.updated_at || '') >= emailDate) {
            email = data.institutional_email;
            emailDate = resp.updated_at || '';
        }
        return { n, won, started: won || (!!resp && hasRetoAnswers(id, data, subject)),
            kind: result ? result.kind : null, score: result ? result.score : 0, max: result ? result.max : 0,
            pct: result ? result.pct : 0, date: won ? resp.updated_at : null };
    });
    return { retos, email, wonCount: retos.filter(r => r.won).length };
}

// API: Certificados Medienpass de estudiantes (una clase y una materia habilitada).
// Por estudiante: retos 0-6 ganados en esa materia y el correo institucional que dejó al ganar.
app.get('/api/admin/certificates/students/:className/:subject', allow('certificates'), async (req, res) => {
    const { className, subject } = req.params;
    if (!subjectStore.isKnown(subject)) return res.status(400).json({ success: false, message: 'Materia desconocida' });
    if (!supabase) return res.json({ success: true, students: [] });
    try {
        const { data: students, error } = await selectAll(() => supabase.from('students')
            .select('id, username, full_name, student_code, class_name').eq('class_name', className));
        if (error) return res.json({ success: false, message: error.message });
        if (!students.length) return res.json({ success: true, students: [] });

        const { data: responses } = await selectAll(() => supabase.from('activity_responses')
            .select('student_id, activity_id, data, updated_at')
            .in('student_id', students.map(s => s.id))
            .in('activity_id', retoIdsForSubject(subject)));
        const index = indexResponses(responses);
        const showCode = res.locals.admin.perms.configure; // el código es la clave del estudiante
        const rows = students.map(st => ({
            id: st.id,
            name: st.full_name || st.username,
            code: showCode ? (st.student_code || '') : '',
            ...studentRetoStatus(st, index, subject)
        }));
        rows.sort((a, b) => sortNameKey(a.name).localeCompare(sortNameKey(b.name), 'es', { sensitivity: 'base' }));
        return res.json({ success: true, students: rows });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Avance retos (Indicadores). Por clase: estudiantes que ganaron cada reto 0-6 en una materia
// y cuántos lo tienen en curso. Salen las clases con la materia habilitada (Configuración) o con
// algún avance. El detalle por estudiante de una clase lo da la ruta de certificados.
app.get('/api/admin/retos-progress/:subject', allow('reports'), async (req, res) => {
    const { subject } = req.params;
    if (!subjectStore.isKnown(subject)) return res.status(400).json({ success: false, message: 'Materia desconocida' });
    if (!supabase) return res.json({ success: true, classes: [] });
    try {
        const { data: students, error } = await selectAll(() => supabase.from('students').select('id, class_name'));
        if (error) return res.json({ success: false, message: error.message });
        const { data: responses, error: respError } = await selectAll(() => supabase.from('activity_responses')
            .select('student_id, activity_id, data, updated_at')
            .in('activity_id', retoIdsForSubject(subject)));
        if (respError) return res.json({ success: false, message: respError.message });

        let subjectConfig = {};
        try { subjectConfig = JSON.parse(fs.readFileSync(SUBJECT_CONFIG_FILE, 'utf8')); } catch (e) { /* sin configuración */ }
        const index = indexResponses(responses);
        const byClass = new Map();
        students.filter(st => st.class_name).forEach(st => {
            if (!byClass.has(st.class_name)) byClass.set(st.class_name, []);
            byClass.get(st.class_name).push(studentRetoStatus(st, index, subject).retos);
        });
        const classes = [...byClass].map(([className, list]) => ({
            className,
            enabled: !!(subjectConfig[className] && subjectConfig[className][subject] === true),
            total: list.length,
            retos: [0, 1, 2, 3, 4, 5, 6].map(n => ({
                n,
                won: list.filter(r => r[n].won).length,
                inProgress: list.filter(r => r[n].started && !r[n].won).length
            }))
        })).filter(c => c.enabled || c.retos.some(r => r.won || r.inProgress))
            .sort((a, b) => a.className.localeCompare(b.className, 'es', { numeric: true }));
        return res.json({ success: true, subject, classes });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// Números de reto 1-6 que ganó un estudiante, en cualquier materia
function wonRetoNumbers(responses, className) {
    const won = new Set();
    (responses || []).forEach(r => {
        const n = retoResults.retoNumber(r.activity_id);
        if (!n) return;
        const result = computeRetoResult(r.activity_id, className, r.data || {});
        if (result && result.won) won.add(n);
    });
    return won;
}

// Datos de los indicadores institucionales (services/indicators.js)
async function loadIndicators() {
    const { data: students, error } = await selectAll(() => supabase.from('students').select('id, class_name, student_code'));
    if (error) throw new Error(error.message);
    const { data: teachers, error: teachersError } = await selectAll(() => supabase.from('teachers').select('id, first_name, last_name, email, training_completed'));
    if (teachersError) throw new Error(teachersError.message);
    const { data: responses, error: responsesError } = await selectAll(() => supabase.from('activity_responses')
        .select('student_id, activity_id, data').like('activity_id', 'reto%'));
    if (responsesError) throw new Error(responsesError.message);
    const { data: products, error: productsError } = await selectAll(() => supabase.from('multimedia_products').select('student_id, link'));
    if (productsError) throw new Error(productsError.message);

    const classOf = new Map(students.map(s => [s.id, s.class_name]));
    const byStudent = new Map();
    responses.forEach(r => {
        if (!byStudent.has(r.student_id)) byStudent.set(r.student_id, []);
        byStudent.get(r.student_id).push(r);
    });
    const wonRetos = new Map();
    byStudent.forEach((list, id) => wonRetos.set(id, wonRetoNumbers(list, classOf.get(id))));
    const withEvidence = new Set(products.filter(p => evidenceLinks.validLinks(p.link).length).map(p => p.student_id));

    const exemptions = readTeacherExemptions();
    return indicators.computeIndicators({
        students,
        teachers: teachers.map(t => ({ ...t, exempt: isExemptTeacher(exemptions, t) })),
        assignedSegments: readTeacherSegments(),
        mappingSegments: indicators.segmentsFromMapping(readClassTeacherConfig(), teachers),
        wonRetos,
        withEvidence
    });
}

// API: Indicadores institucionales, en total y por segmento
app.get('/api/admin/indicators', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });
    try {
        return res.json({ success: true, indicators: await loadIndicators() });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get PSP Indicators data per class
app.get('/api/admin/psp-indicators/:className', allow('reports'), async (req, res) => {
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
        const { data: responses } = await selectAll(() => supabase
            .from('activity_responses')
            .select('*')
            .in('student_id', studentIds));

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

            // Retos 1-6 ganados: los mismos que cuenta el indicador (números distintos, en cualquier materia)
            const retosWon = wonRetoNumbers(studentResp, st.class_name).size;
            const progress = Math.min(100, Math.round((retosWon / 6) * 100));

            return {
                id: st.id,
                name: st.full_name || st.username,
                teacher: teacherName,
                evaluation_passed: evalStatus,
                retosCompleted: retosWon,
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
app.get('/api/admin/psp-matrix', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await selectAll(() => supabase.from('students').select('id, class_name'));
        if (!students) return res.json({ success: true, matrix: {} });

        const { data: responses } = await selectAll(() => supabase.from('activity_responses').select('student_id, activity_id'));
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
app.get('/api/admin/teacher-reports', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        // Fetch all students to cross reference classes
        const { data: students } = await selectAll(() => supabase.from('students').select('id, class_name'));
        if (!students) return res.json({ success: true, teachers: [] });

        // Fetch profile responses
        const { data: profiles } = await selectAll(() => supabase.from('activity_responses').select('student_id, data').eq('activity_id', 'profile'));
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

// API: Docentes y cursos (Indicadores). Por curso (clase + materia): docente, avance en los retos 0-6
// y si está pendiente por aplicar el Medienpass; por docente: capacitación KMK y cursos.
app.get('/api/admin/teacher-courses', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: true, courses: [], teachers: [], summary: null });
    try {
        // El código solo sirve para no contar dos veces a un estudiante repetido; no sale en la respuesta
        const { data: students, error } = await selectAll(() => supabase.from('students').select('id, class_name, student_code'));
        if (error) return res.json({ success: false, message: error.message });
        const { data: teachers, error: teachersError } = await selectAll(() => supabase.from('teachers')
            .select('id, first_name, last_name, email, subject, training_completed, training_score, training_date'));
        if (teachersError) return res.json({ success: false, message: teachersError.message });
        const [retoResp, profileResp] = await Promise.all([
            selectAll(() => supabase.from('activity_responses').select('student_id, activity_id, data, updated_at').like('activity_id', 'reto%')),
            selectAll(() => supabase.from('activity_responses').select('student_id, activity_id, data, updated_at').eq('activity_id', 'profile'))
        ]);
        if (retoResp.error || profileResp.error) return res.json({ success: false, message: (retoResp.error || profileResp.error).message });

        const index = indexResponses([...retoResp.data, ...profileResp.data]);
        // Docente que cada estudiante escribió en el Reto 0, por materia (teacher_<materia>)
        const reto0Teachers = new Map(profileResp.data.map(r => [r.student_id, Object.fromEntries(Object.entries(r.data || {})
            .filter(([key, value]) => key.startsWith('teacher_') && typeof value === 'string' && value.trim())
            .map(([key, value]) => [key.slice('teacher_'.length), value]))]));
        let subjectConfig = {};
        try { subjectConfig = JSON.parse(fs.readFileSync(SUBJECT_CONFIG_FILE, 'utf8')); } catch (e) { /* sin configuración */ }
        const mapping = readClassTeacherConfig();
        const assignedSegments = readTeacherSegments();
        const mappingSegments = indicators.segmentsFromMapping(mapping, teachers);

        const exemptions = readTeacherExemptions();
        const report = teacherCourses.buildTeacherCourses({
            students,
            teachers: teachers.map(t => ({ ...t, exempt: isExemptTeacher(exemptions, t) })),
            mapping,
            subjectConfig,
            subjects: subjectStore.activeSubjects().map(s => s.id),
            reto0Teachers,
            retoStatus: (student, subject) => studentRetoStatus(student, index, subject).retos,
            segmentsOf: t => indicators.teacherSegments(t, assignedSegments, mappingSegments)
        });
        return res.json({ success: true, ...report });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Get subject configuration per Klasse
app.get('/api/admin/subject-config', allow('certificates'), (req, res) => {
    const configPath = SUBJECT_CONFIG_FILE;
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
// Se combina con lo guardado: las materias inactivas no salen en la tabla y conservan sus valores.
app.post('/api/admin/subject-config', devOnly, async (req, res) => {
    const configData = req.body || {};
    const configPath = SUBJECT_CONFIG_FILE;
    try {
        await _enqueue(configPath, async () => {
            let current = {};
            try { current = JSON.parse(await fsp.readFile(configPath, 'utf8')); } catch (e) { /* primera vez */ }
            Object.entries(configData).forEach(([klasse, values]) => {
                current[klasse] = { ...(current[klasse] || {}), ...values };
            });
            await _writeJsonAtomic(configPath, current);
        });
        return res.json({ success: true, message: 'Configuración guardada' });
    } catch (e) {
        console.error('Save subject config error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get level configuration per Klasse
app.get('/api/admin/level-config', devOnly, (req, res) => {
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
app.post('/api/admin/level-config', devOnly, async (req, res) => {
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

// API: Get the interface texts of one section (comun, docentes, admin, manuales)
app.get('/api/admin/i18n', devOnly, (req, res) => {
    const sections = i18nStore.listSections();
    const section = sections.some(s => s.id === req.query.section) ? req.query.section : 'comun';
    try {
        return res.json({ success: true, section, sections, i18n: i18nStore.getSection(section) });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Save the interface texts of one section ({ section, i18n: { de, en, es } }).
// A body with only { de, en, es } (old format) is saved to the common section.
app.post('/api/admin/i18n', devOnly, async (req, res) => {
    const { section = 'comun', i18n } = req.body.i18n ? req.body : { i18n: req.body };
    try {
        await i18nStore.saveSection(section, i18n);
        return res.json({ success: true, message: 'Traducciones guardadas' });
    } catch (e) {
        console.error('Save i18n error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Lista de docentes para Administración › Docentes (con su rol de teacher_roles.json)
app.get('/api/admin/teachers', allow('lists'), async (req, res) => {
    if (!supabase) return res.json({ success: true, teachers: [] });
    try {
        const { data, error } = await selectAll(() => supabase.from('teachers')
            .select('id, first_name, last_name, email, doc_number, subject, training_completed, training_score, training_date'));
        if (error) return res.json({ success: false, message: error.message });
        const roles = access.readRoles(teacherRolesFile);
        const assignedSegments = readTeacherSegments();
        const mappingSegments = indicators.segmentsFromMapping(readClassTeacherConfig(), data);
        const showDoc = res.locals.admin.perms.configure; // el documento es la clave del docente
        const teachers = (data || []).map(({ doc_number, ...t }) => ({
            ...t,
            ...(showDoc ? { doc_number } : {}),
            role: access.normalizeRole(roles[(t.email || '').trim().toLowerCase()]),
            segments: indicators.teacherSegments(t, assignedSegments, mappingSegments)
        }));
        teachers.sort((a, b) => `${a.last_name || ''} ${a.first_name || ''}`
            .localeCompare(`${b.last_name || ''} ${b.first_name || ''}`, 'es', { sensitivity: 'base' }));
        return res.json({ success: true, teachers });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Editar un docente desde la lista (nombres, apellidos, correo, materia y rol).
// El documento no se cambia aquí. El rol va por correo en teacher_roles.json ("admin" se guarda
// como desarrollador, que es el mismo perfil).
const SIMPLE_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEACHER_FIELDS = 'id, first_name, last_name, email, doc_number, subject, training_completed, training_score, training_date';

app.post('/api/admin/teachers/:id', devOnly, async (req, res) => {
    const clean = value => String(value == null ? '' : value).trim();
    const body = req.body || {};
    const first_name = clean(body.first_name);
    const last_name = clean(body.last_name);
    const email = clean(body.email).toLowerCase();
    const subject = clean(body.subject);
    const role = access.normalizeRole(clean(body.role));
    const bad = message => res.status(400).json({ success: false, message });
    if (!first_name || !last_name || first_name.length > 80 || last_name.length > 80) return bad('Faltan los nombres o los apellidos');
    if (!SIMPLE_EMAIL_RE.test(email) || email.length > 120) return bad('Correo no válido');
    if (subject && !subjectStore.isKnown(subject)) return bad('Materia desconocida');
    if (!access.ASSIGNABLE_ROLES.includes(role)) return bad('Rol no válido');
    const segments = Array.isArray(body.segments) ? body.segments : null;
    if (segments && segments.some(s => !classLevels.SEGMENTS.includes(s))) return bad('Segmento no válido');
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });
    try {
        const { data: found, error: findError } = await supabase.from('teachers').select('id, email').eq('id', req.params.id).limit(1);
        if (findError) return res.json({ success: false, message: findError.message });
        const current = found && found[0];
        if (!current) return res.status(404).json({ success: false, message: 'Docente no encontrado' });

        // Nadie cambia su propio perfil ni su correo desde aquí
        const oldEmail = clean(current.email).toLowerCase();
        if (clean(res.locals.admin.email).toLowerCase() === oldEmail && (role !== res.locals.admin.role || email !== oldEmail)) {
            return bad('No puedes cambiar tu propio perfil ni tu correo desde aquí');
        }

        const { data: updated, error } = await supabase.from('teachers')
            .update({ first_name, last_name, email, subject }).eq('id', req.params.id).select(TEACHER_FIELDS);
        if (error) return res.json({ success: false, message: error.message });
        if (!updated || !updated.length) return res.json({ success: false, message: 'La base de datos no aceptó el cambio' });

        await _enqueue(teacherRolesFile, async () => {
            let roles = {};
            try { roles = JSON.parse(await fsp.readFile(teacherRolesFile, 'utf8')); } catch (e) { /* sin roles */ }
            delete roles[oldEmail];
            if (role !== 'profesor') roles[email] = role;
            else delete roles[email];
            await _writeJsonAtomic(teacherRolesFile, roles);
        });

        // Segmentos: se guardan si llegan y, si cambió el correo, pasan al correo nuevo
        let assignedSegments = {};
        await _enqueue(teacherSegmentsFile, async () => {
            assignedSegments = readTeacherSegments();
            const previous = assignedSegments[oldEmail];
            if (oldEmail !== email) delete assignedSegments[oldEmail];
            if (segments) assignedSegments[email] = classLevels.SEGMENTS.filter(s => segments.includes(s));
            else if (previous) assignedSegments[email] = previous;
            if (segments || (previous && oldEmail !== email)) await _writeJsonAtomic(teacherSegmentsFile, assignedSegments);
        });
        const { data: allTeachers } = await selectAll(() => supabase.from('teachers').select('first_name, last_name, email'));
        const mappingSegments = indicators.segmentsFromMapping(readClassTeacherConfig(), allTeachers);
        return res.json({ success: true, teacher: { ...updated[0], role, segments: indicators.teacherSegments(updated[0], assignedSegments, mappingSegments) } });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Eliminar un docente (desde Docentes y desde los informes de docentes).
// 1) Copia el registro completo, sus pruebas KMK, su rol, segmentos y excepción en
//    data/teacher_deletions.json. 2) Borra el docente (y sus pruebas KMK). 3) Quita su correo de
//    los roles, segmentos y excepciones. El mapeo por clase no se toca: se avisa en cuántas clases
//    sigue nombrado para que el desarrollador decida en Mapeo.
app.delete('/api/admin/teachers/:id', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });
    try {
        const { data: found, error: findError } = await supabase.from('teachers').select('*').eq('id', req.params.id).limit(1);
        if (findError) return res.json({ success: false, message: findError.message });
        const teacher = found && found[0];
        if (!teacher) return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        const email = String(teacher.email || '').trim().toLowerCase();
        if (email && email === String(res.locals.admin.email || '').trim().toLowerCase()) {
            return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta' });
        }

        const { data: tests } = await supabase.from('teacher_kmk_tests').select('*').eq('teacher_id', teacher.id);
        const roles = access.readRoles(teacherRolesFile);
        const segments = readTeacherSegments();
        const exemptions = readTeacherExemptions();
        // Clases del mapeo que lo nombran (comparando con todos los docentes, como los informes)
        const { data: everyone } = await selectAll(() => supabase.from('teachers').select('id, first_name, last_name, email, subject'));
        const mapped = teacherSubjects.mappedSubjects(readClassTeacherConfig(), everyone || [teacher], subjects.map(s => s.id)).get(teacher.id) || [];
        const name = [teacher.first_name, teacher.last_name].filter(Boolean).join(' ').trim() || teacher.email || String(teacher.id);

        // Copia antes de borrar (si no se puede escribir, no se borra)
        await _enqueue(teacherDeletionsFile, async () => {
            let log = [];
            try { log = JSON.parse(await fsp.readFile(teacherDeletionsFile, 'utf8')) || []; } catch (e) { log = []; }
            log.push({
                date: new Date().toISOString(), by: res.locals.admin.email, id: teacher.id, name, teacher,
                kmkTests: tests || [], role: email ? (roles[email] || null) : null,
                segments: email ? (segments[email] || null) : null, exemption: email ? (exemptions[email] || null) : null
            });
            await _writeJsonAtomic(teacherDeletionsFile, log);
        });

        // Sus pruebas KMK primero (si la tabla las ata al docente, el borrado lo exige)
        if (tests && tests.length) {
            const { error: testsError } = await supabase.from('teacher_kmk_tests').delete().eq('teacher_id', teacher.id);
            if (testsError) return res.json({ success: false, message: testsError.message });
        }
        const { data: deleted, error } = await supabase.from('teachers').delete().eq('id', teacher.id).select('id');
        if (error) return res.json({ success: false, message: error.message });
        if (!deleted || !deleted.length) return res.json({ success: false, message: 'La base de datos no aceptó el borrado' });

        if (email) {
            // Quita el correo del archivo tal como está escrito (sin importar mayúsculas)
            const drop = file => _enqueue(file, async () => {
                let current;
                try { current = JSON.parse(await fsp.readFile(file, 'utf8')); } catch (e) { return; }
                if (!current || typeof current !== 'object' || Array.isArray(current)) return;
                const keys = Object.keys(current).filter(k => k.trim().toLowerCase() === email);
                if (!keys.length) return;
                keys.forEach(k => delete current[k]);
                await _writeJsonAtomic(file, current);
            });
            await drop(teacherRolesFile);
            await drop(teacherSegmentsFile);
            await drop(teacherExemptionsFile);
        }
        return res.json({
            success: true, id: teacher.id, name,
            mappedClasses: mapped.reduce((n, m) => n + m.classes.length, 0)
        });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// API: Materias (Administración › Materias): todas, con cuántos docentes y clases tiene cada una
app.get('/api/admin/subjects', devOnly, async (req, res) => {
    let subjectConfig = {};
    try { subjectConfig = JSON.parse(fs.readFileSync(SUBJECT_CONFIG_FILE, 'utf8')); } catch (e) { /* sin configuración */ }
    const teacherCounts = {};
    if (supabase) {
        try {
            const { data } = await selectAll(() => supabase.from('teachers').select('id, subject'));
            (data || []).forEach(t => { teacherCounts[t.subject] = (teacherCounts[t.subject] || 0) + 1; });
        } catch (e) { /* sin conteo de docentes */ }
    }
    const list = subjects.map(s => ({
        id: s.id, name: s.name, icon: s.icon, color: s.color, active: s.active !== false, custom: !!s.custom,
        teachers: teacherCounts[s.id] || 0,
        classes: Object.values(subjectConfig).filter(c => c && c[s.id] === true).length
    }));
    return res.json({ success: true, subjects: list });
});

// API: Nueva materia (nombre DE/EN/ES, ícono y color). Queda activa, con retos 0 a 6 de contenido
// genérico (data_generic_subject.js) y, si se pide, habilitada en todas las clases de Configuración.
app.post('/api/admin/subjects', devOnly, async (req, res) => {
    const body = req.body || {};
    try {
        const result = await _enqueue(subjectStore.CONFIG_FILE, () => subjectStore.createSubject(body, _writeJsonAtomic));
        if (result.error) return res.status(400).json({ success: false, message: result.error });
        const s = result.subject;
        registerSubjectActivities(s);
        let classes = 0;
        if (body.enableAll === true) {
            await _enqueue(SUBJECT_CONFIG_FILE, async () => {
                let config = {};
                try { config = JSON.parse(await fsp.readFile(SUBJECT_CONFIG_FILE, 'utf8')) || {}; } catch (e) { /* sin configuración */ }
                Object.keys(config).forEach(cls => { config[cls] = { ...(config[cls] || {}), [s.id]: true }; });
                classes = Object.keys(config).length;
                await _writeJsonAtomic(SUBJECT_CONFIG_FILE, config);
            });
        }
        return res.json({ success: true, subject: { id: s.id, name: s.name, icon: s.icon, color: s.color, active: true, custom: true, teachers: 0, classes } });
    } catch (e) {
        console.error('Create subject error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Guardar una materia (nombre DE/EN/ES, ícono, color, activa)
app.post('/api/admin/subjects/:id', devOnly, async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};
    if (body.active === false && !subjectStore.activeSubjects().some(s => s.id !== id)) {
        return res.status(400).json({ success: false, message: 'Debe quedar al menos una materia activa' });
    }
    try {
        const result = await _enqueue(subjectStore.CONFIG_FILE, () => subjectStore.saveSubject(id, body, _writeJsonAtomic));
        if (result.error) return res.status(400).json({ success: false, message: result.error });
        const s = result.subject;
        return res.json({ success: true, subject: { id: s.id, name: s.name, icon: s.icon, color: s.color, active: s.active !== false } });
    } catch (e) {
        console.error('Save subject error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// ── Año escolar (Administración › Año escolar, solo el desarrollador) ──
// Lista de años, año en curso y cuántas respuestas hay guardadas en cada uno.
// Respuestas por año: de Supabase; sin Supabase, del caché local. null si Supabase no respondió.
async function responsesPerYear() {
    const counts = {};
    if (supabase) {
        try {
            const { data, error } = await selectAll(() => supabase.from('activity_responses').select('school_year'));
            if (error) throw error;
            (data || []).forEach(r => { counts[r.school_year] = (counts[r.school_year] || 0) + 1; });
            return counts;
        } catch (e) {
            console.error('Conteo de respuestas por año:', e.message);
            return null;
        }
    }
    const cache = readLocalCache();
    Object.values(cache).forEach(acts => Object.values(acts || {}).forEach(item => {
        if (item && item.school_year) counts[item.school_year] = (counts[item.school_year] || 0) + 1;
    }));
    return counts;
}

function schoolYearsPayload(counts) {
    return {
        active: yearStore.activeYear(),
        nextStart: yearStore.nextStart(),
        countsAvailable: !!counts,
        years: yearStore.list().map(y => ({ ...y, responses: counts ? (counts[y.id] || 0) : null }))
    };
}

const SCHOOL_YEAR_ERRORS = {
    invalid_year: 'adm_anio_err_invalido',
    duplicate_year: 'adm_anio_err_repetido',
    unknown_year: 'adm_anio_err_desconocido',
    active_year: 'adm_anio_err_en_curso',
    year_in_use: 'adm_anio_err_con_respuestas',
    counts_unavailable: 'adm_anio_err_sin_conteo'
};
function schoolYearError(res, code, status = 400) {
    return res.status(status).json({ success: false, code, message: res.locals.t(SCHOOL_YEAR_ERRORS[code]) });
}

app.get('/api/admin/school-years', devOnly, async (req, res) => {
    return res.json({ success: true, ...schoolYearsPayload(await responsesPerYear()) });
});

// Agregar un año: llega el año en que empieza (2028 -> 2028 - 2029)
app.post('/api/admin/school-years', devOnly, async (req, res) => {
    try {
        const result = await _enqueue(yearStore.FILE, () => yearStore.add((req.body || {}).start, _writeJsonAtomic));
        if (result.error) return schoolYearError(res, result.error);
        return res.json({ success: true, id: result.id, ...schoolYearsPayload(await responsesPerYear()) });
    } catch (e) {
        console.error('Agregar año escolar:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Año en curso: el que ven los estudiantes y con el que se guardan sus respuestas
app.put('/api/admin/school-years/active', devOnly, async (req, res) => {
    try {
        const result = await _enqueue(yearStore.FILE, () => yearStore.setActive((req.body || {}).id, _writeJsonAtomic));
        if (result.error) return schoolYearError(res, result.error);
        return res.json({ success: true, id: result.id, ...schoolYearsPayload(await responsesPerYear()) });
    } catch (e) {
        console.error('Año escolar en curso:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// Quitar un año de la lista (no borra respuestas): solo si no está en curso y no tiene respuestas
app.delete('/api/admin/school-years/:id', devOnly, async (req, res) => {
    try {
        const counts = await responsesPerYear();
        if (!counts) return schoolYearError(res, 'counts_unavailable', 503);
        const id = req.params.id;
        const result = await _enqueue(yearStore.FILE, () => yearStore.remove(id, _writeJsonAtomic, { savedResponses: counts[id] || 0 }));
        if (result.error) return schoolYearError(res, result.error);
        return res.json({ success: true, id: result.id, ...schoolYearsPayload(counts) });
    } catch (e) {
        console.error('Quitar año escolar:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get teacher extra roles mapping
app.get('/api/admin/teacher-roles', devOnly, (req, res) => {
    const roles = access.readRoles(teacherRolesFile);
    return res.json({ success: true, roles: Object.fromEntries(Object.entries(roles).map(([email, role]) => [email, access.normalizeRole(role)])) });
});

// API: Save teacher extra role (editor de base de datos). Solo perfiles válidos; nadie cambia el suyo.
app.post('/api/admin/teacher-roles', devOnly, async (req, res) => {
    const body = req.body || {};
    const lowerEmail = String(body.email || '').trim().toLowerCase();
    const role = access.normalizeRole(body.role);
    if (!SIMPLE_EMAIL_RE.test(lowerEmail) || lowerEmail.length > 120) return res.status(400).json({ success: false, message: 'Correo no válido' });
    if (!access.ASSIGNABLE_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Rol no válido' });
    if (lowerEmail === String(res.locals.admin.email || '').trim().toLowerCase() && role !== res.locals.admin.role) {
        return res.status(400).json({ success: false, message: 'No puedes cambiar tu propio perfil' });
    }
    try {
        await _enqueue(teacherRolesFile, async () => {
            let currentRoles = {};
            try { currentRoles = JSON.parse(await fsp.readFile(teacherRolesFile, 'utf8')); } catch (e) { /* sin roles */ }
            Object.keys(currentRoles).filter(k => k.trim().toLowerCase() === lowerEmail).forEach(k => delete currentRoles[k]);
            if (role !== 'profesor') currentRoles[lowerEmail] = role;
            await _writeJsonAtomic(teacherRolesFile, currentRoles);
        });
        return res.json({ success: true, message: 'Rol asignado correctamente' });
    } catch (e) {
        console.error('Save teacher role error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// API: Get teacher mapping configuration
app.get('/api/admin/teacher-mapping', devOnly, (req, res) => {
    try {
        return res.json({ success: true, config: readClassTeacherConfig() });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// Mapeo que llega de la tabla editable: { clase: { materia: "NOMBRE DOCENTE" } }.
// Se quitan los campos vacíos; materias y nombres se validan.
function cleanTeacherMapping(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
    const config = {};
    for (const [rawClass, row] of Object.entries(input)) {
        const className = String(rawClass).trim();
        if (!className || className.length > 60 || !row || typeof row !== 'object' || Array.isArray(row)) return null;
        config[className] = {};
        for (const [subject, name] of Object.entries(row)) {
            if (!subjectStore.isKnown(subject) || typeof name !== 'string' || name.length > 120) return null;
            if (name.trim()) config[className][subject] = name.trim().replace(/\s+/g, ' ');
        }
    }
    return config;
}

// API: Save teacher mapping configuration
app.post('/api/admin/teacher-mapping', devOnly, async (req, res) => {
    const configData = cleanTeacherMapping(req.body);
    if (!configData) return res.status(400).json({ success: false, message: 'Mapeo no válido' });
    try {
        await _enqueue(classTeacherConfigFile, () => _writeJsonAtomic(classTeacherConfigFile, configData));
        return res.json({ success: true, message: 'Mapeo de profesores guardado', config: configData });
    } catch (e) {
        console.error('Save teacher mapping error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
});




// ════════════════════════════════════════
// EXECUTIVE DASHBOARD ROUTES
// ════════════════════════════════════════
// Página antigua: el dashboard ejecutivo es la pestaña Inicio del panel
app.get('/admin/executive', requireAdmin, (req, res) => {
    res.redirect('/admin#inicio');
});

// API: KPIs for Executive Dashboard
app.get('/api/admin/kpis', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const data = await loadIndicators();
        return res.json({
            success: true,
            kpis: {
                totalStudents: data.students.total,
                progressRate: data.students.pct,
                teachersCertified: data.teachers.pct
            }
        });
    } catch (e) {
        console.error('KPIs error:', e);
        return res.json({ success: false });
    }
});

// API: Progress by Klasse
app.get('/api/admin/progress-by-klasse', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const year = yearStore.resolve(req.query.year); // sin año válido: el año en curso
        const { data: students } = await selectAll(() => supabase.from('students').select('id, class_name'));
        const { data: responses } = await selectAll(() => supabase.from('activity_responses').select('*').eq('school_year', year));

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
app.get('/api/admin/progress-by-subject', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const year = yearStore.resolve(req.query.year); // sin año válido: el año en curso
        const { data: responses } = await selectAll(() => supabase.from('activity_responses').select('*').eq('school_year', year));

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
            subject: s.name[res.locals.lang] || s.name.es,
            count: subjectCounts[s.id]
        }));
        return res.json({ success: true, data });
    } catch (e) {
        return res.json({ success: false });
    }
});

// API: Inicio › Estudiantes sin empezar el Medienpass (por clase, en el año elegido). Sin códigos.
app.get('/api/admin/students-without-progress', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const year = yearStore.resolve(req.query.year); // sin año válido: el año en curso
        const { data: students } = await selectAll(() => supabase.from('students').select('id, class_name, student_code, full_name, username'));
        const { data: responses } = await selectAll(() => supabase.from('activity_responses').select('student_id').eq('school_year', year));
        const startedIds = new Set((responses || []).map(r => r.student_id));
        const report = noProgress.buildNoProgressReport({ students: students || [], startedIds, sortKey: sortNameKey });
        return res.json({ success: true, year, yearLabel: yearStore.labelOf(year), ...report });
    } catch (e) {
        console.error('students-without-progress:', e.message);
        return res.json({ success: false });
    }
});

// API: Student profile (Reto 0)
app.get('/api/admin/student-profile/:id', allow('lists'), async (req, res) => {
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
app.get('/api/admin/pending-teachers', devOnly, (req, res) => {
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

app.post('/api/admin/approve-teacher/:id', devOnly, async (req, res) => {
    try {
        let pending = [];
        if (fs.existsSync(pendingTeachersFile)) {
            pending = JSON.parse(fs.readFileSync(pendingTeachersFile, 'utf8'));
        }
        const idx = pending.findIndex(p => p.id === req.params.id);
        if (idx === -1) return res.json({ success: false, message: 'Solicitud no encontrada' });

        const teacherData = pending[idx];
        // Materia elegida en la lista de solicitudes (viene preseleccionada con la que pidió el docente)
        const subject = String((req.body && req.body.subject) || teacherData.subject || '').trim();
        if (subject && !subjectStore.isKnown(subject)) {
            return res.status(400).json({ success: false, message: 'Materia desconocida' });
        }

        if (supabase) {
            const { data: existing } = await supabase.from('teachers').select('id').eq('doc_number', teacherData.doc_number).single();
            if (existing) {
                 await supabase.from('teachers').update({
                     first_name: teacherData.first_name,
                     last_name: teacherData.last_name,
                     email: teacherData.email,
                     ...(subject ? { subject } : {})
                 }).eq('id', existing.id);
            } else {
                 await supabase.from('teachers').insert({
                     doc_number: teacherData.doc_number,
                     first_name: teacherData.first_name,
                     last_name: teacherData.last_name,
                     email: teacherData.email,
                     subject
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

app.post('/api/admin/reject-teacher/:id', devOnly, async (req, res) => {
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

// API: Inicio › Docentes pendientes de certificación. Los exentos van aparte. Cada docente trae la
// materia registrada y la que dice el mapeo (services/teacher_subjects.js); canEdit: solo el
// desarrollador corrige materias y da excepciones.
app.get('/api/admin/teachers-status', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers, error } = await selectAll(() => supabase.from('teachers')
            .select('id, first_name, last_name, email, subject, training_completed, training_score'));
        if (error) return res.json({ success: false, message: error.message });
        const exemptions = readTeacherExemptions();
        const subjectIds = subjects.map(s => s.id);
        const mapped = teacherSubjects.mappedSubjects(readClassTeacherConfig(), teachers, subjectIds);
        const nameOf = t => [t.first_name, t.last_name].filter(Boolean).join(' ').trim() || t.email || '—';
        const row = t => ({ id: t.id, name: nameOf(t), email: t.email || '', subject: t.subject || '', score: t.training_score, ...teacherSubjects.reviewSubject(t, mapped.get(t.id)) });
        const sortByName = (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        const pending = teachers.filter(t => !t.training_completed && !isExemptTeacher(exemptions, t)).map(row).sort(sortByName);
        const exempt = teachers.filter(t => !t.training_completed && isExemptTeacher(exemptions, t)).map(t => {
            const info = exemptions[String(t.email || '').trim().toLowerCase()] || {};
            return { ...row(t), reason: info.reason || '', by: info.by || '', date: info.date || null };
        }).sort(sortByName);
        return res.json({
            success: true,
            total: teachers.length,
            certified: teachers.filter(t => t.training_completed).length,
            pending,
            exempt,
            mappingChanges: teacherSubjects.proposedChanges(teachers, readClassTeacherConfig(), subjectIds).length,
            canEdit: !!res.locals.admin.perms.configure
        });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// Correo de un docente por id (las excepciones se guardan por correo)
async function teacherById(id) {
    const { data, error } = await supabase.from('teachers').select('id, first_name, last_name, email, subject').eq('id', id).limit(1);
    if (error) throw new Error(error.message);
    return (data && data[0]) || null;
}

// Excepción de la capacitación KMK: { exempt: true|false, reason }
app.post('/api/admin/teachers/:id/exemption', devOnly, async (req, res) => {
    const body = req.body || {};
    if (typeof body.exempt !== 'boolean') return res.status(400).json({ success: false, message: 'Falta exempt' });
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });
    try {
        const teacher = await teacherById(req.params.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        if (!String(teacher.email || '').trim()) return res.status(400).json({ success: false, message: 'El docente no tiene correo' });
        await _enqueue(teacherExemptionsFile, async () => {
            const next = teacherSubjects.setExemption(readTeacherExemptions(), teacher.email, body.exempt, { reason: body.reason, by: res.locals.admin.email });
            await _writeJsonAtomic(teacherExemptionsFile, next);
        });
        return res.json({ success: true, exempt: body.exempt });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// Registro de los cambios de materia hechos desde el panel (data/teacher_subject_changes.json)
async function logSubjectChanges(changes, by) {
    if (!changes.length) return;
    await _enqueue(teacherSubjectLogFile, async () => {
        let log = [];
        try { log = JSON.parse(await fsp.readFile(teacherSubjectLogFile, 'utf8')) || []; } catch (e) { log = []; }
        const date = new Date().toISOString();
        changes.forEach(c => log.push({ date, by, id: c.id, name: c.name, from: c.from, to: c.to }));
        await _writeJsonAtomic(teacherSubjectLogFile, log.slice(-2000));
    });
}

// Corregir la materia de un docente: { subject }
app.post('/api/admin/teachers/:id/subject', devOnly, async (req, res) => {
    const subject = String((req.body || {}).subject || '').trim();
    if (!subjectStore.isKnown(subject)) return res.status(400).json({ success: false, message: 'Materia desconocida' });
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });
    try {
        const teacher = await teacherById(req.params.id);
        if (!teacher) return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        if (teacher.subject === subject) return res.json({ success: true, subject, changed: false });
        const { data: updated, error } = await supabase.from('teachers').update({ subject }).eq('id', teacher.id).select('id, subject');
        if (error) return res.json({ success: false, message: error.message });
        if (!updated || !updated.length) return res.json({ success: false, message: 'La base de datos no aceptó el cambio' });
        await logSubjectChanges([{ id: teacher.id, name: [teacher.first_name, teacher.last_name].join(' ').trim(), from: teacher.subject || '', to: subject }], res.locals.admin.email);
        return res.json({ success: true, subject, changed: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// Administración › Mapeo › Asignatura de cada docente: todos los docentes registrados con su
// asignatura (la que usan los informes por materia) y la que dice el mapeo.
app.get('/api/admin/teacher-subjects', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: true, teachers: [], mappingChanges: 0 });
    try {
        const { data: teachers, error } = await selectAll(() => supabase.from('teachers')
            .select('id, first_name, last_name, email, subject, training_completed'));
        if (error) return res.json({ success: false, message: error.message });
        const subjectIds = subjects.map(s => s.id);
        const mapping = readClassTeacherConfig();
        const mapped = teacherSubjects.mappedSubjects(mapping, teachers, subjectIds);
        const exemptions = readTeacherExemptions();
        const list = teachers.map(t => ({
            id: t.id,
            name: [t.first_name, t.last_name].filter(Boolean).join(' ').trim() || t.email || '—',
            email: t.email || '',
            subject: subjectStore.isKnown(t.subject) ? t.subject : '',
            trained: !!t.training_completed,
            exempt: isExemptTeacher(exemptions, t),
            ...teacherSubjects.reviewSubject(t, mapped.get(t.id))
        })).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
        return res.json({ success: true, teachers: list, mappingChanges: teacherSubjects.proposedChanges(teachers, mapping, subjectIds).length });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// Aplicar a todos los docentes la materia que dice el mapeo (solo las propuestas sin empate)
app.post('/api/admin/teacher-subjects/apply', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'Supabase no configurado' });
    try {
        const { data: teachers, error } = await selectAll(() => supabase.from('teachers').select('id, first_name, last_name, email, subject'));
        if (error) return res.json({ success: false, message: error.message });
        const changes = teacherSubjects.proposedChanges(teachers, readClassTeacherConfig(), subjects.map(s => s.id));
        const done = [];
        const failed = [];
        for (const change of changes) {
            const { data: updated, error: updateError } = await supabase.from('teachers').update({ subject: change.to }).eq('id', change.id).select('id');
            if (updateError || !updated || !updated.length) failed.push(change.name);
            else done.push(change);
        }
        await logSubjectChanges(done, res.locals.admin.email);
        return res.json({ success: true, applied: done.length, failed });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// El inventario de equipos se quitó del panel (la tabla devices sigue en Supabase).
// Los enlaces viejos a /admin/inventory llevan al panel.
app.get('/admin/inventory', requireAdmin, (req, res) => {
    res.redirect('/admin');
});

// API: Get all records from a DB table
app.get('/api/admin/db-records/:table', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers', 'activity_responses'];
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
app.post('/api/admin/db-records/:table/:id', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers'];
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
app.post('/api/admin/db-records/:table', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers'];
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
app.delete('/api/admin/db-records/:table/:id', devOnly, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers'];
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
    if (req.signedCookies.teacher_auth === 'true') return res.redirect('/teacher/training');
    res.render('teacher/login', { error: req.query.error ? String(req.query.error).slice(0, 300) : null, subjects, ssoEnabled: microsoftSso.configured() });
});

app.post('/api/teacher/register', async (req, res) => {
    try {
        const { first_name, last_name, email, doc_number } = req.body;
        if (!first_name || !last_name || !email || !doc_number) {
            return res.json({ success: false, message: 'Faltan campos obligatorios' });
        }
        // Materia (opcional): solo una materia activa
        const subject = subjectStore.isActive(String(req.body.subject || '')) ? req.body.subject : '';

        let pending = [];
        try { pending = JSON.parse(fs.readFileSync(pendingTeachersFile, 'utf8')); } catch(e) {}
        
        if (pending.find(p => p.doc_number === doc_number || p.email === email)) {
            return res.json({ success: false, message: 'Ya existe una solicitud pendiente para este documento o correo.' });
        }

        pending.push({
            id: Date.now().toString(),
            first_name, last_name, email, doc_number, subject,
            date: new Date().toISOString()
        });

        await _enqueue(pendingTeachersFile, () => _writeJsonAtomic(pendingTeachersFile, pending));
        return res.json({ success: true, message: 'Registro enviado para aprobación.' });
    } catch(e) {
        return res.json({ success: false, message: 'Error en el servidor.' });
    }
});

app.post('/teacher/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('teacher/login', { error: res.locals.t('srv_ingresa_correo_clave'), subjects });
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
                // Sin el documento en la cookie: es la clave del docente
                const teacherData = {
                    first_name: teacher.first_name,
                    last_name: teacher.last_name,
                    subject: teacher.subject,
                    email: teacher.email,
                    id: teacher.id,
                    role: roleOfEmail(teacher.email)
                };
                res.cookie('teacher_auth', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true });
                res.cookie('teacher_data', JSON.stringify(teacherData), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', signed: true });
                // Idioma inicial según la materia, solo si aún no se eligió uno con los botones
                if (!req.cookies.lang) {
                    const subj = (teacher.subject || '').toLowerCase();
                    const subjectLang = subj === 'aleman' ? 'de' : subj === 'ingles' ? 'en' : 'es';
                    res.cookie('lang', subjectLang, { maxAge: 365 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
                }
                return res.redirect('/teacher/training');
            } else {
                return res.render('teacher/login', { error: res.locals.t('srv_credenciales_docente'), subjects });
            }
        } catch (e) {
            console.error('Teacher login error:', e);
            return res.render('teacher/login', { error: res.locals.t('srv_error_login'), subjects });
        }
    } else {
        return res.render('teacher/login', { error: res.locals.t('srv_sin_base_datos'), subjects });
    }
});

// Middleware for teacher auth. El rol se lee en teacher_roles.json en cada petición (no el de la cookie).
function requireTeacher(req, res, next) {
    if (req.signedCookies.teacher_auth === 'true' && req.signedCookies.teacher_data) {
        try {
            const t = JSON.parse(req.signedCookies.teacher_data);
            delete t.doc_number; // cookies anteriores lo traían
            t.role = roleOfEmail(t.email);
            res.locals.teacher = t;
            return next();
        } catch (e) { }
    }
    return res.redirect('/teacher/login');
}

app.get('/teacher/logout', (req, res) => {
    res.clearCookie('teacher_auth');
    res.clearCookie('teacher_data');
    res.redirect('/teacher/login');
});

// Materia con la que se ve la capacitación o se presenta el test: la elegida o la del docente
async function trainingSubject(req, res) {
    const asked = String((req.query && req.query.subject) || (req.body && req.body.subject) || '');
    if (subjects.some(s => s.id === asked)) return asked;
    return currentTeacherSubject(res.locals.teacher);
}

async function teacherTrainingStatus(teacher) {
    if (!supabase || !teacher || !teacher.id) return { completed: false };
    try {
        const { data } = await withTimeout(supabase.from('teachers')
            .select('training_completed, training_score, training_date').eq('id', teacher.id).maybeSingle(), 4000, 'capacitación del docente');
        return { completed: !!(data && data.training_completed), score: data && data.training_score, date: data && data.training_date };
    } catch (e) {
        return { completed: false };
    }
}

app.get('/teacher/training', requireTeacher, async (req, res) => {
    const subject = await trainingSubject(req, res);
    // "En tu materia": lo que ya existe para esa asignatura (ejemplos del Reto 0 y preguntas de sus retos)
    const retoSamples = {};
    if (subject) {
        [1, 2, 3, 4, 5, 6].forEach(n => {
            const activity = allActivities[String(n)].find(a => a.subject === subject);
            const questions = (retoEvidenceFor(activity, 5) || []).filter(item => item.type === 'radio_group');
            retoSamples[n] = questions.filter((q, i) => questions.findIndex(other => other.kmk === q.kmk) === i).slice(0, 3);
        });
    }
    res.render('teacher/training', {
        part2Competencies,
        subjects: subjects.filter(s => s.active !== false),
        subject,
        study: subject ? getReto0Study(subject) : null,
        retoSamples,
        kmkAreas: KMK_AREAS, // dimensión de inteligencia artificial de cada competencia
        status: await teacherTrainingStatus(res.locals.teacher)
    });
});

// El banco de fichas se retiró: la dirección vieja lleva a Capacitación KMK (las hojas de trabajo de
// Klett siguen en la pestaña «Fichas» de cada competencia)
app.get('/teacher/worksheets', requireTeacher, (req, res) => res.redirect('/teacher/training'));

// Test KMK de 12 preguntas (data_teacher_test.js). Se califica aquí con lo que envía el formulario.
app.get('/teacher/evaluation', requireTeacher, async (req, res) => {
    const subject = await trainingSubject(req, res);
    res.render('teacher/evaluation', {
        subjects: subjects.filter(s => s.active !== false),
        subject,
        questions: subject ? teacherTest.publicTest(teacherTest.buildTeacherTest(subject)) : null,
        result: null,
        status: await teacherTrainingStatus(res.locals.teacher),
        kmkAreas: KMK_AREAS
    });
});

// Guarda el intento. Quien ya aprobó no pierde la aprobación si repite el test y le va peor.
async function saveTeacherTestResult(teacher, result) {
    if (!supabase || !teacher || !teacher.id) return;
    try {
        await supabase.from('teacher_kmk_tests').insert({ teacher_id: teacher.id, score: result.score, passed: result.passed });
        const { data } = await supabase.from('teachers').select('training_completed, training_score').eq('id', teacher.id).maybeSingle();
        const already = !!(data && data.training_completed);
        if (result.passed) {
            const fields = { training_completed: true, training_score: Math.max(result.score, (data && data.training_score) || 0) };
            if (!already) fields.training_date = new Date().toISOString();
            await supabase.from('teachers').update(fields).eq('id', teacher.id);
        } else if (!already) {
            await supabase.from('teachers').update({ training_completed: false, training_score: result.score }).eq('id', teacher.id);
        }
    } catch (e) {
        console.error('Error guardando el test KMK:', e.message);
    }
}

app.post('/teacher/evaluation', requireTeacher, async (req, res) => {
    const subject = await trainingSubject(req, res);
    if (!subject) return res.redirect('/teacher/evaluation');
    const answers = {};
    Object.entries(req.body || {}).forEach(([key, value]) => { if (key.startsWith('q_')) answers[key.slice(2)] = value; });
    const result = teacherTest.gradeTeacherTest(teacherTest.buildTeacherTest(subject), answers);
    const status = await teacherTrainingStatus(res.locals.teacher);
    await saveTeacherTestResult(res.locals.teacher, result);
    res.render('teacher/evaluation', {
        subjects: subjects.filter(s => s.active !== false),
        subject,
        questions: null,
        result,
        status,
        kmkAreas: KMK_AREAS
    });
});

app.get('/teacher/klasse2-activity', requireTeacher, (req, res) => {
    res.render('teacher/klasse2-activity');
});

// El test de conocimiento anterior ahora es parte del test de 12 preguntas
app.all('/teacher/knowledge-test', requireTeacher, (req, res) => res.redirect('/teacher/evaluation'));

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
    // ?lang= permite imprimir en otro idioma; si no viene, el idioma global elegido
    const lang = i18nStore.normalizeLang((req.query.lang || res.locals.lang).toLowerCase());

    // Preguntas del grado elegido (las editadas por los docentes, si las hay)
    const resolvedActivities = {};
    for (const [lvl, acts] of Object.entries(allActivities)) {
        resolvedActivities[lvl] = acts.map(act => ({
            ...act,
            evidence: retoEvidenceFor(act, levelVal) || act.evidence_k5 || act.evidence || []
        }));
    }

    // Las preguntas cambian por materia: ?subject= o, si no viene, la materia del docente
    const teacherSubject = ((res.locals.teacher && res.locals.teacher.subject) || '').toLowerCase();
    const subject = validSubject(req.query.subject || teacherSubject || 'aleman');

    res.render('teacher/challenges-print', {
        reto0: reto0ForGrade(subject, levelVal), // con la evaluación editada de ese grado, si la hay
        subject,
        allActivities: resolvedActivities,
        level: levelVal,
        lang: lang
    });
});

app.get('/teacher/student-preview', requireTeacher, async (req, res) => {
    const challengeToolsConfig = readChallengeToolsConfig();
    res.render('teacher/student-preview', {
        sharedProfile,
        reto0BySubject,
        allActivities,
        subjects,
        klassenConfig,
        challengeToolsConfig,
        defaultAgentTools: {},
        kmkAreas: KMK_AREAS,
        editorAccess: await teacherEditAccess(res.locals.teacher)
    });
});

// Vista previa del Medienpass visual para el docente: la misma página, sin guardar nada
app.get('/teacher/visual-preview', requireTeacher, (req, res) => {
    const subject = validSubject(req.query.subject);
    const n = Math.min(6, Math.max(0, parseInt(req.query.reto, 10) || 0));
    const activity = n === 0
        ? getVisualReto0(subject)
        : { ...allActivities[String(n)].find(a => a.subject === subject) };
    if (n > 0) activity.evidence = retoEvidenceFor(activity, 2);
    res.render('visual/reto', { student: null, ...visualRetoLocals(activity, { preview: true }) });
});

// ─── Configura tus Retos del 1 al 6: quién puede guardar ───
// Cada docente guarda las preguntas de su materia; estos roles, las de cualquier materia.
const EDIT_ANY_SUBJECT_ROLES = ['coordinador', 'directivo', 'admin', 'desarrollador'];

// Materia actual del docente: la de la tabla teachers (el admin puede haberla cambiado después
// de que inició sesión) o, si no se puede consultar, la de su sesión.
async function currentTeacherSubject(teacher) {
    let subject = (teacher && teacher.subject) || '';
    if (supabase && teacher && teacher.id) {
        try {
            const { data } = await withTimeout(supabase.from('teachers').select('subject').eq('id', teacher.id).maybeSingle(), 4000, 'materia del docente');
            if (data) subject = data.subject || '';
        } catch (e) { /* se usa la de la sesión */ }
    }
    subject = String(subject).trim().toLowerCase();
    return subjects.some(s => s.id === subject) ? subject : '';
}

async function teacherEditAccess(teacher) {
    return {
        subject: await currentTeacherSubject(teacher),
        anySubject: EDIT_ANY_SUBJECT_ROLES.includes(teacher && teacher.role)
    };
}

// Grado (2-12), materia y reto válidos de una petición del editor, o null. Reto 0: solo su
// evaluación (desde la pregunta 10) y solo en K3-K12 (el Reto 0 visual no se edita).
function instrumentTarget({ grade, subject, reto }) {
    const g = parseInt(grade, 10);
    const n = parseInt(reto, 10);
    const validReto = (n >= 1 && n <= 6) || (n === 0 && g >= 3);
    if (!(g >= 2 && g <= 12) || !validReto || !subjects.some(s => s.id === subject)) return null;
    return { grade: g, subject, reto: n };
}

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
// API: CONFIGURA TUS RETOS DEL 0 AL 6 (preguntas editadas por los docentes)
// ════════════════════════════════════════
app.get('/api/instruments/:grade/:subject/:reto', requireTeacher, (req, res) => {
    const target = instrumentTarget(req.params);
    if (!target) return res.status(400).json({ success: false, error: 'invalid' });
    const custom = instrumentStore.getCustomInstrument(target.grade, target.subject, target.reto);
    return res.json({ success: true, custom: !!custom, data: custom || null });
});

// Guarda la versión editada para todos los estudiantes de ese grado y materia. Si falla responde
// { error } con un código que traduce el editor: invalid, forbidden, server o los de
// instrumentStore.normalizeCustomQuestions (con el índice de la pregunta).
app.post('/api/instruments/save', requireTeacher, async (req, res) => {
    const target = instrumentTarget(req.body || {});
    if (!target) return res.status(400).json({ success: false, error: 'invalid' });
    const access = await teacherEditAccess(res.locals.teacher);
    if (!access.anySubject && access.subject !== target.subject) {
        return res.status(403).json({ success: false, error: 'forbidden' });
    }
    const result = instrumentStore.normalizeCustomQuestions(req.body.questions, target);
    if (result.error) return res.status(400).json({ success: false, error: result.error, index: result.index });
    try {
        const saved = instrumentStore.saveCustomInstrument(target.grade, target.subject, target.reto, 'editable',
            result.questions, res.locals.teacher.email || '');
        return res.json({ success: true, saved });
    } catch (e) {
        console.error('Save instrument error:', e);
        return res.status(500).json({ success: false, error: 'server' });
    }
});

// Vuelve a las preguntas del sistema
app.post('/api/instruments/reset', requireTeacher, async (req, res) => {
    const target = instrumentTarget(req.body || {});
    if (!target) return res.status(400).json({ success: false, error: 'invalid' });
    const access = await teacherEditAccess(res.locals.teacher);
    if (!access.anySubject && access.subject !== target.subject) {
        return res.status(403).json({ success: false, error: 'forbidden' });
    }
    try {
        instrumentStore.resetToDefault(target.grade, target.subject, target.reto);
        return res.json({ success: true });
    } catch (e) {
        console.error('Reset instrument error:', e);
        return res.status(500).json({ success: false, error: 'server' });
    }
});

// Consulta los avances: seguimiento de una clase. El combo trae las Klassen de los estudiantes
// registrados (o, sin base de datos, las de Configuración), en orden natural (K2A … K12D).
app.get('/teacher/progress', requireTeacher, async (req, res) => {
    let classList = await getUniqueClasses();
    if (!classList.length) {
        try { classList = Object.keys(JSON.parse(fs.readFileSync(SUBJECT_CONFIG_FILE, 'utf8'))); } catch (e) { classList = []; }
    }
    classList = [...new Set(classList)].sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }));
    res.render('teacher/progress', { teacher: res.locals.teacher, sharedProfile, reto0BySubject, allActivities,
        customInstruments: instrumentStore.loadAllCustom(), classList, subjectIds: subjects.map(s => s.id) });
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

        const { data: responses, error: rErr } = await selectAll(() => supabase
            .from('activity_responses')
            .select('*')
            .in('student_id', studentIds));

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

// La bitácora de novedades se retiró (sin tabla en Supabase): la dirección vieja lleva al portal docente.
app.get('/teacher/bitacora', requireTeacher, (req, res) => res.redirect('/teacher/training'));

// ════════════════════════════════════════
// KMK TRAINING ROUTES
// ════════════════════════════════════════

// API: Get KMK training questions (for quiz)
app.get('/api/kmk-training/questions', (req, res) => {
    return res.json({ success: true, questions: getKmkQuestions(res.locals.lang) });
});

// API: Submit completed KMK training (teacher marks themselves as trained)
app.post('/api/kmk-training/complete', devOnly, async (req, res) => {
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
app.get('/api/admin/kmk-training-stats', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: allTeachers } = await selectAll(() => supabase.from('teachers').select('*'));
        if (!allTeachers) return res.json({ success: true, stats: [], total: 0, trained: 0 });
        // Los exentos de la capacitación no cuentan (igual que en el indicador a); la materia es la
        // asignatura del docente (Mapeo › Asignatura de cada docente)
        const exemptions = readTeacherExemptions();
        const teachers = allTeachers.filter(t => !isExemptTeacher(exemptions, t));

        const total = teachers.length;
        const trainedTeachers = teachers.filter(t => t.training_completed);
        const trained = trainedTeachers.length;
        const coveragePct = total > 0 ? Math.round((trained / total) * 100) : 0;

        // Group by subject_assigned
        const subjectMap = {};
        subjects.forEach(s => {
            subjectMap[s.id] = { subjectId: s.id, subjectName: s.name[res.locals.lang] || s.name.es, icon: s.icon, total: 0, trained: 0, teachers: [] };
        });
        // Add a catch-all for unassigned
        subjectMap['_otros'] = { subjectId: '_otros', subjectName: res.locals.t('adm_ts_sin_asignatura'), icon: '📋', total: 0, trained: 0, teachers: [] };

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
app.get('/api/admin/kmk-trained-teachers', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase
            .from('teachers')
            .select('id, first_name, last_name, email, subject, subject_assigned, training_completed, training_date, training_score')
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
    const studentId = res.locals.student.id;
    const { activity_id, links, description, product_type } = req.body || {};

    // Solo retos 1-6: la materia sale de la actividad, no de lo que envíe el navegador
    const activity = retoResults.retoNumber(activity_id)
        ? Object.values(allActivities).flat().find(a => a.id === activity_id)
        : null;
    if (!activity) return res.status(400).json({ success: false, code: 'bad_activity', message: 'Actividad no válida' });

    const normalized = evidenceLinks.normalizeLinks(links);
    if (normalized.error) return res.status(400).json({ success: false, code: normalized.error, message: 'Vínculos no válidos' });
    if (!normalized.links.length) return res.status(400).json({ success: false, code: 'empty', message: 'Falta el vínculo' });

    const type = evidenceLinks.PRODUCT_TYPES.includes(product_type) ? product_type : 'otro';
    const fields = {
        subject: activity.subject,
        product_type: type,
        description: String(description || '').trim().slice(0, evidenceLinks.MAX_DESCRIPTION_LENGTH),
        link: normalized.links.join('\n')
    };
    if (!supabase) return res.json({ success: true, localOnly: true, links: normalized.links });
    try {
        // Un registro por estudiante y actividad
        const { data: existing } = await supabase
            .from('multimedia_products')
            .select('id')
            .eq('student_id', studentId)
            .eq('activity_id', activity_id)
            .order('created_at', { ascending: false })
            .limit(1);

        let error;
        if (existing && existing.length) {
            ({ error } = await supabase.from('multimedia_products')
                .update({ ...fields, updated_at: new Date().toISOString() })
                .eq('id', existing[0].id));
        } else {
            ({ error } = await supabase.from('multimedia_products')
                .insert({ student_id: studentId, activity_id, ...fields }));
        }
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, links: normalized.links });
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
            .order('created_at', { ascending: false })
            .limit(1);
        const product = data && data[0];
        if (!product) return res.json({ success: true, data: null });
        return res.json({ success: true, data: { ...product, links: evidenceLinks.storedLinks(product.link) } });
    } catch (e) {
        return res.json({ success: true, data: null });
    }
});

// API: Admin — multimedia stats per subject
app.get('/api/admin/multimedia-stats', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: students } = await selectAll(() => supabase.from('students').select('id'));
        const { data: products } = await selectAll(() => supabase.from('multimedia_products').select('*'));
        const totalStudents = students ? students.length : 0;

        const subjectStats = {};
        subjects.forEach(s => {
            subjectStats[s.id] = { subjectId: s.id, subjectName: s.name[res.locals.lang] || s.name.es, icon: s.icon, color: s.color, count: 0, studentSet: new Set(), products: [] };
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
app.get('/api/admin/multimedia-products', allow('reports'), async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: products } = await supabase
            .from('multimedia_products')
            .select('*, students(full_name, username, class_name)')
            .order('created_at', { ascending: false })
            .limit(500);
        // El panel solo enlaza vínculos http(s); lo demás se muestra como texto
        const list = (products || []).map(p => ({
            ...p,
            links: evidenceLinks.validLinks(p.link),
            image_url: evidenceLinks.isValidLink(p.image_url) ? p.image_url : ''
        }));
        return res.json({ success: true, products: list });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});

// ─── Botón AYUDA: videos con enlace (las preguntas frecuentes están en los textos de la página) ───
app.get('/api/help', requireAnyLogin, (req, res) => {
    const videos = campaign.getVideos().filter(video => video.url).map(({ id, title, url }) => ({ id, title, url }));
    const pending = campaign.getVideos().filter(video => !video.url).map(({ id, title }) => ({ id, title }));
    res.json({ success: true, videos, pending });
});

// ─── Administración › Capacitación y ayuda ───
app.get('/api/admin/help-videos', devOnly, (req, res) => {
    res.json({ success: true, videos: campaign.getVideos() });
});

app.post('/api/admin/help-videos', devOnly, (req, res) => {
    const result = campaign.saveVideos((req.body || {}).links);
    if (result.error) return res.status(400).json({ success: false, code: result.error, id: result.id });
    res.json({ success: true, videos: result.videos });
});

// Un envío a la vez. Se guarda el avance para que el panel lo muestre.
let campaignJob = null;

function campaignState() {
    return {
        service: mailer.serviceStatus(),
        settings: campaign.getSettings(),
        emails: campaign.getEmails(),
        stats: campaign.emailStats(),
        job: campaignJob
    };
}

app.get('/api/admin/campaign', devOnly, (req, res) => {
    res.json({ success: true, ...campaignState() });
});

app.post('/api/admin/campaign/settings', devOnly, (req, res) => {
    const result = campaign.saveSettings(req.body || {});
    if (result.error) return res.status(400).json({ success: false, code: result.error });
    res.json({ success: true, settings: result.settings });
});

app.post('/api/admin/campaign/emails/:id', devOnly, (req, res) => {
    const result = campaign.saveEmail(req.params.id, req.body || {});
    if (result.error) return res.status(400).json({ success: false, code: result.error });
    res.json({ success: true, email: result.email });
});

const campaignEmail = id => campaign.getEmails().find(email => email.id === id);
const campaignSubjectName = (teacher, lang) => {
    const subject = subjects.find(s => s.id === (teacher && teacher.subject));
    return subject ? (subject.name[lang] || subject.name.es) : '';
};

// Docentes para la campaña: se piden a Supabase cada vez, sin confiar en lo que envíe la página
async function campaignTeachers() {
    if (!supabase) return [];
    const { data, error } = await selectAll(() => supabase.from('teachers').select('id, first_name, last_name, email, subject, training_completed'));
    if (error) throw new Error(error.message);
    const exemptions = readTeacherExemptions();
    return (data || []).map(t => ({ ...t, exempt: isExemptTeacher(exemptions, t) }));
}

function campaignFilter(body) {
    const type = ['all', 'untrained', 'subject'].includes(body.type) ? body.type : 'all';
    return { type, subject: type === 'subject' ? body.subject : undefined };
}

app.post('/api/admin/campaign/recipients', devOnly, async (req, res) => {
    const body = req.body || {};
    const email = campaignEmail(body.emailId);
    if (!email) return res.status(400).json({ success: false, code: 'unknown' });
    try {
        const selection = campaign.selectRecipients(await campaignTeachers(), email.id, campaignFilter(body));
        res.json({
            success: true,
            count: selection.recipients.length,
            alreadySent: selection.alreadySent,
            invalid: selection.invalid,
            external: selection.recipients.filter(r => r.external).map(r => r.to),
            missingVideos: campaign.renderEmail(email, { teacher: null, subjectName: '' }).missingVideos
        });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/admin/campaign/preview', devOnly, (req, res) => {
    const body = req.body || {};
    const email = campaignEmail(body.emailId);
    if (!email) return res.status(400).json({ success: false, code: 'unknown' });
    const draft = { ...email, ...(typeof body.subject === 'string' ? { subject: body.subject } : {}), ...(typeof body.body === 'string' ? { body: body.body } : {}) };
    res.json({ success: true, ...campaign.renderEmail(draft, { teacher: { first_name: 'Ana' }, subjectName: campaignSubjectName({ subject: 'matematicas' }, res.locals.lang) }) });
});

// Prueba: solo al correo de quien está en el panel
app.post('/api/admin/campaign/test', devOnly, async (req, res) => {
    const email = campaignEmail((req.body || {}).emailId);
    if (!email) return res.status(400).json({ success: false, code: 'unknown' });
    if (!mailer.serviceStatus().configured) return res.status(409).json({ success: false, code: 'not_configured' });
    let adminUser = {};
    try { adminUser = JSON.parse(req.signedCookies.admin_user || '{}'); } catch (e) { /* cookie ilegible */ }
    if (!adminUser.email) return res.status(400).json({ success: false, code: 'no_admin_email' });
    try {
        const { subject, html } = campaign.renderEmail(email, { teacher: adminUser, subjectName: campaignSubjectName(adminUser, res.locals.lang) });
        await mailer.sendMail({ to: adminUser.email, subject: `[Prueba] ${subject}`, html });
        res.json({ success: true, to: adminUser.email });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// Envía la serie elegida. confirmCount debe coincidir con los destinatarios: si cambió, no envía.
app.post('/api/admin/campaign/send', devOnly, async (req, res) => {
    const body = req.body || {};
    const email = campaignEmail(body.emailId);
    if (!email) return res.status(400).json({ success: false, code: 'unknown' });
    if (!mailer.serviceStatus().configured) return res.status(409).json({ success: false, code: 'not_configured' });
    if (campaignJob && campaignJob.running) return res.status(409).json({ success: false, code: 'busy' });
    if (!campaign.getSettings().appUrl) return res.status(400).json({ success: false, code: 'no_app_url' });
    try {
        const { recipients } = campaign.selectRecipients(await campaignTeachers(), email.id, campaignFilter(body));
        if (Number(body.confirmCount) !== recipients.length) {
            return res.status(409).json({ success: false, code: 'count_changed', count: recipients.length });
        }
        if (!recipients.length) return res.status(400).json({ success: false, code: 'no_recipients' });

        const lang = res.locals.lang;
        const delay = Number(process.env.CAMPAIGN_DELAY_MS) || 2500; // Exchange admite unos 30 correos por minuto
        campaignJob = { emailId: email.id, running: true, total: recipients.length, sent: 0, failed: 0, errors: [] };
        res.json({ success: true, job: campaignJob });

        (async () => {
            for (const recipient of recipients) {
                const at = new Date().toISOString();
                try {
                    const { subject, html } = campaign.renderEmail(email, { teacher: recipient.teacher, subjectName: campaignSubjectName(recipient.teacher, lang) });
                    await mailer.sendMail({ to: recipient.to, subject, html });
                    campaign.appendLog({ emailId: email.id, to: recipient.to, at, ok: true });
                    campaignJob.sent++;
                } catch (e) {
                    campaign.appendLog({ emailId: email.id, to: recipient.to, at, ok: false, error: e.message });
                    campaignJob.failed++;
                    if (campaignJob.errors.length < 5) campaignJob.errors.push(`${recipient.to}: ${e.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            campaignJob.running = false;
        })();
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// ─── Portal de Documentación y Manuales ───
// Guía de uso (services/user_guide.js): cada perfil ve sus pestañas. Estudiante: la suya; docente:
// docente y estudiante; directivo y coordinador: además coordinación; desarrollador: todas.
function guideViewer(res) {
    if (res.locals.userRole === 'admin') return res.locals.adminRole;
    if (res.locals.userRole === 'teacher') return roleOfEmail(res.locals.teacher && res.locals.teacher.email);
    return 'estudiante';
}

app.get('/docs', requireAnyLogin, (req, res) => {
    const viewer = guideViewer(res);
    const backLink = res.locals.userRole === 'admin' ? '/admin' : res.locals.userRole === 'teacher' ? '/teacher/training' : '/';
    res.render('docs/user', {
        userRole: res.locals.userRole,
        student: res.locals.student,
        teacher: res.locals.teacher,
        guideTabs: userGuide.tabsFor(viewer),
        guideCommon: userGuide.common(),
        backLink,
        // Solo avisos conocidos (no se muestra texto que venga en la dirección)
        error: req.query.error === 'tecnico' ? res.locals.t('man_g_aviso_tecnico') : null
    });
});

// Manual técnico: solo el perfil desarrollador (el rol se lee en teacher_roles.json)
app.get('/docs/technical', requireAnyLogin, (req, res) => {
    const isDev = res.locals.adminRole === 'desarrollador'
        || !!(res.locals.teacher && res.locals.teacher.email && roleOfEmail(res.locals.teacher.email) === 'desarrollador');

    if (!isDev) {
        return res.redirect('/docs?error=tecnico');
    }
    res.render('docs/technical', { userRole: res.locals.userRole, student: res.locals.student, teacher: res.locals.teacher, techSections: techManual.sections() });
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
