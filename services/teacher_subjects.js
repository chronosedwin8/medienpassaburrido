// Materia de cada docente frente al mapeo de profesores (Administración › Mapeo).
// Muchos docentes quedaron registrados con «Alemán» (la primera opción del registro) aunque dictan
// otra materia. El mapeo dice qué materia dicta cada docente en cada clase: con él se propone la
// materia correcta. Lo usa Inicio › Docentes pendientes de certificación (corregir una por una o
// aplicar todas las del mapeo).
// - Los nombres del mapeo se buscan entre los docentes registrados (teacher_courses.teacherMatcher).
// - Si el docente aparece en varias materias, se propone la de más clases. Con un empate no se
//   propone ninguna (ambiguous): la elige el desarrollador.
// - Si la materia registrada ya está entre las del mapeo, no se cambia.

const { teacherMatcher, canonicalClass } = require('./teacher_courses');

// Map id del docente -> [{ subject, classes: ['K3A', ...] }], de más a menos clases
function mappedSubjects(mapping, teachers, subjectIds) {
    const match = teacherMatcher(teachers);
    const byTeacher = new Map();
    Object.entries(mapping || {}).forEach(([rawKey, row]) => {
        if (!row || typeof row !== 'object') return;
        const cls = canonicalClass(rawKey) || rawKey;
        Object.entries(row).forEach(([subject, name]) => {
            if (subjectIds && !subjectIds.includes(subject)) return;
            if (typeof name !== 'string' || !name.trim()) return;
            const teacher = match(name, subject);
            if (!teacher) return;
            if (!byTeacher.has(teacher.id)) byTeacher.set(teacher.id, new Map());
            const subjects = byTeacher.get(teacher.id);
            if (!subjects.has(subject)) subjects.set(subject, new Set());
            subjects.get(subject).add(cls);
        });
    });
    const order = subject => (subjectIds ? subjectIds.indexOf(subject) : 0);
    const out = new Map();
    byTeacher.forEach((subjects, id) => {
        out.set(id, [...subjects.entries()]
            .map(([subject, classes]) => ({ subject, classes: [...classes].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })) }))
            .sort((a, b) => b.classes.length - a.classes.length || order(a.subject) - order(b.subject)));
    });
    return out;
}

// { mapped, suggested, mismatch, ambiguous } de un docente
function reviewSubject(teacher, mapped) {
    const list = mapped || [];
    if (!list.length) return { mapped: [], suggested: null, mismatch: false, ambiguous: false };
    if (list.some(m => m.subject === teacher.subject)) return { mapped: list, suggested: null, mismatch: false, ambiguous: false };
    const tie = list.length > 1 && list[0].classes.length === list[1].classes.length;
    return { mapped: list, suggested: tie ? null : list[0].subject, mismatch: true, ambiguous: tie };
}

// Cambios que propone el mapeo para todos los docentes: [{ id, name, from, to, classes }]
function proposedChanges(teachers, mapping, subjectIds) {
    const mapped = mappedSubjects(mapping, teachers, subjectIds);
    return (teachers || []).map(t => {
        const review = reviewSubject(t, mapped.get(t.id));
        if (!review.suggested) return null;
        const best = review.mapped.find(m => m.subject === review.suggested);
        return { id: t.id, name: [t.first_name, t.last_name].filter(Boolean).join(' ').trim(), from: t.subject || '', to: review.suggested, classes: best.classes };
    }).filter(Boolean);
}

// Excepciones de la capacitación KMK, por correo: { correo: { reason, by, date } }
function setExemption(exemptions, email, exempt, { reason = '', by = '', date = new Date().toISOString() } = {}) {
    const key = String(email || '').trim().toLowerCase();
    const next = { ...(exemptions || {}) };
    if (!key) return next;
    if (exempt) next[key] = { reason: String(reason || '').trim().slice(0, 200), by: String(by || '').trim().toLowerCase(), date };
    else delete next[key];
    return next;
}

module.exports = { mappedSubjects, reviewSubject, proposedChanges, setExemption };
