/**
 * ai_service.js - Service for AI-Assisted Instrument Generation (Google Gemini)
 *
 * Reestructura las preguntas existentes de un Reto siguiendo LAS INSTRUCCIONES
 * que el docente escribe en la caja de prompt. El prompt del docente es la
 * instrucción principal, no una simple etiqueta de "tema".
 *
 * Requiere GEMINI_API_KEY (clave "AIza..." de Google AI Studio) en .env
 */

const LANGS = ['es', 'de', 'en'];

// Modelos a intentar, en orden. Configurable con GEMINI_MODEL en .env
const DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

// Cuántas preguntas se envían por request (evita respuestas truncadas)
const BATCH_SIZE = parseInt(process.env.GEMINI_BATCH_SIZE, 10) || 6;

const DEFAULT_TOPICS = {
    0: "Diagnóstico Inicial de Perfil Digital y Hábitos Tecnológicos",
    1: "Búsqueda, Filtrado y Procesamiento de Información Digital",
    2: "Comunicación, Trabajo Colaborativo y Netiqueta Escolar",
    3: "Producción Multimedia, Presentaciones y Derechos de Autor",
    4: "Ciberseguridad, Protección de Datos y Privacidad Digital",
    5: "Resolución de Problemas Técnicos y Pensamiento Algorítmico",
    6: "Análisis Crítico de Medios, Reflexión y Desinformación"
};

/**
 * Lee la API Key de Google. Solo se aceptan claves de API ("AIza...").
 * Los tokens OAuth de corta duración (AQ.*) no sirven para este endpoint.
 */
function getApiKey() {
    const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_TOKEN || '').trim();
    return key;
}

function getModels() {
    const configured = (process.env.GEMINI_MODEL || '').trim();
    if (configured) return [configured, ...DEFAULT_MODELS.filter(m => m !== configured)];
    return DEFAULT_MODELS;
}

/**
 * Estado de la integración con Google (para diagnóstico desde el servidor/UI).
 */
function getAIStatus() {
    const key = getApiKey();
    if (!key) {
        return {
            configured: false,
            reason: 'missing_key',
            message: 'Falta GEMINI_API_KEY en el archivo .env. Genera una clave en https://aistudio.google.com/apikey y agrégala como GEMINI_API_KEY=AIza...'
        };
    }
    if (!key.startsWith('AIza')) {
        return {
            configured: false,
            reason: 'invalid_key_format',
            message: 'La clave configurada no es una API Key de Google (debe empezar por "AIza"). Los tokens OAuth temporales (AQ...) no funcionan con generativelanguage.googleapis.com.'
        };
    }
    return { configured: true, model: getModels()[0] };
}

/* ────────────────────────────────────────────────────────────
   Utilidades de texto multilingüe
   ──────────────────────────────────────────────────────────── */

function textOf(value, lang = 'es') {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value[lang] || value.es || value.de || value.en || '';
    return String(value);
}

function toMultiLang(value, fallbackSource) {
    const out = {};
    LANGS.forEach(l => {
        const candidate = textOf(value, l);
        out[l] = (candidate && String(candidate).trim())
            ? String(candidate).trim()
            : textOf(fallbackSource, l);
    });
    return out;
}

/* ────────────────────────────────────────────────────────────
   Construcción del prompt
   ──────────────────────────────────────────────────────────── */

/** Representación compacta de una pregunta para enviar al modelo. */
function serializeQuestion(q, index) {
    return {
        index,
        id: q.id,
        type: q.type || (Array.isArray(q.options) && q.options.length ? 'radio_group' : 'textarea'),
        label: { es: textOf(q.label, 'es'), de: textOf(q.label, 'de'), en: textOf(q.label, 'en') },
        hint: { es: textOf(q.hint, 'es'), de: textOf(q.hint, 'de'), en: textOf(q.hint, 'en') },
        options: Array.isArray(q.options)
            ? q.options.map(o => ({
                es: textOf(o, 'es'), de: textOf(o, 'de'), en: textOf(o, 'en'),
                correct: o.correct === true
            }))
            : []
    };
}

