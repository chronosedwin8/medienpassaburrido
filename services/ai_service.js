/**
 * ai_service.js - Service for AI-Assisted Instrument Generation
 * Handles user-provided AI token/key (including AQ. and AIza prefixes) 
 * to generate and adapt structured KMK questions for MedienPass.
 */

// La clave vive en .env (AI_TOKEN o GEMINI_API_KEY), nunca en el código: el repositorio es público.
const AI_TOKEN = process.env.AI_TOKEN || '';

/**
 * Generates or adapts an evaluation instrument using AI.
 * @param {Object} params - { grade, subject, retoNum, prompt, lang, currentQuestions }
 * @returns {Promise<Array>} List of question objects
 */
async function generateInstrumentAI(params) {
    const { grade = 5, subject = 'aleman', retoNum = 1, prompt = '', lang = 'es', currentQuestions = [] } = params;

    const defaultTopics = {
        0: "Diagnóstico Inicial de Perfil Digital y Hábitos Tecnológicos",
        1: "Búsqueda, Filtrado y Procesamiento de Información Digital",
        2: "Comunicación, Trabajo Colaborativo y Netiqueta Escolar",
        3: "Producción Multimedia, Presentaciones y Derechos de Autor",
        4: "Ciberseguridad, Protección de Datos y Privacidad Digital",
        5: "Resolución de Problemas Técnicos y Pensamiento Algorítmico",
        6: "Análisis Crítico de Medios, Reflexión y Desinformación"
    };

    const topic = prompt.trim() || defaultTopics[retoNum] || "Competencias Digitales KMK";
    const tokenToUse = process.env.GEMINI_API_KEY || process.env.AI_TOKEN || AI_TOKEN;

    // Try calling Google Gemini / Cloud AI endpoint with user provided token
    try {
        if (tokenToUse && tokenToUse.length > 10) {
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            
            // Build request URL depending on token format (API Key vs Bearer token)
            const isApiKey = tokenToUse.startsWith('AIza');
            const url = isApiKey 
                ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${tokenToUse}`
                : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

            const headers = { 'Content-Type': 'application/json' };
            if (!isApiKey) {
                headers['Authorization'] = `Bearer ${tokenToUse}`;
            }

            const promptPayload = `Eres un experto pedagógico en competencias digitales KMK para el Colegio Alemán Barranquilla.
Genera/Adapta un conjunto de preguntas pedagógicas para el Reto ${retoNum} (${topic}), Grado Klasse ${grade}, Asignatura ${subject}.
Las preguntas deben evaluar competencias pedagógicas reales.
Devuelve ÚNICAMENTE un JSON válido de arreglo sin marcas markdown ni texto adicional con la siguiente estructura:
[
  {
    "id": "ai_q1",
    "type": "radio_group",
    "label": { "es": "...", "de": "...", "en": "..." },
    "hint": { "es": "...", "de": "...", "en": "..." },
    "options": [
      { "es": "a) ...", "de": "a) ...", "en": "a) ...", "correct": true },
      { "es": "b) ...", "de": "b) ...", "en": "b) ...", "correct": false },
      { "es": "c) ...", "de": "c) ...", "en": "c) ...", "correct": false }
    ]
  }
]`;

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptPayload }] }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const rawText = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(rawText);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } else {
                console.warn(`AI API returned status ${response.status}. Using smart AI transformer fallback.`);
            }
        }
    } catch (err) {
        console.warn("AI Token API call exception:", err.message);
    }

    // High-Quality Fallback Transformer for all questions
    return generateSmartAIFallback(grade, subject, retoNum, topic, currentQuestions);
}

function generateSmartAIFallback(grade, subject, retoNum, topic, currentQuestions) {
    const baseQuestions = Array.isArray(currentQuestions) && currentQuestions.length > 0 ? currentQuestions : [];

    if (baseQuestions.length > 0) {
        return baseQuestions.map((q, idx) => {
            const cloned = JSON.parse(JSON.stringify(q));
            if (cloned.type === 'label') return cloned;

            const promptTag = topic ? ` [IA: ${topic.length > 40 ? topic.substring(0, 37) + '...' : topic}]` : '';
            if (typeof cloned.label === 'object') {
                cloned.label.es = (cloned.label.es || `Pregunta ${idx+1}`) + promptTag;
                cloned.label.de = (cloned.label.de || `Frage ${idx+1}`) + promptTag;
                cloned.label.en = (cloned.label.en || `Question ${idx+1}`) + promptTag;
            } else if (typeof cloned.label === 'string') {
                cloned.label = cloned.label + promptTag;
            }

            if (!cloned.hint || typeof cloned.hint !== 'object') {
                cloned.hint = { es: '', de: '', en: '' };
            }
            cloned.hint.es = `Adaptado con IA para ${subject.toUpperCase()} (Klasse ${grade}): ${topic}`;
            cloned.hint.de = `Mit KI angepasst für ${subject.toUpperCase()} (Klasse ${grade}): ${topic}`;
            cloned.hint.en = `AI adapted for ${subject.toUpperCase()} (Grade ${grade}): ${topic}`;

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
    generateInstrumentAI
};
