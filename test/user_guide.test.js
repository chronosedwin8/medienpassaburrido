// Guía de uso (/docs): textos completos en DE, EN y ES, pestañas por perfil y accesos.
// Uso: node test/user_guide.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'guide-test-secret';
const ROOT = path.join(__dirname, '..');
const guide = require('../services/user_guide');
const i18nStore = require('../services/i18n_store');

const signedCookie = (name, value) => `${name}=${encodeURIComponent('s:' + signature.sign(value, COOKIE_SECRET))}`;

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

function verifyGuideContent() {
    const dict = i18nStore.getSection('manuales');
    const keys = guide.allKeys();
    const missing = keys.filter(key => i18nStore.LANGS.some(lang => !String(dict[lang][key] || '').trim()));
    assert.deepStrictEqual(missing, [], 'Every guide text exists in DE, EN and ES');
    assert.strictEqual(new Set(keys).size, keys.length, 'No guide key is used twice');

    const ids = viewer => guide.tabsFor(viewer).map(tab => tab.id);
    assert.deepStrictEqual(ids('estudiante'), ['estudiante']);
    assert.deepStrictEqual(ids('profesor'), ['docente', 'estudiante']);
    assert.deepStrictEqual(ids('coordinador'), ['coordinacion', 'docente', 'estudiante']);
    assert.deepStrictEqual(ids('directivo'), ['coordinacion', 'docente', 'estudiante']);
    assert.deepStrictEqual(ids('desarrollador'), ['desarrollador', 'coordinacion', 'docente', 'estudiante']);
    assert.deepStrictEqual(ids('desconocido'), ['estudiante'], 'An unknown viewer only sees the student guide');

    // Cada pestaña solo enlaza a páginas que su público puede abrir
    const linksOf = id => guide.TABS.find(tab => tab.id === id).sections.map(s => s.link).filter(Boolean);
    assert.ok(linksOf('estudiante').every(link => ['/', '/profile'].includes(link)), 'Student links stay in the student app');
    assert.ok(linksOf('docente').every(link => link.startsWith('/teacher/')), 'Teacher links stay in the teacher portal');
    const coordinatorHashes = ['inicio', 'indicadores', 'consultas'];
    assert.ok(linksOf('coordinacion').every(link => coordinatorHashes.includes(link.replace('/admin#', '').split('/')[0])),
        'Coordinator links only open sections of their panel');
    assert.ok(guide.TABS.every(tab => tab.sections.every(s => !s.link || (s.link.startsWith('/') && !s.link.startsWith('//')))));

    // Manual técnico
    const techKeys = require('../services/tech_manual').allKeys();
    const techMissing = techKeys.filter(key => i18nStore.LANGS.some(lang => !String(dict[lang][key] || '').trim()));
    assert.deepStrictEqual(techMissing, [], 'Every technical manual text exists in DE, EN and ES');
    console.log(`✅ Guide: ${keys.length} texts and technical manual: ${techKeys.length} texts, in DE, EN and ES; tabs by profile; links within each audience`);
}