function buildPrompt({ grade, subject, retoNum, topic, userPrompt, batch }) {
    const hasInstructions = !!(userPrompt && userPrompt.trim());
    const instructionsBlock = hasInstructions
        ? `INSTRUCCIONES DEL DOCENTE (MÁXIMA PRIORIDAD — debes obedecerlas literalmente en cada pregunta):
"""
${userPrompt.trim()}
"""`
        : `El docente no escribió instrucciones específicas. Mejora la claridad pedagógica y la contextualización de cada pregunta manteniendo el tema: "${topic}".`;

    return `Eres un experto pedagógico en competencias digitales KMK del Colegio Alemán Barranquilla.

CONTEXTO
- Reto ${retoNum}: ${topic}
- Grado: Klasse ${grade}
- Asignatura: ${subject}

${instructionsBlock}

TAREA
Reescribe/reestructura las ${batch.length} preguntas que se listan a continuación aplicando las instrucciones del docente.
Reglas obligatorias:
1. Devuelve EXACTAMENTE ${batch.length} preguntas, en el mismo orden, conservando el mismo "id" y el mismo "type" de cada una.
2. Cada "label" y "hint" debe venir en los tres idiomas: es (español), de (alemán), en (inglés). Traducciones reales y coherentes entre sí.
3. Si la pregunta original tiene opciones, devuelve la misma cantidad de opciones, cada una en los tres idiomas, con el prefijo "a) ", "b) ", "c) "... y EXACTAMENTE UNA con "correct": true.
4. Si la pregunta original no tiene opciones (respuesta abierta), devuelve "options": [].
5. Adapta el vocabulario y la complejidad al nivel de Klasse ${grade}.
6. Las preguntas deben seguir evaluando la competencia digital del Reto ${retoNum}; no cambies el objetivo pedagógico, cambia el enfoque/redacción según las instrucciones.
7. No copies literalmente el texto original: debe notarse la reescritura solicitada.

PREGUNTAS ORIGINALES (JSON):
${JSON.stringify(batch, null, 1)}

FORMATO DE SALIDA
Devuelve ÚNICAMENTE un arreglo JSON válido (sin markdown, sin explicaciones) con esta estructura:
[
  {
    "id": "<mismo id original>",
    "type": "<mismo type original>",
    "label": { "es": "...", "de": "...", "en": "..." },
    "hint": { "es": "...", "de": "...", "en": "..." },
    "options": [
      { "es": "a) ...", "de": "a) ...", "en": "a) ...", "correct": true },
      { "es": "b) ...", "de": "b) ...", "en": "b) ...", "correct": false }
    ]
  }
]`;
}

/* ────────────────────────────────────────────────────────────
   Llamada a Gemini
   ──────────────────────────────────────────────────────────── */

function extractJsonArray(rawText) {
    let text = String(rawText || '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    // Recorta cualquier texto fuera del arreglo JSON
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
        text = text.slice(start, end + 1);
    }
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('La respuesta de la IA no es un arreglo JSON.');
    return parsed;
}

async function callGemini(promptText, apiKey) {
    const models = getModels();
    let lastError = null;

    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const generationConfig = {
            temperature: 0.9,
            maxOutputTokens: 16384,
            responseMimeType: 'application/json'
        };
        // Desactiva "thinking" en Flash 2.5 para no consumir el presupuesto de salida
        if (model.includes('2.5-flash')) {
            generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: promptText }] }],
                    generationConfig
                })
            });

            if (!response.ok) {
                const bodyText = await response.text().catch(() => '');
                lastError = new Error(`Gemini (${model}) respondió ${response.status}: ${bodyText.slice(0, 300)}`);
                // 404 = modelo inexistente para esta clave → probar el siguiente
                if (response.status === 404) continue;
                // 400/403 = clave inválida o sin permisos → no tiene sentido reintentar
                if (response.status === 400 || response.status === 403) throw lastError;
                continue;
            }

            const data = await response.json();
            const candidate = data.candidates && data.candidates[0];
            if (!candidate) {
                const blockReason = data.promptFeedback && data.promptFeedback.blockReason;
                lastError = new Error(blockReason
                    ? `Gemini bloqueó la solicitud (${blockReason}). Revisa el texto del prompt.`
                    : 'Gemini no devolvió candidatos.');
                continue;
            }
            if (candidate.finishReason === 'MAX_TOKENS') {
                lastError = new Error('La respuesta de Gemini se truncó (MAX_TOKENS). Reduce GEMINI_BATCH_SIZE.');
                continue;
            }

            const parts = (candidate.content && candidate.content.parts) || [];
            const rawText = parts.map(p => p.text || '').join('');
            if (!rawText.trim()) {
                lastError = new Error('Gemini devolvió una respuesta vacía.');
                continue;
            }

            return { items: extractJsonArray(rawText), model };
        } catch (err) {
            lastError = err;
            if (/respondió (400|403)/.test(err.message)) throw err;
        }
    }

    throw lastError || new Error('No fue posible contactar a Gemini.');
}

