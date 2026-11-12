// Helpers de los buscadores del panel admin (Administración › Estudiantes y Docentes).
// El navegador compara con la misma normalización (normalizeSearch en admin/dashboard.ejs).

// Texto para comparar sin tildes ni mayúsculas: "Peña Díaz" → "pena diaz".
function searchText(value) {
    return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// students.full_name viene como "NOMBRES APELLIDO1 APELLIDO2", sin separador. Se toman como
// apellidos las dos últimas palabras (una si solo hay dos), igual que el orden de las listas.
// "de", "del", "la"... van con la palabra siguiente para no partir "DE LA HOZ".
const NAME_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'san', 'van', 'von', 'da', 'di']);

function splitStudentName(fullName) {
    const words = searchText(fullName).split(' ').filter(Boolean);
    const parts = [];
    let pending = [];
    words.forEach(w => {
        pending.push(w);
        if (!NAME_PARTICLES.has(w)) { parts.push(pending.join(' ')); pending = []; }
    });
    if (pending.length) parts.push(pending.join(' '));
    if (parts.length <= 1) return { names: parts.join(' '), surnames: '' };
    const cut = parts.length === 2 ? 1 : parts.length - 2;
    return { names: parts.slice(0, cut).join(' '), surnames: parts.slice(cut).join(' ') };
}

module.exports = { searchText, splitStudentName };
