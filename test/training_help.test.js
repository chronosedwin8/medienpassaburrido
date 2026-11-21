// Capacitación docente, test KMK, Medienpass visual, evidencias, botón AYUDA y módulo de correos.
// Usa un servidor sin Supabase y un Microsoft Graph simulado: no envía correos reales.
// Uso: node test/training_help.test.js
const assert = require('assert');
const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');
const { buildTeacherTest, publicTest, gradeTeacherTest } = require('../data_teacher_test');
const { subjects } = require('../data');

const COOKIE_SECRET = 'training-test-secret';
const ROOT = path.join(__dirname, '..');
const signedCookie = (name, value) => `${name}=${encodeURIComponent('s:' + signature.sign(value, COOKIE_SECRET))}`;

async function freePort() {
    const server = net.createServer();
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const { port } = server.address();
    await new Promise(resolve => server.close(resolve));
    return port;
}

async function startServer(env) {
    const port = await freePort();
    const child = spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
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
        } catch (e) { /* aún no */ }
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    await stop();
    throw new Error(`Test server did not start: ${output}`);
}

function testTeacherTestContent() {
    subjects.forEach(({ id }) => {
        const questions = buildTeacherTest(id);
        assert.ok(questions.length >= 10, 'at least 10 questions');
        assert.strictEqual(questions.length, 12);
        assert.strictEqual(questions.filter(q => q.part === 'kmk').length, 6);
        assert.strictEqual(questions.filter(q => q.part === 'subject').length, 6);
        [1, 2, 3, 4, 5, 6].forEach(area => assert.strictEqual(questions.filter(q => q.area === area).length, 2, `competence ${area}`));
        questions.forEach(q => assert.strictEqual(q.options.filter(o => o.correct).length, 1, `${id} ${q.id}: one right answer`));
        assert.ok(!JSON.stringify(publicTest(questions)).includes('"correct"'), 'The page never gets the right answers');
    });
    const questions = buildTeacherTest('matematicas');
    const right = Object.fromEntries(questions.map(q => [q.id, String(q.options.findIndex(o => o.correct))]));
    assert.deepStrictEqual((({ correct, score, passed }) => ({ correct, score, passed }))(gradeTeacherTest(questions, right)), { correct: 12, score: 100, passed: true });
    const nine = { ...right };
    questions.slice(0, 3).forEach(q => { nine[q.id] = String(q.options.findIndex(o => !o.correct)); });
    assert.deepStrictEqual((({ correct, score, passed }) => ({ correct, score, passed }))(gradeTeacherTest(questions, nine)), { correct: 9, score: 75, passed: true }, '9 of 12 passes');
    const eight = { ...nine };
    eight[questions[3].id] = String(questions[3].options.findIndex(o => !o.correct));
    assert.strictEqual(gradeTeacherTest(questions, eight).passed, false, '8 of 12 does not pass');
    assert.strictEqual(gradeTeacherTest(questions, {}).correct, 0, 'Nothing answered is not right');
    assert.strictEqual(gradeTeacherTest(questions, { k1: '99' }).correct, 0, 'An invalid option is not right');
    const areas = gradeTeacherTest(questions, nine).byArea;
    assert.deepStrictEqual(areas.map(a => a.correct), [1, 1, 1, 2, 2, 2], 'Result by competence');
    console.log('✅ Teacher test: 12 questions per subject, 9 pass, answers are not sent to the page');
}

