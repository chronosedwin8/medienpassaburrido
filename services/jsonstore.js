/**
 * jsonstore.js — Lectura y escritura de archivos JSON con caché por mtime.
 *
 * El panel del estudiante hacía 5 lecturas síncronas de disco en CADA petición
 * (subject_config.json, level_config.json, el cache local...), y varias rutas de
 * administración repetían el patrón existsSync + readFileSync + JSON.parse.
 * Cada una bloquea el bucle de eventos: con 30 estudiantes entrando a la vez,
 * el servidor se queda parado leyendo los mismos bytes una y otra vez.
 *
 * Aquí se lee una vez y se recuerda, comprobando la fecha de modificación. Si
 * alguien edita el archivo (o lo hace el propio panel de administración), el
 * cambio se recoge en la siguiente lectura sin reiniciar nada.
 */

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const cache = new Map();   // ruta -> { mtimeMs, value }
const stats = { hits: 0, misses: 0, writes: 0 };

/**
 * Lee un JSON con caché.
 * @param {string} filePath  ruta absoluta
 * @param {*} fallback       valor si el archivo no existe o está corrupto
 */
function read(filePath, fallback = {}) {
    let stat;
    try {
        stat = fs.statSync(filePath);
    } catch (e) {
        return fallback;                     // no existe
    }

    const hit = cache.get(filePath);
    if (hit && hit.mtimeMs === stat.mtimeMs) {
        stats.hits++;
        return hit.value;
    }

    stats.misses++;
    try {
        const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        cache.set(filePath, { mtimeMs: stat.mtimeMs, value });
        return value;
    } catch (e) {
        console.error(`[jsonstore] ${path.basename(filePath)} ilegible:`, e.message);
        return hit ? hit.value : fallback;   // preferimos lo último bueno
    }
}

/**
 * Escribe un JSON de forma atómica (tmp + rename) y refresca la caché.
 * El rename evita dejar el archivo a medias si el proceso muere escribiendo.
 */
async function write(filePath, value) {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await fsp.rename(tmp, filePath);

    stats.writes++;
    try {
        cache.set(filePath, { mtimeMs: fs.statSync(filePath).mtimeMs, value });
    } catch (e) {
        cache.delete(filePath);
    }
    return value;
}

/** Olvida un archivo (o todos) de la caché. */
function invalidate(filePath) {
    if (filePath) cache.delete(filePath);
    else cache.clear();
}

/** Métricas, para comprobar que la caché sirve de algo. */
function metrics() {
    const total = stats.hits + stats.misses;
    return {
        ...stats,
        archivos: cache.size,
        aciertos: total ? `${Math.round((stats.hits / total) * 100)}%` : 'n/d'
    };
}

module.exports = { read, write, invalidate, metrics };
