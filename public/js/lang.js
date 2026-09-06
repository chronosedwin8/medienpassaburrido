/**
 * lang.js — Puente entre el idioma del servidor y el código del navegador.
 *
 * QUÉ HACÍA ANTES Y POR QUÉ SE CAMBIÓ
 *
 * Este archivo mantenía su propio estado de idioma en localStorage, con
 * `DEFAULT_LANG = 'de'`. Al cargar (desde partials/footer.ejs) hacía tres
 * cosas que peleaban con el servidor:
 *
 *   1. En un navegador nuevo localStorage está vacío, así que asumía alemán.
 *   2. Escribía la cookie `lang` con ese valor, PISANDO la elección real de la
 *      persona: alguien entraba eligiendo español y la cookie acababa en "de".
 *   3. Reescribía todos los [data-i18n] del DOM, deshaciendo el HTML que el
 *      servidor ya había generado en el idioma correcto.
 *
 * Resultado: el selector de idioma "no hacía nada". El servidor respondía bien
 * y este script lo revertía medio segundo después.
 *
 * AHORA el idioma lo decide el servidor (services/i18n.js) y lo publica en
 * window.__lang. Aquí solo queda lo que otras vistas necesitan para consultarlo.
 */
(function () {
    'use strict';

    var IDIOMAS = ['es', 'de', 'en'];

    /** El idioma que el servidor ya resolvió y usó para pintar la página. */
    function getLang() {
        var l = window.__lang;
        return IDIOMAS.indexOf(l) !== -1 ? l : 'es';
    }

    /**
     * Cambia de idioma pidiéndoselo al servidor, que es quien manda.
     * Antes lo hacía en el navegador y se perdía al recargar.
     */
    function switchLang(lang) {
        if (IDIOMAS.indexOf(lang) === -1 || lang === getLang()) return;
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
    }

    /** Texto de un objeto multilingüe, con el idioma vigente. */
    function getPrimaryText(textObj, lang) {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;
        if (typeof textObj !== 'object') return String(textObj);
        var l = lang || getLang();
        return textObj[l] || textObj.es || textObj.de || textObj.en || '';
    }

    /**
     * Igual que getPrimaryText, pero añadiendo el español como apoyo cuando la
     * interfaz está en alemán o inglés (la regla pedagógica del colegio).
     */
    function getDisplayText(textObj, lang) {
        var l = lang || getLang();
        var principal = getPrimaryText(textObj, l);
        if (l === 'es' || !textObj || typeof textObj !== 'object') return principal;
        var apoyo = textObj.es;
        return (apoyo && apoyo !== principal) ? principal + '\n' + apoyo : principal;
    }

    function getDisplayHTML(textObj, lang) {
        var l = lang || getLang();
        var principal = getPrimaryText(textObj, l);
        var html = '<span class="lang-line lang-primary">' + principal + '</span>';
        if (l !== 'es' && textObj && typeof textObj === 'object' &&
            textObj.es && textObj.es !== principal) {
            html += '<span class="lang-line lang-secondary">' + textObj.es + '</span>';
        }
        return html;
    }

    // Ya no hay updateUI(): el servidor entrega el HTML traducido. Se deja el
    // nombre para no romper llamadas antiguas, pero no toca el DOM.
    function updateUI() { /* el servidor ya lo hizo */ }
    function setLang() { /* la cookie la escribe el servidor */ }
    function init() { /* nada que inicializar */ }

    window.langUtils = {
        getLang: getLang,
        setLang: setLang,
        switchLang: switchLang,
        getDisplayText: getDisplayText,
        getDisplayHTML: getDisplayHTML,
        getPrimaryText: getPrimaryText,
        updateUI: updateUI,
        init: init
    };
})();
