/**
 * lang.js - Language Switcher for MedienPass App
 * 
 * Supports DE (German), EN (English), and ES (Spanish).
 * Switches content dynamically for:
 * - [data-i18n]: simple string translation from window.i18n
 * - [data-i18n-html]: HTML translation from window.i18n
 * - [data-i18n-placeholder]: placeholder translation
 * - [data-i18n-title]: tooltip (title attribute) translation
 * - [data-i18n-option]: select option translation
 * - [data-lang-content]: multi-language JSON object { de, en, es }
 * - [data-lang-sub]: secondary language text
 * - [data-lang]: colon-separated format (e.g. es:...|de:...|en:...)
 * - Synchronizes all language buttons (.lang-btn, .login-lang-btn, .h-lang-btn)
 * - Emits 'langchange' CustomEvent for page-specific hooks
 * - window.t(key): translated text for scripts (current language → Spanish → key)
 *
 * The choice is shared by the student, teacher and admin portals: it lives in
 * localStorage and in the `lang` cookie, which the server also reads to render
 * pages already translated.
 *
 * Alemán e Inglés se muestran por defecto en su idioma (de / en): la página lo indica con
 * <body data-native-subject="aleman" data-page-lang="de"> y se ve así sin cambiar la preferencia
 * general. Si el estudiante pulsa otro idioma, esa elección vale para esa materia durante la
 * sesión (cookie lang_<materia>) y también queda como su preferencia general.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'medienpass_lang';
    const DEFAULT_LANG = 'es';
    const LANGS = ['de', 'en', 'es'];
    const NATIVE_LANG = { aleman: 'de', ingles: 'en' };
    let pageLang = null; // idioma de esta página cuando muestra una materia en su idioma nativo

    function getCookie(name) {
        const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    function nativeSubject() {
        return (document.body && document.body.getAttribute('data-native-subject')) || '';
    }

    // Idioma con el que se muestra una materia nativa: el que eligió en la sesión o el suyo
    function subjectLang(subject) {
        const chosen = getCookie('lang_' + subject);
        return LANGS.includes(chosen) ? chosen : NATIVE_LANG[subject];
    }

    function getLang() {
        if (pageLang) return pageLang;
        let stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
        const lang = stored || getCookie('lang');
        return LANGS.includes(lang) ? lang : DEFAULT_LANG;
    }

    function setLang(lang) {
        if (!LANGS.includes(lang)) lang = DEFAULT_LANG;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage blocked */ }
        document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
        if (document.documentElement) {
            document.documentElement.lang = lang;
        }
    }

    // Dictionary text for a key, or undefined when no dictionary has it.
    function lookup(key, lang) {
        const dict = window.i18n || {};
        const value = (dict[lang] && dict[lang][key]) || (dict[DEFAULT_LANG] && dict[DEFAULT_LANG][key]);
        return value || undefined;
    }

    function t(key, lang) {
        return lookup(key, lang || getLang()) || key;
    }

    // Get plain display text for an object
    function getDisplayText(textObj, lang) {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;
        if (typeof textObj !== 'object') return String(textObj);
        lang = lang || getLang();
        return textObj[lang] || textObj.es || textObj.de || textObj.en || '';
    }

    function getPrimaryText(textObj, lang) {
        return getDisplayText(textObj, lang);
    }

    // Get multilingual HTML with proper formatting
    function getDisplayHTML(textObj, lang) {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;
        if (typeof textObj !== 'object') return String(textObj);
        lang = lang || getLang();

        const text = textObj[lang] || textObj.es || textObj.de || textObj.en || '';
        // If content is an HTML block (like list items or divs), preserve structure
        if (typeof text === 'string' && (text.trim().startsWith('<li') || text.trim().startsWith('<div') || text.trim().startsWith('<p'))) {
            return text;
        }
        return `<span class="lang-line lang-primary">${text}</span>`;
    }

    function parseLangJson(raw) {
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e1) {
            try {
                const txt = document.createElement('textarea');
                txt.innerHTML = raw;
                return JSON.parse(txt.value);
            } catch (e2) {
                return null;
            }
        }
    }

    function updateUI(lang) {
        lang = lang || getLang();

        // 1. Update simple i18n text
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const value = lookup(el.getAttribute('data-i18n'), lang);
            if (value) el.textContent = value;
        });

        // 2. Update i18n HTML
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const value = lookup(el.getAttribute('data-i18n-html'), lang);
            if (value) el.innerHTML = value;
        });

        // 3. Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const value = lookup(el.getAttribute('data-i18n-placeholder'), lang);
            if (value) el.placeholder = value;
        });

        // 3b. Update tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const value = lookup(el.getAttribute('data-i18n-title'), lang);
            if (value) el.title = value;
        });

        // 4. Update select option text (data-i18n-option)
        document.querySelectorAll('[data-i18n-option]').forEach(el => {
            const value = lookup(el.getAttribute('data-i18n-option'), lang);
            if (value) el.textContent = value;
        });

        // 5. Update multilingual content blocks [data-lang-content]
        document.querySelectorAll('[data-lang-content]').forEach(el => {
            const raw = el.getAttribute('data-lang-content');
            const textObj = parseLangJson(raw);
            if (textObj) {
                el.innerHTML = getDisplayHTML(textObj, lang);
            }
        });

        // 6. Update pipe/colon format: data-lang="es:...|de:...|en:..."
        document.querySelectorAll('[data-lang]:not(.lang-btn):not(.login-lang-btn):not(.h-lang-btn)').forEach(el => {
            const raw = el.getAttribute('data-lang');
            if (raw && raw.includes(':')) {
                const parts = raw.split('|');
                const match = parts.find(p => p.trim().startsWith(lang + ':'));
                if (match) {
                    el.textContent = match.trim().substring(lang.length + 1);
                } else {
                    const fallback = parts.find(p => p.trim().startsWith('de:') || p.trim().startsWith('es:') || p.trim().startsWith('en:'));
                    if (fallback) el.textContent = fallback.trim().substring(fallback.trim().indexOf(':') + 1);
                }
            }
        });

        // 7. Update subject options with data-names JSON
        document.querySelectorAll('option[data-names]').forEach(opt => {
            const names = parseLangJson(opt.getAttribute('data-names'));
            if (names) {
                const icon = opt.getAttribute('data-icon') || '';
                const name = names[lang] || names.es || names.de || names.en || '';
                const notEnabledText = lookup('notEnabled', lang) || '(No habilitada)';
                opt.textContent = `${icon ? icon + ' ' : ''}${name}${opt.disabled ? ' ' + notEnabledText : ''}`;
            }
        });

        // 8. Update button active states across all language switchers
        document.querySelectorAll('.lang-btn, .login-lang-btn, .h-lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        if (document.documentElement) {
            document.documentElement.lang = lang;
        }

        // 9. Dispatch custom event so pages can perform additional reactive updates
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    function switchLang(lang) {
        if (!lang) return;
        setLang(lang);
        if (pageLang) pageLang = lang;
        if (document.body) {
            document.body.classList.add('lang-transitioning');
        }
        updateUI(lang);
        setTimeout(() => {
            if (document.body) {
                document.body.classList.remove('lang-transitioning');
            }
        }, 300);
    }

    // Muestra la página en el idioma nativo de una materia (Alemán → de, Inglés → en) sin cambiar
    // la preferencia general; con otra materia (o ninguna) vuelve a la preferencia. Lo usa el
    // inicio del estudiante al elegir la materia.
    function showSubjectLang(subject) {
        const native = NATIVE_LANG[subject];
        if (document.body) {
            if (native) document.body.setAttribute('data-native-subject', subject);
            else document.body.removeAttribute('data-native-subject');
        }
        if (!native) {
            if (pageLang) {
                pageLang = null;
                updateUI(getLang());
            }
            return;
        }
        pageLang = subjectLang(subject);
        updateUI(pageLang);
    }

    let initialized = false;
    function init() {
        if (initialized) return;
        initialized = true;

        // Página de una materia nativa (la marca el servidor): se muestra en su idioma sin guardarlo
        const declared = document.body && document.body.getAttribute('data-page-lang');
        let lang;
        if (nativeSubject() && LANGS.includes(declared)) {
            pageLang = declared;
            lang = declared;
            if (document.documentElement) document.documentElement.lang = lang;
        } else {
            lang = getLang();
            setLang(lang);
        }

        document.querySelectorAll('.lang-btn, .login-lang-btn, .h-lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newLang = btn.getAttribute('data-lang');
                if (newLang) {
                    // En una materia nativa, la elección vale para esa materia durante la sesión
                    const subject = nativeSubject();
                    if (subject) document.cookie = `lang_${subject}=${newLang};path=/;SameSite=Lax`;
                    switchLang(newLang);
                }
            });
        });

        updateUI(lang);
    }

    window.langUtils = {
        getLang, setLang, switchLang, t,
        getDisplayText, getDisplayHTML, getPrimaryText,
        updateUI, init, showSubjectLang
    };
    window.t = t;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
