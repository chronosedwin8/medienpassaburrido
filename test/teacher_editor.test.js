// Portal docente › "Configura tus Retos del 0 al 6": subcompetencias KMK de las preguntas, validación
// al guardar, permisos por materia y que lo editado llegue a los estudiantes (página y calificación),
// también en la evaluación del Reto 0 (desde la pregunta 10).
// Uso: node test/teacher_editor.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'test-cookie-secret';
const ARGUMENT = 'Elegí esta respuesta porque compara fuentes confiables y explica el proceso con claridad para toda la clase';

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

async function startTestServer(env) {
    const port = await getAvailablePort();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '',
            PHIDIAS_BASE_URL: '', PHIDIAS_TOKEN: '', COOKIE_SECRET, ...env },
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
        } catch (_) { /* aún no */ }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    await stop();
    throw new Error(`Test server did not start: ${output}`);
}

const radios = list => list.filter(q => q.type === 'radio_group');
const clone = value => JSON.parse(JSON.stringify(value));

// Cada pregunta del sistema trabaja una subcompetencia del área KMK de su reto, en todas las materias y niveles
function verifyTemplatesHaveKmk() {
    const { generateEvidenceForReto } = require('../data_questions');
    const { KMK_AREAS, isKmkOfReto } = require('../data_kmk_competences');
    const { subjects } = require('../data_levels');
    assert.strictEqual(KMK_AREAS.length, 6);
    KMK_AREAS.forEach(area => {
        assert.ok(area.subs.length >= 2, `Área ${area.id} con subcompetencias`);
        area.subs.forEach(sub => ['es', 'de', 'en'].forEach(lang => assert.ok(sub.name[lang], `${sub.id} en ${lang}`)));
    });
    for (let reto = 1; reto <= 6; reto++) {
        const used = new Set();
        subjects.forEach(s => [2, 5].forEach(grade => {
            radios(generateEvidenceForReto(reto, s.id, grade)).forEach(q => {
                assert.ok(isKmkOfReto(q.kmk, reto), `${q.id}: subcompetencia ${q.kmk} del área ${reto}`);
                used.add(q.kmk);
            });
        }));
        assert.ok(used.size >= 2, `El reto ${reto} trabaja varias subcompetencias`);
    }
    console.log('✅ The 36 questions are tagged with a KMK sub-competence of their challenge area');
}

function verifyNormalization() {
    const { normalizeCustomQuestions } = require('../services/instrument_store');
    const { allActivities } = require('../data');
    const act = allActivities['1'].find(a => a.id === 'reto1_aleman');
    const target = { grade: 5, subject: 'aleman', reto: 1 };
    const edited = radios(clone(act.evidence_k5));
    edited[0].label.es = 'Pregunta editada';
    edited.push({ id: '', type: 'radio_group', kmk: '1.3', label: { es: 'Nueva pregunta', de: '', en: '' },
        options: [{ es: 'Sí', correct: true }, { es: 'No', correct: false }, { es: '', correct: false }] });

    const { questions } = normalizeCustomQuestions(edited, target);
    assert.strictEqual(radios(questions).length, 7);
    assert.strictEqual(questions.length, 14, 'K5: cada pregunta lleva su campo de argumento');
    assert.strictEqual(questions[0].id, 'r1_aleman_k5_q1', 'Se conserva el id de la pregunta existente');
    assert.strictEqual(questions[1].id, 'r1_aleman_k5_q1_explain');
    const added = questions[12];
    assert.strictEqual(added.id, 'r1_aleman_k5_c1', 'Id nuevo para la pregunta agregada');
    assert.deepStrictEqual(added.label, { es: 'Nueva pregunta', de: 'Nueva pregunta', en: 'Nueva pregunta' }, 'Los idiomas vacíos toman el texto escrito');
    assert.strictEqual(added.options.length, 2, 'Se descartan las opciones vacías');
    assert.deepStrictEqual(added.options.map(o => [o.val, o.correct]), [[0, true], [1, false]]);

    const k2 = normalizeCustomQuestions(radios(clone(act.evidence_k2)), { grade: 2, subject: 'aleman', reto: 1 });
    assert.ok(k2.questions.every(q => q.type === 'radio_group' && !q.hint), 'K2: sin argumento ni pista');

    const fail = (mutate, error, index) => {
        const list = radios(clone(act.evidence_k5));
        mutate(list);
        const result = normalizeCustomQuestions(list, target);
        assert.strictEqual(result.error, error);
        if (index !== undefined) assert.strictEqual(result.index, index);
    };
    fail(list => list.splice(0), 'empty');
    fail(list => { list[2].options.forEach(o => { o.correct = true; }); }, 'correct', 2);
    fail(list => { list[1].options.forEach(o => { o.correct = false; }); }, 'correct', 1);
    fail(list => { list[3].options = list[3].options.slice(0, 1); }, 'options', 3);
    fail(list => { list[4].label = { es: ' ', de: '', en: '' }; }, 'label', 4);
    fail(list => { list[5].kmk = '2.1'; }, 'kmk', 5);
    console.log('✅ Saving validates each question (text, 2+ options, one correct, KMK of the challenge) and keeps the ids');
}

