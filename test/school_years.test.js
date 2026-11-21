// Año escolar (Administración › Año escolar), nombre del estudiante siempre visible y estilo del colegio.
// Usa archivos temporales (SCHOOL_YEARS_FILE, roles, caché) y un servidor sin Supabase.
// Uso: node test/school_years.test.js
const assert = require('assert');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const signature = require('cookie-signature');

const COOKIE_SECRET = 'years-test-secret';
const ROOT = path.join(__dirname, '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'medienpass-years-'));
const yearsFile = path.join(dir, 'school_years.json');
process.env.SCHOOL_YEARS_FILE = yearsFile; // antes de cargar el servicio

const years = require('../services/school_years');
const { studentNames } = require('../services/display_name');

const signedCookie = (name, value) => `${name}=${encodeURIComponent('s:' + signature.sign(value, COOKIE_SECRET))}`;
const writeJson = async (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

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

async function verifyService() {
    // Sin archivo: los años de fábrica, con 2026 - 2027 en curso
    assert.deepStrictEqual(years.read(), { active: '2627', years: ['2526', '2627', '2728'] });
    assert.strictEqual(years.labelOf('2627'), '2026 - 2027');
    assert.strictEqual(years.idFromStart(2028), '2829');
    assert.strictEqual(years.idFromStart(1999), null);
    assert.strictEqual(years.idFromStart('abc'), null);
    assert.ok(years.isValidId('2627') && !years.isValidId('2629') && !years.isValidId('27') && !years.isValidId('<b>'));
    assert.strictEqual(years.resolve('2526'), '2526');
    assert.strictEqual(years.resolve("2627' OR 1=1"), '2627', 'An invalid year in a report falls back to the current year');
    assert.strictEqual(years.nextStart(), 2028);

    assert.strictEqual((await years.add(2028, writeJson)).id, '2829');
    assert.strictEqual((await years.add(2028, writeJson)).error, 'duplicate_year');
    assert.strictEqual((await years.add(1990, writeJson)).error, 'invalid_year');
    assert.strictEqual((await years.setActive('9999', writeJson)).error, 'unknown_year');
    assert.strictEqual((await years.setActive('2829', writeJson)).id, '2829');
    assert.strictEqual(years.activeYear(), '2829');
    assert.strictEqual((await years.remove('2829', writeJson)).error, 'active_year');
    assert.strictEqual((await years.remove('2526', writeJson, { savedResponses: 4 })).error, 'year_in_use');
    assert.strictEqual((await years.remove('2526', writeJson)).id, '2526');
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(yearsFile, 'utf8')), { active: '2829', years: ['2627', '2728', '2829'] });

    // Un archivo dañado o con valores raros vuelve a valores válidos
    fs.writeFileSync(yearsFile, JSON.stringify({ active: 'x', years: ['2627', 'bad', '2627', '2526'] }));
    assert.deepStrictEqual(years.read(), { active: '2627', years: ['2526', '2627'] });
    fs.unlinkSync(yearsFile);

    // Nombre para mostrar: "NOMBRES APELLIDOS" en mayúsculas -> nombre propio; saludo con el primer nombre
    assert.deepStrictEqual(studentNames({ full_name: 'SANTIAGO JOSUE ACERO JIMÉNEZ', username: '2895' }),
        { full: 'Santiago Josue Acero Jiménez', first: 'Santiago', initial: 'S', hasName: true });
    assert.strictEqual(studentNames({ full_name: 'MARÍA DE LOS ÁNGELES PÉREZ-ÑÚÑEZ' }).full, 'María de los Ángeles Pérez-Ñúñez');
    assert.strictEqual(studentNames({ first_name: 'ana', last_name: 'gómez' }).full, 'Ana Gómez');
    assert.deepStrictEqual(studentNames({ username: '2895' }), { full: '2895', first: '2895', initial: '2', hasName: false });
    console.log('✅ School years service (add, current year, remove rules) and display names');
}

