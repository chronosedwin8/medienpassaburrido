// Asignación de actividades a estudiantes, uno por uno o por cursos completos.
//
// Una asignación es: materia + retos (0 a 6) + destinatarios (cursos y/o códigos de estudiante)
// + fecha límite y nota opcionales. La crean los docentes (las suyas) y el panel (todas).
// Un curso completo se guarda por su nombre (K5A): quien entre a ese curso en Phidias —también
// un estudiante nuevo— la recibe sin volver a asignarla.
//
// Se guarda en la tabla activity_assignments de Supabase (migrations/003_activity_assignments.sql).
// Si la tabla aún no existe se usa data/activity_assignments.json y status() lo avisa.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { classInfo } = require('./class_levels');

const TABLE = 'activity_assignments';
const FILE = process.env.ASSIGNMENTS_FILE
    ? path.resolve(process.env.ASSIGNMENTS_FILE)
    : path.join(__dirname, '..', 'data', 'activity_assignments.json');
const RETO_IDS = ['profile', 1, 2, 3, 4, 5, 6];

let backend = null; // 'supabase' | 'file'
let supabase = null;

function init(client) {
    supabase = client;
    backend = null;
}

// ¿Existe la tabla en Supabase? Se comprueba una vez; si no, archivo local.
async function detect() {
    if (backend) return backend;
    if (!supabase) return (backend = 'file');
    try {
        const { error } = await supabase.from(TABLE).select('id').limit(1);
        backend = error ? 'file' : 'supabase';
        if (error) console.warn(`Asignaciones: la tabla ${TABLE} no existe (${error.code || error.message}); se usa ${path.basename(FILE)}. Ejecute migrations/003_activity_assignments.sql.`);
    } catch (e) {
        backend = 'file';
    }
    return backend;
}

function readFile() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { return []; }
}
function writeFile(list) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(list, null, 1));
    fs.renameSync(tmp, FILE);
}

// Ids de actividad de una materia: Reto 0 = "profile", retos 1-6 = "reto{n}_{materia}"
function activityIdFor(subject, n) {
    return Number(n) === 0 || n === 'profile' ? 'profile' : `reto${Number(n)}_${subject}`;
}
function retoNumberOf(activityId) {
    if (activityId === 'profile') return 0;
    const m = /^reto(\d)_/.exec(activityId);
    return m ? Number(m[1]) : null;
}

const uniq = list => [...new Set(list)];

// Valida y normaliza lo que llega del formulario o de la API
function normalize(input, { subjectIds = [] } = {}) {
    const errors = [];
    const subject = String(input.subject || '').trim();
    if (!subjectIds.includes(subject)) errors.push('subject');
    const retos = uniq((Array.isArray(input.retos) ? input.retos : Array.isArray(input.activity_ids) ? input.activity_ids : [])
        .map(r => (r === 'profile' ? 0 : typeof r === 'string' && r.startsWith('reto') ? retoNumberOf(r) : Number(r)))
        .filter(n => Number.isInteger(n) && n >= 0 && n <= 6)).sort();
    if (!retos.length) errors.push('retos');
    const classNames = uniq((input.class_names || input.classes || []).map(c => {
        const info = classInfo(c);
        return info ? info.key : null;
    }).filter(Boolean));
    const studentCodes = uniq((input.student_codes || input.students || []).map(c => String(c).trim()).filter(c => /^\d{1,8}$/.test(c)));
    if (!classNames.length && !studentCodes.length) errors.push('targets');
    let dueDate = null;
    if (input.due_date) {
        const d = String(input.due_date).slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) dueDate = d; else errors.push('due_date');
    }
    const title = String(input.title || '').trim().slice(0, 140);
    return {
        errors,
        value: {
            title,
            subject,
            activity_ids: retos.map(n => activityIdFor(subject, n)),
            class_names: classNames,
            student_codes: studentCodes,
            due_date: dueDate,
            note: String(input.note || '').trim().slice(0, 1000)
        }
    };
}