// Reto 0: se edita solo la evaluación (desde la pregunta 10), sin argumento y con KMK opcional
function verifyReto0Normalization() {
    const { normalizeCustomQuestions } = require('../services/instrument_store');
    const { getReto0ForSubject } = require('../data');
    const reto0 = getReto0ForSubject('aleman');
    const fixed = reto0.evidence.filter(q => !q.quiz);
    const quiz = clone(reto0.evidence.filter(q => q.quiz));
    assert.strictEqual(fixed.length, 9, 'Questions 1 to 9 are the fixed part of Reto 0');
    assert.strictEqual(quiz.length, 10, 'The test starts at question 10');

    quiz[0].label.es = 'Pregunta 10 editada';
    quiz[1].kmk = '';
    quiz.push({ id: '', type: 'radio_group', kmk: '', label: { es: 'Nueva pregunta del Reto 0', de: '', en: '' },
        options: [{ es: 'Sí', correct: true }, { es: 'No', correct: false }], hint: { es: 'Porque sí', de: '', en: '' } });
    const target = { grade: 5, subject: 'aleman', reto: 0 };
    const { questions, error } = normalizeCustomQuestions(quiz, target);
    assert.strictEqual(error, undefined);
    assert.strictEqual(questions.length, 11, 'No argument field is added in Reto 0');
    assert.ok(questions.every(q => q.quiz && q.type === 'radio_group' && !q.id.endsWith('_explain')), 'Every edited question counts for the test');
    assert.strictEqual(questions[0].id, quiz[0].id, 'System ids are kept, so saved answers are graded with the edited question');
    assert.ok(!('kmk' in questions[1]), 'The KMK sub-competence is optional');
    assert.strictEqual(questions[10].id, 'r0_aleman_k5_c1');
    assert.deepStrictEqual(questions[10].practice_explanation, { es: 'Porque sí', de: 'Porque sí', en: 'Porque sí' }, 'The hint is the explanation');

    const bad = clone(quiz);
    bad[2].kmk = '9.9';
    assert.deepStrictEqual(normalizeCustomQuestions(bad, target), { error: 'kmk', index: 2 }, 'A KMK tag must exist');
    console.log('✅ Reto 0: only the test (from question 10) is edited; ids kept, KMK optional, hint saved as the explanation');
}

