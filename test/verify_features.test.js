const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ejs = require('ejs');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'test-cookie-secret';

// Same value Express produces for res.cookie(name, value, { signed: true })
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

async function waitForServer(child, url, getOutput) {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`Test server exited early: ${getOutput()}`);
        }
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
            if (response.ok) return;
        } catch (error) {
            if (error.name !== 'AbortError' && error.name !== 'TimeoutError' && child.exitCode !== null) {
                throw new Error(`Test server failed: ${getOutput()}`);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error(`Test server did not start: ${getOutput()}`);
}

// Perfiles de prueba (el panel lee el perfil de este archivo en cada petición)
const DEV_ADMIN = { email: 'pages.admin@colegioaleman.edu.co', role: 'desarrollador', first_name: 'Page', last_name: 'Admin' };
const COORD_ADMIN = { email: 'pages.coord@colegioaleman.edu.co', role: 'coordinador', first_name: 'Page', last_name: 'Coord' };
const TEST_ROLES = { [DEV_ADMIN.email]: 'desarrollador', [COORD_ADMIN.email]: 'coordinador' };
const adminCookie = user => `${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(user))}`;

async function startTestServer(cachePath, rolesFile) {
    const port = await getAvailablePort();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: path.join(__dirname, '..'),
        env: {
            ...process.env,
            PORT: String(port),
            SUPABASE_URL: '',
            SUPABASE_ANON_KEY: '',
            COOKIE_SECRET,
            LOCAL_ACTIVITY_CACHE_FILE: cachePath,
            TEACHER_ROLES_FILE: rolesFile
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
    try {
        await waitForServer(child, `${baseUrl}/login`, () => output);
    } catch (error) {
        await stop();
        throw error;
    }
    return { baseUrl, stop };
}

async function verifyInstrumentStore() {
    const instrumentStore = require('../services/instrument_store');
    const testQuestions = [{
        id: 'test_q1',
        type: 'radio_group',
        label: { es: '¿Cuál es la práctica correcta de búsqueda?', de: '...', en: '...' },
        hint: { es: 'Usa palabras clave y comillas.', de: '...', en: '...' },
        options: [
            { es: 'a) Usar palabras clave específicas', correct: true },
            { es: 'b) Escribir oraciones largas aleatorias', correct: false }
        ]
    }];

    const saved = instrumentStore.saveCustomInstrument(5, 'tecnologia', 1, 'editable', testQuestions);
    assert.strictEqual(saved.mode, 'editable');
    assert.strictEqual(saved.questions.length, 1);
    assert.strictEqual(saved.questions[0].options[0].correct, true);
    assert.strictEqual(saved.questions[0].options[1].correct, false);

    const retrieved = instrumentStore.getCustomInstrument(5, 'tecnologia', 1);
    assert.ok(retrieved, 'Should retrieve saved custom instrument');
    assert.strictEqual(retrieved.questions[0].options[0].correct, true);

    assert.strictEqual(instrumentStore.resetToDefault(5, 'tecnologia', 1), true);
    assert.strictEqual(instrumentStore.getCustomInstrument(5, 'tecnologia', 1), null);
    console.log('✅ Instrument store save, retrieval, and reset');
}

function verifyActivityTemplate() {
    const activityPath = path.join(__dirname, '..', 'views', 'activity.ejs');
    const source = fs.readFileSync(activityPath, 'utf8');
    ejs.compile(source, { filename: activityPath });
    for (let panel = 1; panel <= 5; panel++) {
        assert.ok(source.includes(`id="panel-header-${panel}"`));
        assert.ok(source.includes(`id="panel-content-${panel}"`));
    }
    console.log('✅ Activity template compiles and exposes accessible accordion controls');

    // Saving happens only through the save buttons
    assert.ok(!source.includes('setInterval(silentAutosave'), 'Activity must not autosave on a timer');
    assert.ok(!source.includes('__autosavePayload'), 'Activity must not send answers when the tab is hidden or closed');
    assert.ok(!source.includes('saveLocally'), 'Activity must not keep drafts in localStorage');
    assert.ok(source.includes("addEventListener('beforeunload'"), 'Activity should warn before leaving with unsaved changes');
    const footer = fs.readFileSync(path.join(__dirname, '..', 'views', 'partials', 'footer.ejs'), 'utf8');
    assert.ok(!footer.includes('autosave.js'), 'Footer must not load the autosave script');
    console.log('✅ Activity saves only when a save button is pressed');
}

// Server-side EJS code (<% %>) runs in Node: it must never use browser globals like window.
// Also renders the admin dashboard with students, a path the local test server (no Supabase,
// so no students) never reaches.
function verifyServerTemplates() {
    const viewsDir = path.join(__dirname, '..', 'views');
    const offenders = [];
    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) { walk(full); continue; }
            if (!entry.name.endsWith('.ejs')) continue;
            const source = fs.readFileSync(full, 'utf8');
            for (const match of source.matchAll(/<%[=-]?[\s\S]*?%>/g)) {
                if (/\b(window|localStorage|sessionStorage)\.|\bdocument\.(getElementById|querySelector|cookie|body|createElement|addEventListener)/.test(match[0])) {
                    offenders.push(`${path.relative(viewsDir, full)}:${source.slice(0, match.index).split('\n').length}`);
                }
            }
        }
    })(viewsDir);
    assert.deepStrictEqual(offenders, [], 'Browser globals used in server-side EJS code');

    const i18nStore = require('../services/i18n_store');
    const { klassenConfig, tecnologiaActivities, subjects, levels } = require('../data');
    const yearStore = require('../services/school_years');
    const schoolYears = yearStore.list();
    const schoolYear = { id: yearStore.activeYear(), label: yearStore.labelOf(yearStore.activeYear()) };
    const students = [
        { id: 's1', username: 'ana', full_name: 'Ana Prueba', class_name: 'K5A', student_code: '2401', created_at: '2026-10-01T12:00:00Z', list_number: 1,
            search: { code: '2401', names: 'ana', surnames: 'prueba' } },
        { id: 's2', username: 'luis', full_name: null, class_name: 'K6B', student_code: null, created_at: null, list_number: 1 }
    ];
    const renderDashboard = (lang, role) => ejs.render(fs.readFileSync(path.join(viewsDir, 'admin', 'dashboard.ejs'), 'utf8'), {
        students, klassenConfig, tecnologiaActivities, subjects, levels, schoolYears, schoolYear,
        adminUser: { first_name: 'Ana', last_name: 'Prueba', role },
        access: { role, perms: {}, isDeveloper: role === 'desarrollador' },
        lang, t: key => i18nStore.translate(key, lang), i18nScripts: () => ''
    }, { filename: path.join(viewsDir, 'admin', 'dashboard.ejs') });
    for (const lang of i18nStore.LANGS) {
        const html = renderDashboard(lang, 'desarrollador');
        assert.ok(html.includes('data-id="s1"') && html.includes('data-id="s2"'), `Admin student list should render (${lang})`);
        assert.ok(html.includes('data-search-code="2401" data-search-names="ana" data-search-surnames="prueba"'), `Student rows carry the search fields (${lang})`);
        assert.ok(html.includes('id="sub-teachers"') && html.includes('id="searchTeacherDoc"'), `Admin dashboard has the teachers section (${lang})`);
        assert.ok(!/maintab-inventory|kpiDevices|kpiIncidents|loadDbTable\('(incidents|multimedia_products)'\)/.test(html),
            `Inventory, incidents and products are gone from the admin dashboard (${lang})`);
        const teachersSection = html.slice(html.indexOf('id="sub-teachers"'), html.indexOf('id="sub-config"'));
        assert.ok(teachersSection.includes("loadDbTable('teachers')") && teachersSection.includes('id="pendingTeachersPanel"'),
            `The database editor is in the teachers section (${lang})`);
        assert.ok(html.includes('id="sub-certificates"') && html.includes('data-mode="teacher"') && !html.includes('loadReport('),
            `Certificates replace the class report (${lang})`);

        // Directivo y coordinador: consultas de solo lectura, sin configuración ni códigos
        const coord = renderDashboard(lang, 'coordinador');
        assert.ok(coord.includes('data-id="s1"') && !coord.includes('2401'), `The coordinator sees the students without their codes (${lang})`);
        assert.ok(!/id="sub-(config|subjects|mapping|help|i18n)"/.test(coord) && !coord.includes("loadDbTable('teachers')") && !coord.includes('id="searchTeacherDoc"'),
            `The coordinator panel has no settings, database editor or ID search (${lang})`);
        assert.ok(coord.includes('data-main="consultas"') && !coord.includes('data-main="administracion"') && !coord.includes('maintab-novedades')
            && coord.includes('id="docentes-cursos-card"') && coord.includes('id="sub-certificates"'), `The coordinator menu is Consultas and Indicadores, without Novedades (${lang})`);
    }
    console.log('✅ Server-side templates use no browser globals and the admin dashboard renders with students');
}

