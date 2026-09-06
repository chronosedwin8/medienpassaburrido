/**
 * stars.js — Puntuación por estrellas.
 *
 * El cálculo vivía dentro del <script> de views/activity.ejs y solo recorría
 * los `.radio-group`, así que:
 *
 *   - Los tipos nuevos (opción múltiple, escala, ordenar, lista, número) no
 *     recibían estrellas nunca, aunque el estudiante los respondiera.
 *   - Las reglas (3 estrellas por acertar, 5 con argumento...) estaban
 *     escritas a mano en la plantilla y ningún docente podía revisarlas.
 *   - El servidor no sabía nada de las estrellas: solo existían en un input
 *     oculto del navegador, así que los informes no podían usarlas.
 *
 * Ahora las reglas están en config/estrellas.json y el mismo cálculo se usa en
 * el servidor y en el navegador (se envía al cliente en /js/estrellas.js).
 */

const path = require('path');
const jsonstore = require('./jsonstore');
const questions = require('./questions');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'estrellas.json');

const POR_DEFECTO = {
    maximoPorPregunta: 5,
    preguntasCalificables: {
        correcta: 3, correctaConArgumento: 5,
        incorrectaConArgumento: 3, incorrectaSinArgumento: 0, sinResponder: 0
    },
    preguntasAbiertas: { respondida: 3, respondidaConArgumento: 5, sinResponder: 0 },
    caraTriste: { activa: true },
    coherencia: {
        minimoCaracteres: 40, minimoPalabras: 8,
        minimoCaracteresDistintos: 5, proporcionPalabrasUnicas: 0.5
    }
};

function reglas() {
    return jsonstore.read(CONFIG_PATH, POR_DEFECTO);
}

/**
 * ¿El texto es una argumentación real y no relleno?
 *
 * Comprueba longitud, número de palabras y variedad: sin lo último,
 * "aaaa aaaa aaaa..." pasaría por explicación.
 */
function esCoherente(texto, cfg) {
    const c = (cfg || reglas()).coherencia;
    const limpio = String(texto || '').trim();

    if (limpio.length < c.minimoCaracteres) return false;

    const palabras = limpio.split(/\s+/).filter(Boolean);
    if (palabras.length < c.minimoPalabras) return false;

    const caracteres = new Set(limpio.toLowerCase().replace(/\s/g, ''));
    if (caracteres.size < c.minimoCaracteresDistintos) return false;

    const unicas = new Set(palabras.map(p => p.toLowerCase()));
    if (unicas.size < palabras.length * c.proporcionPalabrasUnicas) return false;

    return true;
}

/** ¿Hay algo escrito/marcado en esta respuesta? */
function tieneContenido(valor) {
    if (valor === null || valor === undefined || valor === '') return false;
    if (Array.isArray(valor)) return valor.length > 0;
    if (typeof valor === 'object') return Object.keys(valor).length > 0;
    return String(valor).trim().length > 0;
}

/**
 * Estrellas de UNA pregunta.
 *
 * @param {Object} pregunta   pregunta normalizada
 * @param {*}      respuesta  respuesta del estudiante
 * @param {string} argumento  texto del campo "_explain", si existe
 * @returns {{estrellas:number, maximo:number, caraTriste:boolean, motivo:string}}
 */
function calcular(pregunta, respuesta, argumento) {
    const cfg = reglas();
    const q = questions.normalizar(pregunta);
    const max = cfg.maximoPorPregunta;
    const argumentado = esCoherente(argumento, cfg);

    const resultado = questions.calificar(q, respuesta);

    // Sin responder: no se penaliza con cara triste, simplemente aún no hay nada.
    if (!resultado.answered) {
        return { estrellas: cfg.preguntasCalificables.sinResponder, maximo: max, caraTriste: false, motivo: 'sinResponder' };
    }

    // Pregunta abierta (texto, escala, fecha): no hay respuesta correcta que
    // comparar, se valora que esté respondida y, si aporta, que esté explicada.
    if (resultado.correct === null) {
        const a = cfg.preguntasAbiertas;
        const propia = typeof respuesta === 'string' ? respuesta : '';
        const conArgumento = argumentado || esCoherente(propia, cfg);
        return {
            estrellas: conArgumento ? a.respondidaConArgumento : a.respondida,
            maximo: max,
            caraTriste: false,
            motivo: conArgumento ? 'abiertaConArgumento' : 'abiertaRespondida'
        };
    }

    const g = cfg.preguntasCalificables;

    if (resultado.correct) {
        return {
            estrellas: argumentado ? g.correctaConArgumento : g.correcta,
            maximo: max, caraTriste: false,
            motivo: argumentado ? 'correctaConArgumento' : 'correcta'
        };
    }

    if (argumentado) {
        return { estrellas: g.incorrectaConArgumento, maximo: max, caraTriste: false, motivo: 'incorrectaConArgumento' };
    }

    return {
        estrellas: g.incorrectaSinArgumento,
        maximo: max,
        caraTriste: cfg.caraTriste.activa === true,
        motivo: 'incorrectaSinArgumento'
    };
}

/**
 * Estrellas de una actividad completa.
 * @param {Array}  preguntas   lista normalizada
 * @param {Object} respuestas  { idPregunta: valor, idPregunta_explain: texto }
 */
function resumen(preguntas, respuestas) {
    const r = respuestas || {};
    const lista = questions.normalizarLista(preguntas);

    let obtenidas = 0, maximo = 0, respondidas = 0, tristes = 0;
    const detalle = [];

    for (const q of lista) {
        // Las preguntas "_explain" son el argumento de otra, no puntúan aparte.
        if (q.id.endsWith('_explain')) continue;

        const res = calcular(q, r[q.id], r[q.id + '_explain']);
        obtenidas += res.estrellas;
        maximo += res.maximo;
        if (res.motivo !== 'sinResponder') respondidas++;
        if (res.caraTriste) tristes++;
        detalle.push({ id: q.id, ...res });
    }

    return {
        obtenidas, maximo, respondidas,
        total: detalle.length,
        caritasTristes: tristes,
        porcentaje: maximo ? Math.round((obtenidas / maximo) * 100) : 0,
        detalle
    };
}

/** Reglas en forma serializable, para enviarlas al navegador. */
function reglasParaCliente() {
    const cfg = reglas();
    return {
        maximoPorPregunta: cfg.maximoPorPregunta,
        preguntasCalificables: cfg.preguntasCalificables,
        preguntasAbiertas: cfg.preguntasAbiertas,
        caraTriste: cfg.caraTriste,
        coherencia: cfg.coherencia
    };
}

module.exports = {
    reglas, reglasParaCliente, esCoherente, tieneContenido,
    calcular, resumen, CONFIG_PATH
};
