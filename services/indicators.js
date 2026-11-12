// Indicadores institucionales del Medienpass, en total y por segmento (Preescolar, Primaria, Secundaria):
// a) profesores capacitados; b) estudiantes con mínimo 3 de los 6 retos ganados (80 % o más), contando
// números de reto distintos en cualquier materia; c) estudiantes con al menos un vínculo de evidencia.
// Base de b y c: los estudiantes de una clase con nivel. "sinact" queda por fuera, y un registro repetido
// con el mismo código cuenta una sola vez, con sus resultados sumados.

const { SEGMENTS, classInfo, segmentOfMappingKey } = require('./class_levels');

const GOALS = { teachers: 70, students: 85, evidence: 85 };
const MIN_RETOS = 3;
const NO_SEGMENT = 'sin_segmento';

const pct = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);
const summary = (value, total) => ({ value, total, pct: pct(value, total) });

const normalizeName = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/\s+/g, ' ').trim();

// Una persona por código. Si un registro está como "K5A" y otro como "5A", vale el de la K.
function groupStudents(students) {
    const people = new Map();
    (students || []).forEach(student => {
        const key = String(student.student_code || '').trim() || `id:${student.id}`;
        const person = people.get(key) || { ids: [], className: null };
        person.ids.push(student.id);
        const hasK = /^K/i.test(String(student.class_name || ''));
        if (!person.className || (hasK && !/^K/i.test(person.className))) person.className = student.class_name;
        people.set(key, person);
    });
    return [...people.values()];
}

// Segmentos de cada docente según el mapeo de profesores: { correo: ['primaria'] }
function segmentsFromMapping(mapping, teachers) {
    const known = (teachers || []).map(t => ({ email: normalizeEmail(t.email), name: normalizeName(`${t.first_name || ''} ${t.last_name || ''}`) }));
    const result = {};
    Object.entries(mapping || {}).forEach(([classKey, bySubject]) => {
        const segment = segmentOfMappingKey(classKey);
        if (!segment) return;
        Object.values(bySubject || {}).forEach(value => {
            const name = normalizeName(value);
            if (!name) return;
            const parts = name.split(' ');
            const teacher = known.find(t => t.name === name)
                || (parts.length >= 2 ? known.find(t => parts.every(part => t.name.split(' ').includes(part))) : null);
            if (!teacher || !teacher.email) return;
            const list = result[teacher.email] || (result[teacher.email] = []);
            if (!list.includes(segment)) list.push(segment);
        });
    });
    return result;
}

const normalizeEmail = email => String(email || '').trim().toLowerCase();

// Lo que el admin asignó manda sobre lo que se deduce del mapeo
function teacherSegments(teacher, assigned, fromMapping) {
    const email = normalizeEmail(teacher.email);
    const list = assigned && Array.isArray(assigned[email]) ? assigned[email] : (fromMapping && fromMapping[email]) || [];
    return SEGMENTS.filter(segment => list.includes(segment));
}

// students: [{ id, class_name, student_code }]; teachers: [{ email, training_completed, exempt }]
// wonRetos: Map id de estudiante -> Set de retos ganados (1 a 6); withEvidence: Set de ids
function computeIndicators({ students, teachers, assignedSegments, mappingSegments, wonRetos, withEvidence }) {
    const buckets = key => Object.fromEntries(key.map(k => [k, { value: 0, total: 0 }]));
    const studentSegments = buckets(SEGMENTS);
    const evidenceSegments = buckets(SEGMENTS);
    const classes = new Map();

    groupStudents(students).forEach(person => {
        const info = classInfo(person.className);
        if (!info) return;
        const won = new Set();
        person.ids.forEach(id => ((wonRetos && wonRetos.get(id)) || []).forEach(n => won.add(n)));
        const reachesMin = won.size >= MIN_RETOS;
        const hasEvidence = person.ids.some(id => withEvidence && withEvidence.has(id));

        const row = classes.get(info.key) || { className: info.key, klasse: info.klasse, segment: info.segment, total: 0, withMin: 0, withEvidence: 0 };
        row.total++;
        if (reachesMin) row.withMin++;
        if (hasEvidence) row.withEvidence++;
        classes.set(info.key, row);

        studentSegments[info.segment].total++;
        evidenceSegments[info.segment].total++;
        if (reachesMin) studentSegments[info.segment].value++;
        if (hasEvidence) evidenceSegments[info.segment].value++;
    });

    // Los docentes exentos de la capacitación (exempt: true) no cuentan en la base del indicador a)
    const counted = (teachers || []).filter(teacher => !teacher.exempt);
    const teacherBuckets = buckets([...SEGMENTS, NO_SEGMENT]);
    let trained = 0;
    counted.forEach(teacher => {
        const isTrained = !!teacher.training_completed;
        if (isTrained) trained++;
        const segments = teacherSegments(teacher, assignedSegments, mappingSegments);
        (segments.length ? segments : [NO_SEGMENT]).forEach(segment => {
            teacherBuckets[segment].total++;
            if (isTrained) teacherBuckets[segment].value++;
        });
    });

    const withPct = list => Object.fromEntries(Object.entries(list).map(([k, v]) => [k, summary(v.value, v.total)]));
    const total = list => Object.values(list).reduce((acc, v) => ({ value: acc.value + v.value, total: acc.total + v.total }), { value: 0, total: 0 });
    const studentTotal = total(studentSegments);
    const evidenceTotal = total(evidenceSegments);

    return {
        minRetos: MIN_RETOS,
        teachers: { goal: GOALS.teachers, ...summary(trained, counted.length), exempt: (teachers || []).length - counted.length, segments: withPct(teacherBuckets) },
        students: { goal: GOALS.students, ...summary(studentTotal.value, studentTotal.total), segments: withPct(studentSegments) },
        evidence: { goal: GOALS.evidence, ...summary(evidenceTotal.value, evidenceTotal.total), segments: withPct(evidenceSegments) },
        classes: [...classes.values()]
            .map(row => ({ ...row, minPct: pct(row.withMin, row.total), evidencePct: pct(row.withEvidence, row.total) }))
            .sort((a, b) => SEGMENTS.indexOf(a.segment) - SEGMENTS.indexOf(b.segment)
                || a.className.localeCompare(b.className, 'es', { numeric: true }))
    };
}

module.exports = { GOALS, MIN_RETOS, NO_SEGMENT, computeIndicators, segmentsFromMapping, teacherSegments, normalizeEmail, groupStudents };