/* ────────────────────────────────────────────────────────────
   Normalización / validación de la salida
   ──────────────────────────────────────────────────────────── */

/**
 * Fusiona la pregunta generada con la original para garantizar que el resultado
 * siempre sea renderizable (ids, tipo, idiomas y respuesta correcta estables).
 */
function normalizeQuestion(aiQ, baseQ, idx) {
    const base = baseQ || {};
    const ai = (aiQ && typeof aiQ === 'object') ? aiQ : {};

    const normalized = {
        ...base,
        id: base.id || ai.id || `ai_q${idx + 1}_${Date.now()}`,
        type: base.type || ai.type || 'radio_group',
        label: toMultiLang(ai.label, base.label),
        hint: toMultiLang(ai.hint, base.hint)
    };

    const baseOptions = Array.isArray(base.options) ? base.options : [];
    const aiOptions = Array.isArray(ai.options) ? ai.options : [];

    if (baseOptions.length === 0 && aiOptions.length === 0) {
        delete normalized.options;
        return normalized;
    }

    // Se conserva la cantidad de opciones original cuando existe
    const count = baseOptions.length || aiOptions.length;
    const options = [];
    for (let i = 0; i < count; i++) {
        const baseOpt = baseOptions[i];
        const aiOpt = aiOptions[i];
        const merged = { ...(baseOpt || {}), ...toMultiLang(aiOpt, baseOpt) };
        merged.correct = aiOpt ? aiOpt.correct === true : (baseOpt && baseOpt.correct === true);
        options.push(merged);
    }

    // Debe existir exactamente una opción correcta
    const correctIdxs = options.map((o, i) => o.correct ? i : -1).filter(i => i !== -1);
    if (correctIdxs.length !== 1) {
        const baseCorrect = baseOptions.findIndex(o => o && o.correct === true);
        const keep = correctIdxs.length > 1
            ? correctIdxs[0]
            : (baseCorrect !== -1 ? baseCorrect : 0);
        options.forEach((o, i) => { o.correct = (i === keep); });
    }

    normalized.options = options;
    return normalized;
}

/* ────────────────────────────────────────────────────────────
   API pública
   ──────────────────────────────────────────────────────────── */

/**
 * Genera / reestructura el instrumento de un Reto.
 * @param {Object} params { grade, subject, retoNum, prompt, lang, currentQuestions }
 * @returns {Promise<{questions: Array, source: string, model?: string, warning?: string}>}
 */
async function generateInstrumentAI(params) {
    const {
        grade = 5,
        subject = 'aleman',
        retoNum = 1,
        prompt = '',
        currentQuestions = []
    } = params || {};

    const topic = DEFAULT_TOPICS[retoNum] || "Competencias Digitales KMK";
    const baseQuestions = Array.isArray(currentQuestions) ? currentQuestions.filter(Boolean) : [];

    const status = getAIStatus();
    if (!status.configured) {
        return {
            questions: generateSmartAIFallback(grade, subject, retoNum, prompt.trim() || topic, baseQuestions),
            source: 'fallback',
            warning: status.message
        };
    }

    if (baseQuestions.length === 0) {
        return {
            questions: generateSmartAIFallback(grade, subject, retoNum, prompt.trim() || topic, baseQuestions),
            source: 'fallback',
            warning: 'No se encontraron preguntas base para este Reto/Grado/Asignatura.'
        };
    }

    const apiKey = getApiKey();
    const results = new Array(baseQuestions.length).fill(null);
    const failures = [];
    let usedModel = null;

    for (let start = 0; start < baseQuestions.length; start += BATCH_SIZE) {
        const slice = baseQuestions.slice(start, start + BATCH_SIZE);
        const batch = slice.map((q, i) => serializeQuestion(q, start + i));
        const promptText = buildPrompt({ grade, subject, retoNum, topic, userPrompt: prompt, batch });

        try {
            const { items, model } = await callGemini(promptText, apiKey);
            usedModel = model;
            slice.forEach((baseQ, i) => {
                const aiQ = items[i] || items.find(x => x && x.id === baseQ.id);
                results[start + i] = normalizeQuestion(aiQ, baseQ, start + i);
            });
        } catch (err) {
            console.error(`[ai_service] Falló el lote ${start / BATCH_SIZE + 1}:`, err.message);
            failures.push(err.message);
            // El lote conserva sus preguntas originales para no perder contenido
            slice.forEach((baseQ, i) => { results[start + i] = JSON.parse(JSON.stringify(baseQ)); });
        }
    }

    if (failures.length && failures.length * BATCH_SIZE >= baseQuestions.length) {
        // Todos los lotes fallaron
        return {
            questions: generateSmartAIFallback(grade, subject, retoNum, prompt.trim() || topic, baseQuestions),
            source: 'fallback',
            warning: failures[0]
        };
    }

    return {
        questions: results,
        source: 'gemini',
        model: usedModel,
        warning: failures.length ? `Algunas preguntas no pudieron reescribirse: ${failures[0]}` : undefined
    };
}

