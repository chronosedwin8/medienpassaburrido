// Perfiles del panel administrativo y lo que puede hacer cada uno.
// El rol de cada cuenta está en data/teacher_roles.json (correo → rol) y se lee en cada petición,
// así que quitar o cambiar un rol surte efecto en el siguiente clic.
//   desarrollador: todo, incluida la configuración ("admin" es el mismo perfil, nombre anterior).
//   directivo y coordinador: informes, certificados y listas de solo lectura.
// (La bitácora de novedades se retiró: ya no hay permiso de novedades.)
const fs = require('fs');

const PROFILES = ['coordinador', 'directivo', 'desarrollador']; // orden de los botones de entrada
const ASSIGNABLE_ROLES = ['profesor', 'coordinador', 'directivo', 'desarrollador'];
const ROLE_ALIASES = { admin: 'desarrollador' };

const PERMISSIONS = {
    desarrollador: ['configure', 'reports', 'certificates', 'lists'],
    directivo: ['reports', 'certificates', 'lists'],
    coordinador: ['reports', 'certificates', 'lists']
};
const ALL_PERMISSIONS = PERMISSIONS.desarrollador;

function normalizeRole(role) {
    const value = String(role || '').trim().toLowerCase();
    return ROLE_ALIASES[value] || value || 'profesor';
}

const isPanelRole = role => Object.prototype.hasOwnProperty.call(PERMISSIONS, normalizeRole(role));
const can = (role, permission) => (PERMISSIONS[normalizeRole(role)] || []).includes(permission);
const permissionsOf = role => Object.fromEntries(ALL_PERMISSIONS.map(p => [p, can(role, p)]));

// { correo en minúsculas: rol tal como está guardado }
function readRoles(file) {
    try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
        return Object.fromEntries(Object.entries(data).map(([email, role]) => [String(email).trim().toLowerCase(), role]));
    } catch (e) {
        return {};
    }
}

// Rol normalizado de un correo ("profesor" si no tiene rol)
function roleOf(file, email) {
    const key = String(email || '').trim().toLowerCase();
    return key ? normalizeRole(readRoles(file)[key]) : 'profesor';
}

// Ingreso al panel con correo y documento correctos: 'ok', 'not_panel' (no tiene perfil del panel)
// o 'mismatch' (entró por el botón de otro perfil).
function checkProfile(role, chosenProfile) {
    const normalized = normalizeRole(role);
    if (!isPanelRole(normalized)) return 'not_panel';
    return normalized === chosenProfile ? 'ok' : 'mismatch';
}

module.exports = { PROFILES, ASSIGNABLE_ROLES, PERMISSIONS, normalizeRole, isPanelRole, can, permissionsOf, readRoles, roleOf, checkProfile };
