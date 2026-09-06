#!/usr/bin/env node
/**
 * usuarios.js — Gestión de cuentas del personal desde la línea de comandos.
 *
 *   node scripts/usuarios.js listar
 *   node scripts/usuarios.js crear <correo> <rol> [--nombre "X"] [--apellido "Y"] [--pass "..."]
 *   node scripts/usuarios.js rol <correo> <rol>
 *   node scripts/usuarios.js pass <correo> [nueva]
 *   node scripts/usuarios.js borrar <correo>
 *   node scripts/usuarios.js roles
 */

const crypto = require('crypto');
const auth = require('../services/auth');
const config = require('../services/config');

function flag(args, name) {
    const i = args.indexOf(`--${name}`);
    return i !== -1 ? args[i + 1] : undefined;
}

/** Contraseña legible pero fuerte: 4 bloques de 4 caracteres sin ambigüedades. */
function generatePassword() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.randomBytes(16);
    const chars = [...bytes].map(b => alphabet[b % alphabet.length]);
    return [0, 4, 8, 12].map(i => chars.slice(i, i + 4).join('')).join('-');
}

function assertRole(role) {
    const valid = config.roles().hierarchy;
    if (!valid.includes(role)) {
        console.error(`Rol inválido: "${role}".\nRoles válidos: ${valid.join(', ')}`);
        process.exit(1);
    }
}

async function main() {
    const [command, ...args] = process.argv.slice(2);

    switch (command) {
        case 'listar': {
            const users = auth.listUsers();
            if (!users.length) {
                console.log('No hay cuentas locales. Crea una con: node scripts/usuarios.js crear <correo> <rol>');
                return;
            }
            console.log(`\n${users.length} cuenta(s):\n`);
            users
                .sort((a, b) => auth.rank(b.role) - auth.rank(a.role))
                .forEach(u => {
                    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '(sin nombre)';
                    console.log(`  ${u.role.padEnd(14)} ${u.email.padEnd(38)} ${name}${u.hasPassword ? '' : '  ⚠️ sin contraseña'}`);
                });
            console.log('');
            return;
        }

        case 'crear': {
            const [email, role] = args;
            if (!email || !role) {
                console.error('Uso: node scripts/usuarios.js crear <correo> <rol> [--nombre "X"] [--apellido "Y"] [--pass "..."]');
                process.exit(1);
            }
            assertRole(role);
            const password = flag(args, 'pass') || generatePassword();
            const user = await auth.upsertUser(email, {
                role,
                firstName: flag(args, 'nombre') || '',
                lastName: flag(args, 'apellido') || '',
                password
            });
            console.log(`\n✅ Cuenta creada/actualizada\n`);
            console.log(`   Correo:     ${user.email}`);
            console.log(`   Rol:        ${user.role}`);
            if (!flag(args, 'pass')) {
                console.log(`   Contraseña: ${password}`);
                console.log(`\n   ⚠️  Anótala ahora: se guarda cifrada y no se puede volver a mostrar.`);
            }
            console.log('');
            return;
        }

        case 'rol': {
            const [email, role] = args;
            if (!email || !role) {
                console.error('Uso: node scripts/usuarios.js rol <correo> <rol>');
                process.exit(1);
            }
            assertRole(role);
            if (!auth.findLocalUser(email)) {
                console.error(`No existe la cuenta local ${config.normalizeEmail(email)}. Créala con "crear".`);
                process.exit(1);
            }
            const user = await auth.upsertUser(email, { role });
            console.log(`✅ ${user.email} ahora tiene el rol "${user.role}".`);
            return;
        }

        case 'pass': {
            const [email, provided] = args;
            if (!email) {
                console.error('Uso: node scripts/usuarios.js pass <correo> [nueva]');
                process.exit(1);
            }
            if (!auth.findLocalUser(email)) {
                console.error(`No existe la cuenta local ${config.normalizeEmail(email)}.`);
                process.exit(1);
            }
            const password = provided || generatePassword();
            await auth.upsertUser(email, { password });
            console.log(`\n✅ Contraseña actualizada para ${config.normalizeEmail(email)}`);
            if (!provided) console.log(`   Nueva contraseña: ${password}\n`);
            return;
        }

        case 'borrar': {
            const [email] = args;
            if (!email) {
                console.error('Uso: node scripts/usuarios.js borrar <correo>');
                process.exit(1);
            }
            await auth.deleteUser(email);
            console.log(`✅ Cuenta ${config.normalizeEmail(email)} eliminada.`);
            return;
        }

        case 'roles': {
            console.log('\nRoles, de menor a mayor privilegio:\n');
            config.roles().hierarchy.forEach((r, i) => {
                const perms = Object.entries(auth.PERMISSIONS)
                    .filter(([, min]) => auth.atLeast(r, min))
                    .map(([p]) => p);
                console.log(`  ${i}. ${r.padEnd(14)} ${perms.length} permisos`);
            });
            console.log('');
            return;
        }

        default:
            console.log(`
Gestión de cuentas del personal — MedienPass

  node scripts/usuarios.js listar
  node scripts/usuarios.js crear <correo> <rol> [--nombre "X"] [--apellido "Y"] [--pass "..."]
  node scripts/usuarios.js rol <correo> <rol>
  node scripts/usuarios.js pass <correo> [nueva]
  node scripts/usuarios.js borrar <correo>
  node scripts/usuarios.js roles
`);
    }
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