async function list({ includeArchived = false } = {}) {
    if (await detect() === 'supabase') {
        let q = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
        if (!includeArchived) q = q.eq('active', true);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
    }
    return readFile().filter(a => includeArchived || a.active !== false)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

async function get(id) {
    if (await detect() === 'supabase') {
        const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return data;
    }
    return readFile().find(a => a.id === id) || null;
}

async function create(value, { by = {}, schoolYear = null } = {}) {
    const row = {
        ...value,
        title: value.title || '',
        school_year: schoolYear,
        created_by: String(by.email || '').toLowerCase(),
        created_by_name: String(by.name || '').trim(),
        active: true
    };
    if (await detect() === 'supabase') {
        const { data, error } = await supabase.from(TABLE).insert(row).select('*').single();
        if (error) throw error;
        return data;
    }
    const now = new Date().toISOString();
    const saved = { id: crypto.randomUUID(), ...row, created_at: now, updated_at: now };
    const all = readFile();
    all.push(saved);
    writeFile(all);
    return saved;
}

async function update(id, patch) {
    const allowed = ['title', 'subject', 'activity_ids', 'class_names', 'student_codes', 'due_date', 'note', 'active'];
    const clean = {};
    allowed.forEach(k => { if (patch[k] !== undefined) clean[k] = patch[k]; });
    if (await detect() === 'supabase') {
        const { data, error } = await supabase.from(TABLE).update(clean).eq('id', id).select('*').single();
        if (error) throw error;
        return data;
    }
    const all = readFile();
    const i = all.findIndex(a => a.id === id);
    if (i < 0) return null;
    all[i] = { ...all[i], ...clean, updated_at: new Date().toISOString() };
    writeFile(all);
    return all[i];
}

// Añade o quita destinatarios: { add: { classes, students }, remove: { classes, students } }
function changeTargets(assignment, { add = {}, remove = {} } = {}) {
    const norm = (list, isClass) => (list || []).map(v => isClass ? (classInfo(v) || {}).key : String(v).trim())
        .filter(v => v && (isClass || /^\d{1,8}$/.test(v)));
    const removeClasses = new Set(norm(remove.classes, true));
    const removeStudents = new Set(norm(remove.students, false));
    return {
        class_names: uniq([...(assignment.class_names || []), ...norm(add.classes, true)]).filter(c => !removeClasses.has(c)),
        student_codes: uniq([...(assignment.student_codes || []), ...norm(add.students, false)]).filter(c => !removeStudents.has(c))
    };
}

// ¿Le corresponde esta asignación al estudiante (código + curso)?
function appliesTo(assignment, { code, className }) {
    const info = classInfo(className);
    const key = info ? info.key : null;
    return assignment.active !== false && (
        (key && (assignment.class_names || []).includes(key)) ||
        (code && (assignment.student_codes || []).includes(String(code).trim())));
}

async function forStudent(student) {
    const all = await list();
    return all.filter(a => appliesTo(a, { code: student.student_code || student.username, className: student.class_name }));
}

// Puede editarla quien la creó o un perfil del panel
function canEdit(assignment, user) {
    if (!assignment || !user) return false;
    if (user.panel) return true;
    return !!user.email && String(assignment.created_by || '').toLowerCase() === String(user.email).toLowerCase();
}

// Estudiantes destinatarios (cursos completos + individuales) a partir de la matrícula
function recipients(assignment, rosterStudents) {
    const classes = new Set(assignment.class_names || []);
    const codes = new Set(assignment.student_codes || []);
    const out = rosterStudents.filter(s => classes.has(s.class_name) || codes.has(s.code));
    // Códigos sueltos que ya no están en la matrícula también se listan
    codes.forEach(c => { if (!out.some(s => s.code === c)) out.push({ code: c, full_name: '', class_name: '' }); });
    return out;
}

async function status() {
    return { backend: await detect(), table: TABLE, migration: 'migrations/003_activity_assignments.sql' };
}

module.exports = {
    init, detect, list, get, create, update, normalize, changeTargets, appliesTo, forStudent, canEdit,
    recipients, status, activityIdFor, retoNumberOf, RETO_IDS,
    _resetForTests: () => { backend = null; }
};
