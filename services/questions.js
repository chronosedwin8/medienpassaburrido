/**
 * questions.js — Modelo único de preguntas.
 *
 * Dos problemas que resuelve:
 *
 * 1. Lo que el docente editaba o generaba con IA se guardaba en
 *    data/custom_instruments.json y NINGUNA ruta de estudiante lo leía: la
 *    vista de actividad siempre renderizaba `evidence_kN` de data.js. El
 *    editor y el generador con IA no llegaban nunca al aula.
 *
 * 2. Solo existían tres tipos de pregunta (`text`, `textarea`, `radio_group`) y
 *    estaban escritos a mano en la plantilla, así que añadir uno obligaba a
 *    tocar EJS del estudiante y del docente por separado.
 *
 * Aquí viven el catálogo de tipos, la normalización, la validación de
 * respuestas y la resolución "por defecto + lo que puso el docente".
 */

const instrumentStore = require('./instrument_store');

/* ════════════════════════════════════════════════════════════
   Catálogo de tipos
   ════════════════════════════════════════════════════════════ */

/**
 * Cada tipo declara:
 *   opciones      si necesita lista de opciones
 *   calificable   si se puede corregir automáticamente
 *   multiple      si admite varias respuestas
 *   etiqueta      nombre legible para el editor del docente
 */
const TIPOS = {
    text: {
        opciones: false, calificable: false, multiple: false,
        etiqueta: { es: 'Respuesta corta', de: 'Kurze Antwort', en: 'Short answer' }
    },
    textarea: {
        opciones: false, calificable: false, multiple: false,
        etiqueta: { es: 'Respuesta larga', de: 'Lange Antwort', en: 'Long answer' }
    },
    radio_group: {
        opciones: true, calificable: true, multiple: false,
        etiqueta: { es: 'Opción única', de: 'Einfachauswahl', en: 'Single choice' }
    },
    checkbox_group: {
        opciones: true, calificable: true, multiple: true,
        etiqueta: { es: 'Opción múltiple', de: 'Mehrfachauswahl', en: 'Multiple choice' }
    },
    true_false: {
        opciones: true, calificable: true, multiple: false,
        etiqueta: { es: 'Verdadero / Falso', de: 'Richtig / Falsch', en: 'True / False' }
    },
    select: {
        opciones: true, calificable: true, multiple: false,
        etiqueta: { es: 'Lista desplegable', de: 'Auswahlliste', en: 'Dropdown' }
    },
    scale: {
        opciones: false, calificable: false, multiple: false,
        etiqueta: { es: 'Escala (1 a 5)', de: 'Skala (1 bis 5)', en: 'Scale (1 to 5)' }
    },
    number: {
        opciones: false, calificable: true, multiple: false,
        etiqueta: { es: 'Número', de: 'Zahl', en: 'Number' }
    },
    date: {
        opciones: false, calificable: false, multiple: false,
        etiqueta: { es: 'Fecha', de: 'Datum', en: 'Date' }
    },
    ordering: {
        opciones: true, calificable: true, multiple: true,
        etiqueta: { es: 'Ordenar', de: 'Reihenfolge', en: 'Ordering' }
    }
};

const LANGS = ['es', 'de', 'en'];
const TIPO_POR_DEFECTO = 'textarea';

function esTipoValido(tipo) {
    return Object.prototype.hasOwnProperty.call(TIPOS, tipo);
}

/** Catálogo para el editor del docente. */
function catalogo() {
    return Object.entries(TIPOS).map(([id, def]) => ({ id, ...def }));
}

/* ════════════════════════════════════════════════════════════
   Normalización
   ════════════════════════════════════════════════════════════ */

function textoMultilingue(valor, respaldo) {
    const salida = {};
    for (const lang of LANGS) {
        let t = '';
        if (typeof valor === 'string') t = valor;
        else if (valor && typeof valor === 'object') t = valor[lang] || '';

        if (!String(t).trim() && respaldo) {
            t = typeof respaldo === 'string' ? respaldo : (respaldo[lang] || respaldo.es || '');
        }
        salida[lang] = String(t || '').trim();
    }
    return salida;
}

/**
 * Deduce el tipo cuando falta, en vez de dejar la pregunta sin renderizar.
 * data.js tiene preguntas sin `type` explícito.
 */
function deducirTipo(pregunta) {
    if (esTipoValido(pregunta.type)) return pregunta.type;
    if (Array.isArray(pregunta.options) && pregunta.options.length) {
        const correctas = pregunta.options.filter(o => o && o.correct === true).length;
        return correctas > 1 ? 'checkbox_group' : 'radio_group';
    }
    return TIPO_POR_DEFECTO;
}