function verifyAdminSearch() {
    const { searchText, splitStudentName } = require('../services/admin_search');
    assert.strictEqual(searchText('  PEÑA  Díaz '), 'pena diaz');
    assert.deepStrictEqual(splitStudentName('JUAN PÉREZ GARCÍA'), { names: 'juan', surnames: 'perez garcia' });
    assert.deepStrictEqual(splitStudentName('MARIA JOSE PEREZ GOMEZ'), { names: 'maria jose', surnames: 'perez gomez' });
    assert.deepStrictEqual(splitStudentName('ANA SCHMIDT'), { names: 'ana', surnames: 'schmidt' });
    assert.deepStrictEqual(splitStudentName('LUIS DE LA HOZ PEREZ'), { names: 'luis', surnames: 'de la hoz perez' });
    assert.deepStrictEqual(splitStudentName('maria de los angeles ruiz diaz'), { names: 'maria de los angeles', surnames: 'ruiz diaz' });
    assert.deepStrictEqual(splitStudentName('pedro'), { names: 'pedro', surnames: '' });
    assert.deepStrictEqual(splitStudentName(null), { names: '', surnames: '' });
    console.log('✅ Admin search splits student names into first names and surnames');
}

// Respuestas de un reto 1-6 para un grado: `correct` preguntas bien (el resto mal), con o sin argumento
function retoAnswers(activity, correct, explain) {
    const argument = 'Porque la fuente es confiable, tiene autor conocido, fecha reciente y datos comprobables en otros sitios.';
    const data = {};
    activity.evidence.filter(e => e.type === 'radio_group').forEach((q, i) => {
        const idx = q.options.findIndex(o => (i < correct ? o.correct : !o.correct));
        const opt = q.options[idx];
        data[q.id] = String(opt.val !== undefined ? opt.val : idx);
        data[q.id + '_explain'] = explain ? argument : '';
    });
    return data;
}

