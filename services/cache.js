/**
 * cache.js — Memoria de resultados con caducidad.
 *
 * Medido en este servidor: una consulta trivial a Supabase tarda entre 180 y
 * 375 ms. El coste dominante de la aplicación no es calcular, es esperar a la
 * red. Los paneles de administración repiten las mismas agregaciones sobre
 * datos que cambian despacio (el listado de estudiantes, los dispositivos, el
 * claustro), y cada visita las pedía de nuevo.
 *
 * Aquí se recuerda el resultado unos segundos. No sustituye a la base de datos:
 * es una ventana corta para que refrescar un panel no cueste otro viaje.
 */

const store = new Map();          // clave -> { expira, valor }
const enVuelo = new Map();        // clave -> Promise
const stats = { hits: 0, misses: 0, coalesced: 0 };

const TTL_POR_DEFECTO = 30_000;   // 30 s

/**
 * Devuelve el valor recordado o ejecuta `productor` y lo recuerda.
 *
 * Si varias peticiones piden la misma clave a la vez (treinta estudiantes
 * entrando en el mismo minuto), solo se ejecuta una consulta y todas esperan
 * a esa: sin esto, un panel compartido dispara N consultas idénticas.
 *
 * @param {string} clave
 * @param {number} ttlMs
 * @param {() => Promise<*>} productor
 */
async function recordar(clave, ttlMs, productor) {
    const ahora = Date.now();
    const hit = store.get(clave);

    if (hit && hit.expira > ahora) {
        stats.hits++;
        return hit.valor;
    }

    const yaEnCurso = enVuelo.get(clave);
    if (yaEnCurso) {
        stats.coalesced++;
        return yaEnCurso;
    }

    stats.misses++;
    const promesa = (async () => {
        try {
            const valor = await productor();
            store.set(clave, { expira: Date.now() + (ttlMs || TTL_POR_DEFECTO), valor });
            return valor;
        } finally {
            enVuelo.delete(clave);
        }
    })();

    enVuelo.set(clave, promesa);
    return promesa;
}

/** Olvida una clave o, con prefijo, todas las que empiecen por él. */
function invalidar(prefijo) {
    if (!prefijo) {
        store.clear();
        return;
    }
    for (const clave of store.keys()) {
        if (clave.startsWith(prefijo)) store.delete(clave);
    }
}

/** Envoltura para Express: cachea la respuesta JSON de una ruta de lectura. */
function rutaCacheada(clave, ttlMs, manejador) {
    return async (req, res, next) => {
        try {
            const claveFinal = typeof clave === 'function' ? clave(req) : clave;
            const payload = await recordar(claveFinal, ttlMs, () => manejador(req));
            res.set('Cache-Control', 'private, max-age=15');
            return res.json(payload);
        } catch (e) {
            return next(e);
        }
    };
}

function metricas() {
    const total = stats.hits + stats.misses + stats.coalesced;
    return {
        ...stats,
        claves: store.size,
        aciertos: total ? `${Math.round(((stats.hits + stats.coalesced) / total) * 100)}%` : 'n/d'
    };
}

// Limpieza periódica para que el mapa no crezca sin límite.
const limpieza = setInterval(() => {
    const ahora = Date.now();
    for (const [clave, v] of store) {
        if (v.expira <= ahora) store.delete(clave);
    }
}, 60_000);
limpieza.unref();

module.exports = { recordar, invalidar, rutaCacheada, metricas, TTL_POR_DEFECTO };
