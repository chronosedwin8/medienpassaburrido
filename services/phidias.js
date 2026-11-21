// Matrícula del colegio desde la API de Phidias (https://ds-barranquilla.phidias.co/rest).
//
// Phidias es la fuente de verdad de los estudiantes: nombre completo, curso (KKP1 … K12C), código y
// correo institucional (<código>@colegioaleman.edu.co). Con ella:
// - el ingreso con Microsoft (SSO) reconoce al estudiante por su correo, sin cargar listas cada año;
// - el ingreso con código usa el curso que dice Phidias;
// - los docentes y el administrador asignan actividades por estudiante o por curso completo.
//
// Solo se leen los campos necesarios (id, código, nombres, correo, curso y estado). Phidias entrega
// también direcciones, teléfonos y claves cifradas: nunca se guardan ni se envían al navegador.
//
// Variables de entorno: PHIDIAS_BASE_URL y PHIDIAS_TOKEN (en .env y en CapRover, nunca en el código).
// La lista se guarda en memoria 6 horas y en data/phidias_roster.json, para seguir funcionando si
// Phidias no responde.

const fs = require('fs');
const path = require('path');
const { classInfo } = require('./class_levels');

const ROSTER_FILE = process.env.PHIDIAS_ROSTER_FILE
    ? path.resolve(process.env.PHIDIAS_ROSTER_FILE)
    : path.join(__dirname, '..', 'data', 'phidias_roster.json');
const TTL_MS = 6 * 60 * 60 * 1000;
const TIMEOUT_MS = 30000;
const SCHOOL_DOMAIN = 'colegioaleman.edu.co';
// Estados de matrícula que cuentan como estudiante del colegio; «retirado» queda fuera.
const ENROLLED = new Set(['activo', 'inscrito', 'admitido', 'pendiente']);

let cache = null;        // { fetchedAt, source, students: [...] }
let inflight = null;

function configured() {
    return !!(process.env.PHIDIAS_BASE_URL && process.env.PHIDIAS_TOKEN);
}

