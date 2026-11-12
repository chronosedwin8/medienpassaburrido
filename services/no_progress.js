// Inicio › "Estudiantes sin empezar el Medienpass": por clase, cuántos estudiantes no han guardado
// ningún reto (0 a 6) en el año elegido, con sus nombres. Reemplaza la lista suelta de 10 nombres.
// - Solo cuentan las clases con nivel (class_levels): "sinact" queda por fuera.
// - Un estudiante repetido con el mismo código cuenta una vez y empezó si empezó con cualquiera de
//   sus registros (indicators.groupStudents).
// - Clases ordenadas por segmento y, dentro de cada uno, de mayor a menor porcentaje sin empezar.

const { SEGMENTS, classInfo } = require('./class_levels');
const { groupStudents } = require('./indicators');

const pct = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);
const EARLY_ORDER = { PK: 0, KIN: 1, KKP: 2 };
const classOrder = info => (info.grade === 0 ? EARLY_ORDER[info.klasse] : info.grade + 2);

// students: [{ id, class_name, student_code, full_name, username }]
// startedIds: Set de ids de estudiante con algún reto guardado en el año
// sortKey: función que ordena los nombres (por apellidos en server.js)
function buildNoProgressReport({ students, startedIds, sortKey = name => name }) {
    const byId = new Map((students || []).map(s => [s.id, s]));
    const classes = new Map();
    groupStudents(students).forEach(person => {
        const info = classInfo(person.className);
        if (!info) return;
        const records = person.ids.map(id => byId.get(id));
        const named = records.find(s => s && s.full_name) || records[0] || {};
        const entry = classes.get(info.key) || { className: info.key, segment: info.segment, order: classOrder(info), letter: info.letter || '', total: 0, pending: [] };
        entry.total++;
        if (!person.ids.some(id => startedIds.has(id))) entry.pending.push(String(named.full_name || named.username || '').trim());
        classes.set(info.key, entry);
    });

    const list = [...classes.values()].map(c => ({
        className: c.className,
        segment: c.segment,
        total: c.total,
        pending: c.pending.length,
        pct: pct(c.pending.length, c.total),
        nobodyStarted: c.pending.length === c.total,
        students: c.pending.slice().sort((a, b) => sortKey(a).localeCompare(sortKey(b), 'es')),
        order: c.order,
        letter: c.letter
    }));

    const totals = items => {
        const total = items.reduce((sum, c) => sum + c.total, 0);
        const pending = items.reduce((sum, c) => sum + c.pending, 0);
        return { total, pending, pct: pct(pending, total), classes: items.length, complete: items.filter(c => c.pending === 0).length };
    };
    const segments = {};
    SEGMENTS.forEach(seg => { segments[seg] = totals(list.filter(c => c.segment === seg)); });

    const withPending = list.filter(c => c.pending > 0).sort((a, b) =>
        SEGMENTS.indexOf(a.segment) - SEGMENTS.indexOf(b.segment) || b.pct - a.pct || a.order - b.order || a.letter.localeCompare(b.letter));
    return {
        summary: totals(list),
        segments,
        classes: withPending.map(({ order, letter, ...c }) => c)
    };
}

module.exports = { buildNoProgressReport };
