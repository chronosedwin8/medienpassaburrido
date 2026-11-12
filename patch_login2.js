const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

// 1. Add getUniqueClasses helper before LOGIN ROUTES
const loginMarker = '// ════════════════════════════════════════\n// LOGIN ROUTES';
const helper = `// Helper: get unique class names from DB
async function getUniqueClasses() {
    if (!supabase) return [];
    try {
        const { data } = await supabase.from('students').select('class_name');
        return [...new Set((data || []).map(s => s.class_name))].filter(Boolean).sort();
    } catch (e) { return []; }
}

`;

if (!c.includes('async function getUniqueClasses')) {
    c = c.replace(loginMarker, helper + loginMarker);
    console.log('Added getUniqueClasses helper');
} else {
    console.log('Helper already exists');
}

// 2. Simplify GET /login to use getUniqueClasses
c = c.replace(
    /app\.get\('\/login', async \(req, res\) => \{\n    if \(res\.locals\.student\) return res\.redirect\('\/'\);\n    let uniqueClasses = \[\];\n    if \(supabase\) \{\n        try \{\n            const \{ data \} = await supabase\.from\('students'\)\.select\('class_name'\);\n            uniqueClasses = \[\.\.\.new Set\(\(data \|\| \[\]\)\.map\(s => s\.class_name\)\)\]\.filter\(Boolean\)\.sort\(\);\n        \} catch\(e\) \{\}\n    \}\n    res\.render\('login', \{ error: null, klassenConfig, uniqueClasses \}\);\n\}\);/,
    `app.get('/login', async (req, res) => {
    if (res.locals.student) return res.redirect('/');
    const uniqueClasses = await getUniqueClasses();
    res.render('login', { error: null, klassenConfig, uniqueClasses });
});`
);
console.log('Updated GET /login');

// 3. Fix POST /login to fetch uniqueClasses and pass it in all render calls
// Add uniqueClasses fetch at the start of POST /login  
c = c.replace(
    "app.post('/login', async (req, res) => {\r\n    const { username, class_name, student_code } = req.body;\r\n    if (!username || !username.trim()) {",
    "app.post('/login', async (req, res) => {\r\n    const { username, class_name, student_code } = req.body;\r\n    const uniqueClasses = await getUniqueClasses();\r\n    if (!username || !username.trim()) {"
);
console.log('Added uniqueClasses to POST /login');

// 4. Replace all render('login', { error: ..., klassenConfig }) with versions that include uniqueClasses
c = c.replace(/res\.render\('login', \{ error: (.+?), klassenConfig \}\)/g, 
    "res.render('login', { error: $1, klassenConfig, uniqueClasses })");
console.log('Updated all login error renders');

fs.writeFileSync('server.js', c);
console.log('Done!');