// Respuestas de la evaluación del Reto 0: las primeras `correct` preguntas bien, el resto mal
function reto0Answers(reto0, correct) {
    const data = {};
    reto0.evidence.filter(e => e.quiz).forEach((q, i) => {
        const idx = q.options.findIndex(o => (i < correct ? o.correct : !o.correct));
        data[q.id] = String(q.options[idx].val !== undefined ? q.options[idx].val : idx);
    });
    return data;
}

// Contenido por materia: Reto 0 (10 preguntas) y retos 1-6 (situaciones de la materia)
function verifySubjectContent() {
    const { allActivities, getReto0ForSubject, subjects } = require('../data');
    const legacy = require('../test/fixtures/legacy_correct_positions.json');
    const langs = ['es', 'de', 'en'];
    const leftovers = /undefined|\$\{|Dificultad \+|Schwierigkeit \+|Difficulty \+/;
    const problems = [];
    const firstLabels = {};

    subjects.forEach(({ id }) => {
        const reto0 = getReto0ForSubject(id);
        const quiz = reto0.evidence.filter(e => e.quiz);
        if (quiz.length !== 10) problems.push(`${id}: Reto 0 con ${quiz.length} preguntas`);
        if (reto0.evidence.some(e => e.id.startsWith('eval_'))) problems.push(`${id}: Reto 0 conserva la evaluación anterior`);
        // 6 competencias y 3 reglas de seguridad: las 2 de la materia y la de la inteligencia artificial
        if (!reto0.study || reto0.study.examples.length !== 6 || reto0.study.safety.length !== 3) problems.push(`${id}: Reto 0 sin material de estudio`);
        quiz.forEach(q => {
            if (q.options.length !== 3 || q.options.filter(o => o.correct).length !== 1) problems.push(`${q.id}: opciones`);
            if (langs.some(l => !q.label[l] || q.options.some(o => !o[l]) || !q.practice_explanation[l])) problems.push(`${q.id}: falta un idioma`);
            if (leftovers.test(JSON.stringify(q))) problems.push(`${q.id}: restos de plantilla`);
        });

        for (let r = 1; r <= 6; r++) {
            const activity = allActivities[String(r)].find(a => a.subject === id);
            if (!activity) continue;
            for (let g = 2; g <= 12; g++) {
                activity[`evidence_k${g}`].filter(e => e.type === 'radio_group').forEach((q, i) => {
                    const correct = q.options.findIndex(o => o.correct);
                    if (q.options.length !== 3 || q.options.filter(o => o.correct).length !== 1) problems.push(`${q.id}: opciones`);
                    if (g > 2 && correct !== legacy[`r${r}q${i + 1}`]) problems.push(`${q.id}: la respuesta correcta cambió de posición`);
                    if (langs.some(l => !q.label[l] || q.options.some(o => !o[l]))) problems.push(`${q.id}: falta un idioma`);
                    if (leftovers.test(JSON.stringify(q))) problems.push(`${q.id}: restos de plantilla`);
                    if (g === 7 && r === 1 && i === 0) firstLabels[id] = q.label.es;
                });
            }
        }
    });
    assert.deepStrictEqual(problems.slice(0, 10), [], 'Subject content problems');
    assert.strictEqual(new Set(Object.values(firstLabels)).size, Object.keys(firstLabels).length, 'Each subject has its own reto questions');
    console.log('✅ Reto 0 (10 questions) and retos 1-6 are adapted to each subject in DE, EN and ES');
}

function verifyRetoResult() {
    const { retoResult, retoNumber, isInstitutionalEmail } = require('../services/reto_result');
    const { allActivities, getReto0ForSubject } = require('../data');
    const base = allActivities['3'].find(a => a.id === 'reto3_ingles');
    const reto = { ...base, evidence: base.evidence_k5 };

    assert.deepStrictEqual(retoResult(reto, retoAnswers(reto, 6, true)), { kind: 'stars', score: 30, max: 30, pct: 100, won: true });
    assert.strictEqual(retoResult(reto, retoAnswers(reto, 5, true)).won, true, '5 correct + arguments = 28/30 wins');
    assert.deepStrictEqual(retoResult(reto, retoAnswers(reto, 6, false)), { kind: 'stars', score: 18, max: 30, pct: 60, won: false });
    assert.strictEqual(retoResult(reto, {}).won, false);

    // Reto 0: 10 preguntas por materia, se gana con 8; la evaluación anterior (28) sigue valiendo
    const { legacyReto0Questions } = require('../data');
    const reto0 = getReto0ForSubject('aleman');
    assert.strictEqual(retoResult(reto0, reto0Answers(reto0, 8)).won, true, '8 of 10 wins Reto 0');
    assert.deepStrictEqual(retoResult(reto0, reto0Answers(reto0, 7)), { kind: 'hits', score: 7, max: 10, pct: 70, won: false });
    assert.strictEqual(retoResult(getReto0ForSubject('ingles'), reto0Answers(reto0, 10)).won, false, 'Reto 0 is won per subject');
    const oldAnswers = reto0Answers({ evidence: legacyReto0Questions.map(q => ({ ...q, quiz: true })) }, 23);
    const legacy = retoResult(getReto0ForSubject('musica'), oldAnswers, { legacyQuestions: legacyReto0Questions });
    assert.ok(legacy.won && legacy.legacy, 'Students who passed the old 28-question evaluation keep Reto 0');
    assert.strictEqual(retoResult(getReto0ForSubject('musica'), oldAnswers).won, false);

    assert.strictEqual(retoNumber('profile'), 0);
    assert.strictEqual(retoNumber('reto6_mint_sach'), 6);
    assert.strictEqual(retoNumber('save-flow-test'), null);
    assert.strictEqual(retoResult({ id: 'notes', evidence: [] }, {}), null);
    assert.ok(isInstitutionalEmail(' Ana.Perez@ColegioAleman.edu.co '));
    assert.ok(!isInstitutionalEmail('ana@gmail.com'));
    assert.ok(!isInstitutionalEmail('ana@colegioaleman.edu.co.evil.com'));
    console.log('✅ A reto is won with 80 % (computed on the server) and only school emails are accepted');
}

// El cuadro "Certificado Medienpass" y el correo institucional solo se habilitan con los 7 retos
// (0 a 6) de la materia ganados; un solo reto ganado no basta.
async function verifyRetoEmailFlow(baseUrl) {
    const { allActivities, getReto0ForSubject } = require('../data');
    const retoOf = n => {
        const base = allActivities[String(n)].find(a => a.id === `reto${n}_ingles`);
        return { ...base, evidence: base.evidence_k5 || base.evidence };
    };
    const student = { id: 'local_reto_email_test', username: 'reto', class_name: 'K5A' };
    const cookie = `${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const save = async (activityId, body) => (await fetch(`${baseUrl}/api/save/${activityId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body)
    })).json();
    const load = async (activityId, query = '') => (await fetch(`${baseUrl}/api/load/${activityId}${query}`, { headers: { Cookie: cookie } })).json();
    const schoolEmail = 'reto@colegioaleman.edu.co';

    // Un reto ganado no basta
    let res = await save('reto3_ingles', { ...retoAnswers(retoOf(3), 6, true), institutional_email: schoolEmail });
    assert.strictEqual(res.retoResult.won, true);
    assert.strictEqual(res.emailError, 'not_complete', 'No email until retos 0 to 6 are won');
    assert.strictEqual(res.institutionalEmail, '');
    assert.ok(res.medienpass && !res.medienpass.complete && res.medienpass.wonCount === 1 && res.medienpass.total === 7);

    // Reto 0 y retos 1, 2, 4 y 5 ganados: falta el 6
    await save('profile', { reto0_subject: 'ingles', ...reto0Answers(getReto0ForSubject('ingles'), 10) });
    for (const n of [1, 2, 4, 5]) await save(`reto${n}_ingles`, retoAnswers(retoOf(n), 6, true));
    let loaded = await load('reto3_ingles');
    assert.ok(loaded.medienpass.wonCount === 6 && !loaded.medienpass.complete && loaded.medienpass.email === '');
    res = await save('reto6_ingles', { ...retoAnswers(retoOf(6), 6, false), institutional_email: schoolEmail });
    assert.strictEqual(res.emailError, 'not_complete', 'A lost reto 6 does not complete the Medienpass');

    // Reto 6 ganado: completo; el correo tiene que ser del colegio
    res = await save('reto6_ingles', { ...retoAnswers(retoOf(6), 6, true), institutional_email: 'reto@gmail.com' });
    assert.ok(res.medienpass.complete);
    assert.strictEqual(res.emailError, 'invalid', 'Only school emails');
    res = await save('reto6_ingles', { ...retoAnswers(retoOf(6), 6, true), institutional_email: ' Reto@ColegioAleman.edu.co ' });
    assert.strictEqual(res.emailError, null);
    assert.strictEqual(res.institutionalEmail, schoolEmail);
    assert.deepStrictEqual(res.medienpass.retos.map(r => r.won), Array(7).fill(true));
    assert.ok(res.medienpass.email === schoolEmail && res.medienpass.subjectName.es && res.medienpass.completedAt);

    // Los otros retos de la materia ya muestran el cuadro con el correo; otra materia no
    loaded = await load('reto3_ingles');
    assert.ok(loaded.medienpass.complete && loaded.medienpass.email === schoolEmail);
    assert.ok((await load('profile', '?subject=ingles')).medienpass.complete, 'Reto 0 of the same subject shows the box');
    assert.ok(!(await load('profile', '?subject=aleman')).medienpass.complete, 'Another subject is not complete');

    // Si vuelve a guardar el reto 6 sin ganarlo, el correo guardado se conserva
    res = await save('reto6_ingles', { ...retoAnswers(retoOf(6), 6, false), institutional_email: schoolEmail });
    assert.ok(!res.medienpass.complete && res.emailError === null);
    assert.strictEqual((await load('reto6_ingles')).data.institutional_email, schoolEmail, 'A saved email is never erased');

    const page = await (await fetch(`${baseUrl}/activity/2627/reto3_ingles`, { headers: { Cookie: cookie } })).text();
    assert.ok(page.includes('<section class="reto-win" id="retoWin" aria-live="polite" hidden>') && page.includes('id="institutional_email"')
        && page.includes('id="retoCertificate"') && page.includes('id="retoCertRetos"'),
        'The certificate box starts hidden; the page shows it only when the server reports retos 0 to 6 won');
    // Cada pregunta muestra la competencia KMK que trabaja
    const kmkTags = [...page.matchAll(/class="kmk-tag" data-kmk="(\d\.\d)"/g)].map(m => m[1]);
    assert.ok(kmkTags.length === 6 && kmkTags.every(id => id.startsWith('3.')) && page.includes('KMK 3.1'),
        'Each question of the reto shows its KMK sub-competence');
    console.log('✅ The certificate box and the school email only unlock after winning retos 0 to 6 of the subject');
}

