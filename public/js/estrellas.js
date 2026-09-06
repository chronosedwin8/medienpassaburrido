/**
 * estrellas.js — Puntuación por estrellas en el navegador.
 *
 * Aplica las MISMAS reglas que services/stars.js, que llegan en
 * window.__reglasEstrellas desde el servidor (config/estrellas.json). Antes el
 * cálculo estaba escrito a mano dentro de views/activity.ejs y solo recorría
 * los `.radio-group`: los tipos nuevos —opción múltiple, escala, ordenar,
 * lista, número— no recibían estrellas nunca aunque se respondieran.
 */
(function () {
    'use strict';

    const POR_DEFECTO = {
        maximoPorPregunta: 5,
        preguntasCalificables: { correcta: 3, correctaConArgumento: 5, incorrectaConArgumento: 3, incorrectaSinArgumento: 0, sinResponder: 0 },
        preguntasAbiertas: { respondida: 3, respondidaConArgumento: 5, sinResponder: 0 },
        caraTriste: { activa: true },
        coherencia: { minimoCaracteres: 40, minimoPalabras: 8, minimoCaracteresDistintos: 5, proporcionPalabrasUnicas: 0.5 }
    };

    const reglas = () => window.__reglasEstrellas || POR_DEFECTO;

    /** ¿Es una argumentación real y no relleno? */
    function esCoherente(texto) {
        const c = reglas().coherencia;
        const limpio = String(texto || '').trim();
        if (limpio.length < c.minimoCaracteres) return false;

        const palabras = limpio.split(/\s+/).filter(Boolean);
        if (palabras.length < c.minimoPalabras) return false;

        const caracteres = new Set(limpio.toLowerCase().replace(/\s/g, ''));
        if (caracteres.size < c.minimoCaracteresDistintos) return false;

        const unicas = new Set(palabras.map(p => p.toLowerCase()));
        return unicas.size >= palabras.length * c.proporcionPalabrasUnicas;
    }

    /**
     * Lee la respuesta de una pregunta y dice si acertó.
     * @returns {{respondida:boolean, correcta:boolean|null, texto:string}}
     *          correcta es null cuando la pregunta no tiene respuesta correcta.
     */
    function leerRespuesta(grupo) {
        // Opción múltiple: acierta si marcó TODAS las correctas y ninguna más.
        const casillas = grupo.querySelectorAll('input[type="checkbox"]');
        if (casillas.length) {
            const marcadas = [...casillas].filter(c => c.checked);
            if (!marcadas.length) return { respondida: false, correcta: null, texto: '' };
            const correctas = [...casillas].filter(c => c.getAttribute('data-correct') === 'true');
            const acierta = marcadas.length === correctas.length &&
                            marcadas.every(c => c.getAttribute('data-correct') === 'true');
            return { respondida: true, correcta: correctas.length ? acierta : null, texto: '' };
        }

        const radios = grupo.querySelectorAll('input[type="radio"]');
        if (radios.length) {
            const elegido = [...radios].find(r => r.checked);
            if (!elegido) return { respondida: false, correcta: null, texto: '' };
            // La escala usa radios pero no tiene respuesta correcta.
            const hayCorrecta = [...radios].some(r => r.hasAttribute('data-correct'));
            if (!hayCorrecta) return { respondida: true, correcta: null, texto: '' };
            return { respondida: true, correcta: elegido.getAttribute('data-correct') === 'true', texto: '' };
        }

        // Ordenar: hace falta rellenar todas las posiciones.
        const posiciones = grupo.querySelectorAll('input[name*="__"]');
        if (posiciones.length) {
            const llenas = [...posiciones].filter(i => i.value !== '');
            if (llenas.length !== posiciones.length) return { respondida: false, correcta: null, texto: '' };
            // El orden correcto es el de aparición en la lista.
            const ordenado = [...posiciones]
                .map((i, idx) => ({ idx, pos: Number(i.value) }))
                .sort((a, b) => a.pos - b.pos)
                .map(x => x.idx);
            const acierta = ordenado.every((v, i) => v === i);
            return { respondida: true, correcta: acierta, texto: '' };
        }

        const lista = grupo.querySelector('select');
        if (lista) {
            if (!lista.value) return { respondida: false, correcta: null, texto: '' };
            const op = lista.options[lista.selectedIndex];
            const hayCorrecta = [...lista.options].some(o => o.hasAttribute('data-correct'));
            return { respondida: true, correcta: hayCorrecta ? op.getAttribute('data-correct') === 'true' : null, texto: '' };
        }

        const campo = grupo.querySelector('textarea, input[type="text"], input[type="number"], input[type="date"]');
        if (campo) {
            const v = String(campo.value || '').trim();
            return { respondida: v !== '', correcta: null, texto: v };
        }

        return { respondida: false, correcta: null, texto: '' };
    }

    /** Estrellas de una pregunta, con las mismas reglas que el servidor. */
    function calcular(grupo, argumento) {
        const cfg = reglas();
        const r = leerRespuesta(grupo);
        const argumentado = esCoherente(argumento);

        if (!r.respondida) {
            return { estrellas: cfg.preguntasCalificables.sinResponder, caraTriste: false };
        }

        if (r.correcta === null) {
            const a = cfg.preguntasAbiertas;
            const conArgumento = argumentado || esCoherente(r.texto);
            return { estrellas: conArgumento ? a.respondidaConArgumento : a.respondida, caraTriste: false };
        }

        const g = cfg.preguntasCalificables;
        if (r.correcta) {
            return { estrellas: argumentado ? g.correctaConArgumento : g.correcta, caraTriste: false };
        }
        if (argumentado) {
            return { estrellas: g.incorrectaConArgumento, caraTriste: false };
        }
        return { estrellas: g.incorrectaSinArgumento, caraTriste: cfg.caraTriste.activa === true };
    }

    /** Pinta las estrellas de un contenedor. */
    function pintar(contenedor, estrellas) {
        contenedor.querySelectorAll('.mini-star').forEach(estrella => {
            const val = parseInt(estrella.getAttribute('data-val'), 10);
            const llena = val <= estrellas;
            estrella.textContent = llena ? '★' : '☆';
            estrella.classList.toggle('mini-star-filled', llena);
        });
        contenedor.setAttribute('aria-label', estrellas + ' de ' + reglas().maximoPorPregunta + ' estrellas');
    }

    /**
     * Recalcula TODAS las preguntas de la actividad.
     * Recorre los contenedores de estrellas en vez de solo los `.radio-group`,
     * que era la razon por la que los tipos nuevos nunca puntuaban.
     */
    function recalcular() {
        let obtenidas = 0, maximo = 0;

        document.querySelectorAll('.field-star-rating').forEach(contenedor => {
            const id = contenedor.getAttribute('data-field-id');
            const grupo = document.getElementById('wrap_' + id) ||
                          document.getElementById('group_' + id) ||
                          contenedor.closest('.form-group');
            if (!grupo) return;

            const explicacion = document.getElementById(id + '_explain');
            const res = calcular(grupo, explicacion ? explicacion.value : '');

            const oculto = document.getElementById('star_' + id);
            if (oculto) oculto.value = res.estrellas;

            const triste = document.getElementById('sad_' + id);
            if (triste) triste.style.display = res.caraTriste ? 'inline' : 'none';

            pintar(contenedor, res.estrellas);

            obtenidas += res.estrellas;
            maximo += reglas().maximoPorPregunta;
        });

        return { obtenidas, maximo };
    }

    window.medienpassEstrellas = { recalcular, calcular, esCoherente, pintar, reglas };

    // Nombre histórico que la plantilla ya invoca en cada cambio de campo.
    window.recalculateInteractiveStars = function () {
        recalcular();
        if (typeof window.updateStarSummary === 'function') window.updateStarSummary();
    };

    document.addEventListener('DOMContentLoaded', recalcular);
})();