/**
 * Deja una pregunta en forma canónica y renderizable.
 * Nunca lanza: una pregunta rota debe degradarse, no tumbar la actividad.
 */
function normalizar(pregunta, indice = 0) {
    const p = (pregunta && typeof pregunta === 'object') ? pregunta : {};
    const tipo = deducirTipo(p);
    const def = TIPOS[tipo];

    const salida = {
        id: String(p.id || `q${indice + 1}`),
        type: tipo,
        label: textoMultilingue(p.label, `Pregunta ${indice + 1}`),
        hint: textoMultilingue(p.hint, ''),
        required: p.required === true,
        rows: Number(p.rows) > 0 ? Number(p.rows) : undefined
    };

    if (def.opciones) {
        let opciones = Array.isArray(p.options) ? p.options : [];

        // Verdadero/Falso trae sus opciones puestas si no vienen dadas.
        if (tipo === 'true_false' && opciones.length === 0) {
            opciones = [
                { es: 'Verdadero', de: 'Richtig', en: 'True', correct: true },
                { es: 'Falso', de: 'Falsch', en: 'False', correct: false }
            ];
        }

        salida.options = opciones.map((o, i) => ({
            ...textoMultilingue(o, `Opción ${i + 1}`),
            value: o && o.value !== undefined ? String(o.value) : String(i),
            correct: !!(o && o.correct === true)
        }));

        // Una de opción única sin respuesta marcada no se puede corregir:
        // se marca la primera para que el informe no la cuente siempre mal.
        if (!def.multiple && salida.options.length && !salida.options.some(o => o.correct)) {
            salida.options[0].correct = true;
        }
    }

    if (tipo === 'scale') {
        salida.min = Number.isFinite(Number(p.min)) ? Number(p.min) : 1;
        salida.max = Number.isFinite(Number(p.max)) ? Number(p.max) : 5;
        if (salida.max <= salida.min) salida.max = salida.min + 4;
    }

    if (tipo === 'number') {
        if (p.min !== undefined && Number.isFinite(Number(p.min))) salida.min = Number(p.min);
        if (p.max !== undefined && Number.isFinite(Number(p.max))) salida.max = Number(p.max);
        if (p.answer !== undefined) salida.answer = Number(p.answer);
    }

    if (tipo === 'ordering') {
        // El orden correcto es el de la lista tal como la escribió el docente.
        salida.correctOrder = salida.options.map(o => o.value);
    }

    return salida;
}

function normalizarLista(preguntas) {
    if (!Array.isArray(preguntas)) return [];
    return preguntas.map((p, i) => normalizar(p, i));
}

/* ════════════════════════════════════════════════════════════
   Resolución: por defecto + lo que guardó el docente
   ════════════════════════════════════════════════════════════ */