async function testPages(baseUrl) {
    const teacher = { email: 'test@colegioaleman.edu.co', first_name: 'Ana', last_name: 'Test', subject: 'musica', id: 'local_teacher' };
    const teacherCookie = `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(teacher))}`;
    const get = async (route, cookie) => (await fetch(`${baseUrl}${route}`, { headers: { Cookie: cookie } })).text();
    const noSubjectTeacher = { ...teacher, subject: '' };
    const noSubjectCookie = `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(noSubjectTeacher))}`;

    // Capacitación: mismo contenido, reorganizado por competencia y con la materia del docente
    const training = await get('/teacher/training', teacherCookie);
    assert.ok(training.includes('id="trainingSubject"') && training.includes('value="musica" selected'), 'The teacher subject is selected');
    assert.ok(training.includes('panel-1-que') && training.includes('panel-6-fichas'), 'Each competence has its tabs');
    assert.ok(training.includes('Digital_Citizenship_Blueprint.pdf'), 'The guide is still there');
    assert.ok(training.includes('klett.de/inhalt'), 'The worksheets are still there');
    // El banco de fichas se retiró: sin enlace, y la dirección vieja lleva a Capacitación
    assert.ok(!training.includes('href="/teacher/worksheets"') && !training.includes('navWorksheets'), 'No link to the worksheet bank');
    const oldBank = await fetch(`${baseUrl}/teacher/worksheets`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
    assert.ok(oldBank.status === 302 && oldBank.headers.get('location') === '/teacher/training', 'The old worksheet bank address goes to the training');
    assert.ok(training.includes('Este soy yo'), 'Competence 0 is still there');
    assert.ok(training.includes('/teacher/visual-preview?subject=musica'), 'Link to the visual version of the subject');
    const otherSubject = await get('/teacher/training?subject=matematicas', teacherCookie);
    assert.ok(otherSubject.includes('value="matematicas" selected') && otherSubject.includes('GeoGebra'), 'The content follows the chosen subject');
    const noSubject = await get('/teacher/training', noSubjectCookie);
    assert.ok(noSubject.includes('Elige tu materia arriba'), 'Without a subject it asks to choose one');

    // Test: formulario sin respuestas y calificación en el servidor
    const form = await get('/teacher/evaluation', teacherCookie);
    assert.strictEqual((form.match(/<fieldset class="ttest-q">/g) || []).length, 12, 'The test shows 12 questions');
    assert.ok(!/data-correct|"correct"/.test(form), 'The form does not reveal the answers');
    const noSubjectForm = await get('/teacher/evaluation', noSubjectCookie);
    assert.ok(noSubjectForm.includes('id="testSubject"') && !noSubjectForm.includes('<fieldset'), 'Without a subject, it asks for one first');

    const questions = buildTeacherTest('musica');
    const body = new URLSearchParams({ subject: 'musica' });
    questions.forEach(q => body.set(`q_${q.id}`, String(q.options.findIndex(o => o.correct))));
    const result = await (await fetch(`${baseUrl}/teacher/evaluation`, {
        method: 'POST', headers: { Cookie: teacherCookie, 'Content-Type': 'application/x-www-form-urlencoded' }, body
    })).text();
    assert.ok(result.includes('100%') && result.includes('¡Aprobado!'), 'All right passes');
    const failed = await (await fetch(`${baseUrl}/teacher/evaluation`, {
        method: 'POST', headers: { Cookie: teacherCookie, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ subject: 'musica' })
    })).text();
    assert.ok(failed.includes('Todavía no apruebas') && failed.includes('#area1'), 'A failed test links back to each competence');
    const old = await fetch(`${baseUrl}/teacher/knowledge-test`, { headers: { Cookie: teacherCookie }, redirect: 'manual' });
    assert.strictEqual(old.headers.get('location'), '/teacher/evaluation', 'The old test leads to the new one');
    console.log('✅ Training keeps its content per competence and subject; the test is graded on the server');

    // Medienpass visual
    const kid = (id, class_name) => {
        const student = { id, username: id, class_name };
        return `lang=es; ${signedCookie('student_id', id)}; ${signedCookie('student_data', JSON.stringify(student))}`;
    };
    for (const className of ['KIN3', 'PK3', 'K1A', 'K2B']) {
        const cookie = kid(`local_visual_${className}`, className);
        const home = await get('/', cookie);
        assert.ok(home.includes('vis-subjects'), `${className}: the visual home page`);
        assert.ok(!home.includes('id="subjectCombo"'), `${className}: not the text dashboard`);
        const path_ = await get('/?subject=musica', cookie);
        assert.strictEqual((path_.match(/class="vis-stop /g) || []).length, 7, `${className}: 7 stops (Challenge 0 to 6)`);
        const reto = await get('/activity/2526/reto4_musica', cookie);
        assert.ok(reto.includes('window.VISUAL_RETO') && reto.includes('/js/visual.js'), `${className}: visual challenge`);
        assert.ok(!reto.includes('<textarea') && !reto.includes('_explain'), `${className}: nothing to write`);
        const reto0 = await get('/profile?subject=musica', cookie);
        assert.ok(reto0.includes('r0v_musica_q1') && !reto0.includes('reto0Accordion'), `${className}: visual Challenge 0`);
    }
    const k3 = kid('local_k3', 'K3A');
    assert.ok((await get('/', k3)).includes('id="subjectCombo"'), 'K3 keeps the regular dashboard');
    const k3Reto = await get('/activity/2526/reto4_musica', k3);
    assert.ok(k3Reto.includes('_explain') && !k3Reto.includes('window.VISUAL_RETO'), 'K3 keeps written explanations');

    // Un niño de Kinder gana un reto sin escribir nada
    const cookie = kid('local_kinder_win', 'KIN3');
    const page = await get('/activity/2526/reto1_arte', cookie);
    const config = JSON.parse(page.slice(page.indexOf('window.VISUAL_RETO = ') + 21, page.indexOf(';\n</script>', page.indexOf('window.VISUAL_RETO = '))));
    assert.strictEqual(config.questions.length, 3);
    const answers = Object.fromEntries(config.questions.map(q => [q.id, String(q.options.find(o => o.correct).val)]));
    const save = await (await fetch(`${baseUrl}/api/save/reto1_arte`, {
        method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(answers)
    })).json();
    assert.ok(save.retoResult && save.retoResult.won, 'A Kinder student wins with 3 right answers');
    assert.ok((await get('/?subject=arte', cookie)).includes('⭐⭐⭐'), 'The stop shows the stars');

    // Vista previa docente: sin guardar
    const preview = await get('/teacher/visual-preview?subject=arte&reto=0', teacherCookie);
    assert.ok(preview.includes('"preview":true') && preview.includes('r0v_arte_q1'), 'Teachers can preview the visual version');
    console.log('✅ Visual Medienpass: PK, KIN, K1 and K2 use it, win without writing, and K3 keeps its version');

    // Botón de evidencias en los retos 1 a 6
    assert.ok(k3Reto.includes('id="evidenceOpenBtn"') && k3Reto.includes('Adjuntar vínculos de evidencia'), 'Evidence button in each challenge');
    assert.ok(k3Reto.includes('Ejemplo en'), 'Evidence example of the subject');
    assert.ok(!k3Reto.includes('Naturales...'), 'The fixed example of another subject is gone');
    const k3Reto0 = await get('/profile?subject=musica', k3);
    assert.ok(!k3Reto0.includes('id="evidenceOpenBtn"'), 'Challenge 0 has no evidence button');
    assert.ok(k3Reto0.includes('concept-reto-link') && k3Reto0.includes('reto1_musica'), 'Each competence links to the challenge of the subject');
    assert.ok(k3Reto0.includes('reto0-subject-chip') && k3Reto0.includes('renderReto0Route'), 'Subject on view and result by competence');
    const post = (cookieValue, payload) => fetch(`${baseUrl}/api/student/multimedia-product`, {
        method: 'POST', headers: { Cookie: cookieValue, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    assert.strictEqual((await post(k3, { activity_id: 'reto1_musica', links: ['javascript:alert(1)'] })).status, 400, 'A dangerous link is rejected');
    assert.strictEqual((await post(k3, { activity_id: 'profile', links: ['https://a.co'] })).status, 400, 'Only challenges 1 to 6');
    assert.strictEqual((await post(k3, { activity_id: 'reto1_musica', links: [] })).status, 400, 'At least one link');
    const saved = await (await post(k3, { activity_id: 'reto1_musica', links: ['https://a.co/1', 'https://a.co/2'] })).json();
    assert.deepStrictEqual(saved.links, ['https://a.co/1', 'https://a.co/2'], 'Up to 3 links are accepted');
    console.log('✅ Evidence button: validated links in challenges 1 to 6');

    // Botón AYUDA en todas las páginas de estudiantes y docentes
    for (const [route, who] of [['/', k3], ['/?subject=arte', cookie], ['/teacher/training', teacherCookie], ['/teacher/progress', teacherCookie], ['/teacher/student-preview', teacherCookie], ['/teacher/evaluation', teacherCookie]]) {
        assert.ok((await get(route, who)).includes('id="helpOpen"'), `AYUDA button on ${route}`);
    }
    assert.ok((await (await fetch(`${baseUrl}/login`)).text()).includes('id="helpOpen"'), 'AYUDA button on the login page');
    const help = await (await fetch(`${baseUrl}/api/help`, { headers: { Cookie: k3 } })).json();
    assert.ok(help.success && help.videos.length === 0 && help.pending.length === 7, 'Videos without a link are shown as coming soon');
    assert.strictEqual((await fetch(`${baseUrl}/api/help`, { redirect: 'manual' })).status, 302, 'The videos need a session');
    console.log('✅ AYUDA button on student, visual and teacher pages');

    // Lector inmersivo (diferenciación): en los retos 0 a 6, con su panel; no en el inicio
    for (const page of [k3Reto, k3Reto0]) {
        assert.ok(page.includes('id="readerOpen"') && page.includes('id="readerPanel"') && page.includes('/js/reader.js') && page.includes('/css/reader.css'),
            'The reader is on the challenge pages');
        assert.ok(page.indexOf('id="readerPanel"') > page.indexOf('</main>'), 'The reader panel is outside <main>, so text size does not enlarge it');
    }
    assert.ok(k3Reto.includes('data-reader-trans="en"') && k3Reto.includes('id="reader_ruler"') && k3Reto.includes('Lector inmersivo'), 'Reader options, translated');
    assert.ok(!(await get('/', k3)).includes('id="readerOpen"'), 'The home page has no reader');
    const reader = require('../public/js/reader.js');
    assert.deepStrictEqual(reader.sanitizeSettings({ rate: 'turbo', size: 9, spacing: 'si', tint: 'rojo', trans: 'fr', ruler: true }),
        { rate: 'normal', size: 0, spacing: false, font: false, ruler: true, tint: 'ninguno', trans: '' }, 'Odd saved settings fall back to the defaults');
    const long = 'Primera frase con varias palabras. '.repeat(12).trim();
    const chunks = reader.chunkText(long, 100);
    assert.ok(chunks.length > 1 && chunks.every(c => c.text.length <= 100), 'Long texts are read in short parts');
    assert.strictEqual(chunks.map(c => c.text).join(''), long, 'The parts keep the whole text, so the highlight lines up');
    assert.ok(chunks.every(c => long.startsWith(c.text, c.start)), 'Each part knows where it starts');
    const voices = [{ lang: 'es-ES', name: 'España' }, { lang: 'es-CO', name: 'Colombia', localService: true }, { lang: 'de_DE', name: 'Deutsch' }, { lang: 'en-US', name: 'US' }];
    assert.strictEqual(reader.pickVoice(voices, 'es').name, 'Colombia', 'A Colombian voice is preferred for Spanish');
    assert.strictEqual(reader.pickVoice(voices, 'de').name, 'Deutsch', 'Voices written de_DE are recognized');
    assert.strictEqual(reader.pickVoice(voices, 'en').name, 'US', 'Any English voice if there is no British one');
    assert.strictEqual(reader.pickVoice([], 'es'), null);
    assert.strictEqual(reader.otherLangText('{"de":"<b>Hallo</b> Welt","es":"Hola"}', 'de'), 'Hallo Welt', 'Translations carry no markup');
    assert.strictEqual(reader.otherLangText('no json', 'de'), '');
    console.log('✅ Immersive reader: on challenge pages, reads in short parts with a voice of the page language, safe settings');
}

async function testCampaign(baseUrl, graph, logFile) {
    const admin = { email: 'admin@colegioaleman.edu.co', role: 'desarrollador', first_name: 'Admin', last_name: 'Test' };
    const adminCookie = `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(admin))}`;
    const call = (route, body) => fetch(`${baseUrl}${route}`, {
        method: body ? 'POST' : 'GET',
        headers: { Cookie: adminCookie, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined
    });
    assert.strictEqual((await fetch(`${baseUrl}/api/admin/campaign`, { redirect: 'manual' })).status, 302, 'The module is for admins only');

    const dashboard = await (await call('/admin')).text();
    assert.ok(dashboard.includes('data-sub="ayuda"') && dashboard.includes('id="sub-help"'), 'The module is in the admin menu');
    const state = await (await call('/api/admin/campaign')).json();
    assert.strictEqual(state.emails.length, 5, '5 emails');
    assert.ok(state.service.configured, 'The simulated service is configured');

    // Videos
    assert.strictEqual((await call('/api/admin/help-videos', { links: { reto0: 'javascript:alert(1)' } })).status, 400, 'A bad video link is rejected');
    const videos = await (await call('/api/admin/help-videos', { links: { reto0: 'https://videos.example/reto0' } })).json();
    assert.ok(videos.success && videos.videos.find(v => v.id === 'reto0').url.endsWith('/reto0'));
    assert.ok(videos.videos.every(v => v.script && v.title.es), 'Each video has its script');

    // Correos
    assert.strictEqual((await call('/api/admin/campaign/emails/reto0', { subject: '', body: 'x' })).status, 400, 'The subject is required');
    assert.strictEqual((await call('/api/admin/campaign/emails/nada', { subject: 'a', body: 'b' })).status, 400, 'Unknown email');
    const edited = await (await call('/api/admin/campaign/emails/reto0', { subject: 'Reto 0 de {materia}', body: 'Hola, {nombre}: <b>mira</b>\n{video:reto0}\n{video:entrar}' })).json();
    assert.ok(edited.success);
    const preview = await (await call('/api/admin/campaign/preview', { emailId: 'reto0' })).json();
    assert.strictEqual(preview.subject, 'Reto 0 de Matemáticas');
    assert.ok(preview.html.includes('Hola, Ana:') && preview.html.includes('&lt;b&gt;mira') && !preview.html.includes('<b>'), 'The text is escaped');
    assert.ok(preview.html.includes('href="https://videos.example/reto0"'), 'The video link is clickable');
    assert.ok(preview.html.includes('AYUDA'), 'Each email ends with the AYUDA segment');
    assert.deepStrictEqual(preview.missingVideos, ['entrar'], 'It warns about videos without a link');

    // Prueba: solo a quien está en el panel
    const test = await (await call('/api/admin/campaign/test', { emailId: 'reto0' })).json();
    assert.ok(test.success && test.to === admin.email);
    assert.strictEqual(graph.sent.length, 1);
    assert.deepStrictEqual(graph.sent[0].toRecipients.map(r => r.emailAddress.address), [admin.email]);
    assert.ok(graph.sent[0].subject.startsWith('[Prueba]'));
    assert.strictEqual(graph.tokenRequests, 1, 'It asks Microsoft for the permission');

    // Envío: sin Supabase no hay docentes; no se envía nada y se exige el conteo correcto
    const none = await (await call('/api/admin/campaign/recipients', { emailId: 'reto0', type: 'all' })).json();
    assert.strictEqual(none.count, 0);
    assert.strictEqual((await call('/api/admin/campaign/send', { emailId: 'reto0', type: 'all', confirmCount: 5 })).status, 400, 'Without the platform link it does not send');
    await call('/api/admin/campaign/settings', { appUrl: 'https://medienpass.example/' });
    assert.strictEqual((await call('/api/admin/campaign/send', { emailId: 'reto0', type: 'all', confirmCount: 5 })).status, 409, 'A different count does not send');
    assert.strictEqual((await call('/api/admin/campaign/send', { emailId: 'reto0', type: 'all', confirmCount: 0 })).status, 400, 'No recipients');
    assert.strictEqual(graph.sent.length, 1, 'Nothing else was sent');
    assert.ok(!fs.existsSync(logFile) || JSON.parse(fs.readFileSync(logFile, 'utf8')).length === 0, 'The test email does not count as sent');
    console.log('✅ Email module: videos, editing, preview, test to the admin only, and safe sending');
}

function testRecipients(tempDir) {
    process.env.HELP_CAMPAIGN_FILE = path.join(tempDir, 'unit-config.json');
    process.env.CAMPAIGN_LOG_FILE = path.join(tempDir, 'unit-log.json');
    delete require.cache[require.resolve('../services/campaign')];
    const campaign = require('../services/campaign');
    const teachers = [
        { id: 1, first_name: 'Ana María', email: 'ANA@colegioaleman.edu.co', subject: 'arte', training_completed: true },
        { id: 2, first_name: 'Beto', email: 'beto@colegioaleman.edu.co', subject: 'musica', training_completed: false },
        { id: 3, first_name: 'Cata', email: 'cata@gmail.com', subject: 'arte', training_completed: false },
        { id: 4, first_name: 'Sin', email: 'no-es-correo', subject: 'arte', training_completed: false },
        { id: 5, first_name: 'Copia', email: 'beto@colegioaleman.edu.co', subject: 'musica', training_completed: false }
    ];
    const emails = list => list.recipients.map(r => r.to);
    assert.deepStrictEqual(emails(campaign.selectRecipients(teachers, 'reto0', { type: 'all' })), ['ana@colegioaleman.edu.co', 'beto@colegioaleman.edu.co', 'cata@gmail.com']);
    assert.strictEqual(campaign.selectRecipients(teachers, 'reto0', { type: 'all' }).invalid, 1, 'An invalid email is counted apart');
    assert.deepStrictEqual(emails(campaign.selectRecipients(teachers, 'reto0', { type: 'untrained' })), ['beto@colegioaleman.edu.co', 'cata@gmail.com']);
    assert.deepStrictEqual(emails(campaign.selectRecipients(teachers, 'reto0', { type: 'subject', subject: 'arte' })), ['ana@colegioaleman.edu.co', 'cata@gmail.com']);
    assert.ok(campaign.selectRecipients(teachers, 'reto0', { type: 'all' }).recipients.find(r => r.to === 'cata@gmail.com').external, 'Addresses outside the school are flagged');

    campaign.appendLog({ emailId: 'reto0', to: 'beto@colegioaleman.edu.co', at: '2026-11-07', ok: true });
    campaign.appendLog({ emailId: 'reto0', to: 'ana@colegioaleman.edu.co', at: '2026-11-07', ok: false, error: 'x' });
    const again = campaign.selectRecipients(teachers, 'reto0', { type: 'all' });
    assert.deepStrictEqual(emails(again), ['ana@colegioaleman.edu.co', 'cata@gmail.com'], 'Who got it is skipped; a failed send can be retried');
    assert.strictEqual(again.alreadySent, 1);
    assert.deepStrictEqual(emails(campaign.selectRecipients(teachers, 'cierre', { type: 'untrained' })), ['beto@colegioaleman.edu.co', 'cata@gmail.com'], 'Another email can still be sent to them');
    assert.deepStrictEqual(campaign.emailStats().reto0.sent, 1);
    console.log('✅ Recipients: filters, no duplicates, nobody gets the same email twice');
}

async function testMailerRetries() {
    const hits = [];
    const server = http.createServer((req, res) => {
        hits.push(req.url);
        if (req.url.includes('/token')) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ access_token: 'abc', expires_in: 3600 })); }
        if (hits.filter(u => u.includes('sendMail')).length === 1) { res.writeHead(429, { 'Retry-After': '0' }); return res.end(); }
        if (hits.filter(u => u.includes('sendMail')).length === 2) { res.writeHead(202); return res.end(); }
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'ErrorAccessDenied' } }));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const env = { MS_TENANT_ID: 't', MS_CLIENT_ID: 'c', MS_CLIENT_SECRET: 's', MAIL_FROM: 'm@x.co', GRAPH_LOGIN_URL: base, GRAPH_API_URL: base };
    const mailer = require('../services/mailer');
    mailer.resetTokenCache();
    assert.deepStrictEqual(mailer.serviceStatus({}).missing, ['MS_TENANT_ID', 'MS_CLIENT_ID', 'MS_CLIENT_SECRET', 'MAIL_FROM']);
    await assert.rejects(mailer.sendMail({ to: 'a@b.co', subject: 's', html: 'h' }, {}), /no está configurado/);
    await mailer.sendMail({ to: 'a@b.co', subject: 's', html: 'h' }, env);
    assert.strictEqual(hits.filter(u => u.includes('sendMail')).length, 2, 'It retries once when Microsoft asks to wait');
    await assert.rejects(mailer.sendMail({ to: 'a@b.co', subject: 's', html: 'h' }, env), /ErrorAccessDenied/, 'A rejection is reported');
    assert.strictEqual(hits.filter(u => u.includes('/token')).length, 1, 'The permission is reused');
    await new Promise(resolve => server.close(resolve));
    console.log('✅ Mailer: Microsoft Graph with permission reuse, a retry and clear errors');
}

async function run() {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-training-'));
    const cache = path.join(tempDir, 'cache.json');
    fs.writeFileSync(cache, '{}');
    const logFile = path.join(tempDir, 'campaign-log.json');

    // Microsoft Graph simulado
    const graph = { sent: [], tokenRequests: 0 };
    const mock = http.createServer((req, res) => {
        let raw = '';
        req.on('data', chunk => { raw += chunk; });
        req.on('end', () => {
            if (req.url.includes('/oauth2/v2.0/token')) {
                graph.tokenRequests++;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ access_token: 'token', expires_in: 3600 }));
            }
            if (req.url.includes('/sendMail')) {
                graph.sent.push(JSON.parse(raw).message);
                res.writeHead(202);
                return res.end();
            }
            res.writeHead(404);
            res.end();
        });
    });
    await new Promise(resolve => mock.listen(0, '127.0.0.1', resolve));
    const mockUrl = `http://127.0.0.1:${mock.address().port}`;

    // Perfiles de prueba: el módulo de capacitación y correos es solo del desarrollador
    const rolesFile = path.join(tempDir, 'teacher_roles.json');
    fs.writeFileSync(rolesFile, JSON.stringify({ 'admin@colegioaleman.edu.co': 'desarrollador' }));

    const { baseUrl, stop } = await startServer({
        TEACHER_ROLES_FILE: rolesFile,
        LOCAL_ACTIVITY_CACHE_FILE: cache,
        HELP_CAMPAIGN_FILE: path.join(tempDir, 'help.json'),
        CAMPAIGN_LOG_FILE: logFile,
        CUSTOM_INSTRUMENTS_PATH: path.join(tempDir, 'instruments.json'),
        MS_TENANT_ID: 'tenant',
        MS_CLIENT_ID: 'client',
        MS_CLIENT_SECRET: 'secret',
        MAIL_FROM: 'medienpass@colegioaleman.edu.co',
        GRAPH_LOGIN_URL: mockUrl,
        GRAPH_API_URL: mockUrl,
        CAMPAIGN_DELAY_MS: '1'
    });
    try {
        testTeacherTestContent();
        await testPages(baseUrl);
        await testCampaign(baseUrl, graph, logFile);
        testRecipients(tempDir);
        await testMailerRetries();
    } finally {
        await stop();
        await new Promise(resolve => mock.close(resolve));
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    console.log('\nAll training and help tests passed.');
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
