// Materias editables (Administración › Materias): nombre DE/EN/ES, ícono, color y si está activa.
// Los cambios se guardan en data/subjects_config.json y se aplican SOBRE el mismo array `subjects`
// de data_levels.js (se modifican los objetos, también s.name.de/en/es), así llegan a toda la app.
// Una materia inactiva no se ofrece en los combos ni al estudiante (filtro: s.active !== false);
// sus datos no se borran y vuelven al reactivarla.
// Materias nuevas (createSubject): se guardan con custom: true; data_levels.js las agrega al arrancar.

const fs = require('fs');
const path = require('path');
const { subjects, SUBJECT_ID_RE } = require('../data_levels');

const CONFIG_FILE = process.env.SUBJECTS_CONFIG_FILE
    ? path.resolve(process.env.SUBJECTS_CONFIG_FILE)
    : path.join(__dirname, '../data/subjects_config.json');
const LANGS = ['de', 'en', 'es'];
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const MAX_NAME = 60;
const MAX_ICON = 8;

// Valores de fábrica, para volver a ellos cuando un campo queda vacío
const defaults = Object.fromEntries(subjects.map(s => [s.id, { name: { ...s.name }, icon: s.icon, color: s.color }]));

function readConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) || {};
    } catch (e) {
        console.error('Error leyendo subjects_config.json:', e.message);
    }
    return {};
}

function apply(config) {
    subjects.forEach(s => {
        const base = defaults[s.id];
        const c = config[s.id] || {};
        LANGS.forEach(lang => {
            const value = c.name && typeof c.name[lang] === 'string' ? c.name[lang].trim() : '';
            s.name[lang] = value || base.name[lang];
        });
        s.icon = typeof c.icon === 'string' && c.icon.trim() ? c.icon.trim() : base.icon;
        s.color = COLOR_RE.test(c.color || '') ? c.color : base.color;
        s.active = c.active !== false;
    });
}

function load() {
    apply(readConfig());
}

function activeSubjects() {
    return subjects.filter(s => s.active !== false);
}

function isKnown(id) {
    return subjects.some(s => s.id === id);
}

function isActive(id) {
    return activeSubjects().some(s => s.id === id);
}

// Revisa lo que llega del panel para una materia. Devuelve { error } o { entry } listo para guardar.
function sanitize(id, input = {}) {
    if (!isKnown(id)) return { error: 'Materia desconocida' };
    return checkFields(input);
}

function checkFields(input = {}) {
    const name = {};
    for (const lang of LANGS) {
        const value = String((input.name && input.name[lang]) || '').trim();
        if (!value) return { error: `Falta el nombre (${lang.toUpperCase()})` };
        if (value.length > MAX_NAME) return { error: `Nombre demasiado largo (${lang.toUpperCase()})` };
        name[lang] = value;
    }
    const icon = String(input.icon || '').trim();
    if (!icon || [...icon].length > MAX_ICON) return { error: 'Ícono no válido' };
    const color = String(input.color || '').trim();
    if (!COLOR_RE.test(color)) return { error: 'Color no válido (use #rrggbb)' };
    return { entry: { name, icon, color, active: input.active !== false } };
}

// Guarda una materia y la aplica. `write(file, data)` es la escritura atómica del servidor.
async function saveSubject(id, input, write) {
    const { error, entry } = sanitize(id, input);
    if (error) return { error };
    const config = readConfig();
    const current = subjects.find(s => s.id === id);
    config[id] = current && current.custom ? { ...entry, custom: true } : entry;
    await write(CONFIG_FILE, config);
    apply(config);
    return { subject: current };
}

// Id de una materia nueva a partir de su nombre en español: "Educación Física" → educacion_fisica
function newSubjectId(nameEs) {
    const base = String(nameEs || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').replace(/^[^a-z]+/, '').slice(0, 20).replace(/_+$/, '');
    const root = SUBJECT_ID_RE.test(base) ? base : 'materia';
    let id = root;
    for (let n = 2; isKnown(id); n++) id = `${root}_${n}`;
    return id;
}

// Crea una materia nueva (custom: true). Queda activa y con contenido genérico; data.js le arma los
// retos (registerSubjectActivities). Nunca reemplaza una materia existente.
async function createSubject(input, write) {
    const { error, entry } = checkFields({ ...input, active: true });
    if (error) return { error };
    const sameName = subjects.find(s => LANGS.some(lang => s.name[lang].trim().toLowerCase() === entry.name[lang].toLowerCase()));
    if (sameName) return { error: `Ya existe una materia con ese nombre (${sameName.name.es})` };
    const id = newSubjectId(entry.name.es);
    const config = readConfig();
    config[id] = { ...entry, custom: true };
    await write(CONFIG_FILE, config);
    const subject = { id, name: { ...entry.name }, icon: entry.icon, color: entry.color, custom: true, active: true };
    subjects.push(subject);
    defaults[id] = { name: { ...entry.name }, icon: entry.icon, color: entry.color };
    apply(config);
    return { subject };
}

load();

module.exports = {
    CONFIG_FILE,
    load,
    activeSubjects,
    isKnown,
    isActive,
    sanitize,
    saveSubject,
    createSubject,
    newSubjectId
};
