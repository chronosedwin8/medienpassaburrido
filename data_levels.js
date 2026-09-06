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
    { id: "mint_sach", name: { de: "MINT und Sachunterricht", en: "MINT and Science", es: "MINT y Ciencias Naturales" }, icon: "🔬", color: "#0d9488" }
];

const levels = [
    { id: "1", title: { de: "MedienPass Reto 1", en: "MedienPass Challenge 1", es: "MedienPass Reto 1" }, icon: "✅", color: "#4f46e5" },
    { id: "2", title: { de: "MedienPass Reto 2", en: "MedienPass Challenge 2", es: "MedienPass Reto 2" }, icon: "📋", color: "#0ea5e9" },
    { id: "3", title: { de: "MedienPass Reto 3", en: "MedienPass Challenge 3", es: "MedienPass Reto 3" }, icon: "📋", color: "#8b5cf6" },
    { id: "4", title: { de: "MedienPass Reto 4", en: "MedienPass Challenge 4", es: "MedienPass Reto 4" }, icon: "📋", color: "#f59e0b" },
    { id: "5", title: { de: "MedienPass Reto 5", en: "MedienPass Challenge 5", es: "MedienPass Reto 5" }, icon: "📋", color: "#ef4444" },
    { id: "6", title: { de: "MedienPass Reto 6", en: "MedienPass Challenge 6", es: "MedienPass Reto 6" }, icon: "📋", color: "#059669" }
];

module.exports = { subjects, levels };
