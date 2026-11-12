// ═══════════════════════════════════════════
// MedienPass Reto Configuration (1-6)
// ═══════════════════════════════════════════

const subjects = [
    { id: "aleman", name: { de: "Deutsch", en: "German", es: "Alemán" }, icon: "🇩🇪", color: "#dc2626" },
    { id: "espanol", name: { de: "Spanisch", en: "Spanish", es: "Español" }, icon: "🇪🇸", color: "#ea580c" },
    { id: "ingles", name: { de: "Englisch", en: "English", es: "Inglés" }, icon: "🇬🇧", color: "#0ea5e9" },
    { id: "tecnologia", name: { de: "Technologie", en: "Technology", es: "Tecnología" }, icon: "💻", color: "#7c3aed" },
    { id: "ciencias", name: { de: "Naturwissenschaften", en: "Science", es: "Ciencias" }, icon: "🔬", color: "#059669" },
    { id: "individuos", name: { de: "Individuen", en: "Individuals", es: "Individuos" }, icon: "👤", color: "#d946ef" },
    { id: "matematicas", name: { de: "Mathematik", en: "Mathematics", es: "Matemáticas" }, icon: "➗", color: "#2563eb" },
    { id: "musica", name: { de: "Musik", en: "Music", es: "Música" }, icon: "🎵", color: "#f59e0b" },
    { id: "arte", name: { de: "Kunst", en: "Art", es: "Arte" }, icon: "🎨", color: "#ec4899" },
    { id: "mint_sach", name: { de: "MINT", en: "MINT", es: "MINT" }, icon: "🔬", color: "#0d9488" },
    // Deportes: natación, polimotor, voleibol, baloncesto y atletismo (retos en data_deportes_retos.js)
    { id: "deportes", name: { de: "Sport", en: "Sports", es: "Deportes" }, icon: "🏅", color: "#16a34a" }
];

// Materias nuevas creadas en Administración › Materias (custom: true en data/subjects_config.json o
// SUBJECTS_CONFIG_FILE). Se agregan aquí, antes de que data.js genere los retos, para que toda la app
// las vea; su contenido es genérico (data_generic_subject.js). services/subject_store.js las crea.
const SUBJECT_ID_RE = /^[a-z][a-z0-9_]{1,24}$/;
(function loadCustomSubjects() {
    const fs = require('fs');
    const path = require('path');
    const file = process.env.SUBJECTS_CONFIG_FILE
        ? path.resolve(process.env.SUBJECTS_CONFIG_FILE)
        : path.join(__dirname, 'data', 'subjects_config.json');
    let config = {};
    try { if (fs.existsSync(file)) config = JSON.parse(fs.readFileSync(file, 'utf8')) || {}; } catch (e) { config = {}; }
    Object.entries(config).forEach(([id, entry]) => {
        if (!entry || entry.custom !== true || !SUBJECT_ID_RE.test(id) || subjects.some(s => s.id === id)) return;
        const name = entry.name || {};
        if (!['de', 'en', 'es'].every(lang => typeof name[lang] === 'string' && name[lang].trim())) return;
        subjects.push({ id, name: { de: name.de, en: name.en, es: name.es }, icon: entry.icon || '📘', color: entry.color || '#21529b', custom: true });
    });
})();

const levels = [
    { id: "1", title: { de: "MedienPass Reto 1", en: "MedienPass Challenge 1", es: "MedienPass Reto 1" }, icon: "✅", color: "#4f46e5" },
    { id: "2", title: { de: "MedienPass Reto 2", en: "MedienPass Challenge 2", es: "MedienPass Reto 2" }, icon: "📋", color: "#0ea5e9" },
    { id: "3", title: { de: "MedienPass Reto 3", en: "MedienPass Challenge 3", es: "MedienPass Reto 3" }, icon: "📋", color: "#8b5cf6" },
    { id: "4", title: { de: "MedienPass Reto 4", en: "MedienPass Challenge 4", es: "MedienPass Reto 4" }, icon: "📋", color: "#f59e0b" },
    { id: "5", title: { de: "MedienPass Reto 5", en: "MedienPass Challenge 5", es: "MedienPass Reto 5" }, icon: "📋", color: "#ef4444" },
    { id: "6", title: { de: "MedienPass Reto 6", en: "MedienPass Challenge 6", es: "MedienPass Reto 6" }, icon: "📋", color: "#059669" }
];

module.exports = { subjects, levels, SUBJECT_ID_RE };
