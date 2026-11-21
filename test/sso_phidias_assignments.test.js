// Ingreso con Microsoft (SSO), matrícula de Phidias, actividades asignadas, avance del Reto 0,
// Reto 0 sencillo (K3-K5), retroalimentación de los retos 1-6 y retos siempre disponibles.
// No usa la red: Phidias y Microsoft se prueban con datos de ejemplo; el servidor de prueba corre
// sin Supabase ni Phidias.
// Uso: node -r ./test/isolate.js test/sso_phidias_assignments.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'test-cookie-secret-sso';
const signedCookie = (name, value) => `${name}=${encodeURIComponent('s:' + signature.sign(value, COOKIE_SECRET))}`;
const b64url = obj => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// ── Unidades ──

function testClassNames() {
    const cl = require('../services/class_levels');
    assert.strictEqual(cl.loginClassName('5C'), 'K5C');
    assert.strictEqual(cl.loginClassName('K12c'), 'K12C');
    assert.strictEqual(cl.loginClassName('sinact'), 'sinact');
    assert.deepStrictEqual(cl.classNameVariants('K5C'), ['K5C', '5C']);
    assert.deepStrictEqual(cl.classNameVariants('PK2'), ['PK2']);
    console.log('✅ Class names: "5C" logs in as K5C and both spellings are searched');
}

function testMicrosoftSso() {
    process.env.AZURE_TENANT_ID = 'tenant-1';
    process.env.AZURE_CLIENT_ID = 'client-1';
    process.env.AZURE_CLIENT_SECRET = 'secret-1';
    const sso = require('../services/microsoft_sso');
    assert.ok(sso.configured());
    const login = sso.newLoginState({ as: 'student' });
    const url = new URL(sso.authorizeUrl(login, 'https://app.test/auth/microsoft/callback'));
    assert.strictEqual(url.host, 'login.microsoftonline.com');
    assert.ok(url.pathname.startsWith('/tenant-1/oauth2/v2.0/authorize'));
    assert.strictEqual(url.searchParams.get('client_id'), 'client-1');
    assert.strictEqual(url.searchParams.get('code_challenge_method'), 'S256');
    assert.strictEqual(url.searchParams.get('state'), login.state);
    assert.ok(!url.toString().includes('secret-1'), 'The secret never goes to the browser');

    const now = Date.now();
    const token = claims => `${b64url({ alg: 'RS256' })}.${b64url(claims)}.sig`;
    const good = { aud: 'client-1', tid: 'tenant-1', iss: 'https://login.microsoftonline.com/tenant-1/v2.0', exp: Math.floor(now / 1000) + 600, nonce: login.nonce, preferred_username: '3255@ColegioAleman.edu.co', name: 'Angel Alfonso' };
    const id = sso.identityFromIdToken(token(good), { nonce: login.nonce, now });
    assert.strictEqual(id.email, '3255@colegioaleman.edu.co');
    assert.throws(() => sso.identityFromIdToken(token({ ...good, aud: 'other' }), { nonce: login.nonce, now }), /aplicación/);
    assert.throws(() => sso.identityFromIdToken(token({ ...good, tid: 'other' }), { nonce: login.nonce, now }), /organización/);
    assert.throws(() => sso.identityFromIdToken(token({ ...good, nonce: 'x' }), { nonce: login.nonce, now }), /ingreso/);
    assert.throws(() => sso.identityFromIdToken(token({ ...good, exp: 10 }), { nonce: login.nonce, now }), /venció/);
    console.log('✅ Microsoft SSO: PKCE + state + nonce; the token must be for this app, this school and still valid');
}