async function verifyGuidePages(baseUrl, rolesFile) {
    const student = { id: 'local_guide_student', username: 'guia', class_name: 'K5A' };
    const teacher = email => ({ email, first_name: 'Guía', last_name: 'Docente', subject: 'aleman', id: 'teacher_' + email });
    const admin = email => ({ email, first_name: 'Guía', last_name: 'Panel' });
    const cookies = {
        student: `lang=es; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`,
        teacher: `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify(teacher('profe@colegioaleman.edu.co')))}`,
        coord: `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(admin('coord@colegioaleman.edu.co')))}`,
        dev: `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify(admin('dev@colegioaleman.edu.co')))}`
    };
    const page = async (who, route = '/docs') => {
        const response = await fetch(baseUrl + route, { headers: { Cookie: cookies[who] || 'lang=es' }, redirect: 'manual' });
        return { status: response.status, location: response.headers.get('location'), html: response.status === 200 ? await response.text() : '' };
    };
    const tabsIn = html => [...html.matchAll(/<section id="tab-([a-z]+)" class="guide-tab/g)].map(m => m[1]);

    const anonymous = await page('none');
    assert.strictEqual(anonymous.status, 302, 'The guide needs a session');

    const forStudent = await page('student');
    assert.strictEqual(forStudent.status, 200, 'Students can open the guide (it no longer sends them back to their profile)');
    assert.deepStrictEqual(tabsIn(forStudent.html), ['estudiante']);
    assert.ok(forStudent.html.includes('Antes de empezar') && forStudent.html.includes('href="/"'), 'Common card and back link to the home page');

    const forTeacher = await page('teacher');
    assert.deepStrictEqual(tabsIn(forTeacher.html), ['docente', 'estudiante']);
    assert.ok(forTeacher.html.includes('href="/teacher/training"'), 'The teacher goes back to the portal');

    const forCoord = await page('coord');
    assert.deepStrictEqual(tabsIn(forCoord.html), ['coordinacion', 'docente', 'estudiante']);
    assert.ok(!forCoord.html.includes('href="/docs/technical"'), 'Coordinators do not get the technical manual link');

    const forDev = await page('dev');
    assert.deepStrictEqual(tabsIn(forDev.html), ['desarrollador', 'coordinacion', 'docente', 'estudiante']);
    assert.ok(forDev.html.includes('href="/docs/technical"') && forDev.html.includes('href="/admin#administracion/mapeo"'));

    // Avisos: solo los conocidos, nunca texto de la dirección
    const restricted = await page('coord', '/docs/technical');
    assert.strictEqual(restricted.location, '/docs?error=tecnico');
    const technical = await page('dev', '/docs/technical');
    const techSections = require('../services/tech_manual').SECTIONS;
    assert.ok(technical.status === 200 && techSections.every(s => technical.html.includes(`<section id="${s.id}" class="tech-section`)),
        'The developer sees every section of the technical manual');
    assert.ok(!/16\/20|20 preguntas/.test(technical.html), 'The technical manual no longer describes the old 20-question Reto 0');
    assert.ok((await page('coord', '/docs?error=tecnico')).html.includes('Acceso restringido'));
    const injected = await page('coord', '/docs?error=' + encodeURIComponent('<b>Hola</b> phishing'));
    assert.ok(!injected.html.includes('phishing') && !injected.html.includes('role="alert"'), 'Unknown notices are not shown');

    // Entradas a la guía: botón Guía del panel y Manual de usuario en el menú docente
    const panel = await page('coord', '/admin');
    assert.ok(panel.html.includes('href="/docs"') && panel.html.includes('data-i18n="adm_go_guide"'), 'The admin bar links to the guide');
    // La dirección antigua del menú docente ya no da error: lleva al inicio de cada portal
    assert.strictEqual((await page('teacher', '/teacher/menu')).location, '/teacher/training');
    assert.strictEqual((await page('coord', '/teacher/menu')).location, '/admin');
    const progress = await page('teacher', '/teacher/progress');
    assert.ok(progress.html.includes('href="/teacher/student-preview"') && progress.html.includes('Configura tus Retos del 0 al 6')
        && progress.html.includes('Consulta los avances') && progress.html.includes('href="/docs"'),
        'The teacher menu has «Configura tus Retos del 0 al 6», «Consulta los avances» and the manual');
    assert.ok(!progress.html.includes('href="/teacher/bitacora"') && !progress.html.includes('doc_nav_modo_estudiante'), 'No log and no separate Student mode item');
    assert.ok(/<select id="classFilterInput"/.test(progress.html) && progress.html.includes('Elige tu Klasse'), 'The classes are chosen from a combo');
    const guideTeacher = forTeacher.html;
    assert.ok(guideTeacher.includes('Configura tus retos del 0 al 6') && guideTeacher.includes('Consulta los avances') && !/[Bb]itácora/.test(guideTeacher),
        'The teacher guide uses the new menu names and no longer mentions the log');
    console.log('✅ Guide pages: each profile sees its tabs, students can open it, unknown notices are ignored');
}

async function run() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-guide-'));
    const rolesFile = path.join(dir, 'teacher_roles.json');
    fs.writeFileSync(rolesFile, JSON.stringify({ 'coord@colegioaleman.edu.co': 'coordinador', 'dev@colegioaleman.edu.co': 'desarrollador' }));
    try {
        verifyGuideContent();
        const server = await startTestServer({
            TEACHER_ROLES_FILE: rolesFile,
            LOCAL_ACTIVITY_CACHE_FILE: path.join(dir, 'cache.json'),
            CUSTOM_INSTRUMENTS_PATH: path.join(dir, 'instruments.json')
        });
        try {
            await verifyGuidePages(server.baseUrl, rolesFile);
        } finally {
            await server.stop();
        }
        console.log('\nAll user guide tests passed.');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