// El Reto 0 es un registro para todas las materias: guardar una materia no borra las otras
async function verifyReto0BySubject(baseUrl) {
    const { getReto0ForSubject } = require('../data');
    const student = { id: 'local_reto0_subjects', username: 'reto0', class_name: 'K6A' };
    const cookie = `${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const save = async body => (await fetch(`${baseUrl}/api/save/profile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body)
    })).json();
    const load = async subject => (await fetch(`${baseUrl}/api/load/profile?subject=${subject}`, { headers: { Cookie: cookie } })).json();

    let res = await save({ reto0_subject: 'aleman', about_me: 'Me gusta leer', ...reto0Answers(getReto0ForSubject('aleman'), 9) });
    assert.strictEqual(res.retoResult.won, true, 'German Reto 0 won with 9/10');
    res = await save({ reto0_subject: 'ingles', ...reto0Answers(getReto0ForSubject('ingles'), 5) });
    assert.strictEqual(res.retoResult.won, false, 'English Reto 0 not won with 5/10');

    const aleman = await load('aleman');
    assert.strictEqual(aleman.retoResult.won, true, 'Saving English did not erase German');
    assert.strictEqual(aleman.data.about_me, 'Me gusta leer');
    assert.strictEqual((await load('ingles')).retoResult.won, false);
    assert.strictEqual((await load('musica')).retoResult.score, 0);

    const page = await (await fetch(`${baseUrl}/profile?subject=matematicas`, { headers: { Cookie: cookie } })).text();
    assert.ok(page.includes('id="r0_matematicas_q1_0"') && !page.includes('id="eval_q1_0"'), 'Reto 0 page shows the subject evaluation');
    assert.ok((page.match(/class="mySlides fade"/g) || []).length === 5, 'Reto 0 study material has 5 slides');
    const print = await fetch(`${baseUrl}/teacher/download-challenges?level=7&subject=musica`, {
        headers: { Cookie: `${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify({ email: 't@colegioaleman.edu.co', subject: 'aleman' }))}` }
    });
    assert.strictEqual(print.status, 200, 'Printable booklet renders for a subject');
    assert.ok((await print.text()).includes('Beethoven'), 'Printable booklet uses the chosen subject');
    console.log('✅ Reto 0 is graded per subject and saving one subject keeps the others');
}

