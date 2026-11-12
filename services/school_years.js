// Años escolares (Administración › Año escolar): la lista de años y cuál está en curso.
// Se guarda en data/school_years.json: { "active": "2627", "years": ["2526", "2627", "2728"] }.
// Un año es un código de cuatro dígitos con los dos años que abarca: "2627" = 2026 - 2027
// (es el valor que ya usan las respuestas guardadas en activity_responses.school_year).
// El año en curso es el que ven los estudiantes y con el que se guardan sus respuestas;
// los informes del panel se pueden consultar por cualquiera de los años de la lista.
// Quitar un año de la lista no borra respuestas.

const fs = require('fs');
const path = require('path');

const FILE = process.env.SCHOOL_YEARS_FILE
    ? path.resolve(process.env.SCHOOL_YEARS_FILE)
    : path.join(__dirname, '..', 'data', 'school_years.json');

// Valores de fábrica: los años que traía data.js, con 2026 - 2027 en curso
const DEFAULTS = { active: '2627', years: ['2526', '2627', '2728'] };
const ID_RE = /^\d{4}$/;
const MIN_START = 2000;
const MAX_START = 2098;

// "2627" -> 2026 (el año en que empieza)
function startOf(id) {
    return 2000 + Number(String(id).slice(0, 2));
}

// Código válido: cuatro dígitos y el segundo año sigue al primero ("2627", no "2629")
function isValidId(id) {
    if (!ID_RE.test(String(id || ''))) return false;
    const a = Number(String(id).slice(0, 2));
    const b = Number(String(id).slice(2));
    return b === a + 1;
}

// 2028 -> "2829"
function idFromStart(start) {
    const year = Number(start);
    if (!Number.isInteger(year) || year < MIN_START || year > MAX_START) return null;
    const a = year % 100;
    return String(a).padStart(2, '0') + String(a + 1).padStart(2, '0');
}

// "2627" -> "2026 - 2027"
function labelOf(id) {
    if (!isValidId(id)) return String(id || '');
    const start = startOf(id);
    return `${start} - ${start + 1}`;
}

function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const years = [...new Set((Array.isArray(source.years) ? source.years : []).map(String).filter(isValidId))]
        .sort((x, y) => startOf(x) - startOf(y));
    if (!years.length) years.push(...DEFAULTS.years);
    let active = String(source.active || '');
    if (!years.includes(active)) active = years.includes(DEFAULTS.active) ? DEFAULTS.active : years[years.length - 1];
    return { active, years };
}

// Se relee solo si el archivo cambió (lo leen todas las páginas para mostrar el año)
let cache = null;
let cacheStamp = null;

function read() {
    let stamp = 'none';
    try { stamp = String(fs.statSync(FILE).mtimeMs); } catch (e) { /* aún no existe */ }
    if (cache && stamp === cacheStamp) return cache;
    let raw = null;
    if (stamp !== 'none') {
        try { raw = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { console.error('Error leyendo school_years.json:', e.message); }
    }
    cache = normalize(raw || DEFAULTS);
    cacheStamp = stamp;
    return cache;
}

function activeYear() {
    return read().active;
}

function isKnown(id) {
    return read().years.includes(String(id));
}

// Lista para las vistas: [{ id, label, start, active }]
function list() {
    const { active, years } = read();
    return years.map(id => ({ id, label: labelOf(id), start: startOf(id), active: id === active }));
}

// El año siguiente al último de la lista (sugerencia del formulario "Agregar año")
function nextStart() {
    const { years } = read();
    return startOf(years[years.length - 1]) + 1;
}

// Año pedido por un informe: el de la lista si es válido; si no, el año en curso
function resolve(id) {
    return isValidId(id) ? String(id) : activeYear();
}

// Escrituras. `write(file, data)` es la escritura atómica del servidor.
async function save(config, write) {
    const next = normalize(config);
    await write(FILE, next);
    cache = null;
    return next;
}

async function add(start, write) {
    const id = idFromStart(start);
    if (!id) return { error: 'invalid_year' };
    const current = read();
    if (current.years.includes(id)) return { error: 'duplicate_year' };
    const config = await save({ active: current.active, years: [...current.years, id] }, write);
    return { id, config };
}

async function setActive(id, write) {
    const current = read();
    if (!current.years.includes(String(id))) return { error: 'unknown_year' };
    const config = await save({ active: String(id), years: current.years }, write);
    return { id: String(id), config };
}

// Solo sale de la lista un año que no está en curso y sin respuestas guardadas
async function remove(id, write, { savedResponses = 0 } = {}) {
    const current = read();
    id = String(id);
    if (!current.years.includes(id)) return { error: 'unknown_year' };
    if (id === current.active) return { error: 'active_year' };
    if (savedResponses > 0) return { error: 'year_in_use' };
    const config = await save({ active: current.active, years: current.years.filter(y => y !== id) }, write);
    return { id, config };
}

module.exports = {
    FILE,
    DEFAULTS,
    isValidId,
    idFromStart,
    labelOf,
    startOf,
    read,
    activeYear,
    isKnown,
    list,
    nextStart,
    resolve,
    add,
    setActive,
    remove
};
