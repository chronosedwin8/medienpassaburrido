// Administración: Configuración, Docentes editables, Materias, Mapeo de profesores, Solicitudes con
// materia, Avance retos y escudo en los certificados. Uso: node test/admin_features.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'admin-test-secret';
const ROOT = path.join(__dirname, '..');

function signedCookie(name, value) {
    return `${name}=${encodeURIComponent('s:' + signature.sign(value, COOKIE_SECRET))}`;
}

async function getAvailablePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    return port;
}

async function startTestServer(files) {
    const port = await getAvailablePort();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: {
            ...process.env,
            PORT: String(port),
            SUPABASE_URL: '',
            SUPABASE_ANON_KEY: '',
            COOKIE_SECRET,
            LOCAL_ACTIVITY_CACHE_FILE: files.cache,
            SUBJECTS_CONFIG_FILE: files.subjects,
            CLASS_TEACHER_CONFIG_FILE: files.mapping,
            PENDING_TEACHERS_FILE: files.pending,
            CUSTOM_INSTRUMENTS_PATH: files.instruments,
            TEACHER_ROLES_FILE: files.roles,
            CLASS_SUBJECTS_FILE: files.classSubjects
        },
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

// Punto 1: una llave de más en el CSS del panel tapaba la tabla de Configuración
function verifyDashboardCss() {
    const source = fs.readFileSync(path.join(ROOT, 'views', 'admin', 'dashboard.ejs'), 'utf8');
    const blocks = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
    assert.ok(blocks.length >= 2, 'The admin dashboard has its style blocks');
    blocks.forEach((m, i) => {
        const css = m[1].replace(/\/\*[\s\S]*?\*\//g, '');
        let depth = 0;
        for (const ch of css) {
            if (ch === '{') depth++;
            if (ch === '}') depth--;
            assert.ok(depth >= 0, `Style block ${i + 1} closes a brace it never opened`);
        }
        assert.strictEqual(depth, 0, `Style block ${i + 1} leaves braces open`);
    });
    assert.ok(/\.sc-toggle\s*\{[^}]*position:\s*relative/.test(source), 'The Configuración toggles keep their size rule');
    console.log('✅ Admin dashboard CSS braces are balanced (Configuración toggles render)');
}

// Materias: cambios sobre el mismo array de data_levels.js, inactivas fuera de activeSubjects()
async function verifySubjectStore(file) {
    fs.writeFileSync(file, JSON.stringify({ musica: { name: { de: 'Musik', en: 'Music', es: 'Música y Coro' }, icon: '🎶', color: '#123456', active: false } }));
    process.env.SUBJECTS_CONFIG_FILE = file;
    const store = require('../services/subject_store');
    const { subjects } = require('../data_levels');
    const musica = subjects.find(s => s.id === 'musica');
    assert.strictEqual(musica.name.es, 'Música y Coro', 'The saved name is applied to the shared subject');
    assert.strictEqual(musica.icon, '🎶');
    assert.strictEqual(musica.active, false);
    assert.ok(!store.activeSubjects().some(s => s.id === 'musica'), 'An inactive subject is not offered');
    assert.ok(store.isKnown('musica') && !store.isActive('musica'));

    assert.ok(store.sanitize('nada', {}).error, 'Unknown subject is rejected');
    const good = { name: { de: 'Kunst', en: 'Art', es: 'Arte' }, icon: '🎨', color: '#ec4899', active: true };
    assert.ok(store.sanitize('arte', { ...good, color: 'rojo' }).error, 'Color must be #rrggbb');
    assert.ok(store.sanitize('arte', { ...good, name: { de: '', en: 'Art', es: 'Arte' } }).error, 'Every language needs a name');

    let written = null;
    const result = await store.saveSubject('arte', { ...good, name: { ...good.name, es: 'Artes plásticas' } }, async (f, data) => { written = data; });
    assert.ok(!result.error && written.arte.name.es === 'Artes plásticas' && written.musica, 'Saving keeps the other subjects');
    assert.strictEqual(subjects.find(s => s.id === 'arte').name.es, 'Artes plásticas');

    fs.writeFileSync(file, '{}');
    store.load();
    assert.strictEqual(musica.name.es, 'Música', 'Without changes the default names come back');
    assert.strictEqual(musica.active, true);
    delete process.env.SUBJECTS_CONFIG_FILE;
    console.log('✅ Subject store renames, deactivates and restores subjects in place');
}

// Punto 4: en cada clase el docente de Alemán ya no aparece repetido en otras materias
function verifyMappingCleanup() {
    const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'class_teacher_config.json'), 'utf8'));
    const norm = name => String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
    for (const [cls, row] of Object.entries(config)) {
        assert.ok(row.aleman, `${cls} keeps its German teacher`);
        const repeated = Object.entries(row).filter(([subject, name]) => subject !== 'aleman' && norm(name) === norm(row.aleman));
        assert.deepStrictEqual(repeated, [], `${cls}: the German teacher is not repeated in other subjects`);
    }
    assert.ok(!config['KLASSE 2 (K2A)'].arte && !config['KLASSE 2 (K2A)'].matematicas, 'K2A: Arte and Matemáticas removed');
    assert.ok(!config['KLASSE 6 (K6A)'].mint_sach && config['KLASSE 6 (K6A)'].musica, 'K6A: only MINT removed');
    assert.strictEqual(config['KLASSE 3 (K3A)'].matematicas, 'MARCELA IRENE ORTIZ HERNANDEZ', 'Repeats without German stay');
    console.log('✅ Teacher mapping: German teachers are no longer repeated in other subjects');
}

