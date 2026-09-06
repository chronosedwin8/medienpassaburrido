const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

const targetSection = `app.put('/api/devices/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
            if (!cleanEmail.includes('@')) {`;

const restoredContent = `app.put('/api/devices/:id', requireAdmin, async (req, res) => {
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

// ════════════════════════════════════════
// TEACHER ROUTES (PORTAL DOCENTE - CAPACITACIÓN)
// ════════════════════════════════════════
app.get('/teacher/login', (req, res) => {
    if (req.cookies.teacher_auth === 'true') return res.redirect('/teacher/training');
    res.render('teacher/login', { error: null, subjects });
});

// API: Search teachers by last name (removed)

app.get('/api/debug-teachers', async (req, res) => {
    if (!supabase) return res.json({ error: 'No supabase' });
    const { data, error } = await supabase.from('teachers').select('*');
    res.json({ data, error });
});

app.post('/teacher/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('teacher/login', { error: 'Por favor ingresa tu correo y contraseña.', subjects });
    }

    if (supabase) {
        try {
            let cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.includes('@')) {`;

if (c.includes(targetSection)) {
    c = c.replace(targetSection, restoredContent);
    fs.writeFileSync('server.js', c);
    console.log('Restored server.js');
} else {
    console.log('Target section not found');
}
