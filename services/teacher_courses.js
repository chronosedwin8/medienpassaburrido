// Informe "Docentes y cursos" (Indicadores): por curso (clase + materia), avance en los retos 0-6 y
// si ya se empezó a aplicar el Medienpass; por docente, su capacitación KMK y sus cursos.
//
// - El docente de un curso sale del mapeo de profesores (Administración › Mapeo). Si el mapeo no
//   tiene esa clase y materia, se usa el docente que más eligieron los estudiantes en el Reto 0,
//   solo si su nombre coincide con un docente registrado.
// - Un curso existe si la materia está habilitada para la clase (Configuración), si el mapeo le
//   asigna docente o si algún estudiante ya empezó un reto de esa materia.
// - "En desarrollo": al menos un estudiante empezó un reto (0 a 6) de esa materia.
//   "Pendiente": nadie ha empezado; falta aplicar el Medienpass.

const { classInfo } = require('./class_levels');

const RETOS = [0, 1, 2, 3, 4, 5, 6];
const STATUS = { ACTIVE: 'en_desarrollo', PENDING: 'pendiente' };

const normalizeName = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Clave de clase de una clave del mapeo ("KLASSE 6 (K6A)") o de un estudiante ("K6A", "6A")
function canonicalClass(name) {
    const inParens = /\(([^)]+)\)/.exec(String(name || ''));
    const info = classInfo(inParens ? inParens[1] : name);
    return info ? info.key : null;
}

// Clave con la que el mapeo guarda una clase nueva: "KLASSE 7 (K7A)"; preescolar queda igual ("PK1")
function mappingKeyFor(classKey) {
    const m = /^K(\d{1,2})([A-Z])$/.exec(classKey || '');
    return m ? `KLASSE ${Number(m[1])} (${classKey})` : classKey;
}

const fullName = t => [t.first_name, t.last_name].filter(Boolean).join(' ').trim();

// Una persona por código dentro de la clase (como en los indicadores): si "5A" y "K5A" tienen el mismo
// código es el mismo estudiante, y sus avances se suman.
function peopleOf(students) {
    const people = new Map();
    students.forEach(st => {
        const key = String(st.student_code || '').trim() || `id:${st.id}`;
        if (!people.has(key)) people.set(key, []);
        people.get(key).push(st);
    });
    return [...people.values()];
}

function mergeStatuses(lists) {
    return RETOS.map(n => ({
        n,
        won: lists.some(list => list[n] && list[n].won),
        started: lists.some(list => list[n] && list[n].started)
    }));
}

// Busca un docente registrado por nombre. Nombre completo igual, o todas las palabras escritas
// dentro de su nombre; si hay varios, desempata la materia. Sin coincidencia única: null.
function teacherMatcher(teachers) {
    const known = (teachers || []).map(t => {
        const name = normalizeName(fullName(t));
        return { teacher: t, name, words: name.split(' ').filter(Boolean) };
    }).filter(k => k.name);
    return (raw, subject) => {
        const name = normalizeName(raw);
        if (!name) return null;
        const exact = known.filter(k => k.name === name);
        if (exact.length === 1) return exact[0].teacher;
        const parts = name.split(' ');
        const candidates = known.filter(k => parts.every(p => k.words.includes(p)));
        if (candidates.length === 1) return candidates[0].teacher;
        const sameSubject = candidates.filter(k => k.teacher.subject === subject);
        return sameSubject.length === 1 ? sameSubject[0].teacher : null;
    };
}

/**
 * @param {object} input
 * @param {Array}  input.students        [{ id, class_name }]
 * @param {Array}  input.teachers        [{ id, first_name, last_name, email, subject, training_completed, training_score, training_date }]
 * @param {object} input.mapping         { "KLASSE 6 (K6A)": { aleman: "NOMBRE" } }
 * @param {object} input.subjectConfig   { K6A: { aleman: true } }
 * @param {Array}  input.subjects        ids de materias que cuentan (las activas)
 * @param {Map}    input.reto0Teachers   id de estudiante -> { materia: nombre escrito en el Reto 0 }
 * @param {Function} input.retoStatus    (estudiante, materia) -> [{ n, won, started }] para los retos 0-6
 * @param {Function} [input.segmentsOf]  (docente) -> ['primaria', ...]
 */
