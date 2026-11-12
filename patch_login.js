const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(
"app.get('/login', (req, res) => {\r\n    if (res.locals.student) return res.redirect('/');\r\n    res.render('login', { error: null, klassenConfig });\r\n});",
`app.get('/login', async (req, res) => {
    if (res.locals.student) return res.redirect('/');
    let uniqueClasses = [];
    if (supabase) {
        try {
            const { data } = await supabase.from('students').select('class_name');
            uniqueClasses = [...new Set((data || []).map(s => s.class_name))].filter(Boolean).sort();
        } catch(e) {}
    }
    res.render('login', { error: null, klassenConfig, uniqueClasses });
});`
);
fs.writeFileSync('server.js', c);
console.log('Patched login route');
