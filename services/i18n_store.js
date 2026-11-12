/**
 * i18n_store.js - Interface text dictionaries (DE / EN / ES)
 * Reads the same public/js/i18n*.js files the browser loads, so the server can render
 * pages already translated, and lets the admin panel ("Textos e idiomas") edit them.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const vm = require('vm');

const LANGS = ['de', 'en', 'es'];
const DEFAULT_LANG = 'es';
const JS_DIR = path.join(__dirname, '..', 'public', 'js');

// One file per portal, so each page only downloads the texts it uses.
// New keys use a prefix per section (doc_, adm_, man_) because all sections merge into
// a single window.i18n in the browser.
const SECTIONS = {
    comun: { file: 'i18n.js', label: 'Común y estudiantes' },
    docentes: { file: 'i18n-docentes.js', label: 'Portal docente' },
    admin: { file: 'i18n-admin.js', label: 'Panel admin' },
    manuales: { file: 'i18n-manuales.js', label: 'Manuales' }
};

let dicts = {};   // { comun: { de, en, es }, ... }
let merged = {};  // every section together: { de: {...}, en: {...}, es: {...} }
let version = Date.now(); // changes on every (re)load so browsers fetch fresh files

function emptyDict() {
    return { de: {}, en: {}, es: {} };
}

// Evaluates the file the way the browser would and keeps what it puts in module.exports.
function readSection(id) {
    const file = path.join(JS_DIR, SECTIONS[id].file);
    if (!fs.existsSync(file)) return emptyDict();
    const sandbox = { window: {}, module: { exports: {} } };
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
    const source = sandbox.module.exports || {};
    const dict = emptyDict();
    LANGS.forEach(lang => { dict[lang] = { ...(source[lang] || {}) }; });
    return dict;
}

function load() {
    const nextDicts = {};
    const nextMerged = emptyDict();
    for (const id of Object.keys(SECTIONS)) {
        nextDicts[id] = readSection(id);
        LANGS.forEach(lang => Object.assign(nextMerged[lang], nextDicts[id][lang]));
    }
    dicts = nextDicts;
    merged = nextMerged;
    version = Date.now();
}

function normalizeLang(lang) {
    return LANGS.includes(lang) ? lang : DEFAULT_LANG;
}

// Text for a key: requested language → Spanish → the key itself (so gaps are visible).
function translate(key, lang) {
    const l = normalizeLang(lang);
    return merged[l][key] || merged[DEFAULT_LANG][key] || key;
}

// Dictionary sections each portal needs, by URL.
function sectionsForPath(urlPath) {
    const p = urlPath || '';
    if (p.startsWith('/admin')) return ['comun', 'admin'];
    if (p.startsWith('/teacher')) return ['comun', 'docentes'];
    if (p.startsWith('/docs')) return ['comun', 'docentes', 'manuales'];
    return ['comun'];
}

// <script> tags for the page's dictionaries plus lang.js.
function scriptTags(urlPath) {
    const files = sectionsForPath(urlPath).map(id => SECTIONS[id].file).concat('lang.js');
    return files.map(file => `<script src="/js/${file}?v=${version}"></script>`).join('\n    ');
}

function serialize(id, dict) {
    return `/**
 * ${SECTIONS[id].file} - Textos de la interfaz (${SECTIONS[id].label}) en alemán, inglés y español.
 * Se edita desde el panel admin: Administración › Textos e idiomas.
 */
(function (dict) {
    if (typeof window !== 'undefined') {
        window.i18n = window.i18n || {};
        Object.keys(dict).forEach(function (lang) {
            window.i18n[lang] = Object.assign(window.i18n[lang] || {}, dict[lang]);
        });
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = dict;
    }
})(${JSON.stringify(dict, null, 4)});
`;
}

// Writes are chained so two saves from the panel never interleave.
let writeChain = Promise.resolve();
function saveSection(id, data) {
    const run = writeChain.then(async () => {
        if (!SECTIONS[id]) throw new Error('Sección de textos desconocida: ' + id);
        const dict = emptyDict();
        LANGS.forEach(lang => {
            Object.entries((data && data[lang]) || {}).forEach(([key, value]) => {
                dict[lang][key] = String(value);
            });
        });
        const file = path.join(JS_DIR, SECTIONS[id].file);
        const tmp = `${file}.tmp`;
        await fsp.writeFile(tmp, serialize(id, dict), 'utf8');
        await fsp.rename(tmp, file);
        load();
    });
    writeChain = run.catch(() => {});
    return run;
}

function getSection(id) {
    return dicts[id] || emptyDict();
}

function listSections() {
    return Object.entries(SECTIONS).map(([id, s]) => ({ id, label: s.label, file: s.file }));
}

load();

module.exports = {
    LANGS,
    DEFAULT_LANG,
    normalizeLang,
    translate,
    sectionsForPath,
    scriptTags,
    getSection,
    listSections,
    saveSection,
    reload: load
};