const SAMPLE_PHIDIAS = [{
    id: 18, name: 'PRIMARIA', courses: [{
        id: 86, name: 'KLASSE 5', sections: [{
            id: 1, name: 'K5C', students: [
                { id: 1, code: 9944, firstname: 'SOFÍA ISABEL', lastname: 'PRUEBA DE LA HOZ', email: '9944@colegioaleman.edu.co', address: 'calle 1', password: 'hash', enrollment: { status: 'activo' } },
                { id: 2, code: 9253, firstname: 'JUAN', lastname: 'PÉREZ', email: 'mama@gmail.com', enrollment: { status: 'inscrito' } },
                { id: 3, code: 9000, firstname: 'IDO', lastname: 'RETIRADO', email: '9000@colegioaleman.edu.co', enrollment: { status: 'retirado' } }
            ]
        }]
    }]
}, {
    id: 17, name: 'KINDERGARTEN', courses: [{ id: 80, name: 'PREKINDER', sections: [{ id: 2, name: 'PK1', students: [
        { id: 4, code: 9100, firstname: 'ANA', lastname: 'NUEVA', email: '', enrollment: { status: 'activo' } }
    ] }] }]
}];

async function testPhidiasRoster() {
    const phidias = require('../services/phidias');
    const list = phidias.flatten(SAMPLE_PHIDIAS);
    assert.strictEqual(list.length, 3, 'Withdrawn students are left out');
    const maria = list.find(s => s.code === '9944');
    assert.strictEqual(maria.full_name, 'Sofía Isabel Prueba de la Hoz');
    assert.strictEqual(maria.class_name, 'K5C');
    assert.ok(!('address' in maria) && !('password' in maria), 'Only the fields the app needs are kept');
    assert.strictEqual(phidias.codeFromEmail('9944@colegioaleman.edu.co'), '9944');
    assert.strictEqual(phidias.codeFromEmail('9944@gmail.com'), null);
    phidias._setCacheForTests({ students: list });
    assert.strictEqual((await phidias.findByEmail('9944@ColegioAleman.edu.co')).code, '9944');
    assert.strictEqual((await phidias.findByEmail('mama@gmail.com')).code, '9253', 'Registered personal email also works');
    const classes = await phidias.classes();
    assert.deepStrictEqual(classes.map(c => c.class_name), ['PK1', 'K5C'], 'Classes in school order');
    assert.deepStrictEqual(['K10A', 'K2A', 'KIN1', 'KKP1', 'PK3', 'K1B'].sort(phidias.classOrder), ['KKP1', 'PK3', 'KIN1', 'K1B', 'K2A', 'K10A']);
    phidias._setCacheForTests(null);
    console.log('✅ Phidias roster: full names, classes, institutional email = code; withdrawn and private fields left out');
}

function testDirectoryPlan() {
    const dir = require('../services/student_directory');
    const phidias = require('../services/phidias');
    const students = phidias.flatten(SAMPLE_PHIDIAS);
    const rows = [
        { id: 'a', username: '9944', student_code: '9944', class_name: 'K5B', full_name: 'Maria' },     // cambia de curso y nombre
        { id: 'b', username: '9944b', student_code: '9944', class_name: '5C', full_name: 'dup' },        // duplicado
        { id: 'c', username: '2000', student_code: '2000', class_name: 'K4A', full_name: 'Se fue' },     // ya no está
        { id: 'd', username: '1999', student_code: '1999', class_name: 'sinact', full_name: 'Inactivo' } // ya inactivo
    ];
    const plan = dir.buildPlan(rows, students);
    assert.deepStrictEqual(plan.create.map(c => c.code).sort(), ['9100', '9253']);
    assert.strictEqual(plan.update.length, 1);
    assert.deepStrictEqual(plan.update[0].patch, { class_name: 'K5C', full_name: 'Sofía Isabel Prueba de la Hoz' }, 'K5B -> K5C and the full name from Phidias');
    assert.deepStrictEqual(plan.deactivate.map(d => d.id).sort(), ['b', 'c'], 'Nobody is deleted: they move to sinact');
    assert.ok(plan.deactivate.every(d => d.to === 'sinact'));
    console.log('✅ Sync with Phidias: new students, class changes and leavers (to "sinact", never deleted)');
}

