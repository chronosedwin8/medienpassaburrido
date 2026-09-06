const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');
c = c.replace(/app\.put\('\/api\/devices\/:id', requireAdmin, async \(req, res\) => \{\s*if \(!supabase\) return res\.json\(\{ success: false \}\);\s*if \(!cleanEmail\.includes\('@'\)\) \{/, 
`app.put('/api/devices/:id', requireAdmin, async (req, res) => {
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

app.post('/teacher/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('teacher/login', { error: 'Por favor ingresa tu correo y contraseña.', subjects });
    }

    if (supabase) {
        try {
            let cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.includes('@')) {`);
fs.writeFileSync('server.js', c);
console.log('Done');