async function verifyReto0Flow(baseUrl, storePath) {
    const { getReto0ForSubject } = require('../data');
    const teacherCookie = teacher => `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(teacher))}`;
    const aleman = teacherCookie({ email: 'editor.aleman@colegioaleman.edu.co', last_name: 'Editor', subject: 'aleman', id: 'local_t1', role: 'profesor' });
    const student = { id: 'local_editor_reto0', username: 'reto0', class_name: 'K5A' };
    const studentCookie = `lang=es; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const post = (route, cookie, body) => fetch(`${baseUrl}${route}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body), redirect: 'manual'
    });

    assert.strictEqual((await fetch(`${baseUrl}/api/instruments/2/aleman/0`, { headers: { Cookie: aleman } })).status, 400, 'The visual Reto 0 is not edited');
    const quiz = clone(getReto0ForSubject('aleman').evidence.filter(q => q.quiz)).slice(0, 5);
    quiz[0].label = { es: 'Evaluación editada por la docente de alemán', de: 'Von der Deutschlehrerin bearbeiteter Test', en: 'Test edited by the German teacher' };
    let res = await post('/api/instruments/save', aleman, { grade: 5, subject: 'aleman', reto: 0, questions: quiz });
    assert.strictEqual(res.status, 200);
    assert.ok(JSON.parse(fs.readFileSync(storePath, 'utf8'))['5_aleman_0'], 'Saved under grade_subject_0');

    const page = await (await fetch(`${baseUrl}/profile?subject=aleman`, { headers: { Cookie: studentCookie } })).text();
    assert.ok(page.includes('Von der Deutschlehrerin bearbeiteter Test') || page.includes('Evaluación editada por la docente de alemán'),
        'The student sees the edited test in Reto 0');
    const answers = { reto0_subject: 'aleman' };
    quiz.forEach(q => { answers[q.id] = String(q.options.findIndex(o => o.correct)); });
    res = await (await post('/api/save/profile', studentCookie, answers)).json();
    assert.ok(res.retoResult && res.retoResult.max === 5 && res.retoResult.won === true, 'Reto 0 is graded with the 5 edited questions');

    res = await post('/api/instruments/reset', aleman, { grade: 5, subject: 'aleman', reto: 0 });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(storePath, 'utf8')), {});
    console.log('✅ Reto 0: the edited test reaches the student page and grading; reset restores the system test');
}

