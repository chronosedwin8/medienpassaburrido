/**
 * config.js — Configuración central de la aplicación.
 *
 * Única fuente de verdad para colegio, grados, idiomas, roles y sesión.
 * Todo valor sensible se toma del entorno; nada de contraseñas por defecto.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'app.config.json');

let cache = null;
let cacheMtime = 0;

/** Carga la configuración, recargándola si el archivo cambió en disco. */
function load() {
    try {
        const stat = fs.statSync(CONFIG_PATH);
        if (!cache || stat.mtimeMs !== cacheMtime) {
            cache = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
            cacheMtime = stat.mtimeMs;
        }
    } catch (e) {
        if (!cache) throw new Error(`No se pudo leer config/app.config.json: ${e.message}`);
    }
    return cache;
}

const cfg = () => load();

/* ── Secretos ─────────────────────────────────────────────── */

let generatedSecret = null;

/**
 * Clave para firmar las sesiones. En producción es obligatoria: sin ella las
 * sesiones no sobreviven a un reinicio y no se pueden repartir entre réplicas.
 */
function sessionSecret() {
    const fromEnv = (process.env.SESSION_SECRET || '').trim();
    if (fromEnv.length >= 16) return fromEnv;

    if (!generatedSecret) {
        generatedSecret = crypto.randomBytes(32).toString('hex');
        const msg = process.env.NODE_ENV === 'production'
            ? '🚨 SESSION_SECRET no está definida. Se generó una clave temporal: las sesiones se invalidarán en cada reinicio. Define SESSION_SECRET en las variables de entorno.'
            : '⚠️  SESSION_SECRET no definida; se usa una clave temporal solo para desarrollo.';
        console.warn(msg);
    }
    return generatedSecret;
}

/** Contraseña del administrador de emergencia. Sin valor por defecto. */
function bootstrapAdminPassword() {
    const pwd = (process.env.ADMIN_PASSWORD || '').trim();
    return pwd.length >= 8 ? pwd : null;
}

/* ── Accesos de conveniencia ──────────────────────────────── */

const school = () => cfg().school;
const academic = () => cfg().academic;
const i18nConfig = () => cfg().i18n;
const sessionConfig = () => cfg().session;
const roles = () => cfg().roles;

/** Normaliza un correo: minúsculas y dominio institucional si se omitió. */
function normalizeEmail(email) {
    let clean = String(email || '').trim().toLowerCase();
    if (!clean) return '';
    if (!clean.includes('@')) clean += `@${school().emailDomain}`;
    return clean;
}

/** Idioma por defecto para un curso ("5A" → "de"). */
function defaultLangForKlasse(className) {
    const conf = i18nConfig();
    const klasse = String(className || '').match(/^\d+/);
    if (klasse && conf.studentDefaultByKlasse[klasse[0]]) {
        return conf.studentDefaultByKlasse[klasse[0]];
    }
    return conf.default;
}

/** Lista de cursos válidos ("2A", "2B", ... "12D"). */
function allClassNames() {
    const { klassen, kurse } = academic();
    return klassen.flatMap(k => kurse.map(c => `${k}${c}`));
}

module.exports = {
    load, school, academic, i18nConfig, sessionConfig, roles,
    sessionSecret, bootstrapAdminPassword,
    normalizeEmail, defaultLangForKlasse, allClassNames,
    CONFIG_PATH
};
