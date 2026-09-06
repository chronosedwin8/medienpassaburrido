/**
 * session.js — Sesiones firmadas (HMAC-SHA256).
 *
 * Sustituye a las cookies `admin_auth=true`, `teacher_auth=true`,
 * `teacher_data`, `admin_user`, `student_id` y `student_data`, que el cliente
 * podía escribir a mano para concederse cualquier rol.
 *
 * El contenido de la sesión sigue siendo legible (va en base64), pero cualquier
 * modificación invalida la firma y el servidor la rechaza.
 */

const crypto = require('crypto');
const config = require('./config');

const b64url = buf => Buffer.from(buf).toString('base64url');

function sign(payloadB64) {
    return crypto
        .createHmac('sha256', config.sessionSecret())
        .update(payloadB64)
        .digest('base64url');
}

/** Comparación en tiempo constante: evita filtrar la firma por temporización. */
function safeEqual(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Serializa y firma una sesión.
 * @param {Object} data  { sub, kind, role, name, email, className, ... }
 * @param {number} ttlHours
 */
function create(data, ttlHours) {
    const payload = {
        ...data,
        iat: Date.now(),
        exp: Date.now() + ttlHours * 60 * 60 * 1000
    };
    const encoded = b64url(JSON.stringify(payload));
    return `${encoded}.${sign(encoded)}`;
}

/**
 * Verifica y decodifica una sesión.
 * @returns {Object|null} la sesión, o null si es inválida, falsificada o expiró.
 */
function verify(token) {
    if (!token || typeof token !== 'string') return null;
    const dot = token.lastIndexOf('.');
    if (dot < 1) return null;

    const encoded = token.slice(0, dot);
    const signature = token.slice(dot + 1);

    if (!safeEqual(signature, sign(encoded))) return null;

    try {
        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
        if (!payload.exp || Date.now() > payload.exp) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

/** Escribe la cookie de sesión. */
function attach(res, data, ttlHours) {
    const { cookieName } = config.sessionConfig();
    const token = create(data, ttlHours);
    res.cookie(cookieName, token, {
        maxAge: ttlHours * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    });
    return token;
}

/** Lee y valida la sesión de la petición. */
function read(req) {
    const { cookieName } = config.sessionConfig();
    return verify(req.cookies && req.cookies[cookieName]);
}

/** Cierra la sesión y limpia las cookies inseguras heredadas. */
function destroy(res) {
    const { cookieName } = config.sessionConfig();
    res.clearCookie(cookieName, { path: '/' });
    ['admin_auth', 'admin_user', 'teacher_auth', 'teacher_data', 'student_id', 'student_data']
        .forEach(name => res.clearCookie(name, { path: '/' }));
}

module.exports = { create, verify, attach, read, destroy };
