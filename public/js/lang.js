/**
 * lang.js - Language Switcher for MedienPass App
 * 
 * Display rules (updated):
 * - DE selected: Show German (primary) + Spanish (secondary)
 * - EN selected: Show English (primary) + Spanish (secondary)
 * - ES selected / Tecnología: Show ONLY Spanish
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'medienpass_lang';
    const DEFAULT_LANG = 'de';

    function getLang() {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    }

    function setLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    }

    // Get display text based on language rules
    function getDisplayText(textObj, lang) {
        if (!textObj || typeof textObj === 'string') return textObj || '';
        if (typeof textObj !== 'object') return String(textObj);
        lang = lang || getLang();

        const isTechSection = document.body && document.body.getAttribute('data-section') === 'tecnologia';

        if (lang === 'es' || isTechSection) {
            // Spanish mode (or Tech Section): show ONLY Spanish
            return textObj.es || textObj.de || '';
        } else if (lang === 'en') {
            // English mode: primary English + secondary Spanish
            const primary = textObj.en || textObj.de || '';
            const secondary = textObj.es || '';
            if (primary && secondary && primary !== secondary) {
                return primary + '\n' + secondary;
            }
            return primary || secondary;
        } else {
            // German mode: primary German + secondary Spanish
            const primary = textObj.de || '';
            const secondary = textObj.es || '';
            if (primary && secondary && primary !== secondary) {
                return primary + '\n' + secondary;
            }
            return primary || secondary;
        }
    }

    function getPrimaryText(textObj, lang) {
        if (!textObj || typeof textObj === 'string') return textObj || '';
        if (typeof textObj !== 'object') return String(textObj);
        lang = lang || getLang();
        return textObj[lang] || textObj.de || '';
    }

    // Get multilingual HTML with proper formatting
    function getDisplayHTML(textObj, lang) {
        if (!textObj || typeof textObj === 'string') return textObj || '';
        if (typeof textObj !== 'object') return String(textObj);
        lang = lang || getLang();

        const isTechSection = document.body && document.body.getAttribute('data-section') === 'tecnologia';

        if (lang === 'es' || isTechSection) {
            // Spanish mode (or Tech Section): show ONLY Spanish
            const es = textObj.es || textObj.de || '';
            return `<span class="lang-line lang-primary">${es}</span>`;
        } else if (lang === 'en') {
            // English mode: English primary + Spanish secondary (small below)
            const primary = textObj.en || textObj.de || '';
            const secondary = textObj.es || '';
            let html = `<span class="lang-line lang-primary">${primary}</span>`;
            if (secondary && secondary !== primary) {
                html += `<br><span class="lang-line lang-secondary" style="font-size:0.7em; opacity:0.8;">${secondary}</span>`;
            }
            return html;
        } else {
            // German mode: German primary + Spanish secondary (in parentheses)
            const primary = textObj.de || '';
            const secondary = textObj.es || '';
            let html = `<span class="lang-line lang-primary">${primary}</span>`;
            if (secondary && secondary !== primary) {
                html += ` <span class="lang-line lang-secondary" style="font-size:0.9em; opacity:0.9;">(${secondary})</span>`;
            }
            return html;
        }
    }

    function updateUI(lang) {
        lang = lang || getLang();
        const t = window.i18n ? window.i18n[lang] : {};

        // Update simple i18n text
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.textContent = t[key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) {
                el.placeholder = t[key];
            }
        });

        // Update select option text (data-i18n-option)
        document.querySelectorAll('[data-i18n-option]').forEach(el => {
            const key = el.getAttribute('data-i18n-option');
            if (t[key]) {
                el.textContent = t[key];
            }
        });

        // Update multilingual content blocks
        document.querySelectorAll('[data-lang-content]').forEach(el => {
            try {
                const textObj = JSON.parse(el.getAttribute('data-lang-content'));
                el.innerHTML = getDisplayHTML(textObj, lang);
            } catch (e) { /* ignore */ }
        });

        // Update button active states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        document.documentElement.lang = lang;
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    }

    function switchLang(lang) {
        setLang(lang);
        document.body.classList.add('lang-transitioning');
        updateUI(lang);
        setTimeout(() => {
            document.body.classList.remove('lang-transitioning');
        }, 300);
    }

    function init() {
        const lang = getLang();
        setLang(lang);

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newLang = btn.getAttribute('data-lang');
                switchLang(newLang);
            });
        });

        updateUI(lang);
    }

    window.langUtils = {
        getLang, setLang, switchLang,
        getDisplayText, getDisplayHTML, getPrimaryText,
        updateUI, init
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