async function get(pathname, params = {}) {
    if (!configured()) throw new Error('Phidias no está configurado (PHIDIAS_BASE_URL y PHIDIAS_TOKEN)');
    const url = new URL(process.env.PHIDIAS_BASE_URL.replace(/\/+$/, '') + pathname);
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v); });
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${process.env.PHIDIAS_TOKEN}`, Accept: 'application/json' },
                signal: ctrl.signal
            });
            if (!res.ok) throw new Error(`Phidias respondió ${res.status} en ${pathname}`);
            return await res.json();
        } catch (e) {
            lastError = e;
        } finally {
            clearTimeout(timer);
        }
    }
    throw lastError;
}

// "ANGEL DAVID" -> "Angel David"; respeta tildes y partículas cortas (de, del, la)
function titleCase(text) {
    const small = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'von', 'van', 'der']);
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim().split(' ')
        .map((w, i) => (i > 0 && small.has(w)) ? w : w.replace(/(^|[-'])(\p{L})/gu, (m, p, c) => p + c.toUpperCase()))
        .join(' ');
}

const cleanEmail = e => String(e || '').trim().toLowerCase().replace(/\s+/g, '');

// Un estudiante de /1/course/consolidate -> solo lo que usa la app
function mapStudent(raw, section, course, level) {
    const code = String(raw.code || '').trim();
    const info = classInfo(section.name);
    const status = String((raw.enrollment && raw.enrollment.status) || '').toLowerCase();
    const first = titleCase(raw.firstname);
    const last = titleCase(raw.lastname || [raw.lastname1, raw.lastname2].filter(Boolean).join(' '));
    return {
        phidias_id: raw.id,
        code,
        email: cleanEmail(raw.email),
        first_name: first,
        last_name: last,
        full_name: [first, last].filter(Boolean).join(' '),
        class_name: info ? info.key : String(section.name || '').trim().toUpperCase(),
        course: course.name,
        level: level.name,
        status
    };
}

function flatten(levels) {
    const out = [];
    (Array.isArray(levels) ? levels : []).forEach(level => (level.courses || []).forEach(course =>
        (course.sections || []).forEach(section => (section.students || []).forEach(raw => {
            const st = mapStudent(raw, section, course, level);
            if (st.code && ENROLLED.has(st.status)) out.push(st);
        }))));
    return out;
}

function readFileCache() {
    try {
        const saved = JSON.parse(fs.readFileSync(ROSTER_FILE, 'utf8'));
        if (saved && Array.isArray(saved.students)) return { ...saved, source: 'archivo' };
    } catch (e) { /* sin copia local */ }
    return null;
}

function writeFileCache(data) {
    try {
        fs.mkdirSync(path.dirname(ROSTER_FILE), { recursive: true });
        const tmp = ROSTER_FILE + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(data));
        fs.renameSync(tmp, ROSTER_FILE);
    } catch (e) {
        console.warn('No se pudo guardar data/phidias_roster.json:', e.message);
    }
}

// Lista de estudiantes matriculados. force = true ignora la caché (botón «Actualizar desde Phidias»).
async function roster({ force = false } = {}) {
    if (!force && cache && Date.now() - cache.fetchedAt < TTL_MS) return cache;
    if (!cache && !force) {
        const saved = readFileCache();
        if (saved) {
            cache = saved;
            if (Date.now() - saved.fetchedAt < TTL_MS) return cache;
            refresh().catch(() => {}); // se actualiza en segundo plano; mientras tanto, la copia local
            return cache;
        }
    }
    return refresh();
}

function refresh() {
    if (inflight) return inflight;
    inflight = (async () => {
        try {
            const levels = await get('/1/course/consolidate');
            const students = flatten(levels);
            if (!students.length) throw new Error('Phidias devolvió una matrícula vacía');
            cache = { fetchedAt: Date.now(), source: 'phidias', students };
            writeFileCache(cache);
            return cache;
        } catch (e) {
            console.error('Phidias:', e.message);
            const fallback = cache || readFileCache();
            if (fallback) { cache = fallback; return cache; }
            throw e;
        } finally {
            inflight = null;
        }
    })();
    return inflight;
}

// Código del estudiante a partir de su correo institucional ("3255@colegioaleman.edu.co" -> "3255")
function codeFromEmail(email) {
    const m = /^(\d{3,6})@(.+)$/.exec(cleanEmail(email));
    return m && m[2] === SCHOOL_DOMAIN ? m[1] : null;
}

async function findByCode(code) {
    const { students } = await roster();
    const c = String(code || '').trim();
    return students.find(s => s.code === c) || null;
}

// Por correo: primero el código institucional, después el correo registrado en Phidias
async function findByEmail(email) {
    const { students } = await roster();
    const e = cleanEmail(email);
    const code = codeFromEmail(e);
    return (code && students.find(s => s.code === code)) || students.find(s => s.email === e) || null;
}

const naturalSort = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
const CLASS_ORDER = ['KKP', 'PK', 'KIN', 'K'];
function classOrder(a, b) {
    const ia = classInfo(a), ib = classInfo(b);
    const ka = ia ? CLASS_ORDER.indexOf(ia.klasse.replace(/\d+$/, '')) : 9;
    const kb = ib ? CLASS_ORDER.indexOf(ib.klasse.replace(/\d+$/, '')) : 9;
    return ka - kb || naturalSort(a, b);
}

// [{ class_name, course, level, count }] en orden: KKP, PK, KIN, K1A … K12C
async function classes() {
    const { students } = await roster();
    const map = new Map();
    students.forEach(s => {
        const c = map.get(s.class_name) || { class_name: s.class_name, course: s.course, level: s.level, count: 0 };
        c.count++;
        map.set(s.class_name, c);
    });
    return [...map.values()].sort((a, b) => classOrder(a.class_name, b.class_name));
}

// Estudiantes de un curso, por apellido. Solo datos públicos para el navegador.
async function studentsOfClass(className) {
    const info = classInfo(className);
    const key = info ? info.key : String(className || '').toUpperCase();
    const { students } = await roster();
    return students.filter(s => s.class_name === key)
        .sort((a, b) => naturalSort(a.last_name + ' ' + a.first_name, b.last_name + ' ' + b.first_name))
        .map(publicView);
}

const publicView = s => ({ code: s.code, full_name: s.full_name, first_name: s.first_name, last_name: s.last_name, class_name: s.class_name });

async function status() {
    const r = cache || readFileCache();
    return {
        configured: configured(),
        loaded: !!r,
        source: r ? r.source : null,
        fetchedAt: r ? new Date(r.fetchedAt).toISOString() : null,
        students: r ? r.students.length : 0
    };
}

module.exports = {
    configured, roster, refresh, findByCode, findByEmail, classes, studentsOfClass, status,
    codeFromEmail, titleCase, flatten, classOrder, publicView, SCHOOL_DOMAIN,
    _setCacheForTests: data => { cache = data ? { fetchedAt: Date.now(), source: 'prueba', ...data } : null; }
};