async function verifyEditorFlow(baseUrl, storePath) {
    const { allActivities } = require('../data');
    const act = allActivities['1'].find(a => a.id === 'reto1_aleman');
    const teacherCookie = teacher => `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(teacher))}`;
    const aleman = teacherCookie({ email: 'editor.aleman@colegioaleman.edu.co', last_name: 'Editor', subject: 'aleman', id: 'local_t1', role: 'profesor' });
    const coord = teacherCookie({ email: 'editor.coord@colegioaleman.edu.co', last_name: 'Coord', subject: '', id: 'local_t2', role: 'coordinador' });
    const student = { id: 'local_editor_student', username: 'editor', class_name: 'K5A' };
    const studentCookie = `${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    const post = (route, cookie, body) => fetch(`${baseUrl}${route}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(body), redirect: 'manual'
    });

    let res = await (await fetch(`${baseUrl}/api/instruments/5/aleman/1`, { headers: { Cookie: aleman } })).json();
    assert.deepStrictEqual([res.success, res.custom], [true, false], 'Sin edición: preguntas del sistema');
    assert.strictEqual((await fetch(`${baseUrl}/api/instruments/1/aleman/1`, { headers: { Cookie: aleman } })).status, 400);

    const edited = radios(clone(act.evidence_k5));
    edited[0].label = { es: 'Pregunta editada por la docente de alemán', de: 'Von der Deutschlehrerin bearbeitete Frage', en: 'Question edited by the German teacher' };
    edited.push({ id: '', type: 'radio_group', kmk: '1.3', label: { es: '¿Dónde guardas la versión final?', de: '', en: '' },
        options: [{ es: 'En la carpeta del proyecto en la nube', correct: true }, { es: 'En el escritorio de un computador compartido', correct: false }] });

    res = await post('/api/instruments/save', aleman, { grade: 5, subject: 'musica', reto: 1, questions: edited });
    assert.strictEqual(res.status, 403, 'Un docente de Alemán no guarda en Música');
    assert.strictEqual((await res.json()).error, 'forbidden');

    const twoCorrect = clone(edited);
    twoCorrect[0].options.forEach(o => { o.correct = true; });
    res = await post('/api/instruments/save', aleman, { grade: 5, subject: 'aleman', reto: 1, questions: twoCorrect });
    assert.strictEqual(res.status, 400);
    assert.deepStrictEqual(await res.json(), { success: false, error: 'correct', index: 0 });

    res = await post('/api/instruments/save', aleman, { grade: 5, subject: 'aleman', reto: 1, questions: edited });
    assert.strictEqual(res.status, 200);
    const saved = (await res.json()).saved;
    assert.strictEqual(saved.updatedBy, 'editor.aleman@colegioaleman.edu.co');
    assert.strictEqual(radios(saved.questions).length, 7);
    assert.ok(JSON.parse(fs.readFileSync(storePath, 'utf8'))['5_aleman_1'], 'Se guarda en el archivo de preguntas editadas');

    res = await (await fetch(`${baseUrl}/api/instruments/5/aleman/1`, { headers: { Cookie: aleman } })).json();
    assert.strictEqual(res.custom, true, 'El editor vuelve a cargar lo guardado');
    assert.strictEqual(res.data.questions[0].label.es, 'Pregunta editada por la docente de alemán');

    // El estudiante de K5 ve las preguntas editadas y se le califica con ellas
    const page = await (await fetch(`${baseUrl}/activity/2627/reto1_aleman`, { headers: { Cookie: studentCookie } })).text();
    assert.ok(page.includes('Pregunta editada por la docente de alemán'), 'La página del reto muestra la pregunta editada');
    assert.ok(page.includes('name="r1_aleman_k5_c1"'), 'La página del reto incluye la pregunta agregada');
    const answers = {};
    radios(saved.questions).forEach(q => {
        answers[q.id] = String(q.options.find(o => o.correct).val);
        answers[`${q.id}_explain`] = ARGUMENT;
    });
    res = await (await post('/api/save/reto1_aleman', studentCookie, answers)).json();
    assert.strictEqual(res.retoResult.max, 35, 'Se califica con las 7 preguntas editadas');
    assert.strictEqual(res.retoResult.won, true);

    // Cuadernillo impreso y progreso del docente con las preguntas editadas
    const booklet = await (await fetch(`${baseUrl}/teacher/download-challenges?level=5&subject=aleman`, { headers: { Cookie: aleman } })).text();
    assert.ok(booklet.includes('Pregunta editada por la docente de alemán') && booklet.includes('KMK 1.3'), 'El cuadernillo usa las preguntas editadas');
    const progress = await (await fetch(`${baseUrl}/teacher/progress`, { headers: { Cookie: aleman } })).text();
    assert.ok(progress.includes('5_aleman_1'), 'El progreso del docente recibe las preguntas editadas');

    // Un coordinador puede guardar y restablecer cualquier materia
    const musica = radios(clone(allActivities['1'].find(a => a.id === 'reto1_musica').evidence_k5));
    res = await post('/api/instruments/save', coord, { grade: 5, subject: 'musica', reto: 1, questions: musica });
    assert.strictEqual(res.status, 200, 'El coordinador guarda en Música');
    res = await post('/api/instruments/reset', coord, { grade: 5, subject: 'musica', reto: 1 });
    assert.strictEqual(res.status, 200);
    assert.strictEqual((await post('/api/instruments/reset', aleman, { grade: 5, subject: 'musica', reto: 1 })).status, 403);

    // Restablecer vuelve a las preguntas del sistema
    res = await post('/api/instruments/reset', aleman, { grade: 5, subject: 'aleman', reto: 1 });
    assert.strictEqual(res.status, 200);
    const restored = await (await fetch(`${baseUrl}/activity/2627/reto1_aleman`, { headers: { Cookie: studentCookie } })).text();
    assert.ok(!restored.includes('Pregunta editada por la docente de alemán') && !restored.includes('r1_aleman_k5_c1'), 'Vuelven las preguntas del sistema');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(storePath, 'utf8')), {});
    console.log('✅ Teachers save their subject only; edited questions reach the reto page, grading, booklet and progress; reset restores them');
}

