/**
 * i18n.js — Traducciones del lado del servidor.
 *
 * Las traducciones viven en config/i18n/<lang>.json (datos, no código).
 * Antes se guardaban como JavaScript ejecutable en public/js/i18n.js, se leían
 * con vm.runInNewContext() y se reescribían generando código: cualquier texto
 * que un administrador escribiera terminaba ejecutándose en el navegador de
 * todos los usuarios.
 *
 * Traducir en el servidor evita además el parpadeo de idioma: el HTML sale ya
 * en la lengua correcta en lugar de renderizarse en español y cambiar después.
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const config = require('./config');

const I18N_DIR = path.join(__dirname, '..', 'config', 'i18n');

const cache = new Map();
const mtimes = new Map();

/** Carga un diccionario, recargándolo si cambió en disco. */
function dict(lang) {
    const file = path.join(I18N_DIR, `${lang}.json`);
    try {
        const stat = fs.statSync(file);
        if (!cache.has(lang) || mtimes.get(lang) !== stat.mtimeMs) {
            cache.set(lang, JSON.parse(fs.readFileSync(file, 'utf8')));
            mtimes.set(lang, stat.mtimeMs);
        }
        return cache.get(lang);
    } catch (e) {
        return cache.get(lang) || {};
    }
}

const languages = () => config.i18nConfig().languages;
const defaultLang = () => config.i18nConfig().default;

function isSupported(lang) {
    return languages().includes(lang);
}

/**
 * Traduce una clave. Si falta, cae al idioma por defecto y, en último término,
 * devuelve la propia clave para que el hueco sea visible en vez de silencioso.
 * Admite sustituciones: t('hello', 'es', { name: 'Ana' }) → "Hola, {name}".
 */
function t(key, lang, vars) {
    const language = isSupported(lang) ? lang : defaultLang();
    let text = dict(language)[key];

    if (text === undefined) text = dict(defaultLang())[key];
    if (text === undefined) return key;

    if (vars) {
        for (const [name, value] of Object.entries(vars)) {
            text = text.split(`{${name}}`).join(String(value));
        }
    }
    return text;
}

/**
 * Elige el texto de un objeto multilingüe ({ es, de, en }), como los que trae
 * data.js. Respeta la regla pedagógica del colegio: en alemán e inglés se
 * muestra también el español como apoyo.
 */
function pick(textObj, lang) {
    if (textObj === null || textObj === undefined) return '';
    if (typeof textObj === 'string') return textObj;
    if (typeof textObj !== 'object') return String(textObj);

    const language = isSupported(lang) ? lang : defaultLang();
    return textObj[language] || textObj[defaultLang()] || textObj.es || textObj.de || textObj.en || '';
}

/**
 * Resuelve el idioma de la petición, por orden de prioridad:
 *   ?lang= → cookie → idioma propio del curso del estudiante → por defecto
 */
function resolve(req, user) {
    // 1. Cambio explicito en esta peticion
    const fromQuery = req.query && req.query.lang;
    if (isSupported(fromQuery)) return fromQuery;

    // 2. El idioma que la persona eligio al entrar, guardado en la sesion
    //    firmada: acompaña a la persona aunque se borren las cookies del sitio.
    if (user && isSupported(user.lang)) return user.lang;

    // 3. Cookie del navegador
    const fromCookie = req.cookies && req.cookies.lang;
    if (isSupported(fromCookie)) return fromCookie;

    if (user && user.kind === 'student' && user.className) {
        return config.defaultLangForKlasse(user.className);
    }
    if (user && user.kind === 'staff') {
        const staffDefault = config.i18nConfig().staffDefault;
        if (isSupported(staffDefault)) return staffDefault;
    }
    return defaultLang();
}

/** Middleware: expone lang, t() y pick() a todas las vistas. */
function middleware(req, res, next) {
    const lang = resolve(req, req.user);

    // Si llega ?lang=, se recuerda la elección
    if (req.query && req.query.lang && isSupported(req.query.lang)) {
        res.cookie('lang', req.query.lang, {
            maxAge: 365 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
            path: '/'
        });
    }

    req.lang = lang;
    res.locals.lang = lang;
    res.locals.languages = languages();
    res.locals.t = (key, vars) => t(key, lang, vars);
    res.locals.pick = textObj => pick(textObj, lang);
    // Un solo idioma para toda la interfaz, sin excepciones por seccion.
    res.locals.display = textObj => display(textObj, lang);
    next();
}

/** Diccionario completo de un idioma, para el cliente. */
function bundle(lang) {
    const language = isSupported(lang) ? lang : defaultLang();
    return { ...dict(defaultLang()), ...dict(language) };
}

/** Todos los diccionarios (para el editor de administración). */
function all() {
    return Object.fromEntries(languages().map(l => [l, dict(l)]));
}

/** Guarda el diccionario de un idioma. Solo datos: nunca genera código. */
async function save(lang, translations) {
    if (!isSupported(lang)) throw new Error(`Idioma no soportado: ${lang}`);
    if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
        throw new Error('Las traducciones deben ser un objeto de clave → texto.');
    }

    const clean = {};
    for (const key of Object.keys(translations).sort()) {
        const value = translations[key];
        if (typeof value === 'string') clean[key] = value;
    }

    const file = path.join(I18N_DIR, `${lang}.json`);
    const tmp = `${file}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(clean, null, 2) + '\n', 'utf8');
    await fsp.rename(tmp, file);

    cache.delete(lang);
    mtimes.delete(lang);
    return Object.keys(clean).length;
}

/** Claves presentes en el idioma por defecto que faltan en los demás. */
function missingKeys() {
    const base = Object.keys(dict(defaultLang()));
    const report = {};
    for (const lang of languages()) {
        if (lang === defaultLang()) continue;
        const own = dict(lang);
        report[lang] = base.filter(k => own[k] === undefined);
    }
    return report;
}

module.exports = {
    t, pick, resolve, middleware, bundle, all, save,
    languages, defaultLang, isSupported, missingKeys, dict, I18N_DIR
};

/* ────────────────────────────────────────────────────────────
   Regla de presentación del colegio
   ──────────────────────────────────────────────────────────── */

/**
 * Devuelve { primary, support } para un texto multilingüe.
 *
 * El idioma es UNO para toda la interfaz: el que la persona eligió. Antes había
 * excepciones por sección (Tecnología se forzaba a español) y el intercambio se
 * hacía en el navegador con public/js/lang.js, un archivo que además NUNCA se
 * cargaba: el selector no hacía nada y el estudiante veía alemán con "ES"
 * seleccionado. Ahora se resuelve en el servidor y no depende de dónde esté.
 *
 * En alemán e inglés se añade el español debajo como apoyo, que es la regla
 * pedagógica del colegio; en español no hace falta.
 */
function display(textObj, lang) {
    if (!textObj) return { primary: '', support: '' };
    if (typeof textObj === 'string') return { primary: textObj, support: '' };

    const language = isSupported(lang) ? lang : defaultLang();

    if (language === 'es') {
        return { primary: textObj.es || textObj.de || textObj.en || '', support: '' };
    }

    const primary = textObj[language] || textObj.es || textObj.de || textObj.en || '';
    const support = textObj.es && textObj.es !== primary ? textObj.es : '';
    return { primary, support };
}

module.exports.display = display;
