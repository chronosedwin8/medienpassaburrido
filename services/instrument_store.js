/**
 * instrument_store.js - Preguntas de los retos 1-6 editadas por los docentes
 * (portal docente › "Configura tus Retos del 1 al 6").
 * Se guardan por grado, materia y reto. Si hay una versión editada, los estudiantes de ese grado y
 * materia la ven y se les califica con ella; "Restablecer" vuelve a las preguntas del sistema.
 */

const fs = require('fs');
const path = require('path');
const { EXPLAIN_LABEL } = require('../data_questions');
const { isKmkOfReto, isKmk } = require('../data_kmk_competences');

const STORE_PATH = process.env.CUSTOM_INSTRUMENTS_PATH ||
    path.join(__dirname, '../data/custom_instruments.json');

const LANGS = ['es', 'de', 'en'];
const MAX_QUESTIONS = 20;

// Copia en memoria: la página de cada reto y la calificación la consultan muchas veces.
// Se renueva al guardar o restablecer desde la app (un cambio a mano en el archivo se ve al reiniciar).
let memoryStore = null;

// Ensure directory and file exist
function ensureStore() {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
        fs.writeFileSync(STORE_PATH, JSON.stringify({}), 'utf8');
    }
}

function loadAllCustom() {
    ensureStore();
    try {
        const raw = fs.readFileSync(STORE_PATH, 'utf8');
        return JSON.parse(raw || '{}');
    } catch (e) {
        console.error("Error loading custom instruments store:", e);
        return {};
    }
}

function currentStore() {
    if (!memoryStore) memoryStore = loadAllCustom();
    return memoryStore;
}

/**
 * Gets key for grade, subject, reto
 */
function getKey(grade, subject, retoNum) {
    return `${grade}_${subject}_${retoNum}`;
}

/**
 * Gets custom instrument if saved, or returns null if default should be used
 */
function getCustomInstrument(grade, subject, retoNum) {
    const store = currentStore();
    const key = getKey(grade, subject, retoNum);
    return store[key] || null;
}

// Preguntas editadas de ese grado, materia y reto, o null si se usan las del sistema
function getCustomQuestions(grade, subject, retoNum) {
    const custom = getCustomInstrument(grade, subject, retoNum);
    return custom && Array.isArray(custom.questions) && custom.questions.length ? custom.questions : null;
}

function safeWriteStore(store) {
    const tempPath = `${STORE_PATH}.tmp`;
    try {
        fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), 'utf8');
        fs.renameSync(tempPath, STORE_PATH);
        memoryStore = store;
    } catch (err) {
        console.error("Error writing custom instruments store:", err);
        if (fs.existsSync(tempPath)) {
            try { fs.unlinkSync(tempPath); } catch (_) {}
        }
        throw err;
    }
}

/**
 * Saves custom instrument for a given grade, subject, reto.
 * updatedBy: correo del docente que guardó (se muestra en el editor).
 */
function saveCustomInstrument(grade, subject, retoNum, mode, questions, updatedBy) {
    ensureStore();
    const store = loadAllCustom();
    const key = getKey(grade, subject, retoNum);

    store[key] = {
        mode: mode || 'editable',
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy || '',
        questions: questions || []
    };

    safeWriteStore(store);
    return store[key];
}

/**
 * Resets instrument back to automatic default mode
 */
function resetToDefault(grade, subject, retoNum) {
    ensureStore();
    const store = loadAllCustom();
    const key = getKey(grade, subject, retoNum);
    if (store[key]) {
        delete store[key];
        safeWriteStore(store);
    }
    return true;
}

// Texto en los tres idiomas: los que falten toman el primero escrito. null si está vacío.
function langText(value) {
    if (typeof value === 'string') value = { es: value };
    if (!value || typeof value !== 'object') return null;
    const texts = {};
    LANGS.forEach(lang => { texts[lang] = typeof value[lang] === 'string' ? value[lang].trim() : ''; });
    const fallback = LANGS.map(lang => texts[lang]).find(Boolean);
    if (!fallback) return null;
    LANGS.forEach(lang => { if (!texts[lang]) texts[lang] = fallback; });
    return texts;
}