async function verifyRemovedOptions(baseUrl) {
    const cookie = `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify({ email: 'pages@colegioaleman.edu.co', subject: 'aleman', id: 'x', role: 'profesor' }))}`;
    const post = route => fetch(`${baseUrl}${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: '{}' });
    assert.strictEqual((await post('/api/instruments/upload-pdf')).status, 404, 'Sin subida de PDF');
    assert.strictEqual((await post('/api/instruments/generate-ai')).status, 404, 'Sin generación con IA');
    assert.strictEqual((await fetch(`${baseUrl}/teacher/download-csv-template`, { headers: { Cookie: cookie } })).status, 404, 'Sin plantilla CSV');

    const preview = await (await fetch(`${baseUrl}/teacher/student-preview`, { headers: { Cookie: cookie } })).text();
    assert.ok(preview.includes('window.editorConfig') && preview.includes('"1.1"'), 'El editor recibe las subcompetencias KMK');
    assert.ok(!/pdfFileInput|csvQuestionsFileInput|download-csv-template/.test(preview), 'La barra del editor ya no tiene PDF ni CSV');
    assert.ok(preview.includes('data-i18n="doc_inst_4_modalidad_y_pdf"') && preview.includes('editorAccessNote'));
    const training = await (await fetch(`${baseUrl}/teacher/training`, { headers: { Cookie: cookie } })).text();
    assert.ok(!training.includes('download-csv-template'), 'El menú del portal ya no tiene "Formato CSV IA"');
    console.log('✅ PDF upload, CSV template and AI generation are gone from the teacher portal');
}

async function run() {
    const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-editor-'));
    const storePath = path.join(testDir, 'custom_instruments.json');
    process.env.CUSTOM_INSTRUMENTS_PATH = storePath;
    const projectStore = path.join(__dirname, '..', 'data', 'custom_instruments.json');
    const projectStoreBefore = fs.existsSync(projectStore) ? fs.readFileSync(projectStore, 'utf8') : null;
    try {
        verifyTemplatesHaveKmk();
        verifyNormalization();
        verifyReto0Normalization();
        // El rol se lee del archivo de roles en cada petición, no de la cookie
        const rolesFile = path.join(testDir, 'teacher_roles.json');
        fs.writeFileSync(rolesFile, JSON.stringify({ 'editor.coord@colegioaleman.edu.co': 'coordinador' }));
        const server = await startTestServer({
            TEACHER_ROLES_FILE: rolesFile,
            CUSTOM_INSTRUMENTS_PATH: storePath,
            LOCAL_ACTIVITY_CACHE_FILE: path.join(testDir, 'local_activity_responses.json')
        });
        try {
            await verifyEditorFlow(server.baseUrl, storePath);
            await verifyReto0Flow(server.baseUrl, storePath);
            await verifyRemovedOptions(server.baseUrl);
        } finally {
            await server.stop();
        }
        const projectStoreAfter = fs.existsSync(projectStore) ? fs.readFileSync(projectStore, 'utf8') : null;
        assert.strictEqual(projectStoreAfter, projectStoreBefore, 'data/custom_instruments.json del proyecto no cambia');
        console.log('\nAll teacher editor tests passed.');
    } finally {
        delete process.env.CUSTOM_INSTRUMENTS_PATH;
        fs.rmSync(testDir, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
