// Estudiantes de Supabase alineados con la matrícula de Phidias (services/phidias.js).
//
// - ensureStudent(phidiasStudent): al entrar (con Microsoft o con código) busca al estudiante por su
//   código. Si no existe lo crea; si cambió de curso (año nuevo) o falta su nombre, lo actualiza.
//   Así no hay que cargar estudiantes cada año: Phidias manda.
// - syncPlan() / applySync(): el administrador ve y aplica todos los cambios de una vez.
//   Nunca se borra un estudiante: quien ya no está en Phidias pasa a la clase «sinact» y conserva
//   sus respuestas.
// Antes de cada cambio se guarda el estado anterior en data/phidias_changes.json (y applySync además
// en data/phidias_sync_<fecha>.json), con el motivo.

const fs = require('fs');
const path = require('path');
const { classInfo } = require('./class_levels');

const DATA_DIR = process.env.STUDENT_DIRECTORY_DIR
    ? path.resolve(process.env.STUDENT_DIRECTORY_DIR)
    : path.join(__dirname, '..', 'data');
const CHANGES_FILE = path.join(DATA_DIR, 'phidias_changes.json');
const INACTIVE = 'sinact';
const MAX_LOG = 5000;

function logChange(entry) {
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        let list = [];
        try { list = JSON.parse(fs.readFileSync(CHANGES_FILE, 'utf8')); } catch (e) { list = []; }
        list.push({ date: new Date().toISOString(), ...entry });
        fs.writeFileSync(CHANGES_FILE, JSON.stringify(list.slice(-MAX_LOG), null, 1));
    } catch (e) {
        console.warn('No se pudo registrar el cambio de estudiante:', e.message);
    }
}

// De varios registros con el mismo código, el que representa al estudiante:
// el de su curso actual, luego cualquiera con nivel, y por último el de «sinact».
function pickRow(rows, className) {
    if (!rows || !rows.length) return null;
    return rows.find(r => r.class_name === className)
        || rows.find(r => classInfo(r.class_name))
        || rows[0];
}

async function rowsForCode(supabase, code) {
    const { data, error } = await supabase.from('students').select('*')
        .or(`student_code.eq.${code},username.eq.${code}`);
    if (error) throw error;
    return data || [];
}

// Nombre comparable: sin tildes, mayúsculas ni espacios de más ("ANA  MARÍA" = "Ana Maria").
// Solo se reescribe el nombre si cambió de verdad; la app ya lo muestra bonito (display_name.js).
const sameName = (a, b) => {
    const norm = v => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    return norm(a) === norm(b);
};

// Pruebas locales contra la base real: STUDENT_DIRECTORY_READONLY=1 no escribe en Supabase
// (entra quien ya está registrado, con lo que tiene; nadie se crea ni se cambia).
const readOnly = () => process.env.STUDENT_DIRECTORY_READONLY === '1';

// Cambios que necesita un registro para coincidir con Phidias (o null si ya coincide)
function diffFor(row, ph) {
    const patch = {};
    if (row.class_name !== ph.class_name) patch.class_name = ph.class_name;
    if (ph.full_name && !sameName(row.full_name, ph.full_name)) patch.full_name = ph.full_name;
    if (String(row.student_code || '').trim() !== ph.code) patch.student_code = ph.code;
    return Object.keys(patch).length ? patch : null;
}

function newRow(ph) {
    return { username: ph.code, student_code: ph.code, class_name: ph.class_name, full_name: ph.full_name };
}