/**
 * Fallback local (sin IA): mantiene las preguntas utilizables y marca el enfoque
 * solicitado. Se usa solo cuando Gemini no está disponible.
 */
function generateSmartAIFallback(grade, subject, retoNum, topic, currentQuestions) {
    const baseQuestions = Array.isArray(currentQuestions) && currentQuestions.length > 0 ? currentQuestions : [];

    if (baseQuestions.length > 0) {
        return baseQuestions.map((q, idx) => {
            const cloned = JSON.parse(JSON.stringify(q));
            if (cloned.type === 'label') return cloned;

            const promptTag = topic ? ` [IA: ${topic.length > 40 ? topic.substring(0, 37) + '...' : topic}]` : '';
            if (typeof cloned.label === 'object' && cloned.label !== null) {
                cloned.label.es = (cloned.label.es || `Pregunta ${idx + 1}`) + promptTag;
                cloned.label.de = (cloned.label.de || `Frage ${idx + 1}`) + promptTag;
                cloned.label.en = (cloned.label.en || `Question ${idx + 1}`) + promptTag;
            } else if (typeof cloned.label === 'string') {
                cloned.label = cloned.label + promptTag;
            }

            if (!cloned.hint || typeof cloned.hint !== 'object') {
                cloned.hint = { es: '', de: '', en: '' };
            }
            cloned.hint.es = `Adaptado con IA para ${String(subject).toUpperCase()} (Klasse ${grade}): ${topic}`;
            cloned.hint.de = `Mit KI angepasst für ${String(subject).toUpperCase()} (Klasse ${grade}): ${topic}`;
            cloned.hint.en = `AI adapted for ${String(subject).toUpperCase()} (Grade ${grade}): ${topic}`;

            return cloned;
        });
    }

    return [
        {
            id: `ai_q1_${Date.now()}`,
            type: "radio_group",
            label: {
                es: `[IA Reto ${retoNum}] En ${subject} (Klasse ${grade}), ¿cuál es la práctica recomendada sobre "${topic}"?`,
                de: `[KI Herausforderung ${retoNum}] In ${subject} (Klasse ${grade}), was ist die empfohlene Praxis für "${topic}"?`,
                en: `[AI Challenge ${retoNum}] In ${subject} (Grade ${grade}), what is the recommended practice for "${topic}"?`
            },
            hint: {
                es: `Aplica las normas de seguridad y el marco de competencias digitales KMK.`,
                de: `Wende Sicherheitsregeln und den KMK-Digitalrahmen an.`,
                en: `Apply safety rules and the KMK digital competency framework.`
            },
            options: [
                {
                    es: `a) Aplicar criterios de validación, citación de fuentes y verificación oficial.`,
                    de: `a) Validierungskriterien und Quellenangaben anwenden und offizielle Herkunft prüfen.`,
                    en: `a) Apply validation criteria, cite sources, and verify official origin.`,
                    correct: true
                },
                {
                    es: `b) Copiar directamente información sin verificar autoría ni validez.`,
                    de: `b) Informationen direkt kopieren, ohne Urheberschaft oder Gültigkeit zu prüfen.`,
                    en: `b) Copy information directly without checking authorship or validity.`,
                    correct: false
                }
            ]
        }
    ];
}

module.exports = {
    generateInstrumentAI,
    getAIStatus
};