async function verifyServer(baseUrl, cacheFile) {
    const student = { id: 'local_years_student', username: '2401', full_name: 'ANA MARÍA PRUEBA GÓMEZ', class_name: 'K5A' };
    const cookies = {
        student: `lang=es; ${signedCookie('student_id', student.id)}; ${signedCookie('student_data', JSON.stringify(student))}`,
        teacher: `lang=es; ${signedCookie('teacher_auth', 'true')}; ${signedCookie('teacher_data', JSON.stringify({ email: 'profe@colegioaleman.edu.co', first_name: 'Profe', last_name: 'Prueba', subject: 'aleman', id: 'teacher_profe' }))}`,
        dev: `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify({ email: 'dev@colegioaleman.edu.co', first_name: 'Dev', last_name: 'Prueba' }))}`,
        coord: `lang=es; ${signedCookie('admin_auth', 'true')}; ${signedCookie('admin_user', JSON.stringify({ email: 'coord@colegioaleman.edu.co', first_name: 'Coord', last_name: 'Prueba' }))}`
    };
    const request = async (who, route, options = {}) => {
        const response = await fetch(baseUrl + route, {
            ...options,
            headers: { Cookie: cookies[who] || 'lang=es', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
            redirect: 'manual'
        });
        const type = response.headers.get('content-type') || '';
        return { status: response.status, type, body: type.includes('json') ? await response.json() : await response.text() };
    };
    const json = (method, body) => ({ method, body: JSON.stringify(body) });

    // Inicio del estudiante: nombre completo en la barra fija, saludo con el primer nombre y el año en curso
    let home = (await request('student', '/')).body;
    assert.ok(home.includes('class="dsb-student-bar"') && home.includes('Ana María Prueba Gómez'), 'The student bar shows the full name');
    assert.ok(/Hola<\/span>, <span[^>]*>Ana<\/span>!/.test(home), 'The greeting uses the first name, not the user code');
    assert.ok(home.includes('2026 - 2027') && !home.includes('id="yearSelect"'), 'The student sees the current year and cannot pick another');
    assert.ok(home.includes('/activity/2627/'), 'Challenge links use the current year');
    assert.ok(!/header\.shrunk|user-details/.test(home), 'Nothing hides the name when scrolling');

    // Año escolar: solo el desarrollador
    assert.strictEqual((await request('coord', '/api/admin/school-years')).status, 403);
    assert.strictEqual((await request('coord', '/api/admin/school-years', json('POST', { start: 2030 }))).status, 403);
    assert.strictEqual((await request('student', '/api/admin/school-years')).status, 302);

    let list = (await request('dev', '/api/admin/school-years')).body;
    assert.ok(list.success && list.active === '2627' && list.nextStart === 2028 && list.years.length === 3);
    const added = await request('dev', '/api/admin/school-years', json('POST', { start: 2028 }));
    assert.ok(added.status === 200 && added.body.years.some(y => y.id === '2829' && y.label === '2028 - 2029'), 'A new year is added');
    const duplicate = await request('dev', '/api/admin/school-years', json('POST', { start: 2028 }));
    assert.ok(duplicate.status === 400 && duplicate.body.code === 'duplicate_year' && /ya está en la lista/.test(duplicate.body.message));
    assert.strictEqual((await request('dev', '/api/admin/school-years', json('POST', { start: '20x8' }))).body.code, 'invalid_year');

    // Cambiar el año en curso: lo ve el estudiante y sus respuestas se guardan en ese año
    assert.strictEqual((await request('dev', '/api/admin/school-years/active', json('PUT', { id: '2829' }))).body.active, '2829');
    home = (await request('student', '/')).body;
    assert.ok(home.includes('2028 - 2029') && home.includes('/activity/2829/'), 'The student home follows the current year');
    const saved = await request('student', '/api/save/years-test-activity', json('POST', { answer: 'ok', school_year: '2526' }));
    assert.ok(saved.body.success);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    assert.strictEqual(cache[student.id]['years-test-activity'].school_year, '2829', 'Answers are saved in the current year (not the one the browser sends)');

    // Quitar: nunca el año en curso ni uno con respuestas
    assert.strictEqual((await request('dev', '/api/admin/school-years/2829', { method: 'DELETE' })).body.code, 'active_year');
    await request('dev', '/api/admin/school-years/active', json('PUT', { id: '2627' }));
    list = (await request('dev', '/api/admin/school-years')).body;
    assert.strictEqual(list.years.find(y => y.id === '2829').responses, 1);
    assert.strictEqual((await request('dev', '/api/admin/school-years/2829', { method: 'DELETE' })).body.code, 'year_in_use');
    const removed = await request('dev', '/api/admin/school-years/2526', { method: 'DELETE' });
    assert.ok(removed.status === 200 && !removed.body.years.some(y => y.id === '2526'), 'A year without answers can be removed');

    // Panel: sección Año escolar del desarrollador, filtro de Inicio con los años y el año en la barra
    const devPanel = (await request('dev', '/admin')).body;
    assert.ok(devPanel.includes('id="sub-years"') && devPanel.includes('data-sub="anio"') && devPanel.includes('id="yearAddForm"'));
    assert.ok(/<select id="filterYear"[^>]*>[\s\S]*?<option value="2627" selected>2026 - 2027<\/option>/.test(devPanel), 'The Home year filter lists the years with the current one selected');
    assert.ok(devPanel.includes('id="adminYearChip"'), 'The admin bar shows the current year');
    const coordPanel = (await request('coord', '/admin')).body;
    assert.ok(!coordPanel.includes('id="sub-years"') && !coordPanel.includes('data-sub="anio"'), 'Coordinators do not get the school year settings');

    // Estilo del colegio: logo y hoja de estilo en todas las entradas y portales
    for (const [who, route] of [['none', '/login'], ['student', '/'], ['none', '/teacher/login'], ['teacher', '/teacher/training'],
        ['teacher', '/teacher/progress'], ['teacher', '/teacher/student-preview'], ['teacher', '/teacher/troubleshooting'], ['none', '/admin/login'], ['dev', '/admin'], ['dev', '/docs'], ['dev', '/docs/technical']]) {
        const page = await request(who, route);
        assert.strictEqual(page.status, 200, `${route} opens`);
        assert.ok(page.body.includes('/css/colegio.css') && page.body.includes('/img/logo-colegio'), `${route} uses the school style and logo`);
    }
    const logo = await request('none', '/img/logo-colegio.png');
    assert.ok(logo.status === 200 && logo.type.includes('image/png'), 'The school logo is served');
    console.log('✅ School year settings (developer only), student name bar, current year in answers and school style on every portal');
}

async function run() {
    try {
        await verifyService();
        const rolesFile = path.join(dir, 'teacher_roles.json');
        const cacheFile = path.join(dir, 'cache.json');
        fs.writeFileSync(rolesFile, JSON.stringify({ 'coord@colegioaleman.edu.co': 'coordinador', 'dev@colegioaleman.edu.co': 'desarrollador' }));
        const server = await startTestServer({
            TEACHER_ROLES_FILE: rolesFile,
            SCHOOL_YEARS_FILE: yearsFile,
            LOCAL_ACTIVITY_CACHE_FILE: cacheFile,
            CUSTOM_INSTRUMENTS_PATH: path.join(dir, 'instruments.json')
        });
        try {
            await verifyServer(server.baseUrl, cacheFile);
        } finally {
            await server.stop();
        }
        console.log('\nAll school year tests passed.');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
