/**
 * default_agent_tools.js - Actividades sugeridas de la tarjeta "Agente del Profesor" en los retos 1-6.
 * Salen del paquete de cada materia (data_subject_packs.js). Lo que un docente configure en
 * data/challenge_tools_config.json tiene prioridad sobre esto.
 */
const { getSubjectPack } = require('./data_subject_packs');

const options = (label, list) => list.map((text, i) => `${label} ${i + 1}: ${text}`).join('\n');
const byLang = (es, de, en) => ({
    es: options('Opción', es),
    de: options('Option', de),
    en: options('Option', en)
});

const BUILDERS = {
    1: (E, D, N) => byLang(
        [`Buscar tres fuentes confiables sobre ${E.topic} (p. ej. ${E.source}) y registrar sus enlaces y autores en un documento compartido.`,
            `Crear un glosario colaborativo de ${E.name} en un editor en la nube, empezando por el término «${E.term}».`,
            `Organizar una estructura de carpetas digitales con nombres claros, como ${E.folder}.`],
        [`Suche drei verlässliche Quellen zum Thema „${D.topic}“ (z. B. ${D.source}) und halte Links und Autoren in einem geteilten Dokument fest.`,
            `Erstelle ein gemeinsames Glossar für ${D.name} in einem Online-Editor und beginne mit dem Begriff „${D.term}“.`,
            `Lege eine digitale Ordnerstruktur mit klaren Namen an, zum Beispiel ${D.folder}.`],
        [`Find three reliable sources about ${N.topic} (e.g. ${N.source}) and record their links and authors in a shared document.`,
            `Create a collaborative ${N.name} glossary in a cloud editor, starting with the term “${N.term}”.`,
            `Set up a digital folder structure with clear names, such as ${N.folder}.`]),
    2: (E, D, N) => byLang(
        [`Hacer en ${E.collab} una lluvia de ideas sobre esta pregunta: ${E.debate}`,
            `Redactar en grupo un código de netiqueta para el canal de ${E.name}.`,
            `Coeditar ${E.sharedDoc} y responder con respeto a los comentarios de dos compañeros.`],
        [`Sammelt in ${D.collab} Ideen zu dieser Frage: ${D.debate}`,
            `Verfasst in der Gruppe eine Netiquette für den Kanal in ${D.name}.`,
            `Bearbeitet gemeinsam ${D.sharedDoc} und antwortet respektvoll auf die Kommentare von zwei Mitschülern.`],
        [`Brainstorm in ${N.collab} on this question: ${N.debate}`,
            `Write a netiquette code as a group for the ${N.name} channel.`,
            `Co-edit ${N.sharedDoc} and respond respectfully to two classmates' comments.`]),
    3: (E, D, N) => byLang(
        [`Diseñar una infografía en Canva que resuma ${E.topic}.`,
            `Crear una presentación de ${E.name} con ${E.images}, citando el autor y la licencia.`,
            `Grabar ${E.media}.`],
        [`Gestalte in Canva eine Infografik zum Thema „${D.topic}“.`,
            `Erstelle eine Präsentation für ${D.name} mit Material wie diesem und nenne Urheber und Lizenz: ${D.images}.`,
            `Nimm ${D.media} auf.`],
        [`Design a Canva infographic that sums up ${N.topic}.`,
            `Create a ${N.name} presentation with ${N.images}, crediting the author and licence.`,
            `Record ${N.media}.`]),
    4: (E, D, N) => byLang(
        [`Elaborar un decálogo ilustrado sobre cómo proteger tu cuenta de ${E.app} y tus datos.`,
            `Diseñar un folleto sobre postura y pausas al usar ${E.tool} en ${E.name}.`,
            `Crear un cartel digital sobre cómo reducir el impacto ambiental de los dispositivos que usas en ${E.name}.`],
        [`Erstelle ein illustriertes Plakat darüber, wie du dein Konto bei ${D.app} und deine Daten schützt.`,
            `Gestalte eine Broschüre über Haltung und Pausen bei der Arbeit mit ${D.tool} in ${D.name}.`,
            `Erstelle ein digitales Poster darüber, wie die Geräte, die du in ${D.name} nutzt, die Umwelt weniger belasten.`],
        [`Create an illustrated guide on how to protect your ${N.app} account and your data.`,
            `Design a brochure on posture and breaks when using ${N.tool} in ${N.name}.`,
            `Create a digital poster on how to reduce the environmental impact of the devices you use in ${N.name}.`]),
    5: (E, D, N) => byLang(
        [`Diseñar un mapa mental con soluciones para este problema: ${E.bug}.`,
            `Crear un diagrama de flujo para ${E.loop}.`,
            `Redactar una guía de fallas comunes de ${E.tool} para ayudar a otros estudiantes de ${E.name}.`],
        [`Erstelle eine Mindmap mit Lösungen für dieses Problem: ${D.bug}.`,
            `Zeichne ein Flussdiagramm für diese Aufgabe: ${D.loop}.`,
            `Verfasse eine Anleitung zu häufigen Fehlern in ${D.tool}, die anderen Schülern in ${D.name} hilft.`],
        [`Create a mind map with solutions to this problem: ${N.bug}.`,
            `Draw a flowchart to ${N.loop}.`,
            `Write a guide to common ${N.tool} problems to help other ${N.name} students.`]),
    6: (E, D, N) => byLang(
        [`Comprobar si este titular es verdadero y explicar cómo lo verificaste: ${E.fake}.`,
            `Identificar el sesgo comercial en ${E.bias}.`,
            `Escribir una reflexión sobre cómo los algoritmos y la inteligencia artificial influyen en lo que aprendes sobre ${E.topic}.`],
        [`Prüfe, ob diese Schlagzeile stimmt, und erkläre, wie du es überprüft hast: ${D.fake}.`,
            `Finde die kommerzielle Absicht in diesem Beispiel: ${D.bias}.`,
            `Schreibe eine Reflexion darüber, wie Algorithmen und KI beeinflussen, was du zum Thema „${D.topic}“ lernst.`],
        [`Check whether this headline is true and explain how you verified it: ${N.fake}.`,
            `Identify the commercial bias in ${N.bias}.`,
            `Write a reflection on how algorithms and AI influence what you learn about ${N.topic}.`])
};

// Sugerencias por número de reto para una materia: { 1: { es, de, en }, ... }
function agentToolsFor(subject) {
    const pack = getSubjectPack(subject);
    const tools = {};
    Object.entries(BUILDERS).forEach(([reto, build]) => { tools[reto] = build(pack.es, pack.de, pack.en); });
    return tools;
}

module.exports = { agentToolsFor };
