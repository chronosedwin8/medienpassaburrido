// ¿Ganó el estudiante el reto? Se calcula en el servidor con lo guardado, con las mismas reglas
// que muestra la página (views/activity.ejs), para que nadie pueda saltarse la evaluación.
// - Reto 0 (actividad "profile"): aciertos en la evaluación de la materia (10 preguntas).
// - Retos 1-6 (retoN_materia): por pregunta, 3 estrellas si la respuesta es correcta y 2 más si
//   el argumento es coherente; si es incorrecta, 3 con argumento coherente y 0 sin él. Máx. 5.
//   En la versión visual (preguntas visual: true) cuentan los aciertos, porque no se escribe.
// Se gana con el 80 % o más. Solo entonces se acepta el correo institucional del estudiante.

const RETO_WIN_PCT = 80;
const INSTITUTIONAL_DOMAIN = 'colegioaleman.edu.co';
const INSTITUTIONAL_EMAIL_RE = /^[a-z0-9._%+-]+@colegioaleman\.edu\.co$/;

// Igual que checkCoherence() en views/activity.ejs
function checkCoherence(text) {
    const trimmed = String(text || '').trim();
    if (trimmed.length < 40) return false;
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 8) return false;
    const uniqueChars = new Set(trimmed.toLowerCase().replace(/\s/g, ''));
    if (uniqueChars.size < 5) return false;
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (uniqueWords.size < words.length / 2) return false;
    return true;
}

// 0 para el Reto 0, N para "retoN_materia"; null si la actividad no es un reto
function retoNumber(activityId) {
    if (activityId === 'profile') return 0;
    const match = /^reto([1-6])_[a-z_]+$/.exec(activityId || '');
    return match ? Number(match[1]) : null;
}

const hasCorrectOption = item => Array.isArray(item.options) && item.options.some(o => o.correct);
const optionValue = (opt, idx) => String(opt.val !== undefined ? opt.val : idx);

// El formulario guarda la opción elegida como data[item.id] = valor de la opción
function answerState(item, data) {
    const value = data[item.id];
    if (value === undefined || value === null || value === '') return 'blank';
    const chosen = item.options.findIndex((opt, idx) => optionValue(opt, idx) === String(value));
    if (chosen < 0) return 'blank';
    return item.options[chosen].correct ? 'correct' : 'wrong';
}

function summary(kind, score, max) {
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    return { kind, score, max, pct, won: pct >= RETO_WIN_PCT };
}

const countHits = (questions, answers) => questions.filter(q => answerState(q, answers) === 'correct').length;

// activity: el reto ya resuelto para la clase del estudiante (evidence según el grado).
// Reto 0: cuenta la evaluación de la materia (preguntas quiz: true). options.legacyQuestions son
// las 28 preguntas de la evaluación anterior, igual para todas las materias: quien la aprobó con
// el 80 % conserva el Reto 0 ganado en todas sus materias (legacy: true).
function retoResult(activity, data, options = {}) {
    if (!activity || retoNumber(activity.id) === null) return null;
    const answers = data || {};
    const evidence = activity.evidence || [];

    if (activity.id === 'profile') {
        const questions = evidence.filter(item => item.quiz && hasCorrectOption(item));
        if (!questions.length) return null;
        const result = summary('hits', countHits(questions, answers), questions.length);
        const legacy = (options.legacyQuestions || []).filter(hasCorrectOption);
        if (!result.won && legacy.length) {
            const old = summary('hits', countHits(legacy, answers), legacy.length);
            if (old.won) return { ...old, legacy: true };
        }
        return result;
    }

    const questions = evidence.filter(item => item.type === 'radio_group' && hasCorrectOption(item));
    if (!questions.length) return null;

    // Versión visual (Prekínder, Kinder, K1 y K2): no hay argumento que escribir, cuentan los aciertos
    if (questions.every(q => q.visual)) return summary('hits', countHits(questions, answers), questions.length);

    let stars = 0;
    questions.forEach(q => {
        const state = answerState(q, answers);
        const coherent = checkCoherence(answers[q.id + '_explain']);
        if (state === 'correct') stars += coherent ? 5 : 3;
        else if (state === 'wrong' && coherent) stars += 3;
    });
    return summary('stars', stars, questions.length * 5);
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function isInstitutionalEmail(value) {
    return INSTITUTIONAL_EMAIL_RE.test(normalizeEmail(value));
}

module.exports = {
    RETO_WIN_PCT,
    INSTITUTIONAL_DOMAIN,
    checkCoherence,
    retoNumber,
    retoResult,
    normalizeEmail,
    isInstitutionalEmail
};