async function verifyAdminRoutes(baseUrl) {
    const admin = { headers: { Cookie: adminCookie(DEV_ADMIN) }, redirect: 'manual' };
    const teachers = await fetch(`${baseUrl}/api/admin/teachers`, admin);
    assert.strictEqual(teachers.status, 200);
    assert.deepStrictEqual(await teachers.json(), { success: true, teachers: [] }, 'Teachers list without Supabase is empty');
    const unsigned = await fetch(`${baseUrl}/api/admin/teachers`, { headers: { Cookie: 'admin_auth=true' }, redirect: 'manual' });
    assert.strictEqual(unsigned.status, 302, 'Teachers list needs an admin session');
    const inventory = await fetch(`${baseUrl}/admin/inventory`, admin);
    assert.strictEqual(inventory.status, 302);
    assert.strictEqual(inventory.headers.get('location'), '/admin', 'Old inventory page goes to the admin panel');
    for (const method of ['GET', 'POST']) {
        const devices = await fetch(`${baseUrl}/api/devices`, { ...admin, method });
        assert.strictEqual(devices.status, 404, `/api/devices (${method}) was removed`);
    }
    const certs = await fetch(`${baseUrl}/api/admin/certificates/students/K5A/aleman`, admin);
    assert.deepStrictEqual(await certs.json(), { success: true, students: [] }, 'Student certificates without Supabase are empty');
    const badSubject = await fetch(`${baseUrl}/api/admin/certificates/students/K5A/nada`, admin);
    assert.strictEqual(badSubject.status, 400, 'Unknown subject is rejected');
    const certsUnsigned = await fetch(`${baseUrl}/api/admin/certificates/students/K5A/aleman`, { headers: { Cookie: 'admin_auth=true' }, redirect: 'manual' });
    assert.strictEqual(certsUnsigned.status, 302, 'Certificates need an admin session');
    console.log('✅ Admin teachers list, old inventory redirect and removed inventory APIs');
}