async function verifyAdminApi(baseUrl, files) {
    // Configurar es solo del desarrollador (el perfil sale de files.roles)
    const adminUser = { email: 'jefe@colegioaleman.edu.co', role: 'desarrollador', first_name: 'Ana', last_name: 'Prueba' };
    const admin = `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(adminUser))}`;
    const call = (route, body, method = body ? 'POST' : 'GET') => fetch(`${baseUrl}${route}`, {
        method, redirect: 'manual',
        headers: { Cookie: admin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });

    // Docentes: edición validada (sin Supabase no se guarda)
    const teacher = { first_name: 'Ana', last_name: 'Prueba', email: 'ana@colegioaleman.edu.co', subject: 'aleman', role: 'profesor' };
    assert.strictEqual((await call('/api/admin/teachers/1', { ...teacher, subject: 'nada' })).status, 400, 'Unknown subject is rejected');
    assert.strictEqual((await call('/api/admin/teachers/1', { ...teacher, email: 'sin-arroba' })).status, 400, 'Bad email is rejected');
    assert.strictEqual((await call('/api/admin/teachers/1', { ...teacher, role: 'rey' })).status, 400, 'Unknown role is rejected');
    assert.strictEqual((await call('/api/admin/teachers/1', { ...teacher, first_name: ' ' })).status, 400, 'Names are required');
    const noDb = await (await call('/api/admin/teachers/1', teacher)).json();
    assert.strictEqual(noDb.success, false, 'Without Supabase nothing is saved');
    const unsigned = await fetch(`${baseUrl}/api/admin/teachers/1`, { method: 'POST', headers: { Cookie: 'admin_auth=true' }, redirect: 'manual' });
    assert.strictEqual(unsigned.status, 302, 'Editing a teacher needs an admin session');

    // Materias
    const list = await (await call('/api/admin/subjects')).json();
    assert.ok(list.success && list.subjects.length === 11 && list.subjects.every(s => s.active), 'Eleven active subjects');
    assert.strictEqual((await call('/api/admin/subjects/nada', { name: { de: 'a', en: 'a', es: 'a' }, icon: 'x', color: '#000000' })).status, 400);
    const mate = list.subjects.find(s => s.id === 'matematicas');
    const off = await (await call('/api/admin/subjects/matematicas', { ...mate, name: { ...mate.name, es: 'Matemáticas y Lógica' }, active: false })).json();
    assert.ok(off.success && off.subject.active === false && off.subject.name.es === 'Matemáticas y Lógica');
    assert.ok(JSON.parse(fs.readFileSync(files.subjects, 'utf8')).matematicas.active === false, 'The change is saved to the subjects file');

    const student = { id: 'local_admin_test', username: 'adm', class_name: 'K6A' };
    const studentCookie = `lang=es; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const index = await (await fetch(`${baseUrl}/`, { headers: { Cookie: studentCookie } })).text();
    const combo = index.slice(index.indexOf('id="subjectCombo"'), index.indexOf('</select>', index.indexOf('id="subjectCombo"')));
    assert.ok(!combo.includes('value="matematicas"') && combo.includes('value="aleman"'), 'Inactive subjects are not offered to students');

    const dashboard = await (await call('/admin')).text();
    assert.ok(!dashboard.includes('data-subject="matematicas"'), 'Inactive subjects are not in Configuración');
    assert.ok(dashboard.includes('id="sub-subjects"') && dashboard.includes('data-sub="materias"'), 'The Materias section is in the admin menu');
    assert.ok(dashboard.includes('id="avance-retos-card"') && dashboard.includes('data-sub="avance"'), 'Avance retos replaces the Reto 0 card');
    assert.ok(!dashboard.includes('reto0-diagnostico-card') && !dashboard.includes('data-sub="reto0"') && !dashboard.includes('id="tmEditor"'),
        'The old Reto 0 indicator and the JSON mapping editor are gone');
    const login = await (await fetch(`${baseUrl}/teacher/login`)).text();
    assert.ok(login.includes('id="regSubject"') && !login.includes('<option value="matematicas"'), 'Registration offers the active subjects');

    const on = await (await call('/api/admin/subjects/matematicas', { ...mate, active: true })).json();
    assert.ok(on.success && on.subject.active === true && on.subject.name.es === mate.name.es, 'Reactivated with its name');

    // Mapeo de profesores
    assert.strictEqual((await call('/api/admin/teacher-mapping', { 'KLASSE 6 (K6A)': { nada: 'X' } })).status, 400, 'Unknown subject in the mapping is rejected');
    assert.strictEqual((await call('/api/admin/teacher-mapping', ['x'])).status, 400, 'The mapping must be an object');
    const saved = await (await call('/api/admin/teacher-mapping', { 'KLASSE 6 (K6A)': { aleman: '  SARAI  DE SHAROM DIAZ SEIJA ', musica: '' } })).json();
    assert.ok(saved.success);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(files.mapping, 'utf8')), { 'KLASSE 6 (K6A)': { aleman: 'SARAI DE SHAROM DIAZ SEIJA' } },
        'Empty fields are dropped and names trimmed');
    const loaded = await (await call('/api/admin/teacher-mapping')).json();
    assert.ok(loaded.config['KLASSE 6 (K6A)'].aleman);
    // La clase K6A del estudiante coincide con "KLASSE 6 (K6A)": el Reto 0 prellena su profesor de Alemán
    const profile = await (await fetch(`${baseUrl}/profile`, { headers: { Cookie: studentCookie } })).text();
    assert.ok(profile.includes('value="Sarai De"'), 'Reto 0 pre-fills the teachers of the student class');

    // Solicitudes de registro con materia
    const register = body => fetch(`${baseUrl}/api/teacher/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
    assert.ok((await register({ first_name: 'Luz', last_name: 'Prueba', email: 'luz@colegioaleman.edu.co', doc_number: '111', subject: 'musica' })).success);
    assert.ok((await register({ first_name: 'Eva', last_name: 'Prueba', email: 'eva@colegioaleman.edu.co', doc_number: '222', subject: 'nada' })).success);
    const pending = (await (await call('/api/admin/pending-teachers')).json()).pending;
    assert.deepStrictEqual(pending.map(p => p.subject), ['musica', ''], 'The request keeps a valid subject only');
    assert.strictEqual((await call(`/api/admin/approve-teacher/${pending[0].id}`, { subject: 'nada' })).status, 400, 'Approving with an unknown subject is rejected');
    assert.ok((await (await call(`/api/admin/approve-teacher/${pending[0].id}`, { subject: 'arte' })).json()).success);
    assert.strictEqual(JSON.parse(fs.readFileSync(files.pending, 'utf8')).length, 1, 'The approved request leaves the list');

    // Avance retos y KPI
    assert.deepStrictEqual(await (await call('/api/admin/retos-progress/aleman')).json(), { success: true, classes: [] }, 'Without Supabase there is no progress');
    assert.strictEqual((await call('/api/admin/retos-progress/nada')).status, 400);
    const progressUnsigned = await fetch(`${baseUrl}/api/admin/retos-progress/aleman`, { headers: { Cookie: 'admin_auth=true' }, redirect: 'manual' });
    assert.strictEqual(progressUnsigned.status, 302, 'Avance retos needs an admin session');

    // Escudo del colegio
    const crest = await fetch(`${baseUrl}/img/escudo-colegio.png`);
    assert.ok(crest.ok && /image\/png/.test(crest.headers.get('content-type')), 'The school crest is served');
    assert.ok(profile.includes('/img/escudo-colegio.png'), 'The student reto certificate carries the crest');
    assert.ok(dashboard.includes("'/img/escudo-colegio.png'"), 'The admin certificates carry the crest');
    console.log('✅ Admin API: teachers, subjects, mapping, registration subject, retos progress and crest');
}

// Nueva materia: se crea activa, con retos 0 a 6 de contenido general con su nombre, habilitada en
// todas las clases (archivo temporal de Configuración) y sin reiniciar
async function verifyNewSubject(baseUrl, files) {
    const adminUser = { email: 'jefe@colegioaleman.edu.co', role: 'desarrollador', first_name: 'Ana', last_name: 'Prueba' };
    const admin = `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(adminUser))}`;
    const post = body => fetch(`${baseUrl}/api/admin/subjects`, { method: 'POST', redirect: 'manual', headers: { Cookie: admin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const quimica = { name: { es: 'Química', de: 'Chemie', en: 'Chemistry' }, icon: '⚗️', color: '#7a1f5c', enableAll: true };

    assert.strictEqual((await post({ ...quimica, name: { es: 'Química', de: '', en: 'Chemistry' } })).status, 400, 'Every language needs a name');
    assert.strictEqual((await post({ ...quimica, name: { es: 'Arte', de: 'Kunst', en: 'Art' } })).status, 400, 'An existing subject is not created twice');
    const created = await (await post(quimica)).json();
    const classCount = Object.keys(JSON.parse(fs.readFileSync(files.classSubjects, 'utf8'))).length;
    assert.ok(created.success && created.subject.id === 'quimica' && created.subject.custom === true, 'The id comes from the Spanish name');
    assert.strictEqual(created.subject.classes, classCount, 'Enabled in every class of Configuración');
    assert.ok(Object.values(JSON.parse(fs.readFileSync(files.classSubjects, 'utf8'))).every(c => c.quimica === true));
    assert.strictEqual(JSON.parse(fs.readFileSync(files.subjects, 'utf8')).quimica.custom, true, 'Saved as a new subject');
    const list = (await (await fetch(`${baseUrl}/api/admin/subjects`, { headers: { Cookie: admin } })).json()).subjects;
    assert.ok(list.some(s => s.id === 'quimica' && s.active && s.custom), 'Listed in Materias');

    // Sin reiniciar: el estudiante ya tiene sus retos y su Reto 0, con contenido de la materia
    const student = { id: 'local_new_subject', username: 'nueva', class_name: 'K6A' };
    const cookie = `lang=es; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const reto = await fetch(`${baseUrl}/activity/2627/reto3_quimica`, { headers: { Cookie: cookie } });
    const retoHtml = await reto.text();
    assert.strictEqual(reto.status, 200, 'The new subject has its challenges');
    assert.ok(retoHtml.includes('Química') && !/CodeCombat|Ozaria/.test(retoHtml), 'General content with its own name, not Technology');
    const reto0 = await (await fetch(`${baseUrl}/profile?subject=quimica`, { headers: { Cookie: cookie } })).text();
    assert.ok(reto0.includes('name="reto0_quimica_q1"') && reto0.includes('name="r0_quimica_q10"'), 'Reto 0 has open questions and the 10-question test');
    assert.ok(/<option value="quimica" selected[^>]*>⚗️ Química<\/option>/.test(reto0), 'The Reto 0 subject list includes the new subject');
    const home = await (await fetch(`${baseUrl}/`, { headers: { Cookie: cookie } })).text();
    assert.ok(home.includes('value="quimica"'), 'Students can choose it on the home page');

    // Volver a crear con el mismo nombre no duplica
    assert.strictEqual((await post(quimica)).status, 400);
    console.log('✅ New subjects: created active with challenges 0 to 6 of general content, enabled in every class, without a restart');
}

async function run() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-admin-'));
    const files = {
        cache: path.join(dir, 'cache.json'),
        subjects: path.join(dir, 'subjects_config.json'),
        mapping: path.join(dir, 'class_teacher_config.json'),
        pending: path.join(dir, 'pending_teachers.json'),
        instruments: path.join(dir, 'custom_instruments.json'),
        roles: path.join(dir, 'teacher_roles.json'),
        classSubjects: path.join(dir, 'subject_config.json') // copia: crear una materia la habilita aquí
    };
    fs.copyFileSync(path.join(ROOT, 'subject_config.json'), files.classSubjects);
    fs.writeFileSync(files.mapping, '{}');
    fs.writeFileSync(files.roles, JSON.stringify({ 'jefe@colegioaleman.edu.co': 'desarrollador' }));
    try {
        verifyDashboardCss();
        await verifySubjectStore(path.join(dir, 'subjects_store_test.json'));
        verifyMappingCleanup();
        const server = await startTestServer(files);
        try {
            await verifyAdminApi(server.baseUrl, files);
            await verifyNewSubject(server.baseUrl, files);
        } finally {
            await server.stop();
        }
        console.log('\nAll admin feature tests passed.');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
