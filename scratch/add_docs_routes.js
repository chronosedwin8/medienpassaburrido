const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.js');
let content = fs.readFileSync(serverPath, 'utf8');

if (!content.includes('function requireAnyLogin')) {
    const adminGuard = "function requireAdmin(req, res, next) {\r\n    if (req.cookies.admin_auth === 'true') return next();\r\n    return res.redirect('/admin/login');\r\n}";
    const anyLoginGuard = `function requireAdmin(req, res, next) {
    if (req.cookies.admin_auth === 'true') return next();
    return res.redirect('/admin/login');
}

// ─── Any Login guard middleware (for Docs/Manuals) ───
function requireAnyLogin(req, res, next) {
    if (req.cookies.admin_auth === 'true') {
        res.locals.userRole = 'admin';
        return next();
    }
    if (req.cookies.teacher_auth === 'true' && req.cookies.teacher_data) {
        try {
            res.locals.teacher = JSON.parse(req.cookies.teacher_data);
            res.locals.userRole = 'teacher';
            return next();
        } catch (e) { }
    }
    if (res.locals.student) {
        res.locals.userRole = 'student';
        return next();
    }
    return res.redirect('/login');
}`;

    // Replace normalizing line endings
    content = content.replace(/function requireAdmin\(req, res, next\) \{\s*if \(req\.cookies\.admin_auth === 'true'\) return next\(\);\s*return res\.redirect\('\/admin\/login'\);\s*\}/m, anyLoginGuard);
}

if (!content.includes('app.get(\'/docs\'')) {
    const docsRoutes = `// ─── Portal de Documentación y Manuales ───
app.get('/docs', requireAnyLogin, (req, res) => {
    res.render('docs/index', { userRole: res.locals.userRole, student: res.locals.student, teacher: res.locals.teacher });
});

app.get('/docs/technical', requireAnyLogin, (req, res) => {
    res.render('docs/technical', { userRole: res.locals.userRole, student: res.locals.student, teacher: res.locals.teacher });
});

app.get('/docs/user', requireAnyLogin, (req, res) => {
    res.render('docs/user', { userRole: res.locals.userRole, student: res.locals.student, teacher: res.locals.teacher });
});

// ─── Start Server ───`;

    content = content.replace(/\/\/\s*─── Start Server ───/m, docsRoutes);
}

fs.writeFileSync(serverPath, content, 'utf8');
console.log('✅ Rutas de documentación añadidas correctamente a server.js');
