/**
 * reader.js - Lector inmersivo propio del Medienpass (diferenciación), sin servicios externos.
 * Va en las páginas de los retos (views/partials/reader.ejs):
 * - 🔊 en cada pregunta: la lee en voz alta (voz del dispositivo, Web Speech API) en el idioma de
 *   la página, resaltando palabra por palabra (CSS Custom Highlight API cuando existe).
 * - Panel «Lector»: leer la página o lo seleccionado, velocidad, tamaño de letra, espaciado amplio,
 *   letra fácil de leer, regla de lectura, color de fondo y «Ver también en» (la pregunta en otro
 *   idioma, con los textos DE/EN/ES que ya tiene cada pregunta en data-lang-content).
 * Los ajustes se recuerdan en este navegador (localStorage). Las funciones puras se exportan para
 * las pruebas (node).
 */
(function (root) {
    'use strict';

    // ── Funciones puras ──
    const RATES = { lenta: 0.8, normal: 1, rapida: 1.2 };
    const SIZES = [1, 1.1, 1.2, 1.35, 1.5];
    const TINTS = ['ninguno', 'crema', 'azul', 'verde'];
    const LANGS = ['de', 'en', 'es'];
    const VOICE_PREFS = { de: ['de-DE', 'de-AT', 'de-CH', 'de'], en: ['en-GB', 'en-US', 'en'], es: ['es-CO', 'es-MX', 'es-US', 'es-419', 'es-ES', 'es'] };
    const DEFAULTS = { rate: 'normal', size: 0, spacing: false, font: false, ruler: false, tint: 'ninguno', trans: '' };

    // Ajustes guardados, revisados (un valor raro vuelve al de fábrica)
    function sanitizeSettings(raw) {
        const s = Object.assign({}, DEFAULTS, raw && typeof raw === 'object' ? raw : {});
        return {
            rate: Object.prototype.hasOwnProperty.call(RATES, s.rate) ? s.rate : DEFAULTS.rate,
            size: Number.isInteger(s.size) && s.size >= 0 && s.size < SIZES.length ? s.size : 0,
            spacing: s.spacing === true,
            font: s.font === true,
            ruler: s.ruler === true,
            tint: TINTS.includes(s.tint) ? s.tint : 'ninguno',
            trans: LANGS.includes(s.trans) ? s.trans : ''
        };
    }

    // Partes de hasta `max` caracteres, cortando en el final de una frase, una coma o un espacio
    // (algunos navegadores cortan las lecturas largas). Devuelve [{ text, start }].
    function chunkText(text, max = 220) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            let end = Math.min(text.length, start + max);
            if (end < text.length) {
                const slice = text.slice(start, end);
                const cut = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('? '), slice.lastIndexOf('! '), slice.lastIndexOf('; '));
                const soft = cut > max * 0.4 ? cut + 1 : Math.max(slice.lastIndexOf(', ') + 1, slice.lastIndexOf(' '));
                if (soft > 0) end = start + soft;
            }
            const piece = text.slice(start, end);
            if (piece.trim()) chunks.push({ text: piece, start });
            start = end;
        }
        return chunks;
    }

    // Voz para un idioma: la variante preferida (es-CO, en-GB, de-DE…) o cualquiera del idioma
    function pickVoice(voices, lang) {
        const list = voices || [];
        const norm = v => String(v.lang || '').replace('_', '-').toLowerCase();
        for (const pref of VOICE_PREFS[lang] || [lang]) {
            const p = pref.toLowerCase();
            const found = list.filter(v => norm(v) === p || norm(v).startsWith(p + '-') || (p.length === 2 && norm(v).startsWith(p)));
            if (found.length) return found.find(v => v.localService) || found[0];
        }
        return null;
    }

    // Texto de un nodo en otro idioma, desde data-lang-content ({de, en, es}); '' si no hay
    function otherLangText(json, lang) {
        try {
            const obj = typeof json === 'string' ? JSON.parse(json) : json;
            const value = obj && typeof obj === 'object' ? obj[lang] : '';
            return typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : '';
        } catch (e) {
            return '';
        }
    }

    const helpers = { RATES, SIZES, TINTS, DEFAULTS, sanitizeSettings, chunkText, pickVoice, otherLangText };
    if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // ── Navegador ──
    const STORE = 'medienpass_lector';
    const SPEECH_LANG = { de: 'de-DE', en: 'en-GB', es: 'es-CO' };
    const t = key => (typeof window.t === 'function' ? window.t(key) : key);
    const pageLang = () => (window.langUtils && window.langUtils.getLang ? window.langUtils.getLang() : (document.documentElement.lang || 'es')).slice(0, 2);
    const synth = window.speechSynthesis;
    const canSpeak = !!(synth && window.SpeechSynthesisUtterance);
    const canHighlight = !!(window.CSS && CSS.highlights && window.Highlight);

    let settings = DEFAULTS;
    try { settings = sanitizeSettings(JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) { settings = sanitizeSettings({}); }
    const save = () => { try { localStorage.setItem(STORE, JSON.stringify(settings)); } catch (e) { /* sin almacenamiento */ } };

    // Lo que no se lee ni se traduce
    const SKIP = '.reader-ui, .reader-trans, .reader-say, .kmk-tag, .field-star-rating, .sad-face-indicator, .question-hint-box, ' +
        '.practice-explanation-box, .navigation-bar, .save-actions, script, style, select, input, textarea, i';
    const BLOCKS = 'h1, h2, h3, h4, p, li, label, .panel-title, .activity-instruction, .subtitle, #edilim-question-body button, #edilim-question-body [class*="option"]';
    const visible = el => !!(el.offsetParent || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';

    // Nodos de texto que se leen de un elemento, con el texto limpio y su posición en cada nodo
    function textMap(el) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
            acceptNode: node => (node.parentElement && node.parentElement.closest(SKIP) && !el.matches(SKIP)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        let text = '';
        const map = [];
        let lastSpace = true;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const value = node.nodeValue;
            for (let i = 0; i < value.length; i++) {
                const space = /\s/.test(value[i]);
                if (space && lastSpace) continue;
                text += space ? ' ' : value[i];
                map.push({ node, offset: i });
                lastSpace = space;
            }
        }
        while (text.endsWith(' ')) { text = text.slice(0, -1); map.pop(); }
        return { text, map };
    }

    function readableBlocks(rootEl) {
        const all = [...rootEl.querySelectorAll(BLOCKS)].filter(el => visible(el) && !el.closest(SKIP) && textMap(el).text);
        return all.filter(el => !all.some(other => other !== el && other.contains(el)));
    }

    // ── Lectura en voz alta ──
    let queue = [];
    let reading = null;
    let session = 0;

    function clearMarks() {
        document.querySelectorAll('.reader-reading').forEach(el => el.classList.remove('reader-reading'));
        if (canHighlight) CSS.highlights.delete('reader-word');
    }

    function stop() {
        session++;
        queue = [];
        reading = null;
        if (canSpeak) synth.cancel();
        clearMarks();
        document.querySelectorAll('.reader-say.is-reading').forEach(b => b.classList.remove('is-reading'));
        updateButtons();
    }

    function highlightWord(info, index, length) {
        if (!canHighlight) return;
        const from = info.map[index];
        if (!from) return;
        let endIndex = index + (length > 0 ? length : 0);
        if (!(length > 0)) {
            const rest = info.text.slice(index);
            const m = /^\S+/.exec(rest);
            endIndex = index + (m ? m[0].length : 1);
        }
        const to = info.map[Math.min(endIndex, info.map.length) - 1];
        try {
            const range = document.createRange();
            range.setStart(from.node, from.offset);
            range.setEnd(to.node, to.offset + 1);
            CSS.highlights.set('reader-word', new Highlight(range));
        } catch (e) { /* el texto cambió mientras se leía */ }
    }

    function speakNext(id) {
        if (id !== session) return;
        clearMarks();
        const el = queue.shift();
        if (!el) { reading = null; stop(); return; }
        const info = textMap(el);
        if (!info.text) return speakNext(id);
        el.classList.add('reader-reading');
        if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        const lang = pageLang();
        const voice = pickVoice(synth.getVoices(), lang);
        const chunks = chunkText(info.text);
        let i = 0;
        const sayChunk = () => {
            if (id !== session) return;
            if (i >= chunks.length) return speakNext(id);
            const chunk = chunks[i++];
            const u = new SpeechSynthesisUtterance(chunk.text);
            u.lang = voice ? voice.lang : SPEECH_LANG[lang] || lang;
            if (voice) u.voice = voice;
            u.rate = RATES[settings.rate];
            u.onboundary = e => { if (id === session && (e.name === 'word' || e.name === undefined)) highlightWord(info, chunk.start + e.charIndex, e.charLength); };
            u.onend = sayChunk;
            u.onerror = sayChunk;
            synth.speak(u);
        };
        sayChunk();
    }

    function read(elements, button) {
        if (!canSpeak) return toast(t('est_lec_sin_voz'));
        const wasThis = button && button.classList.contains('is-reading');
        stop();
        if (wasThis) return; // segundo clic en el mismo 🔊: detiene
        queue = elements.filter(Boolean);
        if (!queue.length) return;
        reading = button || true;
        if (button) button.classList.add('is-reading');
        updateButtons();
        speakNext(session);
    }

    function readSelection() {
        if (!canSpeak) return toast(t('est_lec_sin_voz'));
        const text = String(window.getSelection ? window.getSelection() : '').trim();
        if (!text) return toast(t('est_lec_sin_seleccion'));
        stop();
        const lang = pageLang();
        const voice = pickVoice(synth.getVoices(), lang);
        const id = session;
        reading = true;
        updateButtons();
        const chunks = chunkText(text);
        let i = 0;
        const next = () => {
            if (id !== session) return;
            if (i >= chunks.length) return stop();
            const u = new SpeechSynthesisUtterance(chunks[i++].text);
            u.lang = voice ? voice.lang : SPEECH_LANG[lang] || lang;
            if (voice) u.voice = voice;
            u.rate = RATES[settings.rate];
            u.onend = next;
            u.onerror = next;
            synth.speak(u);
        };
        next();
    }

    // ── 🔊 en cada pregunta ──
    function addSayButtons() {
        // También las de los paneles cerrados del Reto 0 (se ven al abrirlos); no las ocultas sin enunciado
        const groups = [...document.querySelectorAll('main .form-group')].filter(g => !g.querySelector(':scope > .reader-say') && g.querySelector('label'));
        groups.forEach(group => {
            const button = sayButton();
            button.addEventListener('click', () => read(readableBlocks(group), button));
            group.insertBefore(button, group.firstChild);
            group.classList.add('reader-group');
        });
        const game = document.getElementById('edilim-game-container');
        if (game && !game.querySelector(':scope > .reader-say')) {
            const button = sayButton();
            button.classList.add('reader-say-game');
            button.addEventListener('click', () => read(readableBlocks(document.getElementById('edilim-question-body') || game), button));
            game.insertBefore(button, game.firstChild);
        }
    }

    function sayButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'reader-say';
        button.innerHTML = '<span aria-hidden="true">🔊</span>';
        button.title = t('est_lec_escuchar');
        button.setAttribute('aria-label', t('est_lec_escuchar'));
        return button;
    }

    // ── «Ver también en»: la pregunta en otro idioma ──
    function applyTranslations() {
        document.querySelectorAll('.reader-trans').forEach(el => el.remove());
        const lang = settings.trans;
        if (!lang || lang === pageLang()) return;
        const scope = [...document.querySelectorAll('main .form-group [data-lang-content], main .activity-instruction[data-lang-content], main h1[data-lang-content]')];
        scope.forEach(el => {
            if (el.closest('.kmk-tag, .reader-ui')) return;
            const text = otherLangText(el.getAttribute('data-lang-content'), lang);
            if (!text) return;
            const span = document.createElement('span');
            span.className = 'reader-trans';
            span.lang = lang;
            span.textContent = text;
            el.appendChild(span);
        });
    }

    // ── Apariencia ──
    let fontLoaded = false;
    function applyLook() {
        const html = document.documentElement;
        html.setAttribute('data-reader-size', String(settings.size));
        html.classList.toggle('reader-spacing', settings.spacing);
        html.classList.toggle('reader-font', settings.font);
        html.setAttribute('data-reader-tint', settings.tint);
        if (settings.font && !fontLoaded) {
            fontLoaded = true;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap';
            document.head.appendChild(link);
        }
        const ruler = document.getElementById('readerRuler');
        if (ruler) ruler.hidden = !settings.ruler;
        applyTranslations();
        updateButtons();
    }

    function updateButtons() {
        const panel = document.getElementById('readerPanel');
        if (!panel) return;
        panel.querySelectorAll('[data-reader-rate]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.readerRate === settings.rate)));
        panel.querySelectorAll('[data-reader-tint]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.readerTint === settings.tint)));
        panel.querySelectorAll('[data-reader-trans]').forEach(b => {
            const lang = b.dataset.readerTrans;
            b.setAttribute('aria-pressed', String(lang === settings.trans));
            b.hidden = !!lang && lang === pageLang();
        });
        ['spacing', 'font', 'ruler'].forEach(key => {
            const box = document.getElementById('reader_' + key);
            if (box) box.checked = settings[key];
        });
        const sizeOut = document.getElementById('readerSizeValue');
        if (sizeOut) sizeOut.textContent = Math.round(SIZES[settings.size] * 100) + ' %';
        const stopBtn = document.getElementById('readerStop');
        if (stopBtn) stopBtn.disabled = !reading;
        const fab = document.getElementById('readerOpen');
        if (fab) fab.classList.toggle('is-reading', !!reading);
    }

    function toast(message) {
        const box = document.getElementById('readerMessage');
        if (!box) return;
        box.textContent = message;
        box.hidden = false;
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => { box.hidden = true; }, 5000);
    }

    function setSetting(key, value) {
        settings = sanitizeSettings(Object.assign({}, settings, { [key]: value }));
        save();
        applyLook();
    }

    function init() {
        const panel = document.getElementById('readerPanel');
        const open = document.getElementById('readerOpen');
        if (!panel || !open) return;
        const toggle = show => {
            panel.hidden = !show;
            open.setAttribute('aria-expanded', String(show));
            if (show) panel.querySelector('button, input').focus();
        };
        open.addEventListener('click', () => toggle(panel.hidden));
        document.getElementById('readerClose').addEventListener('click', () => { toggle(false); open.focus(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); open.focus(); } });

        document.getElementById('readerPage').addEventListener('click', () => read(readableBlocks(document.querySelector('main') || document.body)));
        document.getElementById('readerSelection').addEventListener('mousedown', e => e.preventDefault()); // no pierde la selección
        document.getElementById('readerSelection').addEventListener('click', readSelection);
        document.getElementById('readerStop').addEventListener('click', stop);
        panel.querySelectorAll('[data-reader-rate]').forEach(b => b.addEventListener('click', () => setSetting('rate', b.dataset.readerRate)));
        panel.querySelectorAll('[data-reader-tint]').forEach(b => b.addEventListener('click', () => setSetting('tint', b.dataset.readerTint)));
        panel.querySelectorAll('[data-reader-trans]').forEach(b => b.addEventListener('click', () => setSetting('trans', b.dataset.readerTrans)));
        document.getElementById('readerSmaller').addEventListener('click', () => setSetting('size', Math.max(0, settings.size - 1)));
        document.getElementById('readerBigger').addEventListener('click', () => setSetting('size', Math.min(SIZES.length - 1, settings.size + 1)));
        ['spacing', 'font', 'ruler'].forEach(key => {
            document.getElementById('reader_' + key).addEventListener('change', e => setSetting(key, e.target.checked));
        });
        document.getElementById('readerReset').addEventListener('click', () => { stop(); settings = sanitizeSettings({}); save(); applyLook(); });

        // Regla de lectura: una franja que sigue el puntero o el dedo
        const ruler = document.getElementById('readerRuler');
        const moveRuler = y => { if (!ruler.hidden) ruler.style.top = Math.max(0, y - ruler.offsetHeight / 2) + 'px'; };
        document.addEventListener('pointermove', e => moveRuler(e.clientY), { passive: true });
        document.addEventListener('touchmove', e => { if (e.touches[0]) moveRuler(e.touches[0].clientY); }, { passive: true });

        if (!canSpeak) {
            ['readerPage', 'readerSelection'].forEach(id => { document.getElementById(id).disabled = true; });
            document.getElementById('readerNoVoice').hidden = false;
        } else if (synth.getVoices().length === 0 && 'onvoiceschanged' in synth) {
            synth.addEventListener('voiceschanged', () => { /* voces listas */ }, { once: true });
        }

        addSayButtons();
        applyLook();
        // El Reto 0 abre paneles y el juego dibuja sus preguntas después: se agregan los 🔊 que falten
        new MutationObserver(() => { clearTimeout(init.timer); init.timer = setTimeout(addSayButtons, 300); })
            .observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
        // Al cambiar de idioma, lang.js reescribe los textos: se detiene la lectura y se vuelven a poner las traducciones
        document.addEventListener('langchange', () => {
            stop();
            setTimeout(() => {
                document.querySelectorAll('.reader-say').forEach(b => { b.title = t('est_lec_escuchar'); b.setAttribute('aria-label', t('est_lec_escuchar')); });
                applyLook();
            }, 0);
        });
        window.addEventListener('pagehide', stop);
    }

    root.MedienpassReader = Object.assign({ read, stop, readSelection }, helpers);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})(typeof window !== 'undefined' ? window : globalThis);