function buildTeacherCourses({ students, teachers, mapping, subjectConfig, subjects, reto0Teachers, retoStatus, segmentsOf }) {
    const subjectIds = subjects || [];
    const match = teacherMatcher(teachers);
    const segmentsFor = segmentsOf || (() => []);

    // Estudiantes por clase
    const classes = new Map();
    (students || []).forEach(st => {
        const key = canonicalClass(st.class_name);
        if (!key) return;
        if (!classes.has(key)) classes.set(key, { className: key, segment: classInfo(key).segment, students: [] });
        classes.get(key).students.push(st);
    });
    const ensureClass = key => {
        if (!classes.has(key)) classes.set(key, { className: key, segment: classInfo(key).segment, students: [] });
        return classes.get(key);
    };

    // Mapeo por clase
    const mappingByClass = new Map();
    Object.entries(mapping || {}).forEach(([rawKey, row]) => {
        const key = canonicalClass(rawKey);
        if (!key || !row || typeof row !== 'object') return;
        ensureClass(key);
        mappingByClass.set(key, { ...(mappingByClass.get(key) || {}), ...row });
    });
    Object.keys(subjectConfig || {}).forEach(raw => { const key = canonicalClass(raw); if (key) ensureClass(key); });

    const enabledFor = key => {
        const entry = Object.entries(subjectConfig || {}).find(([raw]) => canonicalClass(raw) === key);
        return entry ? entry[1] || {} : {};
    };

    // Docentes (los registrados, más los nombres del mapeo que no coinciden con ninguno)
    const teacherRows = new Map();
    const teacherRow = t => {
        if (!teacherRows.has(t.id)) {
            teacherRows.set(t.id, {
                id: t.id, name: fullName(t) || t.email || '—', email: t.email || '', subject: t.subject || '',
                registered: true, trained: !!t.training_completed, exempt: !!t.exempt,
                score: t.training_score == null ? null : t.training_score, date: t.training_date || null,
                segments: segmentsFor(t), courses: []
            });
        }
        return teacherRows.get(t.id);
    };
    (teachers || []).forEach(teacherRow);
    const unregistered = (name, subject) => {
        const id = 'mapeo:' + normalizeName(name);
        if (!teacherRows.has(id)) {
            teacherRows.set(id, { id, name: normalizeName(name), email: '', subject, registered: false, trained: false,
                score: null, date: null, segments: [], courses: [] });
        }
        return teacherRows.get(id);
    };

    const courses = [];
    [...classes.values()].sort((a, b) => a.className.localeCompare(b.className, 'es', { numeric: true })).forEach(cls => {
        const enabled = enabledFor(cls.className);
        const mapped = mappingByClass.get(cls.className) || {};
        const people = peopleOf(cls.students);
        subjectIds.forEach(subject => {
            const statuses = people.map(records => mergeStatuses(records.map(st => retoStatus(st, subject))));
            const retos = RETOS.map(n => ({
                n,
                won: statuses.filter(list => list[n] && list[n].won).length,
                inProgress: statuses.filter(list => list[n] && list[n].started && !list[n].won).length
            }));
            const startedStudents = statuses.filter(list => list.some(r => r.started)).length;
            const isEnabled = enabled[subject] === true;
            if (!isEnabled && !mapped[subject] && !startedStudents) return;

            // Docente: el mapeo manda; si no, el más elegido en el Reto 0
            let teacher = null;
            let source = null;
            let mentions = 0;
            if (mapped[subject]) {
                const found = match(mapped[subject], subject);
                teacher = found ? teacherRow(found) : unregistered(mapped[subject], subject);
                source = 'mapeo';
            } else if (reto0Teachers) {
                const counts = new Map();
                people.forEach(records => {
                    const chosen = records.map(st => (reto0Teachers.get(st.id) || {})[subject]).find(Boolean);
                    const found = chosen ? match(chosen, subject) : null;
                    if (found) counts.set(found.id, (counts.get(found.id) || 0) + 1);
                });
                const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
                if (best) {
                    teacher = teacherRows.get(best[0]);
                    source = 'reto0';
                    mentions = best[1];
                }
            }

            const course = {
                key: `${cls.className}|${subject}`,
                className: cls.className,
                segment: cls.segment,
                subject,
                enabled: isEnabled,
                students: people.length,
                startedStudents,
                retos,
                status: startedStudents ? STATUS.ACTIVE : STATUS.PENDING,
                teacherId: teacher ? teacher.id : null,
                teacherName: teacher ? teacher.name : '',
                teacherTrained: teacher ? teacher.trained : null,
                teacherExempt: teacher ? !!teacher.exempt : false,
                teacherSubject: teacher && teacher.registered ? teacher.subject : '', // para avisar si no coincide
                source,
                mentions
            };
            courses.push(course);
            if (teacher) teacher.courses.push(course.key);
        });
    });

    const byKey = new Map(courses.map(c => [c.key, c]));
    const teachersOut = [...teacherRows.values()].map(t => ({
        ...t,
        coursesActive: t.courses.filter(k => byKey.get(k).status === STATUS.ACTIVE).length,
        coursesPending: t.courses.filter(k => byKey.get(k).status === STATUS.PENDING).length
    })).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

    return {
        courses,
        teachers: teachersOut,
        summary: {
            teachers: teachersOut.filter(t => t.registered).length,
            untrained: teachersOut.filter(t => t.registered && !t.trained && !t.exempt).length, // los exentos no cuentan
            exempt: teachersOut.filter(t => t.exempt).length,
            courses: courses.length,
            active: courses.filter(c => c.status === STATUS.ACTIVE).length,
            pending: courses.filter(c => c.status === STATUS.PENDING).length,
            withoutTeacher: courses.filter(c => !c.teacherId).length,
            mappedClasses: mappingByClass.size,
            classes: classes.size
        }
    };
}

module.exports = { STATUS, RETOS, buildTeacherCourses, teacherMatcher, canonicalClass, mappingKeyFor, normalizeName };
