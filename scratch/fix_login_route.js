const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const target = `app.get('/login', async (req, res) => {
    if (res.locals.student) return res.redirect('/');
    const uniqueClasses = await getUniqueClasses();
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
});`;

const replacement = `app.get('/login', async (req, res) => {
    if (res.locals.student) return res.redirect('/');
    const uniqueClasses = await getUniqueClasses();
    res.render('login', { error: req.query.error || null, klassenConfig, uniqueClasses });
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
});`;

if (content.includes("app.get('/login', async (req, res) => {\n    if (res.locals.student) return res.redirect('/');\n    const uniqueClasses = await getUniqueClasses();\n    try {")) {
    content = content.replace(target, replacement);
    fs.writeFileSync(serverPath, content, 'utf8');
    console.log('Rutas de login y api corregidas exitosamente en server.js');
} else {
    console.log('No se encontró el bloque exacto, revisando contenido...');
}
