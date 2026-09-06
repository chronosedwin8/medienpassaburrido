/**
 * auth.js — Identidad, roles y control de acceso.
 *
 * Un solo modelo de usuario para estudiantes y personal, sustituyendo los tres
 * sistemas de login paralelos y los cuatro middlewares que había.
 *
 * Fuentes de identidad del personal, en orden de prioridad:
 *   1. data/users.json   — cuentas locales con contraseña cifrada (scrypt)
 *   2. tabla `teachers`  — login histórico por número de documento
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const session = require('./session');

const USERS_PATH = path.join(__dirname, '..', 'data', 'users.json');

/* ── Contraseñas (scrypt) ─────────────────────────────────── */

function hashPassword(plain) {
    const salt = crypto.randomBytes(16);
    const derived = crypto.scryptSync(String(plain), salt, 64);
    return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

function verifyPassword(plain, stored) {
    if (!stored || !String(stored).startsWith('scrypt$')) return false;
    const parts = String(stored).split('$');
    try {
        const derived = crypto.scryptSync(String(plain), Buffer.from(parts[1], 'hex'), 64);
        return crypto.timingSafeEqual(derived, Buffer.from(parts[2], 'hex'));
    } catch (e) {
        return false;
    }
}

/* ── Almacén local de personal ────────────────────────────── */

function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    } catch (e) {
        return {};
    }
}