// Imagen de una opción del Medienpass visual (grado 2): un emoji corto, o una estrella si no hay
function pictureOf(option) {
    const emoji = option && typeof option.emoji === 'string' ? option.emoji.trim() : '';
    return emoji && emoji.length <= 16 && !/[<>&"']/.test(emoji) ? emoji : '⭐';
}

/**
 * Valida y normaliza las preguntas que envía el editor antes de guardarlas.
 * - Cada pregunta: enunciado, al menos 2 opciones, una sola correcta y una subcompetencia KMK
 *   del área del reto.
 * - Conserva los ids de las preguntas existentes (las respuestas guardadas siguen valiendo) y
 *   da ids nuevos a las agregadas. El valor de cada opción es su posición.
 * - En K3-K12 agrega después de cada pregunta el campo de argumento, como las del sistema.
 * - En el grado 2 (Medienpass visual) cada opción lleva su imagen y no hay argumento ni pista.
 * - Reto 0 (K3-K12): es la evaluación (desde la pregunta 10). Cada pregunta lleva quiz: true, sin
 *   campo de argumento; la subcompetencia KMK es opcional y puede ser de cualquier área; la pista
 *   se guarda como explicación (practice_explanation). Conserva los ids del sistema (r0_<materia>_qN)
 *   para que las respuestas ya guardadas se califiquen con la pregunta editada.
 * Devuelve { questions } o { error, index } (error: empty, too_many, label, options, correct, kmk).
 */
function normalizeCustomQuestions(questions, { grade, subject, reto }) {
    const g = Number(grade);
    const n = Number(reto);
    const isReto0 = n === 0;
    const items = (Array.isArray(questions) ? questions : []).filter(q => q && q.type !== 'textarea');
    if (!items.length) return { error: 'empty', index: -1 };
    if (items.length > MAX_QUESTIONS) return { error: 'too_many', index: -1 };

    const prefix = isReto0 ? `r0_${subject}_k${g}_` : `r${n}_${subject}_k${g}_`;
    const systemId = isReto0 ? new RegExp(`^r0_${subject}_q\\d+$`) : null;
    const incomingIds = new Set(items.map(q => q.id));
    const used = new Set();
    let next = 1;
    const out = [];

    for (let i = 0; i < items.length; i++) {
        const q = items[i];
        const label = langText(q.label);
        if (!label) return { error: 'label', index: i };
        const options = (Array.isArray(q.options) ? q.options : [])
            .map(opt => ({ text: langText(opt), correct: !!(opt && opt.correct), emoji: g === 2 ? pictureOf(opt) : null }))
            .filter(opt => opt.text);
        if (options.length < 2) return { error: 'options', index: i };
        if (options.filter(opt => opt.correct).length !== 1) return { error: 'correct', index: i };
        const kmkOk = isReto0 ? (!q.kmk || isKmk(q.kmk)) : isKmkOfReto(q.kmk, n);
        if (!kmkOk) return { error: 'kmk', index: i };

        const ownId = typeof q.id === 'string' && (q.id.startsWith(prefix) || (systemId && systemId.test(q.id)));
        let id = (ownId && /^[a-z0-9_]+$/.test(q.id) && !q.id.endsWith('_explain') && !used.has(q.id)) ? q.id : null;
        while (!id) {
            const candidate = `${prefix}c${next++}`;
            if (!used.has(candidate) && !incomingIds.has(candidate)) id = candidate;
        }
        used.add(id);

        const item = {
            id,
            label,
            type: 'radio_group',
            kmk: q.kmk,
            options: options.map((opt, idx) => ({ ...opt.text, ...(g === 2 ? { emoji: opt.emoji } : {}), correct: opt.correct, val: idx }))
        };
        if (isReto0) {
            // Evaluación del Reto 0: cuenta para ganarlo; la pista es la explicación de la pregunta
            item.quiz = true;
            if (!q.kmk) delete item.kmk;
            const explanation = langText(q.hint) || langText(q.practice_explanation);
            if (explanation) item.practice_explanation = explanation;
            out.push(item);
            continue;
        }
        if (g === 2) item.visual = true;
        const hint = g === 2 ? null : langText(q.hint);
        if (hint) item.hint = hint;
        out.push(item);
        if (g !== 2) out.push({ id: `${id}_explain`, label: EXPLAIN_LABEL, type: 'textarea' });
    }
    return { questions: out };
}

module.exports = {
    getCustomInstrument,
    getCustomQuestions,
    saveCustomInstrument,
    resetToDefault,
    loadAllCustom,
    normalizeCustomQuestions
};