// Every key a page uses (data-i18n*, t('...')) must exist in German, English and Spanish,
// otherwise switching language leaves that text untranslated.
function verifyTranslationsComplete() {
    const i18nStore = require('../services/i18n_store');
    const merged = { de: {}, en: {}, es: {} };
    i18nStore.listSections().forEach(({ id }) => {
        const dict = i18nStore.getSection(id);
        i18nStore.LANGS.forEach(lang => Object.assign(merged[lang], dict[lang]));
    });

    const files = [];
    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.name.endsWith('.ejs')) files.push(full);
        }
    })(path.join(__dirname, '..', 'views'));
    const jsDir = path.join(__dirname, '..', 'public', 'js');
    fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !f.startsWith('i18n')).forEach(f => files.push(path.join(jsDir, f)));
    files.push(path.join(__dirname, '..', 'server.js')); // mensajes del servidor: res.locals.t('srv_...')

    const keyPattern = /data-i18n(?:-html|-placeholder|-title|-option)?="([A-Za-z0-9_]+)"|\bt\(\s*'([A-Za-z0-9_]+)'\s*\)/g;
    const used = new Set();
    const missing = new Set();
    for (const file of files) {
        for (const match of fs.readFileSync(file, 'utf8').matchAll(keyPattern)) {
            const key = match[1] || match[2];
            used.add(key);
            const absent = i18nStore.LANGS.filter(lang => !merged[lang][key]);
            if (absent.length) missing.add(`${path.basename(file)}: ${key} (${absent.join(', ')})`);
        }
    }
    assert.deepStrictEqual([...missing], [], 'Translation keys missing in some language');
    console.log(`✅ All ${used.size} translation keys used by the pages exist in DE, EN and ES`);
}

