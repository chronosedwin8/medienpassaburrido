// ═══════════════════════════════════════════
// Test KMK de los docentes: 12 preguntas, se aprueba con el 75 % (9 de 12).
// - 6 sobre las competencias, una por área (las del test de conocimiento anterior).
// - 6 de aplicación en la materia del docente (las del Reto 0 de esa materia: data_reto0_quiz.js).
// Se califica en el servidor: lo que llega a la página no incluye las respuestas correctas.
// ═══════════════════════════════════════════

const { buildReto0Questions } = require('./data_reto0_quiz');

const PASS_SCORE = 75;
const t = (es, de, en) => ({ es, de, en });

// options[correct] es la respuesta correcta
const KNOWLEDGE_QUESTIONS = [
    {
        area: 1, correct: 2,
        label: t('Competencia 1 (Buscar): ¿Cómo garantizas la confiabilidad de una fuente?', 'Bereich 1 (Suchen): Wie stellen Sie die Zuverlässigkeit einer Quelle sicher?', 'Area 1 (Search): How do you ensure the reliability of a source?'),
        options: [
            t('Confiar en el primer resultado de búsqueda', 'Dem ersten Suchergebnis vertrauen', 'Trust the first search result'),
            t('Usar solamente imágenes', 'Nur Bilder verwenden', 'Only use images'),
            t('Comparar diversas fuentes y verificar datos', 'Quellen vergleichen und auf Fakten prüfen', 'Compare sources and check facts')
        ]
    },
    {
        area: 2, correct: 1,
        label: t("Competencia 2 (Comunicar): ¿Cuál es una regla importante de 'Netiqueta'?", "Bereich 2 (Kommunizieren): Was ist eine wichtige Regel der 'Netiquette'?", "Area 2 (Communicate): What is an important rule of 'Netiquette'?"),
        options: [
            t('Escribir todo en mayúsculas (gritar)', 'In Großbuchstaben schreiben (Schreien)', 'Write in all caps (shouting)'),
            t('Expresarse de manera educada en entornos digitales', 'Sich höflich in digitalen Umgebungen ausdrücken', 'Express yourself politely in digital environments'),
            t('Reenviar todas las cadenas de mensajes', 'Alle Kettenbriefe weiterleiten', 'Forward all chain letters')
        ]
    },
    {
        area: 3, correct: 1,
        label: t('Competencia 3 (Producir): ¿Qué deben tener en cuenta los estudiantes al usar imágenes?', 'Bereich 3 (Produzieren): Was müssen Schüler beim Verwenden fremder Bilder beachten?', "Area 3 (Produce): What must students consider when using other people's images?"),
        options: [
            t('Pueden usar imágenes sin citar la fuente', 'Bilder dürfen ohne Quellenangabe genutzt werden', 'Images can be used without citation'),
            t('Respetar derechos de autor y usar Creative Commons', 'Urheberrechte respektieren und Creative Commons nutzen', 'Respect copyrights and use Creative Commons'),
            t('Todas las fotos carecen de derechos de autor', 'Alle Fotos haben kein Urheberrecht', 'All photos have no copyright')
        ]
    },
    {
        area: 4, correct: 2,
        label: t('Competencia 4 (Proteger): ¿Cuál es la mejor manera de proteger cuentas online?', 'Bereich 4 (Schützen): Wie schützt man am besten seine Konten?', 'Area 4 (Protect): What is the best way to protect your accounts?'),
        options: [
            t('Usar la misma contraseña en todos lados', 'Gleiches Passwort überall', 'Same password everywhere'),
            t('Compartir la contraseña con amigos de confianza', 'Passwort mit Freunden teilen', 'Share password with friends'),
            t('Usar una contraseña larga y segura', 'Langes, sicheres Passwort verwenden', 'Use a long, secure password')
        ]
    },
    {
        area: 5, correct: 1,
        label: t('Competencia 5 (Solucionar): El proyector no funciona. ¿Qué debes hacer?', 'Bereich 5 (Problemlösen): Ein Projektor funktioniert nicht. Was tun?', "Area 5 (Problem Solving): A projector doesn't work. What should you do?"),
        options: [
            t('Rendirse inmediatamente', 'Direkt aufgeben', 'Give up immediately'),
            t('Hacer pruebas de ensayo/error de forma lógica (cables, energía)', 'Nach dem Trial-and-Error-Verfahren logisch prüfen (Kabel, Strom)', 'Use logical trial-and-error checks (cables, power)'),
            t('Comprar un proyector nuevo', 'Einen neuen Projektor kaufen', 'Buy a new projector')
        ]
    },
    {
        area: 6, correct: 1,
        label: t('Competencia 6 (Analizar): ¿Cómo reconoces las Fake News?', 'Bereich 6 (Analysieren): Wie erkennt man Fake News?', 'Area 6 (Analyze): How do you recognize Fake News?'),
        options: [
            t('Compartir los titulares sin revisar', 'Headlines ohne Prüfung teilen', 'Share headlines without checking'),
            t('Aplicar la técnica SIFT (Detenerse, Investigar, Encontrar fuentes, Rastrear)', 'SIFT-Methode anwenden (Stop, Investigate, Find better sources, Trace)', 'Use the SIFT method (Stop, Investigate, Find better sources, Trace)'),
            t('Confiar ciegamente en comentarios de redes sociales', 'Auf Social Media Kommentare vertrauen', 'Trust social media comments')
        ]
    }
];

// Las 12 preguntas para una materia, con la respuesta correcta (solo para el servidor)
function buildTeacherTest(subject) {
    const knowledge = KNOWLEDGE_QUESTIONS.map((q, i) => ({
        id: `k${i + 1}`,
        part: 'kmk',
        area: q.area,
        label: q.label,
        options: q.options.map((option, idx) => ({ ...option, correct: idx === q.correct }))
    }));
    // En el Reto 0, las preguntas 3 a 8 son una por competencia, con los ejemplos de la materia
    const application = buildReto0Questions(subject).slice(2, 8).map((q, i) => ({
        id: `m${i + 1}`,
        part: 'subject',
        area: i + 1,
        label: q.label,
        options: q.options.map(option => ({ es: option.es, de: option.de, en: option.en, correct: !!option.correct }))
    }));
    return [...knowledge, ...application];
}

// Lo que va a la página: las mismas preguntas sin decir cuál es la correcta
function publicTest(questions) {
    return questions.map(q => ({ ...q, options: q.options.map(({ es, de, en }) => ({ es, de, en })) }));
}

// answers: { k1: '2', m3: '0', ... } con la posición de la opción elegida
function gradeTeacherTest(questions, answers) {
    const byArea = [1, 2, 3, 4, 5, 6].map(area => ({ area, correct: 0, total: 0 }));
    let correct = 0;
    questions.forEach(q => {
        const chosen = q.options[Number(answers[q.id])];
        const isRight = !!(chosen && chosen.correct);
        if (isRight) correct++;
        const row = byArea[q.area - 1];
        row.total++;
        if (isRight) row.correct++;
    });
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, total: questions.length, score, passed: score >= PASS_SCORE, byArea };
}

module.exports = { PASS_SCORE, buildTeacherTest, publicTest, gradeTeacherTest };
