// Accesos por perfil: desarrollador (todo), directivo y coordinador (informes, certificados y listas
// de solo lectura). También el informe "Docentes y cursos" y que la bitácora de novedades ya no existe.
// Uso: node test/access_roles.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'access-test-secret';
const ROOT = path.join(__dirname, '..');
const access = require('../services/access');
const teacherCourses = require('../services/teacher_courses');

const USERS = {
    dev: { email: 'dev@colegioaleman.edu.co', first_name: 'Dana', last_name: 'Dev' },
    alias: { email: 'viejo.admin@colegioaleman.edu.co', first_name: 'Ada', last_name: 'Admin' },
    directivo: { email: 'rector@colegioaleman.edu.co', first_name: 'Rita', last_name: 'Rectora' },
    coordinador: { email: 'coord@colegioaleman.edu.co', first_name: 'Carlos', last_name: 'Coord' },
    profesor: { email: 'profe@colegioaleman.edu.co', first_name: 'Pia', last_name: 'Profe' }
};
const ROLES = {
    'dev@colegioaleman.edu.co': 'desarrollador',
    'VIEJO.ADMIN@colegioaleman.edu.co': 'admin', // nombre anterior del perfil, y en mayúsculas
    'rector@colegioaleman.edu.co': 'directivo',
    'coord@colegioaleman.edu.co': 'coordinador'
};

function signedCookie(name, value) {
    return `${name}=${encodeURIComponent('s:' + signature.sign(value, COOKIE_SECRET))}`;
}
const adminCookie = user => `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(user))}`;
const teacherCookie = user => `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify({ ...user, id: 'teacher_' + user.email, subject: 'aleman' }))}`;

async function getAvailablePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const { port } = server.address();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    return port;
}

async function startTestServer(env) {
    const port = await getAvailablePort();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '', COOKIE_SECRET, ...env },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.setEncoding('utf8').on('data', chunk => { output += chunk; });
    child.stderr.setEncoding('utf8').on('data', chunk => { output += chunk; });
    const stop = async () => {
        if (child.exitCode === null) {
            const exited = new Promise(resolve => child.once('exit', resolve));
            child.kill();
            await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 3000))]);
        }
    };
    const baseUrl = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) throw new Error(`Test server exited early: ${output}`);
        try {
            if ((await fetch(`${baseUrl}/login`, { signal: AbortSignal.timeout(1000) })).ok) return { baseUrl, stop };
        } catch (e) { /* aún no */ }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    await stop();
    throw new Error(`Test server did not start: ${output}`);
}

function verifyAccessRules(rolesFile) {
    assert.strictEqual(access.normalizeRole('admin'), 'desarrollador', '"admin" is the developer profile');
    assert.strictEqual(access.normalizeRole(' Coordinador '), 'coordinador');
    assert.strictEqual(access.normalizeRole(''), 'profesor');
    assert.ok(access.isPanelRole('admin') && access.isPanelRole('directivo') && !access.isPanelRole('profesor') && !access.isPanelRole('rey'));
    assert.deepStrictEqual(access.permissionsOf('desarrollador'), { configure: true, reports: true, certificates: true, lists: true });
    for (const role of ['directivo', 'coordinador']) {
        assert.deepStrictEqual(access.permissionsOf(role), { configure: false, reports: true, certificates: true, lists: true },
            `${role}: reports, certificates and lists, no settings`);
    }
    assert.deepStrictEqual(access.permissionsOf('profesor'), { configure: false, reports: false, certificates: false, lists: false });
    assert.strictEqual(access.roleOf(rolesFile, 'viejo.admin@colegioaleman.edu.co'), 'desarrollador', 'Emails match without case');
    assert.strictEqual(access.roleOf(rolesFile, 'nadie@colegioaleman.edu.co'), 'profesor');
    assert.strictEqual(access.roleOf(path.join(os.tmpdir(), 'no-existe-roles.json'), 'dev@colegioaleman.edu.co'), 'profesor', 'A missing roles file gives no access');
    assert.deepStrictEqual(access.ASSIGNABLE_ROLES, ['profesor', 'coordinador', 'directivo', 'desarrollador'], '"admin" is no longer offered');

    // Al entrar: el perfil elegido debe ser el de la cuenta
    assert.strictEqual(access.checkProfile('coordinador', 'coordinador'), 'ok');
    assert.strictEqual(access.checkProfile('admin', 'desarrollador'), 'ok');
    assert.strictEqual(access.checkProfile('coordinador', 'desarrollador'), 'mismatch', 'A coordinator cannot enter through the developer button');
    assert.strictEqual(access.checkProfile('directivo', 'coordinador'), 'mismatch');
    assert.strictEqual(access.checkProfile('profesor', 'coordinador'), 'not_panel');
    console.log('✅ Profiles: developer has everything, directivo and coordinador only reports, lists and certificates; "admin" is developer');
}

