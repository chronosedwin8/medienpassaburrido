// Nombre del estudiante para mostrar en la app (barra fija, saludo y retos).
// En la base de datos el nombre completo viene en mayúsculas y en orden "NOMBRES APELLIDOS"
// ("SANTIAGO JOSUE ACERO JIMÉNEZ"); aquí se muestra "Santiago Josue Acero Jiménez" y el saludo
// usa el primer nombre ("Santiago"). Sin nombre completo se usan first/last name o el usuario.

const LOWER_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'da', 'do', 'dos', 'van', 'von', 'der']);

function titleCase(text) {
    return String(text || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('es')
        .split(' ')
        .map((word, i) => {
            if (i > 0 && LOWER_WORDS.has(word)) return word;
            return word.replace(/(^|[-'’])(\p{L})/gu, (m, sep, ch) => sep + ch.toLocaleUpperCase('es'));
        })
        .join(' ');
}

function studentNames(student) {
    const s = student || {};
    const raw = (s.full_name && String(s.full_name).trim())
        || [s.first_name, s.last_name].filter(Boolean).join(' ').trim()
        || String(s.username || '').trim();
    const hasName = !!((s.full_name && String(s.full_name).trim()) || s.first_name || s.last_name);
    const full = hasName ? titleCase(raw) : raw;
    const first = hasName ? full.split(' ')[0] : full;
    const initial = (first.match(/\p{L}|\p{N}/u) || ['?'])[0].toLocaleUpperCase('es');
    return { full, first, initial, hasName };
}

module.exports = { titleCase, studentNames };