async function verifySaveFlow(baseUrl, cachePath) {
    const student = { id: 'local_save_test', username: 'test', class_name: 'K3A' };
    const cookie = `${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const save = async (activityId, answer) => fetch(`${baseUrl}/api/save/${activityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookie },
        body: JSON.stringify({ answer, period: 1, school_year: '2627' })
    });

    const firstResponse = await save('save-flow-test', 'persisted');
    assert.strictEqual(firstResponse.status, 200);
    assert.deepStrictEqual(await firstResponse.json(), {
        success: true,
        message: 'Guardado localmente.',
        localOnly: true
    });

    const loadedResponse = await fetch(`${baseUrl}/api/load/save-flow-test`, {
        headers: { Cookie: cookie }
    });
    assert.strictEqual(loadedResponse.status, 200);
    const loaded = await loadedResponse.json();
    assert.strictEqual(loaded.data.answer, 'persisted');
    assert.strictEqual(loaded.data.period, 1);

    const concurrentSaves = await Promise.all(
        Array.from({ length: 8 }, (_, index) => save(`parallel-${index}`, `answer-${index}`))
    );
    assert.ok(concurrentSaves.every(response => response.status === 200));

    const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    for (let index = 0; index < 8; index++) {
        assert.strictEqual(cache[student.id][`parallel-${index}`].data.answer, `answer-${index}`);
    }
    console.log('✅ Save/load flow persists before acknowledging and preserves concurrent saves');
}

async function verifyReto0Page(baseUrl) {
    const student = { id: 'local_reto0_test', username: 'reto0', class_name: 'K5A' };
    const cookie = `${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const response = await fetch(`${baseUrl}/profile`, { headers: { Cookie: cookie } });
    assert.strictEqual(response.status, 200, 'Reto 0 (/profile) should render');
    const html = await response.text();
    assert.ok(html.includes('saveProfileModule(3, this)'), 'Reto 0 should include the teachers module');
    assert.ok(html.includes('name="r0_individuos_q1"'), 'Reto 0 should include the subject evaluation');
    console.log('✅ Reto 0 page renders with the teachers list and the subject evaluation');
}

// Alemán e Inglés se abren en su idioma (de / en) aunque la app esté en español; el idioma que el
// estudiante elige con los botones para esa materia (cookie lang_<materia>) se respeta.
async function verifyNativeLanguage(baseUrl) {
    const student = { id: 'local_native_lang', username: 'native', class_name: 'K5A' };
    const base = `lang=es; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const open = async (route, extra = '') => (await fetch(`${baseUrl}${route}`, { headers: { Cookie: base + extra } })).text();
    const aleman = await open('/activity/2627/reto1_aleman');
    assert.ok(aleman.includes('<html lang="de">') && aleman.includes('data-native-subject="aleman"') && aleman.includes('data-page-lang="de"'),
        'German opens in German');
    const ingles = await open('/activity/2627/reto1_ingles');
    assert.ok(ingles.includes('<html lang="en">') && ingles.includes('data-page-lang="en"'), 'English opens in English');
    const chosen = await open('/activity/2627/reto1_aleman', '; lang_aleman=es');
    assert.ok(chosen.includes('<html lang="es">') && chosen.includes('data-page-lang="es"'), 'The language chosen with the buttons is kept for that subject');
    const otherSubject = await open('/activity/2627/reto1_matematicas');
    assert.ok(otherSubject.includes('<html lang="es">') && !otherSubject.includes('data-native-subject'), 'Other subjects keep the app language');
    const reto0 = await open('/profile?subject=ingles');
    assert.ok(reto0.includes('<html lang="en">') && reto0.includes('🏅 Sports<'), 'Reto 0 of English opens in English (its subject list too)');
    console.log('✅ German and English open in their own language; the buttons can still change it');
}

