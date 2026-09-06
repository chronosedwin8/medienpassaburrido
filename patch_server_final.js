const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// 1. Update allowed tables and limit in GET /api/admin/db-records/:table
content = content.replace(
    /const allowedTables = \['students', 'teachers'\];\r?\n\s+const table = req\.params\.table;/g,
    "const allowedTables = ['students', 'teachers', 'devices', 'incidents', 'multimedia_products', 'activity_responses'];\n    const table = req.params.table;"
);

content = content.replace(
    /\.from\(table\)\.select\('\*'\)\.order\('created_at', \{ ascending: false \}\)\.limit\(200\);/g,
    ".from(table).select('*').order('created_at', { ascending: false }).limit(500);"
);

// 2. Update KMK Stats Grouping
const oldStatsLogic = `app.get('/api/admin/kmk-training-stats', requireAdmin, async (req, res) => {
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
            const subj = t.subject_assigned || t.subject || '_otros';`;

const newStatsLogic = `app.get('/api/admin/kmk-training-stats', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase.from('teachers').select('*');
        if (!teachers) return res.json({ success: true, stats: [], total: 0, trained: 0 });

        // Load teacher mapping config to help assign subjects
        let teacherMapping = {};
        const configPath = path.join(__dirname, 'class_teacher_config.json');
        if (fs.existsSync(configPath)) {
            try { teacherMapping = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { }
        }

        // Helper to find subject for a teacher
        const getTeacherSubject = (t) => {
            if (t.subject_assigned) return t.subject_assigned;
            if (t.subject && !['aleman', 'Alemán', 'alemán', 'ALEMAN'].includes(t.subject)) return t.subject;
            
            // Search in mapping
            const fullName = ((t.first_name || '') + ' ' + (t.last_name || '')).trim().toLowerCase();
            for (const [className, subjectsMap] of Object.entries(teacherMapping)) {
                for (const [subjectKey, teacherName] of Object.entries(subjectsMap)) {
                    if (teacherName.toLowerCase().includes(fullName) || fullName.includes(teacherName.toLowerCase())) {
                        return subjectKey;
                    }
                }
            }
            return t.subject || '_otros';
        };

        const total = teachers.length;
        const trainedTeachers = teachers.filter(t => t.training_completed);
        const trained = trainedTeachers.length;
        const coveragePct = total > 0 ? Math.round((trained / total) * 100) : 0;

        // Group by subject
        const subjectMap = {};
        subjects.forEach(s => {
            subjectMap[s.id] = { subjectId: s.id, subjectName: s.name.es, icon: s.icon, total: 0, trained: 0, teachers: [] };
        });
        subjectMap['_otros'] = { subjectId: '_otros', subjectName: 'Sin asignatura', icon: '📋', total: 0, trained: 0, teachers: [] };

        teachers.forEach(t => {
            const subj = getTeacherSubject(t);`;

content = content.replace(oldStatsLogic, newStatsLogic);

// 3. Update Trained Teachers List
const oldTrainedList = `app.get('/api/admin/kmk-trained-teachers', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase
            .from('teachers')
            .select('id, first_name, last_name, subject, subject_assigned, training_completed, training_date, training_score')
            .order('last_name');
        return res.json({ success: true, teachers: teachers || [] });`;

const newTrainedList = `app.get('/api/admin/kmk-trained-teachers', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase
            .from('teachers')
            .select('*')
            .order('last_name');
            
        // Enrich with subject mapping if needed
        let teacherMapping = {};
        const configPath = path.join(__dirname, 'class_teacher_config.json');
        if (fs.existsSync(configPath)) {
            try { teacherMapping = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) {}
        }

        const enriched = (teachers || []).map(t => {
            if (t.subject_assigned) return t;
            // Search in mapping
            let foundSubject = t.subject;
            for (const [cls, subjs] of Object.entries(teacherMapping)) {
                for (const [sk, tn] of Object.entries(subjs)) {
                    const fn = ((t.first_name || '') + ' ' + (t.last_name || '')).trim().toLowerCase();
                    if (tn.toLowerCase().includes(fn) || fn.includes(tn.toLowerCase())) {
                        foundSubject = sk; break;
                    }
                }
            }
            return { ...t, subject: foundSubject };
        });

        return res.json({ success: true, teachers: enriched });`;

content = content.replace(oldTrainedList, newTrainedList);

fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ Server patched successfully');
