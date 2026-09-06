/**
 * names.js — Presentación de nombres propios.
 *
 * En la tabla `students` los nombres llegaron de importaciones distintas y no
 * son consistentes: conviven "Helena Marriott Rodriguez" y
 * "HERRERA PFEIFFER FELIX LEANDRO GABRIEL". En pantalla eso se ve como un
 * error, y en mayúsculas ocupa el doble de espacio y se lee peor.
 *
 * Aquí solo se arregla la PRESENTACIÓN: el dato guardado no se toca. Y solo se
 * reescribe lo que está claramente mal (todo mayúsculas o todo minúsculas); un
 * nombre ya bien escrito se respeta tal cual, porque quien lo escribió sabe
 * mejor que nosotros cómo se escribe.
 */

// Partículas que van en minúscula dentro del nombre, nunca al principio.
// Español, alemán y neerlandés, que es lo que aparece en este colegio.
const PARTICULAS = new Set([
    'de', 'del', 'la', 'las', 'lo', 'los', 'y', 'e', 'da', 'das', 'do', 'dos',
    'von', 'van', 'der', 'den', 'zu', 'zum', 'zur', 'auf', 'am',
    'di', 'du', 'le', 'saint', 'san', 'santa'
]);

// Prefijos que llevan mayúscula interna.
const PREFIJOS = [
    { re: /^mc(.+)/i,  arma: (m) => 'Mc' + mayusInicial(m[1]) },
    { re: /^mac(.{2,})/i, arma: (m) => 'Mac' + mayusInicial(m[1]) },
    { re: /^o'(.+)/i,  arma: (m) => "O'" + mayusInicial(m[1]) },
    { re: /^d'(.+)/i,  arma: (m) => "d'" + mayusInicial(m[1]) }
];

const ROMANOS = /^(i{1,3}|iv|v|vi{1,3}|ix|x{1,3})$/i;

/** Primera letra en mayúscula, resto en minúscula, respetando tildes y ñ. */
function mayusInicial(palabra) {
    if (!palabra) return '';
    return palabra.charAt(0).toLocaleUpperCase('es') +
           palabra.slice(1).toLocaleLowerCase('es');
}

/** Aplica el formato a una palabra suelta, cuidando guiones y apóstrofos. */
function formatearPalabra(palabra, esPrimera) {
    if (!palabra) return '';

    // Iniciales tipo "J." se dejan como están.
    if (/^[A-ZÁÉÍÓÚÑÜ]\.$/i.test(palabra)) {
        return palabra.toLocaleUpperCase('es');
    }

    // Números romanos (Juan Pablo II).
    if (ROMANOS.test(palabra)) return palabra.toLocaleUpperCase('es');

    const minus = palabra.toLocaleLowerCase('es');

    // Partículas: minúscula, salvo si abren el nombre ("De Arco" al inicio).
    if (!esPrimera && PARTICULAS.has(minus)) return minus;

    // Apellidos compuestos con guion: Pfeiffer-Müller.
    if (palabra.includes('-')) {
        return palabra.split('-').map(p => formatearPalabra(p, true)).join('-');
    }

    for (const { re, arma } of PREFIJOS) {
        const m = minus.match(re);
        if (m) return arma(m);
    }

    return mayusInicial(palabra);
}

/**
 * ¿Merece la pena reescribir este nombre?
 * Solo si está todo en mayúsculas o todo en minúsculas: si ya tiene mezcla,
 * está escrito a mano y se respeta.
 */
function necesitaFormato(nombre) {
    const letras = String(nombre).replace(/[^\p{L}]/gu, '');
    if (letras.length < 2) return false;
    const sinMinusculas = letras === letras.toLocaleUpperCase('es');
    const sinMayusculas = letras === letras.toLocaleLowerCase('es');
    return sinMinusculas || sinMayusculas;
}

/**
 * Nombre listo para mostrar.
 * @param {string} nombre
 * @returns {string}
 */
function formatear(nombre) {
    const limpio = String(nombre || '').trim().replace(/\s+/g, ' ');
    if (!limpio) return '';
    if (!necesitaFormato(limpio)) return limpio;

    return limpio
        .split(' ')
        .map((palabra, i) => formatearPalabra(palabra, i === 0))
        .join(' ');
}

/**
 * Versión corta para sitios estrechos como la barra superior.
 * Toma las dos primeras palabras significativas; con un nombre colombiano
 * completo ("Herrera Pfeiffer Felix Leandro Gabriel") deja "Herrera Pfeiffer",
 * que identifica sin ocupar media pantalla.
 * @param {string} nombre
 * @param {number} maxPalabras
 */
function corto(nombre, maxPalabras = 2) {
    const completo = formatear(nombre);
    if (!completo) return '';

    const palabras = completo.split(' ');
    if (palabras.length <= maxPalabras) return completo;

    const salida = [];
    for (const p of palabras) {
        if (salida.length >= maxPalabras) break;
        // No se corta justo después de una partícula ("de", "von"...).
        salida.push(p);
        if (PARTICULAS.has(p.toLocaleLowerCase('es'))) {
            if (salida.length >= maxPalabras) maxPalabras++;
        }
    }
    return salida.join(' ');
}

/** Iniciales para el avatar: "Herrera Pfeiffer" → "HP". */
function iniciales(nombre) {
    const completo = formatear(nombre);
    const palabras = completo.split(' ')
        .filter(p => p && !PARTICULAS.has(p.toLocaleLowerCase('es')));
    if (!palabras.length) return '?';
    if (palabras.length === 1) return palabras[0].charAt(0).toLocaleUpperCase('es');
    return (palabras[0].charAt(0) + palabras[1].charAt(0)).toLocaleUpperCase('es');
}

module.exports = { formatear, corto, iniciales, necesitaFormato };
