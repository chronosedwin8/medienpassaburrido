const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.js');
let content = fs.readFileSync(serverPath, 'utf8');

const startStr = "app.post('/teacher/login', async (req, res) => {";
const endStr = "app.get('/teacher/logout', (req, res) => {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `app.post('/teacher/login', async (req, res) => {
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
                    extraRole = roles[teacher.email] || 'profesor';
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
                t.role = roles[t.email] || t.role || 'profesor';
            } else {
                t.role = t.role || 'profesor';
            }
            res.locals.teacher = t;
            return next();
        } catch (e) { }
    }
    return res.redirect('/teacher/login');
}

`;

    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    fs.writeFileSync(serverPath, content, 'utf8');
    console.log('Reemplazo determinista completado con éxito.');
} else {
    console.log('No se encontraron startStr o endStr en server.js');
}