async function writeUsers(users) {
    await fsp.mkdir(path.dirname(USERS_PATH), { recursive: true });
    const tmp = `${USERS_PATH}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(users, null, 2), 'utf8');
    await fsp.rename(tmp, USERS_PATH);
}

function findLocalUser(email) {
    const users = readUsers();
    return users[config.normalizeEmail(email)] || null;
}

/** Crea o actualiza una cuenta local de personal. */
async function upsertUser(email, opts) {
    const o = opts || {};
    const users = readUsers();
    const key = config.normalizeEmail(email);
    const existing = users[key] || {};

    users[key] = {
        email: key,
        role: o.role || existing.role || 'profesor',
        firstName: o.firstName !== undefined ? o.firstName : (existing.firstName || ''),
        lastName: o.lastName !== undefined ? o.lastName : (existing.lastName || ''),
        subject: o.subject !== undefined ? o.subject : (existing.subject || null),
        passwordHash: o.password ? hashPassword(o.password) : (existing.passwordHash || null),
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await writeUsers(users);
    return users[key];
}

async function deleteUser(email) {
    const users = readUsers();
    delete users[config.normalizeEmail(email)];
    await writeUsers(users);
}

function listUsers() {
    return Object.values(readUsers()).map(u => {
        const safe = Object.assign({}, u);
        delete safe.passwordHash;
        safe.hasPassword = !!u.passwordHash;
        return safe;
    });
}

/* ── Roles y permisos ─────────────────────────────────────── */

/** Posición del rol en la jerarquía; -1 si no existe. */
function rank(role) {
    return config.roles().hierarchy.indexOf(role);
}

/** ¿`role` tiene al menos el nivel de `minimum`? */
function atLeast(role, minimum) {
    const r = rank(role);
    const m = rank(minimum);
    return r >= 0 && m >= 0 && r >= m;
}

const PERMISSIONS = {
    'activity:submit':  'estudiante',
    'docs:read':        'estudiante',
    'teacher:area':     'profesor',
    'instruments:edit': 'profesor',
    'instruments:ai':   'profesor',
    'incidents:manage': 'profesor',
    'admin:area':       'desarrollador',
    'admin:reports':    'desarrollador',
    'admin:inventory':  'desarrollador',
    'admin:config':     'coordinador',
    'admin:i18n':       'coordinador',
    'admin:teachers':   'coordinador',
    'admin:users':      'directivo',
    'admin:database':   'superadmin'
};

function can(role, permission) {
    const required = PERMISSIONS[permission];
    if (!required) return false;
    return atLeast(role, required);
}

/* ── Autenticación ────────────────────────────────────────── */

/** Comparación de secretos en tiempo constante. */
function secretsMatch(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

/**
 * Valida credenciales de personal.
 * @returns {Promise<Object|null>} perfil normalizado del usuario
 */
async function authenticateStaff(email, password, supabase) {
    const cleanEmail = config.normalizeEmail(email);
    const cleanPassword = String(password || '').trim();
    if (!cleanEmail || !cleanPassword) return null;

    // 1. Administrador de emergencia (solo si ADMIN_PASSWORD está definida)
    const bootstrapPwd = config.bootstrapAdminPassword();
    if (bootstrapPwd && cleanEmail === `admin@${config.school().emailDomain}`) {
        if (secretsMatch(cleanPassword, bootstrapPwd)) {
            return {
                id: 'bootstrap-admin', email: cleanEmail, role: 'superadmin',
                firstName: 'Administrador', lastName: 'de emergencia', source: 'bootstrap'
            };
        }
    }

    // 2. Cuenta local con contraseña cifrada
    const local = findLocalUser(cleanEmail);
    if (local && local.passwordHash && verifyPassword(cleanPassword, local.passwordHash)) {
        return {
            id: local.email, email: local.email, role: local.role,
            firstName: local.firstName, lastName: local.lastName,
            subject: local.subject, source: 'local'
        };
    }

    // 3. Login histórico: correo + número de documento en la tabla `teachers`.
    //    Se conserva para no dejar fuera al claustro; el rol NUNCA sale de la
    //    cookie, siempre del almacén local o del mapa de roles heredado.
    if (supabase) {
        try {
            const result = await supabase
                .from('teachers').select('*')
                .eq('email', cleanEmail).eq('doc_number', cleanPassword)
                .single();
            const teacher = result && result.data;

            if (teacher) {
                return {
                    id: teacher.id, email: teacher.email,
                    role: (local && local.role) || legacyRoleFor(teacher.email) || 'profesor',
                    firstName: teacher.first_name, lastName: teacher.last_name,
                    subject: teacher.subject, source: 'legacy'
                };
            }
        } catch (e) { /* credenciales inválidas */ }
    }

    return null;
}

/** Roles heredados de data/teacher_roles.json (compatibilidad). */
function legacyRoleFor(email) {
    try {
        const rolesPath = path.join(__dirname, '..', 'data', 'teacher_roles.json');
        const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
        const role = roles[config.normalizeEmail(email)];
        return rank(role) >= 0 ? role : null;
    } catch (e) {
        return null;
    }
}

/* ── Middleware ───────────────────────────────────────────── */

/** Carga la sesión en req.user y res.locals para todas las peticiones. */
function loadSession(req, res, next) {
    const user = session.read(req);
    req.user = user;
    res.locals.user = user;
    res.locals.isStaff = !!(user && user.kind === 'staff');
    res.locals.isStudent = !!(user && user.kind === 'student');
    res.locals.can = permission => !!(user && can(user.role, permission));
    next();
}

function denied(req, res, redirectTo, message) {
    if (req.path.startsWith('/api/')) {
        return res.status(req.user ? 403 : 401).json({ success: false, error: message });
    }
    return res.redirect(redirectTo);
}

/**
 * Exige una sesión con permiso suficiente.
 * @param {string|null} permission clave de PERMISSIONS, o null para solo exigir sesión
 */
function requirePermission(permission, options) {
    const loginPath = (options && options.loginPath) || '/login';
    return (req, res, next) => {
        if (!req.user) {
            return denied(req, res, loginPath, 'Debes iniciar sesión.');
        }
        if (permission && !can(req.user.role, permission)) {
            return denied(req, res, '/', 'No tienes permisos para esta sección.');
        }
        next();
    };
}

/** Exige que la sesión sea de estudiante. */
function requireStudent(req, res, next) {
    if (!req.user || req.user.kind !== 'student') {
        return denied(req, res, '/login', 'Debes iniciar sesión como estudiante.');
    }
    next();
}

module.exports = {
    hashPassword, verifyPassword,
    readUsers, writeUsers, listUsers, upsertUser, deleteUser, findLocalUser,
    rank, atLeast, can, PERMISSIONS,
    authenticateStaff, legacyRoleFor,
    loadSession, requirePermission, requireStudent,
    USERS_PATH
};
