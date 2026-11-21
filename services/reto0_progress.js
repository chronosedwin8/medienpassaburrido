// Avance del Reto 0 («Este soy yo») en una materia: los 5 paneles con lo guardado en "profile".
//   1. Avatar elegido (profile_photo).
//   2. Datos personales (nombre) y las 4 preguntas de la materia (reto0_<materia>_q1..q4).
//   3. Profesores guardados con su botón (r0_teachers); en registros anteriores, algún profesor escrito.
//   4. Misión: las tarjetas exploradas se guardan en r0m_<materia> ({ seen: [...], total }). Cuenta con
//      todas exploradas o con la evaluación ya presentada.
//   5. Evaluación ganada (la decide reto_result.js; se recibe en `won`).
// Lo usan los botones 1 a 5 y la barra del Reto 0, y el botón del Reto 0 en el inicio.

const filled = v => v !== undefined && v !== null && v !== false && String(v).trim() !== '';

function missionOf(data, subject) {
    const raw = data && data['r0m_' + subject];
    if (!raw) return { seen: [], total: 0 };
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) return { seen: parsed.map(String), total: 0 };
        return { seen: Array.isArray(parsed.seen) ? parsed.seen.map(String) : [], total: Number(parsed.total) || 0 };
    } catch (e) {
        return { seen: [], total: 0 };
    }
}

function reto0ProgressBySubject(data, subject, { won = false } = {}) {
    const d = data || {};
    const answered = prefix => Object.keys(d).some(k => k.startsWith(prefix) && filled(d[k]));
    const mission = missionOf(d, subject);
    const subjectQuestions = [1, 2, 3, 4].every(n => filled(d[`reto0_${subject}_q${n}`]));
    const evaluationStarted = answered(`r0_${subject}_q`) || answered(`r0v_${subject}_`);
    const panels = [
        filled(d.profile_photo),
        filled(d.name) && subjectQuestions,
        filled(d.r0_teachers) || Object.keys(d).some(k => k.startsWith('teacher_') && filled(d[k])),
        (mission.total > 0 && mission.seen.length >= mission.total) || evaluationStarted || !!won,
        !!won
    ];
    const done = panels.filter(Boolean).length;
    return { panels, done, total: 5, pct: Math.round((done / 5) * 100), mission };
}

module.exports = { reto0ProgressBySubject, missionOf };