function verifyTeacherCoursesReport() {
    const teachers = [
        { id: 't1', first_name: 'Sarai', last_name: 'Diaz Seija', email: 'sdiaz@x', subject: 'aleman', training_completed: true, training_score: 92, training_date: '2026-10-01' },
        { id: 't2', first_name: 'Melisa', last_name: 'Gomez', email: 'mgomez@x', subject: 'ingles', training_completed: false },
        { id: 't3', first_name: 'Luz', last_name: 'Perez', email: 'lperez@x', subject: 'musica', training_completed: false }
    ];
    const students = [
        { id: 's1', class_name: 'K6A', student_code: '100' }, { id: 's2', class_name: '6A', student_code: '200' }, // "6A" es la misma clase
        { id: 's6', class_name: '6A', student_code: '100' }, // el mismo estudiante que s1, repetido: cuenta una vez
        { id: 's3', class_name: 'K7A' }, { id: 's4', class_name: 'K7A' },
        { id: 's5', class_name: 'sinact' } // sin nivel: no cuenta
    ];
    const started = new Set(['s1|aleman|2']); // s1 empezó el reto 2 de Alemán
    const won = new Set(['s2|aleman|0', 's6|aleman|3']); // s6 (= s1) ganó el reto 3
    const report = teacherCourses.buildTeacherCourses({
        students,
        teachers,
        mapping: { 'KLASSE 6 (K6A)': { aleman: 'SARAI DIAZ SEIJA', arte: 'NOMBRE QUE NO EXISTE' } },
        subjectConfig: { K6A: { aleman: true, arte: true }, K7A: { ingles: true, musica: true }, K2A: { musica: true } },
        subjects: ['aleman', 'ingles', 'musica', 'arte'],
        reto0Teachers: new Map([['s3', { ingles: 'MELISA' }], ['s4', { ingles: 'melisa gomez', musica: 'NADIE' }]]),
        retoStatus: (st, subject) => [0, 1, 2, 3, 4, 5, 6].map(n => ({
            n, won: won.has(`${st.id}|${subject}|${n}`), started: won.has(`${st.id}|${subject}|${n}`) || started.has(`${st.id}|${subject}|${n}`)
        })),
        segmentsOf: t => (t.id === 't1' ? ['primaria'] : [])
    });
    const course = key => report.courses.find(c => c.key === key);
    const aleman = course('K6A|aleman');
    assert.ok(aleman && aleman.students === 2 && aleman.status === 'en_desarrollo', 'K6A and 6A are one class; a repeated student code counts once');
    assert.strictEqual(aleman.teacherId, 't1', 'The mapping full name finds the registered teacher');
    assert.strictEqual(aleman.retos[0].won, 1);
    assert.strictEqual(aleman.retos[2].inProgress, 1);
    assert.strictEqual(aleman.retos[3].won, 1, 'The progress of both records of the same student is added');
    assert.strictEqual(course('K6A|arte').teacherName, 'NOMBRE QUE NO EXISTE');
    assert.strictEqual(report.teachers.find(t => t.name === 'NOMBRE QUE NO EXISTE').registered, false, 'A mapping name without an account is shown as not registered');

    const ingles = course('K7A|ingles');
    assert.ok(ingles.status === 'pendiente' && ingles.teacherId === 't2' && ingles.source === 'reto0' && ingles.mentions === 2,
        'Without mapping, the teacher most chosen in Reto 0 is used; nobody started: pending');
    assert.strictEqual(course('K7A|musica').teacherId, null, 'An unknown Reto 0 name gives no teacher');
    assert.ok(course('K2A|musica') && course('K2A|musica').students === 0, 'An enabled class without students still appears');
    assert.ok(!course('K7A|aleman'), 'A subject that is not enabled, mapped or started is not a course');
    assert.ok(!report.courses.some(c => c.className.toLowerCase() === 'sinact'));

    const t1 = report.teachers.find(t => t.id === 't1');
    assert.deepStrictEqual([t1.trained, t1.coursesActive, t1.coursesPending, t1.segments], [true, 1, 0, ['primaria']]);
    const t2 = report.teachers.find(t => t.id === 't2');
    assert.deepStrictEqual([t2.trained, t2.coursesActive, t2.coursesPending], [false, 0, 1]);
    assert.strictEqual(report.teachers.find(t => t.id === 't3').courses.length, 0, 'A teacher without classes is still listed');
    assert.deepStrictEqual(report.summary, { teachers: 3, untrained: 2, exempt: 0, courses: 5, active: 1, pending: 4, withoutTeacher: 2, mappedClasses: 1, classes: 3 });

    assert.strictEqual(teacherCourses.canonicalClass('KLASSE 10 (K10A)'), 'K10A');
    assert.strictEqual(teacherCourses.mappingKeyFor('K7B'), 'KLASSE 7 (K7B)');
    assert.strictEqual(teacherCourses.mappingKeyFor('PK1'), 'PK1');
    console.log('✅ Teachers and classes: mapping first, then Reto 0; pending vs in progress; untrained teachers');
}

