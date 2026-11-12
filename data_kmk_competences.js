// ═══════════════════════════════════════════
// Competencias KMK con sus subcompetencias (estrategia «Bildung in der digitalen Welt»).
// Cada reto 1-6 trabaja el área del mismo número y cada pregunta indica la subcompetencia
// que evalúa (campo kmk, p. ej. "1.2"). Lo usan las preguntas (data_questions.js), el editor
// del portal docente y la validación al guardar (services/instrument_store.js).
// ═══════════════════════════════════════════

const { KMK_COMPETENCES } = require('./data_reto0_quiz');

const t = (es, de, en) => ({ es, de, en });

const SUBCOMPETENCES = {
    1: [
        { id: '1.1', name: t('Buscar y filtrar', 'Suchen und Filtern', 'Searching and filtering') },
        { id: '1.2', name: t('Evaluar y valorar', 'Auswerten und Bewerten', 'Evaluating') },
        { id: '1.3', name: t('Guardar y recuperar', 'Speichern und Abrufen', 'Storing and retrieving') }
    ],
    2: [
        { id: '2.1', name: t('Interactuar', 'Interagieren', 'Interacting') },
        { id: '2.2', name: t('Compartir', 'Teilen', 'Sharing') },
        { id: '2.3', name: t('Colaborar', 'Zusammenarbeiten', 'Collaborating') },
        { id: '2.4', name: t('Conocer y respetar las normas de convivencia (netiqueta)', 'Umgangsregeln kennen und einhalten (Netiquette)', 'Knowing and following the rules of conduct (netiquette)') },
        { id: '2.5', name: t('Participar activamente en la sociedad', 'An der Gesellschaft aktiv teilhaben', 'Taking an active part in society') }
    ],
    3: [
        { id: '3.1', name: t('Desarrollar y producir', 'Entwickeln und Produzieren', 'Developing and producing') },
        { id: '3.2', name: t('Reelaborar e integrar', 'Weiterverarbeiten und Integrieren', 'Further processing and integrating') },
        { id: '3.3', name: t('Respetar las normas legales', 'Rechtliche Vorgaben beachten', 'Observing legal requirements') }
    ],
    4: [
        { id: '4.1', name: t('Actuar con seguridad en entornos digitales', 'Sicher in digitalen Umgebungen agieren', 'Acting safely in digital environments') },
        { id: '4.2', name: t('Proteger los datos personales y la privacidad', 'Persönliche Daten und Privatsphäre schützen', 'Protecting personal data and privacy') },
        { id: '4.3', name: t('Proteger la salud', 'Gesundheit schützen', 'Protecting health') },
        { id: '4.4', name: t('Proteger la naturaleza y el medio ambiente', 'Natur und Umwelt schützen', 'Protecting nature and the environment') }
    ],
    5: [
        { id: '5.1', name: t('Resolver problemas técnicos', 'Technische Probleme lösen', 'Solving technical problems') },
        { id: '5.2', name: t('Usar las herramientas según la necesidad', 'Werkzeuge bedarfsgerecht einsetzen', 'Using tools as needed') },
        { id: '5.3', name: t('Identificar las propias carencias y buscar soluciones', 'Eigene Defizite ermitteln und nach Lösungen suchen', "Identifying one's own gaps and looking for solutions") },
        { id: '5.4', name: t('Usar herramientas y medios digitales para aprender, trabajar y resolver problemas', 'Digitale Werkzeuge und Medien zum Lernen, Arbeiten und Problemlösen nutzen', 'Using digital tools and media for learning, working and problem solving') },
        { id: '5.5', name: t('Reconocer y formular algoritmos', 'Algorithmen erkennen und formulieren', 'Recognising and formulating algorithms') }
    ],
    6: [
        { id: '6.1', name: t('Analizar y evaluar los medios', 'Medien analysieren und bewerten', 'Analysing and evaluating media') },
        { id: '6.2', name: t('Comprender y reflexionar sobre los medios en el mundo digital', 'Medien in der digitalen Welt verstehen und reflektieren', 'Understanding and reflecting on media in the digital world') }
    ]
};

// KMK_AREAS[i]: área i+1 = reto i+1, con su nombre, ícono, subcompetencias y su dimensión de
// inteligencia artificial (ai, ver data_reto0_quiz.js)
const KMK_AREAS = KMK_COMPETENCES.map((comp, i) => ({ id: i + 1, icon: comp.icon, name: comp.name, ai: comp.ai, subs: SUBCOMPETENCES[i + 1] }));

// ¿Es "id" una subcompetencia del área de ese reto?
function isKmkOfReto(id, reto) {
    return (SUBCOMPETENCES[reto] || []).some(sub => sub.id === id);
}

// ¿Es "id" una subcompetencia de cualquier área? (la evaluación del Reto 0 abarca las seis)
function isKmk(id) {
    return Object.values(SUBCOMPETENCES).some(list => list.some(sub => sub.id === id));
}

module.exports = { KMK_AREAS, isKmkOfReto, isKmk };