function testAssignmentsModel(tmp) {
    process.env.ASSIGNMENTS_FILE = path.join(tmp, 'assignments-unit.json');
    delete require.cache[require.resolve('../services/assignments')];
    const a = require('../services/assignments');
    const subjectIds = ['ciencias', 'arte'];
    const bad = a.normalize({ subject: 'x', retos: [] }, { subjectIds });
    assert.deepStrictEqual(bad.errors.sort(), ['retos', 'subject', 'targets']);
    const { errors, value } = a.normalize({ subject: 'ciencias', retos: [0, '2', 9], class_names: ['5a', 'sinact'], student_codes: ['9944', 'x'] }, { subjectIds });
    assert.deepStrictEqual(errors, []);
    assert.deepStrictEqual(value.activity_ids, ['profile', 'reto2_ciencias']);
    assert.deepStrictEqual(value.class_names, ['K5A']);
    assert.deepStrictEqual(value.student_codes, ['9944']);
    assert.ok(a.appliesTo(value, { code: '1', className: '5A' }), 'Whole class (any spelling)');
    assert.ok(a.appliesTo(value, { code: '9944', className: 'K9B' }), 'Single student');
    assert.ok(!a.appliesTo(value, { code: '1', className: 'K5B' }));
    const changed = a.changeTargets(value, { add: { classes: ['K6B'], students: ['7'] }, remove: { classes: ['K5A'] } });
    assert.deepStrictEqual(changed, { class_names: ['K6B'], student_codes: ['9944', '7'] });
    assert.ok(a.canEdit({ created_by: 'x@colegioaleman.edu.co' }, { email: 'X@colegioaleman.edu.co' }));
    assert.ok(!a.canEdit({ created_by: 'x@colegioaleman.edu.co' }, { email: 'y@colegioaleman.edu.co' }));
    assert.ok(a.canEdit({ created_by: 'x@colegioaleman.edu.co' }, { email: 'y@colegioaleman.edu.co', panel: true }));
    const roster = [{ code: '1', class_name: 'K5A' }, { code: '2', class_name: 'K5B' }, { code: '9944', class_name: 'K5C' }];
    assert.deepStrictEqual(a.recipients(value, roster).map(r => r.code), ['1', '9944']);
    console.log('✅ Assignments: by whole class or student, validation, add/remove recipients, only the author or the panel edits');
}

function testReto0Progress() {
    const { reto0ProgressBySubject } = require('../services/reto0_progress');
    const empty = reto0ProgressBySubject({}, 'ciencias');
    assert.deepStrictEqual(empty.panels, [false, false, false, false, false]);
    const data = {
        profile_photo: '🦊', name: 'Ana',
        reto0_ciencias_q1: 'a', reto0_ciencias_q2: 'b', reto0_ciencias_q3: 'c', reto0_ciencias_q4: 'd',
        r0_teachers: '2026-11-20', r0m_ciencias: JSON.stringify({ seen: ['a', 'b'], total: 2 })
    };
    const p = reto0ProgressBySubject(data, 'ciencias', { won: false });
    assert.deepStrictEqual(p.panels, [true, true, true, true, false]);
    assert.strictEqual(p.done, 4);
    assert.deepStrictEqual(reto0ProgressBySubject(data, 'arte').panels, [true, false, true, false, false], 'Each subject has its own questions and mission');
    assert.strictEqual(reto0ProgressBySubject({ ...data, r0m_ciencias: '' , r0_ciencias_q1: '1' }, 'ciencias').panels[3], true, 'Mission counts once the evaluation was presented');
    assert.strictEqual(reto0ProgressBySubject(data, 'ciencias', { won: true }).done, 5);
    console.log('✅ Reto 0 progress: the 5 buttons follow what was saved (avatar, data, teachers, mission, evaluation)');
}