// Asignatura de cada docente frente al mapeo, y excepciones de la capacitación KMK
function verifyTeacherSubjectsAndExemptions() {
    const ts = require('../services/teacher_subjects');
    const teachers = [
        { id: 'a', first_name: 'Marcela Irene', last_name: 'Ortiz Hernandez', subject: 'aleman' },
        { id: 'b', first_name: 'Luz Elsa', last_name: 'Behaine Herrera', subject: 'ciencias' },
        { id: 'c', first_name: 'Ronald Luis', last_name: 'Gerdts Novoa', subject: '' },
        { id: 'd', first_name: 'Nadie', last_name: 'Mapeado', subject: 'aleman' }
    ];
    const mapping = {
        'KLASSE 3 (K3A)': { matematicas: 'MARCELA IRENE ORTIZ HERNANDEZ', ciencias: 'LUZ ELSA BEHAINE HERRERA', espanol: 'RONALD LUIS GERDTS NOVOA' },
        'KLASSE 3 (K3B)': { matematicas: 'Marcela Irene Ortiz Hernández', ciencias: 'MARCELA IRENE ORTIZ HERNANDEZ', ingles: 'RONALD LUIS GERDTS NOVOA' },
        'KLASSE 4 (K4A)': { arte: 'NOMBRE QUE NO EXISTE', nada: 'LUZ ELSA BEHAINE HERRERA' }
    };
    const subjectIds = ['aleman', 'espanol', 'ingles', 'ciencias', 'matematicas', 'arte'];
    const mapped = ts.mappedSubjects(mapping, teachers, subjectIds);
    assert.deepStrictEqual(mapped.get('a'), [{ subject: 'matematicas', classes: ['K3A', 'K3B'] }, { subject: 'ciencias', classes: ['K3B'] }],
        'Accents and case do not matter; the subject with more classes comes first');
    assert.deepStrictEqual(ts.reviewSubject(teachers[0], mapped.get('a')), { mapped: mapped.get('a'), suggested: 'matematicas', mismatch: true, ambiguous: false });
    assert.strictEqual(ts.reviewSubject(teachers[1], mapped.get('b')).mismatch, false, 'A registered subject that is in the mapping is kept');
    const tie = ts.reviewSubject(teachers[2], mapped.get('c'));
    assert.ok(tie.mismatch && tie.ambiguous && tie.suggested === null, 'A tie is left for the developer to choose');
    assert.deepStrictEqual(ts.reviewSubject(teachers[3], mapped.get('d')), { mapped: [], suggested: null, mismatch: false, ambiguous: false }, 'Not in the mapping: nothing to suggest');
    assert.deepStrictEqual(ts.proposedChanges(teachers, mapping, subjectIds),
        [{ id: 'a', name: 'Marcela Irene Ortiz Hernandez', from: 'aleman', to: 'matematicas', classes: ['K3A', 'K3B'] }], 'Only clear changes are applied');

    let exemptions = ts.setExemption({}, ' Profe@ColegioAleman.edu.co ', true, { reason: '  Licencia  ', by: 'DEV@colegioaleman.edu.co', date: '2026-11-08' });
    assert.deepStrictEqual(exemptions, { 'profe@colegioaleman.edu.co': { reason: 'Licencia', by: 'dev@colegioaleman.edu.co', date: '2026-11-08' } });
    exemptions = ts.setExemption(exemptions, 'profe@colegioaleman.edu.co', false);
    assert.deepStrictEqual(exemptions, {}, 'The exemption can be removed');

    // Los exentos no cuentan en el indicador a, ni como "sin capacitación", ni reciben recordatorios
    const indicatorsSvc = require('../services/indicators');
    const result = indicatorsSvc.computeIndicators({
        students: [], assignedSegments: {}, mappingSegments: {},
        teachers: [{ email: 'x@c.co', training_completed: true }, { email: 'y@c.co', exempt: true }, { email: 'z@c.co' }]
    });
    assert.deepStrictEqual([result.teachers.value, result.teachers.total, result.teachers.pct, result.teachers.exempt], [1, 2, 50, 1]);
    const report = teacherCourses.buildTeacherCourses({
        students: [], mapping: {}, subjectConfig: {}, subjects: [], reto0Teachers: new Map(), retoStatus: () => [],
        teachers: [{ id: 't1', first_name: 'A', last_name: 'B', exempt: true }, { id: 't2', first_name: 'C', last_name: 'D' }]
    });
    assert.deepStrictEqual([report.summary.untrained, report.summary.exempt], [1, 1], 'Docentes y cursos: exempt teachers are not "untrained"');
    const campaign = require('../services/campaign');
    const picked = campaign.selectRecipients([{ id: 1, email: 'exento@colegioaleman.edu.co', exempt: true }, { id: 2, email: 'pendiente@colegioaleman.edu.co' }],
        'prueba-exentos', { type: 'untrained' }).recipients.map(r => r.to);
    assert.deepStrictEqual(picked, ['pendiente@colegioaleman.edu.co'], 'Exempt teachers get no training reminders');
    console.log('✅ Teacher subjects: compared with the mapping (ties left to the developer); exemptions leave the indicator and the reminders');
}

