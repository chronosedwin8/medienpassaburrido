const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, '..', 'server.js');
let content = fs.readFileSync(serverJsPath, 'utf8');

// Find the start of /profile route
const profileStartIdx = content.indexOf("app.get('/profile', requireLogin");
if (profileStartIdx === -1) {
    console.error("Could not find start of /profile route in server.js!");
    process.exit(1);
}

// Find the start of admin login/routes following the progress API
const adminLoginIdx = content.indexOf("app.get('/admin/login'");
if (adminLoginIdx === -1) {
    console.error("Could not find start of /admin/login route in server.js!");
    process.exit(1);
}

console.log(`Found /profile at index ${profileStartIdx} and /admin/login at index ${adminLoginIdx}`);

// Reconstructed block
const replacementBlock = `app.get('/profile', requireLogin, (req, res) => {
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
        allTeachers
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
    if (!activity) {
        // Fallback to legacy
        const legacyActs = medienpassActivities[year] || [];
        activity = legacyActs.find(a => a.id === req.params.id);
    }
    if (!activity) return res.status(404).send('Activity not found');
    res.render('activity', { activity, student: res.locals.student, currentYear: year, section: activity.subject || 'medienpass' });
});

app.get('/tecnologia/:id', requireLogin, (req, res) => {
    const activity = tecnologiaActivities.find(a => a.id === req.params.id);
    if (!activity) return res.status(404).send('Activity not found');
    res.render('activity', { activity, student: res.locals.student, currentYear: '2526', section: 'tecnologia' });
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

    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    if (isLocal) {
        // Save to local cache synchronously
        const cache = readLocalCache();
        if (!cache[studentId]) cache[studentId] = {};
        cache[studentId][activityId] = {
            data: formData,
            period: period,
            school_year: schoolYear,
            updated_at: new Date().toISOString()
        };
        writeLocalCache(cache);

        // Save to Supabase asynchronously in the background
        if (supabase) {
            supabase
                .from('activity_responses')
                .upsert({
                    student_id: studentId,
                    activity_id: activityId,
                    data: formData,
                    period: period,
                    school_year: schoolYear,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'student_id,activity_id' })
                .then(({ error }) => {
                    if (error) {
                        console.error('Background save error:', error.message);
                    }
                })
                .catch(err => {
                    console.error('Background save exception:', err);
                });
        }

        return res.json({ success: true, message: 'Guardado localmente.', localOnly: !supabase });
    }

    if (!supabase) {
        return res.json({ success: true, message: 'Solo se guarda localmente.', localOnly: true });
    }

    try {
        const { error } = await supabase
            .from('activity_responses')
            .upsert({
                student_id: studentId,
                activity_id: activityId,
                data: formData,
                period: period,
                school_year: schoolYear,
                updated_at: new Date().toISOString()
            }, { onConflict: 'student_id,activity_id' })
            .select();

        if (error) {
            console.error('Save error:', error);
            return res.status(500).json({ success: false, message: 'Error al guardar' });
        }
        return res.json({ success: true, message: 'Guardado correctamente' });
    } catch (e) {
        console.error('Save error:', e);
        return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

app.get('/api/load/:activityId', requireLogin, async (req, res) => {
    const { activityId } = req.params;
    const studentId = res.locals.student.id;

    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    if (isLocal) {
        const cache = readLocalCache();
        if (cache[studentId] && cache[studentId][activityId]) {
            return res.json({ success: true, data: cache[studentId][activityId].data });
        }
    }

    if (!supabase) return res.json({ success: false, data: {} });

    try {
        const { data, error } = await supabase
            .from('activity_responses')
            .select('data')
            .eq('student_id', studentId)
            .eq('activity_id', activityId)
            .single();

        if (error && error.code !== 'PGRST116') {
            return res.status(500).json({ success: false, data: {} });
        }
        return res.json({ success: true, data: data?.data || {} });
    } catch (e) {
        return res.status(500).json({ success: false, data: {} });
    }
});

app.get('/api/progress', requireLogin, async (req, res) => {
    const studentId = res.locals.student.id;
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

    if (isLocal) {
        const cache = readLocalCache();
        if (cache[studentId]) {
            const progress = {};
            Object.keys(cache[studentId]).forEach(actId => {
                const item = cache[studentId][actId];
                const fields = item.data ? Object.keys(item.data).filter(k => {
                    const val = item.data[k];
                    if (typeof val === 'boolean') return val;
                    if (typeof val === 'string') return val.trim().length > 0;
                    return false;
                }) : [];
                progress[actId] = {
                    fieldsCompleted: fields.length,
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
            const fields = item.data ? Object.keys(item.data).filter(k => {
                const val = item.data[k];
                if (typeof val === 'boolean') return val;
                if (typeof val === 'string') return val.trim().length > 0;
                return false;
            }) : [];
            progress[item.activity_id] = {
                fieldsCompleted: fields.length,
                updatedAt: item.updated_at
            };
        });

        return res.json({ success: true, progress });
    } catch (e) {
        return res.status(500).json({ success: false, progress: {} });
    }
});

// 
`;

const updatedContent = content.substring(0, profileStartIdx) + replacementBlock + content.substring(adminLoginIdx);
fs.writeFileSync(serverJsPath, updatedContent, 'utf8');
console.log("Successfully patched server.js!");