// Every page of the three portals renders (in German, so translated templates are exercised)
async function verifyPagesRender(baseUrl) {
    const student = { id: 'local_pages_test', username: 'pages', class_name: 'K5A' };
    const teacher = { email: 'pages.test@colegioaleman.edu.co', last_name: 'Test', subject: 'aleman', id: 'local_teacher' };
    const cookies = {
        none: 'lang=de',
        student: `lang=de; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`,
        teacher: `lang=de; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(teacher))}`,
        admin: `lang=de; ${adminCookie(DEV_ADMIN)}`,
        coord: `lang=de; ${adminCookie(COORD_ADMIN)}`
    };
    const pages = [
        ['none', '/login'], ['none', '/teacher/login'], ['none', '/admin/login'], ['none', '/admin/login?perfil=coordinador'],
        ['coord', '/admin'],
        ['student', '/'], ['student', '/profile'], ['student', '/activity/2627/reto1_aleman'],
        ['teacher', '/teacher/training'], ['teacher', '/teacher/evaluation'],
        ['teacher', '/teacher/visual-preview?subject=musica&reto=4'], ['teacher', '/teacher/klasse2-activity'], ['teacher', '/teacher/progress'],
        ['teacher', '/teacher/student-preview'], ['teacher', '/teacher/troubleshooting'],
        ['teacher', '/teacher/download-challenges?level=5'], ['teacher', '/docs'],
        ['admin', '/admin']
    ];
    const failed = [];
    for (const [who, route] of pages) {
        const response = await fetch(`${baseUrl}${route}`, { headers: { Cookie: cookies[who] }, redirect: 'manual' });
        if (response.status !== 200) failed.push(`${route} -> ${response.status}`);
    }
    assert.deepStrictEqual(failed, [], 'Pages that do not render');
    console.log(`✅ All ${pages.length} pages of the student, teacher and admin portals render`);
}

async function verifyNoMasterPassword(baseUrl) {
    const response = await fetch(`${baseUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email: 'admin', password: 'medienpass2526' }),
        redirect: 'manual'
    });
    assert.notStrictEqual(response.status, 302, 'The old master password must not log in');
    assert.ok(!(response.headers.get('set-cookie') || '').includes('admin_auth'), 'No admin session for the old master password');
    console.log('✅ The old admin master password no longer grants access');
}

async function verifySessionCookies(baseUrl) {
    const get = (route, cookie) => fetch(`${baseUrl}${route}`, { headers: { Cookie: cookie }, redirect: 'manual' });
    const assertRedirect = async (route, cookie, location) => {
        const response = await get(route, cookie);
        assert.strictEqual(response.status, 302, `${route} should reject cookie: ${cookie}`);
        assert.strictEqual(response.headers.get('location'), location);
    };

    // Hand-made (unsigned) cookies must not grant access
    await assertRedirect('/admin', 'admin_auth=true', '/admin/login');
    await assertRedirect('/api/admin/kpis', 'admin_auth=true', '/admin/login');
    const forgedTeacher = encodeURIComponent(JSON.stringify({ email: 'x@colegioaleman.edu.co', role: 'desarrollador' }));
    await assertRedirect('/teacher/training', `teacher_auth=true; teacher_data=${forgedTeacher}`, '/teacher/login');
    const forgedStudent = encodeURIComponent(JSON.stringify({ id: 'local_save_test' }));
    await assertRedirect('/api/load/save-flow-test', `student_id=local_save_test; student_data=${forgedStudent}`, '/login');

    // A signed cookie whose value was altered must not grant access either
    const tampered = signedCookie('student_id', 'local_save_test').replace('local_save_test', 'local_other');
    await assertRedirect('/api/load/save-flow-test', tampered, '/login');

    // A signed admin cookie without an account that has a panel profile is not enough
    await assertRedirect('/api/admin/kpis', signedCookie('admin_auth', 'true'), '/admin/login');

    // Cookies signed by the server keep working
    const adminResponse = await get('/api/admin/kpis', adminCookie(DEV_ADMIN));
    assert.strictEqual(adminResponse.status, 200);
    console.log('✅ Session cookies are only accepted when signed by the server');
}

async function run() {
    const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-tests-'));
    process.env.CUSTOM_INSTRUMENTS_PATH = path.join(testDir, 'custom_instruments.json');
    try {
        await verifyInstrumentStore();
        verifyActivityTemplate();
        verifyTranslationsComplete();
        verifyServerTemplates();
        verifyAdminSearch();
        verifyRetoResult();
        verifySubjectContent();

        const cachePath = path.join(testDir, 'local_activity_responses.json');
        const rolesFile = path.join(testDir, 'teacher_roles.json');
        fs.writeFileSync(rolesFile, JSON.stringify(TEST_ROLES));
        const server = await startTestServer(cachePath, rolesFile);
        try {
            await verifySaveFlow(server.baseUrl, cachePath);
            await verifyReto0Page(server.baseUrl);
            await verifyNativeLanguage(server.baseUrl);
            await verifyPagesRender(server.baseUrl);
            await verifyNoMasterPassword(server.baseUrl);
            await verifySessionCookies(server.baseUrl);
            await verifyAdminRoutes(server.baseUrl);
            await verifyRetoEmailFlow(server.baseUrl);
            await verifyReto0BySubject(server.baseUrl);
        } finally {
            await server.stop();
        }
        console.log('\nAll verification tests passed.');
    } finally {
        delete process.env.CUSTOM_INSTRUMENTS_PATH;
        fs.rmSync(testDir, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