async function verifyRouteMatrix(baseUrl, rolesFile) {
    const call = (who, route, { method = 'GET', body } = {}) => fetch(`${baseUrl}${route}`, {
        method, redirect: 'manual',
        headers: { Cookie: adminCookie(USERS[who]), ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });

    // Solo el desarrollador (configuración). Con método y cuerpo que no cambian nada sin Supabase.
    const devOnly = [
        ['GET', '/api/admin/i18n'], ['GET', '/api/admin/level-config'], ['GET', '/api/admin/subjects'],
        ['GET', '/api/admin/teacher-roles'], ['GET', '/api/admin/teacher-mapping'], ['GET', '/api/admin/pending-teachers'],
        ['GET', '/api/admin/db-records/students'], ['GET', '/api/admin/help-videos'], ['GET', '/api/admin/campaign'],
        ['POST', '/api/admin/subject-config', {}], ['POST', '/api/admin/students/bulk', { students: [] }],
        ['DELETE', '/api/admin/students/abc'], ['POST', '/api/admin/teachers/1', { role: 'rey' }],
        ['POST', '/api/admin/db-records/teachers/1', {}], ['DELETE', '/api/admin/db-records/teachers/1'],
        ['POST', '/api/kmk-training/complete', {}], ['POST', '/api/admin/approve-teacher/1', {}],
        ['POST', '/api/admin/teacher-roles', { email: 'x@colegioaleman.edu.co', role: 'rey' }],
        // Asignatura de cada docente, excepciones y materias nuevas
        ['GET', '/api/admin/teacher-subjects'], ['POST', '/api/admin/teachers/1/subject', { subject: 'nada' }],
        ['POST', '/api/admin/teachers/1/exemption', {}], ['POST', '/api/admin/teacher-subjects/apply', {}],
        ['POST', '/api/admin/subjects', { name: {} }]
    ];
    // Los tres perfiles (informes, listas y certificados)
    const shared = [
        '/api/admin/indicators', '/api/admin/kpis', '/api/admin/teacher-courses', '/api/admin/retos-progress/aleman',
        '/api/admin/psp-matrix', '/api/admin/teacher-reports', '/api/admin/kmk-training-stats', '/api/admin/multimedia-stats',
        '/api/admin/teachers', '/api/admin/certificates/students/K5A/aleman', '/api/admin/subject-config',
        '/api/admin/teachers-status', '/api/admin/students-without-progress'
    ];

    for (const who of ['directivo', 'coordinador']) {
        for (const [method, route, body] of devOnly) {
            const response = await call(who, route, { method, body });
            assert.strictEqual(response.status, 403, `${who} cannot use ${method} ${route}`);
            assert.strictEqual((await response.json()).code, 'forbidden');
        }
    }
    // (sin el POST de subject-config: escribiría el archivo real de Configuración)
    for (const who of ['dev', 'alias']) {
        for (const [method, route, body] of devOnly.filter(([m, r]) => !(m === 'POST' && r === '/api/admin/subject-config'))) {
            const status = (await call(who, route, { method, body })).status;
            assert.ok(status !== 403 && status !== 302, `${who} can use ${method} ${route} (got ${status})`);
        }
    }
    for (const who of ['dev', 'directivo', 'coordinador']) {
        for (const route of shared) {
            assert.strictEqual((await call(who, route)).status, 200, `${who} can open ${route}`);
        }
    }
    // Una cuenta sin perfil del panel (aunque la cookie esté firmada) vuelve al ingreso
    for (const route of ['/admin', '/api/admin/indicators', '/api/admin/teacher-courses']) {
        const response = await call('profesor', route);
        assert.strictEqual(response.status, 302, `A teacher without a panel profile cannot open ${route}`);
        assert.strictEqual(response.headers.get('location'), '/admin/login');
    }

    // Panel de cada perfil
    const devPanel = await (await call('dev', '/admin')).text();
    const coordPanel = await (await call('coordinador', '/admin')).text();
    assert.ok(devPanel.includes('id="sub-config"') && devPanel.includes('data-main="administracion"') && devPanel.includes('"isDeveloper":true'));
    assert.ok(!coordPanel.includes('id="sub-config"') && !coordPanel.includes('id="sub-i18n"') && coordPanel.includes('data-main="consultas"')
        && coordPanel.includes('"isDeveloper":false') && coordPanel.includes('data-i18n="adm_role_coordinador"'), 'The coordinator panel is read-only and says Coordinador');
    assert.ok((await (await call('alias', '/admin')).text()).includes('data-i18n="adm_role_desarrollador"'), '"admin" shows as Desarrollador');

    // Manual técnico: solo el desarrollador
    assert.strictEqual((await call('coordinador', '/docs/technical')).status, 302);
    assert.strictEqual((await call('dev', '/docs/technical')).status, 200);

    // Roles: solo perfiles válidos, nadie cambia el suyo, "admin" se guarda como desarrollador
    assert.strictEqual((await call('dev', '/api/admin/teacher-roles', { method: 'POST', body: { email: 'x@colegioaleman.edu.co', role: 'rey' } })).status, 400);
    assert.strictEqual((await call('dev', '/api/admin/teacher-roles', { method: 'POST', body: { email: USERS.dev.email, role: 'profesor' } })).status, 400, 'Nobody removes their own profile');
    assert.strictEqual((await call('dev', '/api/admin/teacher-roles', { method: 'POST', body: { email: 'Nueva@colegioaleman.edu.co', role: 'admin' } })).status, 200);
    assert.strictEqual(JSON.parse(fs.readFileSync(rolesFile, 'utf8'))['nueva@colegioaleman.edu.co'], 'desarrollador');
    assert.strictEqual((await call('dev', '/api/admin/teachers/1', { method: 'POST', body: { first_name: 'A', last_name: 'B', email: 'a@colegioaleman.edu.co', role: 'admin' } })).status !== 400, true,
        '"admin" is accepted as developer when editing a teacher');

    // Quitar un rol corta el acceso en la petición siguiente (sin cerrar sesión)
    const roles = JSON.parse(fs.readFileSync(rolesFile, 'utf8'));
    delete roles[USERS.coordinador.email];
    fs.writeFileSync(rolesFile, JSON.stringify(roles));
    const afterRemoval = await call('coordinador', '/api/admin/indicators');
    assert.strictEqual(afterRemoval.status, 302, 'A removed role loses access at once');
    roles[USERS.coordinador.email] = 'directivo';
    fs.writeFileSync(rolesFile, JSON.stringify(roles));
    assert.strictEqual((await call('coordinador', '/api/admin/indicators')).status, 200, 'A changed role is read again');
    console.log(`✅ Route matrix: ${devOnly.length} developer-only routes give 403 to directivo and coordinador, ${shared.length} shared routes open for all three; roles re-read on every request`);
}

async function verifyLoginScreens(baseUrl) {
    const studentLogin = await (await fetch(`${baseUrl}/login`, { headers: { Cookie: 'lang=es' } })).text();
    for (const profile of access.PROFILES) {
        assert.ok(studentLogin.includes(`href="/admin/login?perfil=${profile}"`), `The login page has the ${profile} button`);
    }
    assert.ok(studentLogin.includes('¿Soy coordinador?') && studentLogin.includes('¿Soy directivo?') && studentLogin.includes('¿Soy desarrollador?'));
    assert.ok(studentLogin.includes('href="/teacher/login"') && !studentLogin.includes('adminPanelBtn'), 'The teacher portal stays; the old admin button is gone');

    const chooser = await (await fetch(`${baseUrl}/admin/login`, { headers: { Cookie: 'lang=es' } })).text();
    assert.strictEqual((chooser.match(/class="profile-option /g) || []).length, 3, 'Without a profile the three profiles are offered');
    assert.ok(!chooser.includes('name="password"'));
    const form = await (await fetch(`${baseUrl}/admin/login?perfil=directivo`, { headers: { Cookie: 'lang=es' } })).text();
    assert.ok(form.includes('name="profile" value="directivo"') && form.includes('name="password"') && form.includes('href="/admin/login"'),
        'With a profile the form keeps it and offers to change it');
    const bad = await (await fetch(`${baseUrl}/admin/login?perfil=rey`, { headers: { Cookie: 'lang=es' } })).text();
    assert.ok(!bad.includes('name="profile"'), 'An unknown profile shows the chooser');

    const post = body => fetch(`${baseUrl}/admin/login`, {
        method: 'POST', redirect: 'manual',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: 'lang=es' },
        body: new URLSearchParams(body)
    });
    const noProfile = await post({ email: 'dev@colegioaleman.edu.co', password: '123' });
    assert.strictEqual(noProfile.status, 200);
    assert.ok((await noProfile.text()).includes('Primero elige tu perfil'), 'Without a profile the login asks for one');
    const withProfile = await post({ email: 'dev@colegioaleman.edu.co', password: '123', profile: 'desarrollador' });
    assert.ok(!(withProfile.headers.get('set-cookie') || '').includes('admin_auth'), 'Without the database nobody gets a session');

    // Con sesión, /admin/login lleva al panel
    const logged = await fetch(`${baseUrl}/admin/login`, { headers: { Cookie: adminCookie(USERS.dev) }, redirect: 'manual' });
    assert.strictEqual(logged.headers.get('location'), '/admin');
    console.log('✅ Login: three profile buttons, a profile chooser and a form that keeps the chosen profile');
}

// La bitácora de novedades se retiró (no hay tabla en Supabase): sin rutas, sin pestaña y sin menú
async function verifyIncidentsRemoved(baseUrl) {
    const teacher = teacherCookie(USERS.profesor);
    const post = await fetch(`${baseUrl}/api/incidents`, { method: 'POST', redirect: 'manual', headers: { Cookie: teacher, 'Content-Type': 'application/json' }, body: '{}' });
    assert.strictEqual(post.status, 404, 'Teachers can no longer report incidents');
    assert.strictEqual((await fetch(`${baseUrl}/api/incidents`, { headers: { Cookie: teacher } })).status, 404);
    for (const who of ['dev', 'directivo']) {
        assert.strictEqual((await fetch(`${baseUrl}/api/admin/incidents`, { redirect: 'manual', headers: { Cookie: adminCookie(USERS[who]) } })).status, 404, `${who}: no incidents API`);
    }
    const old = await fetch(`${baseUrl}/teacher/bitacora`, { redirect: 'manual', headers: { Cookie: teacher } });
    assert.strictEqual(old.status, 302);
    assert.strictEqual(old.headers.get('location'), '/teacher/training', 'The old log address leads to the teacher portal');

    const panel = await (await fetch(`${baseUrl}/admin`, { headers: { Cookie: adminCookie(USERS.dev) } })).text();
    assert.ok(!panel.includes('maintab-novedades') && !panel.includes('data-main="novedades"') && !/adm_nov_|loadIncidents/.test(panel), 'The panel has no Novedades tab');
    const portal = await (await fetch(`${baseUrl}/teacher/progress`, { headers: { Cookie: teacher } })).text();
    assert.ok(!portal.includes('/teacher/bitacora') && !portal.includes('doc_nav_bitacora'), 'The teacher menu has no log');
    for (const file of [['services', 'incidents.js'], ['views', 'teacher', 'bitacora.ejs'], ['sql', 'novedades.sql']]) {
        assert.ok(!fs.existsSync(path.join(ROOT, ...file)), `${file.join('/')} was removed`);
    }
    assert.ok(!/CREATE TABLE[^;]*incidents/i.test(fs.readFileSync(path.join(ROOT, 'schema.sql'), 'utf8')), 'schema.sql no longer creates the incidents table');
    console.log('✅ The incident log is gone: no routes, no panel tab, no teacher menu item, and the old address goes to the portal');
}

async function run() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-access-'));
    const rolesFile = path.join(dir, 'teacher_roles.json');
    fs.writeFileSync(rolesFile, JSON.stringify(ROLES));
    try {
        verifyAccessRules(rolesFile);
        verifyTeacherCoursesReport();
        verifyTeacherSubjectsAndExemptions();
        const server = await startTestServer({
            TEACHER_ROLES_FILE: rolesFile,
            LOCAL_ACTIVITY_CACHE_FILE: path.join(dir, 'cache.json'),
            CUSTOM_INSTRUMENTS_PATH: path.join(dir, 'instruments.json'),
            PENDING_TEACHERS_FILE: path.join(dir, 'pending.json'),
            CLASS_TEACHER_CONFIG_FILE: path.join(dir, 'mapping.json'),
            SUBJECTS_CONFIG_FILE: path.join(dir, 'subjects.json'),
            HELP_CAMPAIGN_FILE: path.join(dir, 'help.json'),
            CAMPAIGN_LOG_FILE: path.join(dir, 'campaign-log.json'),
            TEACHER_SEGMENTS_FILE: path.join(dir, 'segments.json')
        });
        try {
            await verifyLoginScreens(server.baseUrl);
            await verifyRouteMatrix(server.baseUrl, rolesFile);
            await verifyIncidentsRemoved(server.baseUrl);
        } finally {
            await server.stop();
        }
        console.log('\nAll access tests passed.');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