function testSimpleReto0() {
    const q = require('../data_reto0_quiz');
    const { subjects } = require('../data');
    assert.ok([3, 4, 5].every(q.isSimpleGrade) && !q.isSimpleGrade(6) && !q.isSimpleGrade(2));
    subjects.forEach(({ id }) => {
        const normal = q.buildReto0Questions(id);
        const simple = q.buildSimpleReto0Questions(id);
        assert.strictEqual(simple.length, 10);
        simple.forEach((s, i) => {
            assert.strictEqual(s.id, normal[i].id, `${id} Reto 0 q${i + 1}: same id`);
            assert.strictEqual(s.options.findIndex(o => o.correct), normal[i].options.findIndex(o => o.correct), `${id} Reto 0 q${i + 1}: same answer position`);
            ['es', 'de', 'en'].forEach(l => assert.ok(s.label[l] && s.options.every(o => o[l]), `${id} Reto 0 q${i + 1} (${l})`));
        });
        assert.ok(simple[9].ai && /inteligencia artificial/.test(simple[9].label.es), `${id}: question 10 stays about AI`);
        assert.ok(!/undefined|\$\{/.test(JSON.stringify([simple, q.getSimpleReto0Study(id)])), `${id}: no holes`);
    });
    const tech = JSON.stringify(q.getSimpleReto0Study('tecnologia'));
    ['Word', 'PowerPoint', 'OneNote', 'Teams', 'OneDrive', 'codeSpark'].forEach(tool => assert.ok(tech.includes(tool), `Technology (K3-K5) uses ${tool}`));
    console.log('✅ Simple Reto 0 (K3-K5): short sentences, same ids and answer positions; Technology with Word, PowerPoint, OneNote, Teams, OneDrive and codeSpark');
}

// ── Servidor de prueba ──

async function getPort() {
    const server = net.createServer();
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const { port } = server.address();
    await new Promise(r => server.close(r));
    return port;
}

async function startServer(tmp) {
    const port = await getPort();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: path.join(__dirname, '..'),
        env: {
            ...process.env,
            PORT: String(port),
            SUPABASE_URL: '', SUPABASE_ANON_KEY: '',
            PHIDIAS_BASE_URL: '', PHIDIAS_TOKEN: '',
            AZURE_TENANT_ID: 'tenant-1', AZURE_CLIENT_ID: 'client-1', AZURE_CLIENT_SECRET: 'secret-1',
            APP_BASE_URL: 'https://medienpass.test',
            COOKIE_SECRET,
            LOCAL_ACTIVITY_CACHE_FILE: path.join(tmp, 'cache.json'),
            TEACHER_ROLES_FILE: path.join(tmp, 'roles.json'),
            ASSIGNMENTS_FILE: path.join(tmp, 'assignments.json')
        },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.on('data', c => { output += c; });
    child.stderr.on('data', c => { output += c; });
    const base = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + 20000;
    for (;;) {
        if (child.exitCode !== null) throw new Error('Server exited: ' + output);
        try { if ((await fetch(base + '/login')).ok) break; } catch (e) { /* aún no */ }
        if (Date.now() > deadline) throw new Error('Server did not start: ' + output);
        await new Promise(r => setTimeout(r, 200));
    }
    return { base, stop: () => child.kill() };
}

async function testServer(tmp) {
    fs.writeFileSync(path.join(tmp, 'roles.json'), JSON.stringify({ 'dev@colegioaleman.edu.co': 'desarrollador' }));
    const { base, stop } = await startServer(tmp);
    try {
        // Botón de Microsoft en los tres ingresos y redirección con PKCE
        for (const page of ['/login', '/teacher/login', '/admin/login?perfil=desarrollador']) {
            const html = await (await fetch(base + page)).text();
            assert.ok(html.includes('/auth/microsoft?as='), `${page} shows "Sign in with Microsoft"`);
        }
        const r = await fetch(base + '/auth/microsoft?as=teacher', { redirect: 'manual' });
        assert.strictEqual(r.status, 302);
        const loc = new URL(r.headers.get('location'));
        assert.strictEqual(loc.searchParams.get('redirect_uri'), 'https://medienpass.test/auth/microsoft/callback');
        assert.ok(/ms_login=s%3A/.test(r.headers.get('set-cookie')), 'The login state is kept in a signed cookie');
        const bad = await fetch(base + '/auth/microsoft/callback?code=x&state=forged', { redirect: 'manual' });
        assert.strictEqual(bad.status, 302);
        assert.ok(bad.headers.get('location').startsWith('/login?error='), 'A forged state is rejected');
        console.log('✅ SSO pages: Microsoft button on the three logins, redirect with PKCE, forged state rejected');

        // Asignaciones por API: el docente asigna a un curso y a un estudiante; el estudiante las ve
        const teacher = { email: 'profe@colegioaleman.edu.co', first_name: 'Profe', last_name: 'Test', subject: 'ciencias', id: 't1' };
        const tCookie = `${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(teacher))}`;
        const otherCookie = `${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify({ ...teacher, email: 'otro@colegioaleman.edu.co' }))}`;
        const json = (url, opts = {}, cookie = tCookie) => fetch(base + url, { ...opts, headers: { 'Content-Type': 'application/json', Cookie: cookie } }).then(async res => ({ status: res.status, body: await res.json() }));
        assert.strictEqual((await fetch(base + '/api/assignments')).status, 401, 'Assignments need a teacher or panel session');
        const invalid = await json('/api/assignments', { method: 'POST', body: JSON.stringify({ subject: 'ciencias', retos: [] }) });
        assert.strictEqual(invalid.status, 400);
        const created = await json('/api/assignments', { method: 'POST', body: JSON.stringify({ subject: 'ciencias', retos: [0, 1], class_names: ['5A'], student_codes: ['9944'], due_date: '2026-12-01' }) });
        assert.strictEqual(created.status, 200, JSON.stringify(created.body));
        const id = created.body.assignment.id;
        assert.deepStrictEqual(created.body.assignment.class_names, ['K5A']);
        const forbidden = await json(`/api/assignments/${id}/targets`, { method: 'POST', body: JSON.stringify({ add: { classes: ['K6A'] } }) }, otherCookie);
        assert.strictEqual(forbidden.status, 403, 'Another teacher cannot change it');
        const targets = await json(`/api/assignments/${id}/targets`, { method: 'POST', body: JSON.stringify({ add: { classes: ['K6A'] }, remove: { students: ['9944'] } }) });
        assert.deepStrictEqual([targets.body.assignment.class_names, targets.body.assignment.student_codes], [['K5A', 'K6A'], []]);
        const listed = await json('/api/assignments');
        assert.strictEqual(listed.body.assignments.length, 1);
        assert.strictEqual(listed.body.storage, 'file');
        const progress = await json(`/api/assignments/${id}/progress`);
        assert.strictEqual(progress.status, 200);

        const student = { id: 'local_assign', username: '4001', student_code: '4001', class_name: 'K5A' };
        const sCookie = `${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
        const mine = await json('/api/student/assignments', {}, sCookie);
        assert.strictEqual(mine.body.assignments.length, 1, 'A student of the assigned class receives it');
        assert.deepStrictEqual(mine.body.assignments[0].retos.map(x => x.status), ['pending', 'pending']);
        const home = await (await fetch(base + '/', { headers: { Cookie: sCookie } })).text();
        assert.ok(home.includes('assigned-box') && home.includes('/profile?subject=ciencias'), 'Home shows the assigned activities');
        const other = { ...student, id: 'local_other', student_code: '4002', class_name: 'K7A' };
        const oCookie = `${signedCookie('student_id', other.id)}; ${signedCookie('student_data', JSON.stringify(other))}`;
        assert.strictEqual((await json('/api/student/assignments', {}, oCookie)).body.assignments.length, 0, 'Other classes do not');
        const archived = await json(`/api/assignments/${id}/archive`, { method: 'POST', body: '{}' });
        assert.strictEqual(archived.body.assignment.active, false);
        assert.strictEqual((await json('/api/student/assignments', {}, sCookie)).body.assignments.length, 0, 'Archived assignments disappear for students');
        const page = await fetch(base + '/teacher/assignments', { headers: { Cookie: tCookie } });
        assert.strictEqual(page.status, 200);
        console.log('✅ Assignment API: whole class or single student, only the author edits, students see theirs, archive hides it');

        // Retos siempre disponibles: inicio liviano, sin segundo combo, 6 retos de las 11 materias
        for (const cls of ['K12C', '5A', 'K4B']) {
            const st = { id: 'local_home_' + cls, username: 'h', class_name: cls };
            const c = `${signedCookie('student_id', st.id)}; ${signedCookie('student_data', JSON.stringify(st))}`;
            const res = await fetch(base + '/', { headers: { Cookie: c, 'Accept-Encoding': 'gzip' } });
            const html = await res.text();
            assert.ok(!html.includes('id="retoCombo"'), `${cls}: no second combo`);
            assert.ok(html.includes('showAllRetos'), `${cls}: shows every challenge after choosing the subject`);
            const cards = (html.match(/id="card-reto\d_[a-z_]+"/g) || []).length;
            assert.strictEqual(cards, 66, `${cls}: 6 challenges x 11 subjects (${cards})`);
            assert.ok(html.length < 400000, `${cls}: light home page (${html.length} bytes)`);
            assert.strictEqual(res.headers.get('content-encoding'), 'gzip', 'Compressed');
        }
        // Retroalimentación en los retos 1-6 y Primaria sin «Misión OASIS»
        const k4 = { id: 'local_quiz', username: 'q', class_name: 'K4A' };
        const k4Cookie = `${signedCookie('student_id', k4.id)}; ${signedCookie('student_data', JSON.stringify(k4))}`;
        const reto = await (await fetch(base + '/activity/2627/reto1_tecnologia', { headers: { Cookie: k4Cookie } })).text();
        assert.strictEqual((reto.match(/class="form-group quiz-card quiz-reto-1"/g) || []).length, 6, 'Six question cards with the reto colour');
        assert.strictEqual((reto.match(/class="quiz-num"/g) || []).length, 6, 'Big numbers');
        assert.strictEqual((reto.match(/class="form-group quiz-explain-card/g) || []).length, 6, 'Split "why?" cards');
        assert.ok(reto.includes('renderQuizFeedback') && reto.includes('pickRadioOption') && reto.includes('id="quizfb_r1_tecnologia_k4_q1"'));
        assert.ok(!reto.includes('class="reto-theme"'), 'No OASIS mission in K3-K6');
        assert.ok(!reto.includes('question-hint-box'), 'The explanation is not shown before answering');
        const k8 = { id: 'local_quiz8', username: 'q8', class_name: 'K8A' };
        const k8Html = await (await fetch(base + '/activity/2627/reto1_tecnologia', { headers: { Cookie: `${signedCookie('student_id', k8.id)}; ${signedCookie('student_data', JSON.stringify(k8))}` } })).text();
        assert.ok(k8Html.includes('class="reto-theme"'), 'K7-K12 keep the OASIS mission');
        console.log('✅ Home: always the 7 challenges, light and compressed; feedback cards in challenges 1-6');

        // Avance del Reto 0: se guarda la misión y los botones siguen lo guardado
        const r0 = { id: 'local_r0', username: 'r0', class_name: 'K5A' };
        const r0Cookie = `${signedCookie('student_id', r0.id)}; ${signedCookie('student_data', JSON.stringify(r0))}`;
        const save = body => json('/api/save/profile', { method: 'POST', body: JSON.stringify(body) }, r0Cookie);
        let saved = await save({ reto0_subject: 'ciencias', profile_photo: '🦊' });
        assert.deepStrictEqual(saved.body.reto0Progress.panels, [true, false, false, false, false]);
        saved = await save({ reto0_subject: 'ciencias', r0m_ciencias: JSON.stringify({ seen: ['x'], total: 1 }) });
        assert.deepStrictEqual(saved.body.reto0Progress.panels, [true, false, false, true, false], 'The mission is kept and counts');
        const loaded = await json('/api/load/profile?subject=ciencias', {}, r0Cookie);
        assert.strictEqual(loaded.body.reto0Progress.done, 2, 'Progress comes back when the page opens');
        assert.ok(JSON.parse(loaded.body.data.r0m_ciencias).seen.includes('x'));
        const profile = await (await fetch(base + '/profile?subject=tecnologia', { headers: { Cookie: r0Cookie } })).text();
        assert.ok(profile.includes('id="r0m_tecnologia"') && profile.includes('applyReto0Progress'));
        assert.ok(profile.includes('codeSpark'), 'K5 sees the simple Reto 0 (Technology with codeSpark)');
        console.log('✅ Reto 0 progress: saved mission and real progress on the 5 buttons; simple Reto 0 for K5');
    } finally {
        stop();
    }
}

(async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-sso-'));
    try {
        testClassNames();
        testMicrosoftSso();
        await testPhidiasRoster();
        testDirectoryPlan();
        testAssignmentsModel(tmp);
        testReto0Progress();
        testSimpleReto0();
        await testServer(tmp);
        console.log('\nAll SSO, Phidias and assignment tests passed.');
    } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