async function ensureStudent(supabase, ph, { reason = 'ingreso' } = {}) {
    if (!supabase) throw new Error('Sin conexión a la base de datos');
    if (!ph || !/^\d+$/.test(ph.code)) throw new Error('Estudiante de Phidias sin código válido');
    const rows = await rowsForCode(supabase, ph.code);
    const row = pickRow(rows, ph.class_name);
    if (readOnly()) return row && row.class_name !== INACTIVE ? row : null;
    if (!row) {
        const { data, error } = await supabase.from('students').insert(newRow(ph)).select('*').single();
        if (error) {
            // Otro ingreso simultáneo lo pudo crear: se vuelve a buscar
            const again = pickRow(await rowsForCode(supabase, ph.code), ph.class_name);
            if (again) return again;
            throw error;
        }
        logChange({ action: 'create', reason, code: ph.code, after: data });
        return data;
    }
    const patch = diffFor(row, ph);
    if (!patch) return row;
    const before = { id: row.id, class_name: row.class_name, full_name: row.full_name, student_code: row.student_code };
    const { data, error } = await supabase.from('students').update(patch).eq('id', row.id).select('*').single();
    if (error) {
        console.error('No se pudo actualizar al estudiante', ph.code, error.message);
        return row; // entra con lo que había
    }
    logChange({ action: 'update', reason, code: ph.code, before, patch });
    return data;
}

// Todo lo que cambiaría para que Supabase coincida con Phidias (no escribe nada)
function buildPlan(supabaseRows, phidiasStudents) {
    const byCode = new Map();
    supabaseRows.forEach(r => {
        const key = String(r.student_code || '').trim() || (/^\d+$/.test(String(r.username || '')) ? String(r.username) : '');
        if (!key) return;
        if (!byCode.has(key)) byCode.set(key, []);
        byCode.get(key).push(r);
    });
    const plan = { create: [], update: [], deactivate: [] };
    const seen = new Set();
    phidiasStudents.forEach(ph => {
        seen.add(ph.code);
        const row = pickRow(byCode.get(ph.code), ph.class_name);
        if (!row) { plan.create.push({ code: ph.code, full_name: ph.full_name, class_name: ph.class_name }); return; }
        const patch = diffFor(row, ph);
        if (patch) plan.update.push({ id: row.id, code: ph.code, full_name: ph.full_name, from: row.class_name, to: ph.class_name, patch });
    });
    supabaseRows.forEach(r => {
        const key = String(r.student_code || '').trim() || String(r.username || '');
        if (seen.has(key) || r.class_name === INACTIVE || !classInfo(r.class_name)) return;
        plan.deactivate.push({ id: r.id, code: key, full_name: r.full_name, from: r.class_name, to: INACTIVE });
    });
    // Un código con dos registros: el duplicado que no se usa también pasa a «sinact»
    byCode.forEach((rows, code) => {
        if (rows.length < 2 || !seen.has(code)) return;
        const ph = phidiasStudents.find(p => p.code === code);
        const keep = pickRow(rows, ph.class_name);
        rows.filter(r => r !== keep && r.class_name !== INACTIVE)
            .forEach(r => plan.deactivate.push({ id: r.id, code, full_name: r.full_name, from: r.class_name, to: INACTIVE, duplicate: true }));
    });
    plan.summary = { create: plan.create.length, update: plan.update.length, deactivate: plan.deactivate.length };
    return plan;
}

async function applyPlan(supabase, plan, phidiasStudents, { by = '' } = {}) {
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const backupFile = path.join(DATA_DIR, `phidias_sync_${stamp}.json`);
    const backup = { date: new Date().toISOString(), by, reason: 'Sincronización con la matrícula de Phidias', plan };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 1));
    const result = { created: 0, updated: 0, deactivated: 0, errors: [] , backupFile: path.basename(backupFile) };
    const byCode = new Map(phidiasStudents.map(p => [p.code, p]));
    for (const item of plan.create) {
        const { error } = await supabase.from('students').insert(newRow(byCode.get(item.code)));
        if (error) result.errors.push({ code: item.code, error: error.message }); else result.created++;
    }
    for (const item of plan.update) {
        const { error } = await supabase.from('students').update(item.patch).eq('id', item.id);
        if (error) result.errors.push({ code: item.code, error: error.message }); else result.updated++;
    }
    for (const item of plan.deactivate) {
        const { error } = await supabase.from('students').update({ class_name: INACTIVE }).eq('id', item.id);
        if (error) result.errors.push({ code: item.code, error: error.message }); else result.deactivated++;
    }
    logChange({ action: 'sync', reason: 'Sincronización con Phidias', by, summary: plan.summary, result: { ...result, errors: result.errors.length } });
    return result;
}

module.exports = { ensureStudent, buildPlan, applyPlan, pickRow, diffFor, sameName, INACTIVE };