/** Número de reto a partir del id de actividad ("reto3_aleman" → 3). */
function retoDeActividad(activityId) {
    const m = String(activityId || '').match(/reto(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
}

/** Grado a partir del curso ("5B" → 5). */
function gradoDeCurso(className) {
    const m = String(className || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

/**
 * Preguntas que debe ver un estudiante concreto.
 *
 * Prioridad:
 *   1. Instrumento guardado por el docente para ese grado/asignatura/reto
 *   2. `evidence` de data.js ya resuelto para el curso
 *
 * @returns {{questions: Array, source: 'docente'|'sistema', updatedAt?: string}}
 */
function paraEstudiante(activity, className) {
    const porDefecto = normalizarLista((activity && activity.evidence) || []);

    const reto = retoDeActividad(activity && activity.id);
    const grado = gradoDeCurso(className);
    const asignatura = activity && activity.subject;

    if (reto === null || grado === null || !asignatura) {
        return { questions: porDefecto, source: 'sistema' };
    }

    let custom = null;
    try {
        custom = instrumentStore.getCustomInstrument(grado, asignatura, reto);
    } catch (e) {
        console.error('[questions] no se pudo leer el instrumento del docente:', e.message);
    }

    if (custom && Array.isArray(custom.questions) && custom.questions.length) {
        const personalizadas = normalizarLista(custom.questions);
        if (personalizadas.length) {
            return { questions: personalizadas, source: 'docente', updatedAt: custom.updatedAt };
        }
    }

    return { questions: porDefecto, source: 'sistema' };
}

/* ════════════════════════════════════════════════════════════
   Corrección de respuestas
   ════════════════════════════════════════════════════════════ */

/**
 * Corrige la respuesta de una pregunta.
 * @returns {{answered: boolean, correct: boolean|null}}
 *          correct es null cuando el tipo no es calificable (texto libre).
 */
function calificar(pregunta, respuesta) {
    const q = normalizar(pregunta);
    const def = TIPOS[q.type];
    const vacia = respuesta === undefined || respuesta === null || respuesta === '' ||
                  (Array.isArray(respuesta) && respuesta.length === 0);

    if (vacia) return { answered: false, correct: null };
    if (!def.calificable) return { answered: true, correct: null };

    if (q.type === 'number') {
        if (q.answer === undefined) return { answered: true, correct: null };
        return { answered: true, correct: Number(respuesta) === Number(q.answer) };
    }

    if (q.type === 'ordering') {
        const esperada = q.correctOrder || [];
        let dada;

        if (Array.isArray(respuesta)) {
            // Ya viene como secuencia de valores en orden.
            dada = respuesta.map(String);
        } else if (respuesta && typeof respuesta === 'object') {
            // Forma que envia el navegador: { valorOpcion: posicionEscrita }.
            // Se ordena por la posicion para reconstruir la secuencia.
            dada = Object.keys(respuesta)
                .filter(k => respuesta[k] !== '' && respuesta[k] !== null && respuesta[k] !== undefined)
                .sort((a, b) => Number(respuesta[a]) - Number(respuesta[b]))
                .map(String);
        } else {
            dada = String(respuesta).split(',').map(v => v.trim());
        }

        return {
            answered: true,
            correct: dada.length === esperada.length && dada.every((v, i) => v === esperada[i])
        };
    }

    const correctas = (q.options || []).filter(o => o.correct).map(o => o.value);

    if (def.multiple) {
        const dadas = (Array.isArray(respuesta) ? respuesta : [respuesta]).map(String);
        return {
            answered: true,
            correct: dadas.length === correctas.length && correctas.every(v => dadas.includes(v))
        };
    }

    return { answered: true, correct: correctas.includes(String(respuesta)) };
}

/** Resumen de un conjunto de respuestas. */
function resumir(preguntas, respuestas = {}) {
    const lista = normalizarLista(preguntas);
    let respondidas = 0, correctas = 0, calificables = 0;

    for (const q of lista) {
        const r = calificar(q, respuestas[q.id]);
        if (r.answered) respondidas++;
        if (r.correct !== null) {
            calificables++;
            if (r.correct) correctas++;
        }
    }

    return {
        total: lista.length,
        respondidas,
        calificables,
        correctas,
        completitud: lista.length ? Math.round((respondidas / lista.length) * 100) : 0,
        acierto: calificables ? Math.round((correctas / calificables) * 100) : null
    };
}

/** Comprueba que un instrumento del docente sea guardable. */
function validarInstrumento(preguntas) {
    const errores = [];
    if (!Array.isArray(preguntas)) return { valido: false, errores: ['Se esperaba una lista de preguntas.'] };
    if (!preguntas.length) return { valido: false, errores: ['El instrumento no tiene preguntas.'] };

    const ids = new Set();
    preguntas.forEach((p, i) => {
        const n = i + 1;
        if (!p || typeof p !== 'object') { errores.push(`Pregunta ${n}: formato inválido.`); return; }
        if (p.type && !esTipoValido(p.type)) errores.push(`Pregunta ${n}: tipo "${p.type}" desconocido.`);

        const id = String(p.id || '');
        if (!id) errores.push(`Pregunta ${n}: falta el identificador.`);
        else if (ids.has(id)) errores.push(`Pregunta ${n}: el identificador "${id}" está repetido.`);
        ids.add(id);

        const label = textoMultilingue(p.label, '');
        if (!label.es && !label.de && !label.en) errores.push(`Pregunta ${n}: no tiene enunciado en ningún idioma.`);

        const tipo = deducirTipo(p);
        if (TIPOS[tipo].opciones && tipo !== 'true_false') {
            const ops = Array.isArray(p.options) ? p.options : [];
            if (ops.length < 2) errores.push(`Pregunta ${n}: "${tipo}" necesita al menos dos opciones.`);
        }
    });

    return { valido: errores.length === 0, errores };
}

module.exports = {
    TIPOS, catalogo, esTipoValido,
    normalizar, normalizarLista,
    paraEstudiante, retoDeActividad, gradoDeCurso,
    calificar, resumir, validarInstrumento
};
