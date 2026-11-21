// ═══════════════════════════════════════════
// MedienPass App - Retos 1-6 de Primaria (K3 a K6), más sencillos
// Pedido (13 y 20 nov 2026): «reajusta todos los retos a temáticas más sencillas respetando los niveles
// cognitivos K4 a K6, incrementando poco a poco la dificultad; de ahí en adelante deja igual» e
// «inicia desde Klasse 3».
//
// - PRIMARY_PACKS[materia]: tema, trabajo, programa y app para niños de 8 a 12 años, en es/de/en.
//   En alemán, el tema va en nominativo entre „…“ y el trabajo en acusativo.
//   Una materia nueva usa un paquete general con su nombre (sin contenidos de otra materia).
// - PRIMARY_TEMPLATES[reto][pregunta] = Q(posiciónCorrecta, basic, plus):
//     basic: K3 y K4, situaciones de todos los días y frases cortas.
//     plus:  K5 y K6, nombra el concepto (fuente confiable, netiqueta, phishing, huella digital,
//            burbuja de filtro…).
//   Cada versión devuelve { label, options[3], hint } (hint: el porqué, se muestra al responder).
// - Se conservan los identificadores, la subcompetencia KMK, la pregunta de IA de cada reto y la
//   POSICIÓN de la respuesta correcta (test/fixtures/legacy_correct_positions.json): lo ya respondido
//   se califica igual.
// - Cada pregunta nombra la materia, su tema o su trabajo en el enunciado y en al menos una opción,
//   para que dos materias nunca repitan un enunciado ni un grupo de opciones (npm test).
// De K7 a K12 siguen la plantilla común de data_questions.js, sin cambios.
// ═══════════════════════════════════════════

const t = (es, de, en) => ({ es, de, en });

// name: se toma de la materia (subjects); aquí van tema, trabajo, programa y app
const PRIMARY_PACKS = {
    aleman: {
        es: { topic: 'los cuentos de hadas', work: 'un cuento ilustrado', program: 'Word', app: 'Anton' },
        de: { topic: 'Märchen', work: 'eine illustrierte Geschichte', workDat: 'einer illustrierten Geschichte', program: 'Word', app: 'Anton' },
        en: { topic: 'fairy tales', work: 'an illustrated story', workBare: 'illustrated story', program: 'Word', app: 'Anton' }
    },
    espanol: {
        es: { topic: 'las fábulas de animales', work: 'una fábula con dibujos', program: 'Word', app: 'Book Creator' },
        de: { topic: 'Tierfabeln', work: 'eine Fabel mit Bildern', workDat: 'einer Fabel mit Bildern', program: 'Word', app: 'Book Creator' },
        en: { topic: 'animal fables', work: 'a fable with drawings', workBare: 'fable with drawings', program: 'Word', app: 'Book Creator' }
    },
    ingles: {
        es: { topic: 'los animales de la granja', work: 'un diccionario de imágenes', program: 'PowerPoint', app: 'Quizlet' },
        de: { topic: 'Bauernhoftiere', work: 'ein Bildwörterbuch', workDat: 'einem Bildwörterbuch', program: 'PowerPoint', app: 'Quizlet' },
        en: { topic: 'farm animals', work: 'a picture dictionary', workBare: 'picture dictionary', program: 'PowerPoint', app: 'Quizlet' }
    },
    tecnologia: {
        es: { topic: 'los algoritmos con codeSpark', work: 'un juego en codeSpark', program: 'OneNote', app: 'Teams' },
        de: { topic: 'Algorithmen mit codeSpark', work: 'ein Spiel in codeSpark', workDat: 'einem Spiel in codeSpark', program: 'OneNote', app: 'Teams' },
        en: { topic: 'algorithms with codeSpark', work: 'a game in codeSpark', workBare: 'game in codeSpark', program: 'OneNote', app: 'Teams' }
    },
    ciencias: {
        es: { topic: 'el ciclo del agua', work: 'un cartel sobre el agua', program: 'PowerPoint', app: 'OneNote' },
        de: { topic: 'Wasserkreislauf', work: 'ein Plakat über das Wasser', workDat: 'einem Plakat über das Wasser', program: 'PowerPoint', app: 'OneNote' },
        en: { topic: 'the water cycle', work: 'a poster about water', workBare: 'poster about water', program: 'PowerPoint', app: 'OneNote' }
    },
    individuos: {
        es: { topic: 'los barrios de Barranquilla', work: 'un mapa de mi barrio', program: 'PowerPoint', app: 'Google Earth' },
        de: { topic: 'Stadtviertel von Barranquilla', work: 'eine Karte meines Viertels', workDat: 'einer Karte meines Viertels', program: 'PowerPoint', app: 'Google Earth' },
        en: { topic: 'the neighbourhoods of Barranquilla', work: 'a map of my neighbourhood', workBare: 'map of my neighbourhood', program: 'PowerPoint', app: 'Google Earth' }
    },
    matematicas: {
        es: { topic: 'las fracciones', work: 'una tabla de fracciones', program: 'Excel', app: 'GeoGebra' },
        de: { topic: 'Brüche', work: 'eine Bruchtabelle', workDat: 'einer Bruchtabelle', program: 'Excel', app: 'GeoGebra' },
        en: { topic: 'fractions', work: 'a fractions chart', workBare: 'fractions chart', program: 'Excel', app: 'GeoGebra' }
    },
    musica: {
        es: { topic: 'los instrumentos de la orquesta', work: 'una canción grabada', program: 'Chrome Music Lab', app: 'Chrome Music Lab' },
        de: { topic: 'Orchesterinstrumente', work: 'ein aufgenommenes Lied', workDat: 'einem aufgenommenen Lied', program: 'Chrome Music Lab', app: 'Chrome Music Lab' },
        en: { topic: 'the instruments of the orchestra', work: 'a recorded song', workBare: 'recorded song', program: 'Chrome Music Lab', app: 'Chrome Music Lab' }
    },
    arte: {
        es: { topic: 'los colores primarios', work: 'un collage digital', program: 'Paint', app: 'Canva' },
        de: { topic: 'Grundfarben', work: 'eine digitale Collage', workDat: 'einer digitalen Collage', program: 'Paint', app: 'Canva' },
        en: { topic: 'primary colours', work: 'a digital collage', workBare: 'digital collage', program: 'Paint', app: 'Canva' }
    },
    mint_sach: {
        es: { topic: 'las plantas y los insectos', work: 'un experimento con semillas', program: 'OneNote', app: 'la cámara de la tableta' },
        de: { topic: 'Pflanzen und Insekten', work: 'ein Experiment mit Samen', workDat: 'einem Experiment mit Samen', program: 'OneNote', app: 'die Kamera des Tablets' },
        en: { topic: 'plants and insects', work: 'an experiment with seeds', workBare: 'experiment with seeds', program: 'OneNote', app: 'the tablet camera' }
    },
    deportes: {
        es: { topic: 'la natación', work: 'un plan de calentamiento', program: 'Word', app: 'el cronómetro' },
        de: { topic: 'Schwimmen', work: 'einen Aufwärmplan', workDat: 'einem Aufwärmplan', program: 'Word', app: 'die Stoppuhr' },
        en: { topic: 'swimming', work: 'a warm-up plan', workBare: 'warm-up plan', program: 'Word', app: 'the stopwatch' }
    }
};

// Paquete general de una materia nueva: solo su nombre
function genericPrimaryPack() {
    return {
        es: { topic: 'el tema de la clase', work: 'una presentación de la clase', program: 'PowerPoint', app: 'OneNote' },
        de: { topic: 'Unterrichtsthema', work: 'eine Präsentation für den Unterricht', workDat: 'einer Präsentation für den Unterricht', program: 'PowerPoint', app: 'OneNote' },
        en: { topic: 'the class topic', work: 'a class presentation', workBare: 'class presentation', program: 'PowerPoint', app: 'OneNote' }
    };
}

// Q(posición correcta, versión K3-K4, versión K5-K6)
const Q = (correct, basic, plus) => ({ correct, basic, plus });

const PRIMARY_TEMPLATES = {
    // ── Reto 1 · Buscar, procesar y archivar ──
    1: {
        1: Q(0,
            (E, D, N) => ({
                label: t(`Quieres saber más de ${E.topic} para ${E.name}. ¿Qué escribes en el buscador?`,
                    `Du willst in ${D.name} mehr zum Thema „${D.topic}“ wissen. Was schreibst du in die Suchmaschine?`,
                    `You want to learn more about ${N.topic} for ${N.name}. What do you type into the search engine?`),
                options: [
                    t(`Pocas palabras clave: «${E.topic} para niños»`, `Wenige Suchwörter: „${D.topic} für Kinder“`, `A few key words: “${N.topic} for kids”`),
                    t('«hola, quiero saber cosas»', '„Hallo, ich will Sachen wissen“', '“hi, I want to know stuff”'),
                    t('Mi nombre completo y mi curso', 'Meinen vollen Namen und meine Klasse', 'My full name and my class')
                ],
                hint: t('Con pocas palabras clave el buscador entiende mejor qué buscas. «Para niños» ayuda a encontrar páginas fáciles de leer.',
                    'Mit wenigen Suchwörtern versteht die Suchmaschine besser, was du suchst. „Für Kinder“ hilft, leicht lesbare Seiten zu finden.',
                    'With a few key words the search engine understands better what you want. “For kids” helps you find pages that are easy to read.')
            }),
            (E, D, N) => ({
                label: t(`Investigas sobre ${E.topic} para ${E.name}. ¿Qué búsqueda da resultados más precisos?`,
                    `Du recherchierst in ${D.name} zum Thema „${D.topic}“. Welche Suche liefert genauere Ergebnisse?`,
                    `You are researching ${N.topic} for ${N.name}. Which search gives more precise results?`),
                options: [
                    t(`Palabras clave entre comillas: "${E.topic}" explicación para niños`, `Suchwörter in Anführungszeichen: "${D.topic}" Erklärung für Kinder`, `Key words in quotation marks: "${N.topic}" explanation for kids`),
                    t(`Una frase larga: «necesito todo de ${E.name} para mañana»`, `Ein langer Satz: „Ich brauche alles aus ${D.name} für morgen“`, `A long sentence: “I need everything about ${N.name} for tomorrow”`),
                    t('Hacer clic en el primer anuncio que aparece', 'Auf die erste Anzeige klicken, die erscheint', 'Click the first ad that appears')
                ],
                hint: t('Las palabras clave y las comillas (búsqueda exacta) filtran los resultados. Los anuncios aparecen primero porque alguien pagó, no porque sean mejores.',
                    'Suchwörter und Anführungszeichen (genaue Suche) filtern die Ergebnisse. Anzeigen stehen oben, weil jemand bezahlt hat, nicht weil sie besser sind.',
                    'Key words and quotation marks (exact search) filter the results. Ads come first because someone paid, not because they are better.')
            })),
        2: Q(1,
            (E, D, N) => ({
                label: t(`Encuentras dos páginas sobre ${E.topic}. ¿Cuál usas para ${E.name}?`,
                    `Du findest zwei Seiten zum Thema „${D.topic}“. Welche nimmst du für ${D.name}?`,
                    `You find two pages about ${N.topic}. Which one do you use for ${N.name}?`),
                options: [
                    t('La que tiene más colores y animaciones', 'Die mit den meisten Farben und Animationen', 'The one with the most colours and animations'),
                    t(`La de un museo, una biblioteca o una enciclopedia para niños sobre ${E.topic}`, `Die eines Museums, einer Bibliothek oder eines Kinderlexikons zum Thema „${D.topic}“`, `The one from a museum, a library or a children’s encyclopedia about ${N.topic}`),
                    t('La que dice «¡increíble! no lo vas a creer»', 'Die mit „Unglaublich! Das glaubst du nie“', 'The one that says “amazing! you won’t believe it”')
                ],
                hint: t('Los museos, las bibliotecas y las enciclopedias revisan lo que publican. Los colores o los títulos exagerados no dicen si algo es verdad.',
                    'Museen, Bibliotheken und Lexika prüfen, was sie veröffentlichen. Farben oder übertriebene Titel sagen nicht, ob etwas stimmt.',
                    'Museums, libraries and encyclopedias check what they publish. Colours or exaggerated titles do not tell you whether something is true.')
            }),
            (E, D, N) => ({
                label: t(`¿Cómo sabes si una página sobre ${E.topic} es una fuente confiable para ${E.name}?`,
                    `Woran erkennst du, ob eine Seite zum Thema „${D.topic}“ eine verlässliche Quelle für ${D.name} ist?`,
                    `How can you tell whether a page about ${N.topic} is a reliable source for ${N.name}?`),
                options: [
                    t('Porque tiene muchos «me gusta»', 'Weil sie viele „Gefällt mir“ hat', 'Because it has lots of “likes”'),
                    t(`Porque dice quién la escribió, cuándo y de dónde saca los datos sobre ${E.topic}`, `Weil sie sagt, wer sie wann geschrieben hat und woher die Angaben zum Thema „${D.topic}“ stammen`, `Because it says who wrote it, when, and where its facts about ${N.topic} come from`),
                    t('Porque es la primera de la lista', 'Weil sie ganz oben in der Liste steht', 'Because it is first on the list')
                ],
                hint: t('Una fuente confiable muestra autor, fecha y de dónde vienen los datos. Los «me gusta» y el orden de la lista no prueban que sea verdad.',
                    'Eine verlässliche Quelle nennt Autor, Datum und Herkunft der Angaben. „Gefällt mir“ und der Platz in der Liste beweisen nicht, dass etwas stimmt.',
                    'A reliable source shows the author, the date and where the facts come from. Likes and the place in the list do not prove it is true.')
            })),
        3: Q(1,
            (E, D, N) => ({
                label: t(`Terminaste ${E.work} para ${E.name}. ¿Dónde lo guardas para encontrarlo mañana?`,
                    `Du hast ${D.work} für ${D.name} fertig. Wo speicherst du die Datei, damit du sie morgen findest?`,
                    `You finished ${N.work} for ${N.name}. Where do you save it so you can find it tomorrow?`),
                options: [
                    t('En el escritorio del computador del salón, con el nombre «sin título»', 'Auf dem Desktop des Klassencomputers mit dem Namen „Unbenannt“', 'On the classroom computer desktop, named “untitled”'),
                    t(`En OneDrive, en la carpeta «${E.name}», con un nombre claro`, `In OneDrive im Ordner „${D.name}“ mit einem klaren Namen`, `In OneDrive, in the “${N.name}” folder, with a clear name`),
                    t('No lo guardo: me lo voy a acordar', 'Gar nicht: Ich merke es mir', 'I don’t save it: I will remember it')
                ],
                hint: t('En OneDrive tu trabajo está seguro y lo abres desde cualquier computador. Una carpeta por materia y un nombre claro te ayudan a encontrarlo.',
                    'In OneDrive ist deine Arbeit sicher, und du öffnest sie von jedem Computer aus. Ein Ordner pro Fach und ein klarer Name helfen dir beim Finden.',
                    'In OneDrive your work is safe and you can open it from any computer. One folder per subject and a clear name help you find it.')
            }),
            (E, D, N) => ({
                label: t(`Tienes varios archivos de ${E.work} para ${E.name}. ¿Cómo los organizas en la nube?`,
                    `Du hast mehrere Dateien für ${D.work} in ${D.name}. Wie ordnest du sie in der Cloud?`,
                    `You have several files for ${N.work} in ${N.name}. How do you organise them in the cloud?`),
                options: [
                    t('Todos sueltos en «Descargas» con nombres como «Documento1»', 'Alle lose in „Downloads“ mit Namen wie „Dokument1“', 'All loose in “Downloads” with names like “Document1”'),
                    t(`Una carpeta «${E.name}» en OneDrive y nombres con tema y fecha`, `Einen Ordner „${D.name}“ in OneDrive und Namen mit Thema und Datum`, `A “${N.name}” folder in OneDrive and names with topic and date`),
                    t('En una memoria USB que todos usan', 'Auf einem USB-Stick, den alle benutzen', 'On a USB stick that everyone uses')
                ],
                hint: t('Carpetas por materia y nombres con tema y fecha (por ejemplo «agua_2026-11-20») hacen que recuperes tu trabajo rápido y sin confundir versiones.',
                    'Ordner pro Fach und Namen mit Thema und Datum (zum Beispiel „Wasser_2026-11-20“) helfen dir, deine Arbeit schnell wiederzufinden, ohne Versionen zu verwechseln.',
                    'Folders per subject and names with topic and date (for example “water_2026-11-20”) help you get your work back quickly without mixing up versions.')
            })),
        4: Q(0,
            (E, D, N) => ({
                label: t(`Un video dice algo raro sobre ${E.topic}. ¿Qué haces antes de usarlo en ${E.name}?`,
                    `Ein Video sagt etwas Seltsames zum Thema „${D.topic}“. Was tust du, bevor du es in ${D.name} benutzt?`,
                    `A video says something strange about ${N.topic}. What do you do before using it in ${N.name}?`),
                options: [
                    t(`Lo compruebo en un libro o en otra página sobre ${E.topic}`, `Ich prüfe es in einem Buch oder auf einer anderen Seite zum Thema „${D.topic}“`, `I check it in a book or on another page about ${N.topic}`),
                    t('Lo creo porque tiene muchas visitas', 'Ich glaube es, weil es viele Aufrufe hat', 'I believe it because it has many views'),
                    t('Lo comparto rápido con mis amigos', 'Ich teile es schnell mit meinen Freunden', 'I quickly share it with my friends')
                ],
                hint: t('Si algo parece raro, compáralo con otra fuente. Muchas visitas no significan que sea verdad.',
                    'Wenn etwas seltsam wirkt, vergleiche es mit einer anderen Quelle. Viele Aufrufe bedeuten nicht, dass es stimmt.',
                    'If something seems strange, compare it with another source. Lots of views do not mean it is true.')
            }),
            (E, D, N) => ({
                label: t(`Lees un dato sorprendente sobre ${E.topic}. ¿Cómo lo verificas para ${E.name}?`,
                    `Du liest eine überraschende Angabe zum Thema „${D.topic}“. Wie überprüfst du sie für ${D.name}?`,
                    `You read a surprising fact about ${N.topic}. How do you verify it for ${N.name}?`),
                options: [
                    t(`Lo busco en dos fuentes confiables más sobre ${E.topic} y comparo`, `Ich suche es in zwei weiteren verlässlichen Quellen zum Thema „${D.topic}“ und vergleiche`, `I look it up in two more reliable sources about ${N.topic} and compare`),
                    t('Me basta con que lo diga un influencer famoso', 'Es reicht, wenn ein berühmter Influencer es sagt', 'It is enough that a famous influencer says it'),
                    t('Lo copio tal cual porque suena interesante', 'Ich kopiere es so, weil es spannend klingt', 'I copy it as it is because it sounds interesting')
                ],
                hint: t('Contrastar fuentes es comparar el dato en varias fuentes confiables. Si coinciden, es más probable que sea correcto.',
                    'Quellen vergleichen heißt, die Angabe in mehreren verlässlichen Quellen zu prüfen. Stimmen sie überein, ist sie wahrscheinlich richtig.',
                    'Cross-checking means comparing the fact in several reliable sources. If they agree, it is more likely to be correct.')
            })),
        5: Q(0,
            (E, D, N) => ({
                label: t(`Le preguntas a un chat de inteligencia artificial (IA) sobre ${E.topic}. ¿Qué haces con su respuesta?`,
                    `Du fragst einen Chat mit künstlicher Intelligenz (KI) zum Thema „${D.topic}“. Was machst du mit seiner Antwort?`,
                    `You ask an artificial intelligence (AI) chat about ${N.topic}. What do you do with its answer?`),
                options: [
                    t(`La reviso con mi profesor de ${E.name} o en un libro, porque la IA se puede equivocar`, `Ich prüfe sie mit meiner Lehrkraft in ${D.name} oder in einem Buch, denn KI kann sich irren`, `I check it with my ${N.name} teacher or in a book, because AI can be wrong`),
                    t('La copio completa en mi tarea', 'Ich kopiere sie ganz in meine Aufgabe', 'I copy all of it into my homework'),
                    t('Le escribo mi dirección para que me ayude mejor', 'Ich schreibe meine Adresse hinein, damit er besser hilft', 'I type my address so it helps me better')
                ],
                hint: t('La inteligencia artificial a veces inventa cosas. Revisa lo que dice con un adulto o con una fuente confiable.',
                    'Künstliche Intelligenz erfindet manchmal Dinge. Prüfe, was sie sagt, mit einem Erwachsenen oder einer verlässlichen Quelle.',
                    'Artificial intelligence sometimes makes things up. Check what it says with an adult or a reliable source.')
            }),
            (E, D, N) => ({
                label: t(`Usas un buscador con inteligencia artificial (IA) para ${E.topic}. ¿Cuál es el mejor uso para ${E.name}?`,
                    `Du nutzt eine Suche mit künstlicher Intelligenz (KI) zum Thema „${D.topic}“. Wie nutzt du sie am besten für ${D.name}?`,
                    `You use an artificial intelligence (AI) search for ${N.topic}. What is the best way to use it for ${N.name}?`),
                options: [
                    t(`Hacer una pregunta clara sobre ${E.topic} y comprobar la respuesta en una fuente confiable`, `Eine klare Frage zum Thema „${D.topic}“ stellen und die Antwort in einer verlässlichen Quelle prüfen`, `Ask a clear question about ${N.topic} and check the answer in a reliable source`),
                    t('Creer todo porque la IA nunca se equivoca', 'Alles glauben, weil KI sich nie irrt', 'Believe everything because AI is never wrong'),
                    t('Pedirle que haga toda la tarea y entregarla sin leer', 'Sie die ganze Aufgabe machen lassen und ungelesen abgeben', 'Ask it to do all the homework and hand it in unread')
                ],
                hint: t('La IA puede «alucinar»: inventar datos que suenan bien. Las preguntas claras dan mejores respuestas, y siempre hay que comprobarlas.',
                    'KI kann „halluzinieren“: Sie erfindet Angaben, die gut klingen. Klare Fragen geben bessere Antworten, und man muss sie immer prüfen.',
                    'AI can “hallucinate”: it makes up facts that sound right. Clear questions get better answers, and you always need to check them.')
            })),
        6: Q(1,
            (E, D, N) => ({
                label: t(`Para ${E.name} usas una foto de ${E.topic} que encontraste en internet. ¿Qué haces?`,
                    `Für ${D.name} benutzt du ein Foto zum Thema „${D.topic}“ aus dem Internet. Was tust du?`,
                    `For ${N.name} you use a photo of ${N.topic} that you found online. What do you do?`),
                options: [
                    t('Digo que la tomé yo', 'Ich sage, dass ich es gemacht habe', 'I say I took it myself'),
                    t(`Escribo debajo de dónde la saqué, en mi trabajo de ${E.name}`, `Ich schreibe in meiner Arbeit für ${D.name} darunter, woher es stammt`, `I write underneath where I got it, in my ${N.name} work`),
                    t('Le borro la marca de agua', 'Ich lösche das Wasserzeichen', 'I remove the watermark')
                ],
                hint: t('Decir de dónde sacaste una foto o un texto es citar la fuente. Así respetas a quien la hizo.',
                    'Anzugeben, woher ein Foto oder Text stammt, heißt Quellen nennen. So respektierst du, wer es gemacht hat.',
                    'Saying where you got a photo or text is citing the source. That way you respect the person who made it.')
            }),
            (E, D, N) => ({
                label: t(`En tu trabajo de ${E.name} sobre ${E.topic} usas datos de una página. ¿Cómo lo haces bien?`,
                    `In deiner Arbeit für ${D.name} zum Thema „${D.topic}“ benutzt du Angaben einer Website. Wie machst du es richtig?`,
                    `In your ${N.name} work about ${N.topic} you use facts from a website. How do you do it right?`),
                options: [
                    t('Copio y pego todo sin cambiar nada', 'Ich kopiere alles, ohne etwas zu ändern', 'I copy and paste everything without changing anything'),
                    t(`Lo escribo con mis palabras y cito la fuente (página y fecha) sobre ${E.topic}`, `Ich schreibe es mit eigenen Worten und nenne die Quelle (Seite und Datum) zum Thema „${D.topic}“`, `I write it in my own words and cite the source (page and date) about ${N.topic}`),
                    t('Cambio dos palabras para que no se note', 'Ich ändere zwei Wörter, damit man es nicht merkt', 'I change two words so nobody notices')
                ],
                hint: t('Copiar sin citar es plagio. Explicar con tus palabras y citar la fuente muestra lo que aprendiste y respeta al autor.',
                    'Ohne Quellenangabe kopieren ist ein Plagiat. Mit eigenen Worten erklären und die Quelle nennen zeigt, was du gelernt hast, und respektiert den Autor.',
                    'Copying without citing is plagiarism. Explaining in your own words and citing the source shows what you learned and respects the author.')
            }))
    },

    // ── Reto 2 · Comunicar y cooperar ──
    2: {
        1: Q(1,
            (E, D, N) => ({
                label: t(`Tienes una pregunta sobre ${E.work} de ${E.name}. ¿Cómo le escribes a tu profesor en Teams?`,
                    `Du hast eine Frage zu ${D.workDat} in ${D.name}. Wie schreibst du deiner Lehrkraft in Teams?`,
                    `You have a question about ${N.work} in ${N.name}. How do you write to your teacher in Teams?`),
                options: [
                    t('«oye q hay q hacer???»', '„ey was muss man machen???“', '“hey wat do we do???”'),
                    t(`«Buenos días, profe. Tengo una duda sobre ${E.work}. Gracias»`, `„Guten Morgen! Ich habe eine Frage zu ${D.workDat}. Danke“`, `“Good morning! I have a question about ${N.work}. Thank you”`),
                    t('Le mando diez mensajes seguidos', 'Ich schicke zehn Nachrichten hintereinander', 'I send ten messages in a row')
                ],
                hint: t('Saludar, decir qué necesitas y dar las gracias hace que tu mensaje sea claro y amable.',
                    'Grüßen, sagen, was du brauchst, und danken macht deine Nachricht klar und freundlich.',
                    'Greeting, saying what you need and saying thank you make your message clear and kind.')
            }),
            (E, D, N) => ({
                label: t(`Necesitas ayuda con ${E.work} de ${E.name}. ¿Qué mensaje por Teams es el más adecuado?`,
                    `Du brauchst Hilfe bei ${D.workDat} in ${D.name}. Welche Teams-Nachricht passt am besten?`,
                    `You need help with ${N.work} in ${N.name}. Which Teams message is the most suitable?`),
                options: [
                    t('Un audio de cinco minutos a las 11 de la noche', 'Eine fünfminütige Sprachnachricht um 23 Uhr', 'A five-minute voice note at 11 pm'),
                    t(`Un mensaje corto con saludo, la duda concreta sobre ${E.work} y gracias, en horario escolar`, `Eine kurze Nachricht mit Gruß, der genauen Frage zu ${D.workDat} und Dank, während der Schulzeit`, `A short message with a greeting, the exact question about ${N.work} and thanks, during school hours`),
                    t('Una captura de pantalla sin ningún texto', 'Einen Screenshot ganz ohne Text', 'A screenshot with no text at all')
                ],
                hint: t('Elegir el canal, el momento y un mensaje claro es parte de comunicarse bien en entornos digitales.',
                    'Den richtigen Kanal, die richtige Zeit und eine klare Nachricht zu wählen gehört zum guten Kommunizieren in digitalen Räumen.',
                    'Choosing the channel, the time and a clear message is part of communicating well online.')
            })),
        2: Q(1,
            (E, D, N) => ({
                label: t(`Quieres mostrar ${E.work} de ${E.name} solo a tu grupo. ¿Cómo lo compartes?`,
                    `Du willst ${D.work} aus ${D.name} nur deiner Gruppe zeigen. Wie teilst du deine Arbeit?`,
                    `You want to show ${N.work} from ${N.name} only to your group. How do you share it?`),
                options: [
                    t('Lo publico en una red social para todo el mundo', 'Ich poste die Arbeit in einem sozialen Netzwerk für alle', 'I post it on social media for everyone'),
                    t(`Lo comparto en el canal de ${E.name} en Teams`, `Ich teile sie im Kanal von ${D.name} in Teams`, `I share it in the ${N.name} channel in Teams`),
                    t('Le doy mi contraseña a cada compañero', 'Ich gebe jedem mein Passwort', 'I give my password to each classmate')
                ],
                hint: t('El canal de la clase en Teams es un lugar seguro: solo lo ven tus compañeros y tu profesor.',
                    'Der Klassenkanal in Teams ist ein sicherer Ort: Nur deine Mitschüler und deine Lehrkraft sehen ihn.',
                    'The class channel in Teams is a safe place: only your classmates and your teacher can see it.')
            }),
            (E, D, N) => ({
                label: t(`Vas a compartir ${E.work} de ${E.name}. ¿Qué opción protege mejor tu trabajo?`,
                    `Du teilst ${D.work} aus ${D.name}. Welche Möglichkeit schützt deine Arbeit am besten?`,
                    `You are going to share ${N.work} from ${N.name}. Which option protects your work best?`),
                options: [
                    t('Un enlace público que cualquiera puede editar', 'Einen öffentlichen Link, den jeder bearbeiten kann', 'A public link that anyone can edit'),
                    t(`Un enlace de OneDrive solo para tu clase de ${E.name}, con permiso de «ver»`, `Einen OneDrive-Link nur für deine Klasse in ${D.name}, mit der Berechtigung „Anzeigen“`, `A OneDrive link only for your ${N.name} class, with “view” permission`),
                    t('Enviarlo a un grupo de chat con desconocidos', 'Die Arbeit in einen Chat mit Unbekannten schicken', 'Send it to a chat group with strangers')
                ],
                hint: t('Los permisos deciden quién ve o cambia un archivo. Compartir solo con quien necesita y con «ver» evita que lo dañen o lo copien.',
                    'Berechtigungen legen fest, wer eine Datei sieht oder ändert. Nur mit den Richtigen und mit „Anzeigen“ zu teilen verhindert, dass sie beschädigt oder kopiert wird.',
                    'Permissions decide who can see or change a file. Sharing only with those who need it, with “view”, keeps it from being damaged or copied.')
            })),
        3: Q(0,
            (E, D, N) => ({
                label: t(`En el chat de ${E.name}, un compañero se burla de ${E.work} de otro. ¿Qué haces?`,
                    `Im Chat von ${D.name} macht sich jemand über die Arbeit (${D.work}) eines anderen lustig. Was tust du?`,
                    `In the ${N.name} chat, a classmate makes fun of someone’s ${N.work}. What do you do?`),
                options: [
                    t(`Escribo algo amable sobre ${E.work} y le aviso al profesor`, `Ich schreibe etwas Nettes über die Arbeit in ${D.name} und sage es der Lehrkraft`, `I write something kind about the ${N.workBare} and tell the teacher`),
                    t('Me río con emojis', 'Ich lache mit Emojis mit', 'I laugh along with emojis'),
                    t('Comparto la burla en otro grupo', 'Ich teile den Spott in einer anderen Gruppe', 'I share the joke in another group')
                ],
                hint: t('En internet tratamos a los demás como en el salón. Si alguien se burla, apoya al compañero y avisa a un adulto.',
                    'Im Internet behandeln wir andere wie im Klassenzimmer. Wenn jemand spottet, unterstütze die Person und sag es einem Erwachsenen.',
                    'Online we treat others the way we do in class. If someone is mocked, support them and tell an adult.')
            }),
            (E, D, N) => ({
                label: t(`En el foro de ${E.name} sobre ${E.topic}, alguien escribe un comentario ofensivo. ¿Qué dice la netiqueta?`,
                    `Im Forum von ${D.name} zum Thema „${D.topic}“ schreibt jemand einen beleidigenden Kommentar. Was sagt die Netiquette?`,
                    `In the ${N.name} forum about ${N.topic}, someone writes an offensive comment. What does netiquette say?`),
                options: [
                    t(`No responder con insultos, apoyar con respeto y reportarlo al profesor de ${E.name}`, `Nicht mit Beleidigungen antworten, respektvoll unterstützen und es der Lehrkraft in ${D.name} melden`, `Don’t reply with insults, support respectfully and report it to the ${N.name} teacher`),
                    t('Contestar con algo peor', 'Mit etwas Schlimmerem antworten', 'Reply with something worse'),
                    t('Hacer captura y burlarse en otro grupo', 'Einen Screenshot machen und in einer anderen Gruppe spotten', 'Take a screenshot and mock it in another group')
                ],
                hint: t('La netiqueta son las normas de respeto en línea. Responder con insultos empeora el ciberacoso; reportarlo ayuda a detenerlo.',
                    'Netiquette sind die Regeln für Respekt im Netz. Mit Beleidigungen antworten verschlimmert Cybermobbing; melden hilft, es zu stoppen.',
                    'Netiquette is the set of rules for respect online. Replying with insults makes cyberbullying worse; reporting helps stop it.')
            })),
        4: Q(0,
            (E, D, N) => ({
                label: t(`Hacen ${E.work} de ${E.name} en grupo. ¿Cómo trabajan juntos en el computador?`,
                    `Ihr macht ${D.work} für ${D.name} in der Gruppe. Wie arbeitet ihr am Computer zusammen?`,
                    `You make ${N.work} for ${N.name} as a group. How do you work together on the computer?`),
                options: [
                    t(`Cada uno escribe su parte de ${E.work} en el mismo archivo de ${E.program}`, `Jeder schreibt seinen Teil von ${D.workDat} in dieselbe Datei in ${D.program}`, `Each person writes their part of the ${N.workBare} in the same ${N.program} file`),
                    t('Uno hace todo y los demás juegan', 'Einer macht alles, die anderen spielen', 'One person does everything and the others play'),
                    t('Cada uno borra lo que hizo el otro', 'Jeder löscht, was der andere gemacht hat', 'Everyone deletes what the others did')
                ],
                hint: t('En un archivo compartido todos aportan y ven el trabajo al mismo tiempo. Repartir las partes es trabajar en equipo.',
                    'In einer gemeinsamen Datei tragen alle bei und sehen die Arbeit gleichzeitig. Aufgaben zu verteilen ist Teamarbeit.',
                    'In a shared file everyone contributes and sees the work at the same time. Sharing out the parts is teamwork.')
            }),
            (E, D, N) => ({
                label: t(`Tu grupo prepara ${E.work} de ${E.name} en un documento colaborativo. ¿Qué es lo mejor?`,
                    `Deine Gruppe erstellt ${D.work} für ${D.name} in einem gemeinsamen Dokument. Was ist am besten?`,
                    `Your group is making ${N.work} for ${N.name} in a collaborative document. What is best?`),
                options: [
                    t(`Repartir las tareas de ${E.work}, escribir cada uno su parte y dejar comentarios en ${E.program}`, `Die Aufgaben für ${D.work} verteilen, jeder schreibt seinen Teil und hinterlässt Kommentare in ${D.program}`, `Share out the tasks for ${N.work}, each write your part and leave comments in ${N.program}`),
                    t('Cambiar el texto de otros sin avisar', 'Den Text anderer ohne Hinweis ändern', 'Change other people’s text without telling them'),
                    t('Trabajar cada uno en archivos distintos y unirlos el último día', 'Jeder arbeitet in einer eigenen Datei, und am letzten Tag wird alles zusammengefügt', 'Everyone works in separate files and joins them on the last day')
                ],
                hint: t('Colaborar en línea es repartir tareas, usar comentarios en vez de borrar y revisar juntos el historial de versiones.',
                    'Online zusammenarbeiten heißt Aufgaben verteilen, Kommentare statt Löschen nutzen und den Versionsverlauf gemeinsam prüfen.',
                    'Collaborating online means sharing out tasks, using comments instead of deleting, and checking the version history together.')
            })),
        5: Q(1,
            (E, D, N) => ({
                label: t(`Ves un video hecho con inteligencia artificial (IA) donde tu profesor de ${E.name} dice cosas que nunca dijo. ¿Qué haces?`,
                    `Du siehst ein mit künstlicher Intelligenz (KI) gemachtes Video, in dem deine Lehrkraft in ${D.name} Dinge sagt, die sie nie gesagt hat. Was tust du?`,
                    `You see a video made with artificial intelligence (AI) where your ${N.name} teacher says things they never said. What do you do?`),
                options: [
                    t('Lo comparto porque es chistoso', 'Ich teile es, weil es lustig ist', 'I share it because it is funny'),
                    t(`No lo comparto y le aviso a un adulto, porque es falso y ofende a tu profesor de ${E.name}`, `Ich teile es nicht und sage es einem Erwachsenen, denn es ist falsch und verletzt deine Lehrkraft in ${D.name}`, `I don’t share it and tell an adult, because it is fake and hurts your ${N.name} teacher`),
                    t('Hago otro igual con un compañero', 'Ich mache so eines mit einem Mitschüler', 'I make another one with a classmate')
                ],
                hint: t('Con IA se pueden hacer videos falsos de personas reales. Compartirlos hace daño; lo correcto es no difundirlos y avisar.',
                    'Mit KI kann man falsche Videos von echten Menschen machen. Sie zu teilen schadet; richtig ist, sie nicht zu verbreiten und Bescheid zu sagen.',
                    'AI can make fake videos of real people. Sharing them causes harm; the right thing is not to spread them and to tell someone.')
            }),
            (E, D, N) => ({
                label: t(`Circula un «deepfake» hecho con inteligencia artificial (IA) sobre ${E.topic} con un compañero de ${E.name}. ¿Qué es lo correcto?`,
                    `Ein mit künstlicher Intelligenz (KI) gemachter „Deepfake“ zum Thema „${D.topic}“ mit einem Mitschüler aus ${D.name} wird verbreitet. Was ist richtig?`,
                    `An artificial intelligence (AI) “deepfake” about ${N.topic} showing a ${N.name} classmate is going around. What is right?`),
                options: [
                    t('Reenviarlo y preguntar si es real', 'Ihn weiterleiten und fragen, ob er echt ist', 'Forward it and ask whether it is real'),
                    t(`No reenviarlo, apoyar al compañero y reportarlo al profesor de ${E.name}`, `Ihn nicht weiterleiten, den Mitschüler unterstützen und es der Lehrkraft in ${D.name} melden`, `Don’t forward it, support your classmate and report it to the ${N.name} teacher`),
                    t('Comentarlo con burlas', 'Ihn spöttisch kommentieren', 'Comment on it with jokes')
                ],
                hint: t('Un deepfake usa IA para imitar la cara o la voz de alguien. Difundirlo, aunque sea «para preguntar», puede ser ciberacoso.',
                    'Ein Deepfake nutzt KI, um Gesicht oder Stimme von jemandem nachzuahmen. Ihn zu verbreiten, auch „nur zum Fragen“, kann Cybermobbing sein.',
                    'A deepfake uses AI to copy someone’s face or voice. Spreading it, even “just to ask”, can be cyberbullying.')
            })),
        6: Q(1,
            (E, D, N) => ({
                label: t(`El colegio hace una encuesta en línea sobre ${E.topic}. ¿Cómo participas?`,
                    `Die Schule macht eine Online-Umfrage zum Thema „${D.topic}“. Wie machst du mit?`,
                    `The school runs an online survey about ${N.topic}. How do you take part?`),
                options: [
                    t('Respondo muchas veces para que gane mi opinión', 'Ich antworte oft, damit meine Meinung gewinnt', 'I answer many times so my opinion wins'),
                    t(`Respondo una vez, con sinceridad, lo que pienso de ${E.topic}`, `Ich antworte einmal ehrlich, was ich über „${D.topic}“ denke`, `I answer once, honestly, what I think about ${N.topic}`),
                    t('Escribo groserías', 'Ich schreibe Schimpfwörter', 'I write rude words')
                ],
                hint: t('Tu opinión cuenta. Participar con respeto y una sola vez hace que la encuesta sea justa.',
                    'Deine Meinung zählt. Respektvoll und nur einmal mitzumachen macht die Umfrage fair.',
                    'Your opinion counts. Taking part respectfully and only once keeps the survey fair.')
            }),
            (E, D, N) => ({
                label: t(`Tu clase de ${E.name} quiere ayudar al colegio con ${E.topic}. ¿Cómo usan los medios digitales?`,
                    `Deine Klasse in ${D.name} will der Schule beim Thema „${D.topic}“ helfen. Wie nutzt ihr digitale Medien?`,
                    `Your ${N.name} class wants to help the school with ${N.topic}. How do you use digital media?`),
                options: [
                    t('Publicar rumores para que la gente se asuste', 'Gerüchte posten, damit die Leute Angst bekommen', 'Post rumours so people get scared'),
                    t(`Hacer ${E.work} con datos verdaderos y compartirlo en el canal del colegio`, `Mit echten Angaben ${D.work} machen und im Schulkanal teilen`, `Make ${N.work} with true facts and share it on the school channel`),
                    t('Copiar una campaña de otro colegio sin decirlo', 'Eine Kampagne einer anderen Schule kopieren, ohne es zu sagen', 'Copy another school’s campaign without saying so')
                ],
                hint: t('Participar en la sociedad digital es usar los medios para aportar con información veraz y respeto.',
                    'An der digitalen Gesellschaft teilnehmen heißt, Medien zu nutzen, um mit wahren Informationen und Respekt etwas beizutragen.',
                    'Taking part in digital society means using media to contribute with truthful information and respect.')
            }))
    },

    // ── Reto 3 · Producir y presentar ──
    3: {
        1: Q(0,
            (E, D, N) => ({
                label: t(`Vas a hacer ${E.work} de ${E.name}. ¿Por dónde empiezas?`,
                    `Du machst ${D.work} für ${D.name}. Womit fängst du an?`,
                    `You are going to make ${N.work} for ${N.name}. Where do you start?`),
                options: [
                    t(`Pienso qué quiero contar sobre ${E.topic} y hago un borrador`, `Ich überlege, was ich zum Thema „${D.topic}“ erzählen will, und mache einen Entwurf`, `I think about what I want to say about ${N.topic} and make a draft`),
                    t('Pongo muchas letras de colores sin pensar', 'Ich setze viele bunte Buchstaben ohne nachzudenken', 'I add lots of coloured letters without thinking'),
                    t('Copio el trabajo de un compañero', 'Ich kopiere die Arbeit eines Mitschülers', 'I copy a classmate’s work')
                ],
                hint: t('Planear primero (qué quiero contar y en qué orden) hace que tu trabajo sea claro.',
                    'Zuerst planen (was will ich erzählen und in welcher Reihenfolge) macht deine Arbeit klar.',
                    'Planning first (what I want to say and in what order) makes your work clear.')
            }),
            (E, D, N) => ({
                label: t(`Preparas ${E.work} de ${E.name} en ${E.program}. ¿Qué paso va primero?`,
                    `Du erstellst ${D.work} für ${D.name} in ${D.program}. Welcher Schritt kommt zuerst?`,
                    `You are making ${N.work} for ${N.name} in ${N.program}. Which step comes first?`),
                options: [
                    t(`Un plan o guion: idea principal sobre ${E.topic}, partes y público`, `Ein Plan oder Drehbuch: Hauptidee zum Thema „${D.topic}“, Teile und Publikum`, `A plan or script: main idea about ${N.topic}, parts and audience`),
                    t('Elegir el fondo animado más llamativo', 'Den auffälligsten animierten Hintergrund wählen', 'Choose the flashiest animated background'),
                    t('Buscar un trabajo ya hecho para entregarlo', 'Eine fertige Arbeit suchen und abgeben', 'Look for a finished piece to hand in')
                ],
                hint: t('Un guion o plan define la idea, las partes y para quién es. Así el diseño ayuda a contar la idea y no la tapa.',
                    'Ein Drehbuch oder Plan legt Idee, Teile und Zielgruppe fest. So hilft das Design, die Idee zu erzählen, statt sie zu verdecken.',
                    'A script or plan sets the idea, the parts and the audience. That way the design helps tell the idea instead of hiding it.')
            })),
        2: Q(1,
            (E, D, N) => ({
                label: t(`En ${E.work} de ${E.name}, ¿cómo se lee mejor el texto?`,
                    `Wie ist der Text in ${D.workDat} für ${D.name} am besten lesbar?`,
                    `In your ${N.workBare} for ${N.name}, how is the text easiest to read?`),
                options: [
                    t('Letra pequeña amarilla sobre fondo blanco', 'Kleine gelbe Schrift auf weißem Hintergrund', 'Small yellow letters on a white background'),
                    t(`Letra grande y oscura sobre fondo claro, con un título sobre ${E.topic}`, `Große dunkle Schrift auf hellem Hintergrund, mit einem Titel zum Thema „${D.topic}“`, `Big dark letters on a light background, with a title about ${N.topic}`),
                    t('Todo en mayúsculas y con diez colores', 'Alles in Großbuchstaben und in zehn Farben', 'All capitals and in ten colours')
                ],
                hint: t('Un buen contraste (oscuro sobre claro) y un título claro hacen que todos puedan leer tu trabajo.',
                    'Guter Kontrast (dunkel auf hell) und ein klarer Titel sorgen dafür, dass alle deine Arbeit lesen können.',
                    'Good contrast (dark on light) and a clear title mean everyone can read your work.')
            }),
            (E, D, N) => ({
                label: t(`Diseñas ${E.work} de ${E.name}. ¿Qué decisión ayuda a tu público a entender ${E.topic}?`,
                    `Du gestaltest ${D.work} für ${D.name}. Welche Entscheidung hilft deinem Publikum, „${D.topic}“ zu verstehen?`,
                    `You are designing ${N.work} for ${N.name}. Which choice helps your audience understand ${N.topic}?`),
                options: [
                    t('Poner todo el texto en una sola diapositiva', 'Den ganzen Text auf eine einzige Folie setzen', 'Put all the text on one slide'),
                    t(`Pocas palabras, imágenes que explican ${E.topic} y buen contraste`, `Wenige Wörter, Bilder, die „${D.topic}“ erklären, und guter Kontrast`, `Few words, images that explain ${N.topic} and good contrast`),
                    t('Usar muchas animaciones que se mueven todo el tiempo', 'Viele Animationen, die sich ständig bewegen', 'Use lots of animations that move all the time')
                ],
                hint: t('En una presentación, menos es más: ideas cortas, imágenes que explican y contraste. Las animaciones excesivas distraen.',
                    'In einer Präsentation ist weniger mehr: kurze Ideen, erklärende Bilder und Kontrast. Zu viele Animationen lenken ab.',
                    'In a presentation, less is more: short ideas, explanatory images and contrast. Too many animations distract.')
            })),
        3: Q(1,
            (E, D, N) => ({
                label: t(`Una app de inteligencia artificial (IA) te hace un dibujo para ${E.work} de ${E.name}. ¿Qué haces?`,
                    `Eine App mit künstlicher Intelligenz (KI) macht dir ein Bild für ${D.work} in ${D.name}. Was tust du?`,
                    `An artificial intelligence (AI) app makes a picture for your ${N.workBare} in ${N.name}. What do you do?`),
                options: [
                    t('Digo que lo dibujé yo', 'Ich sage, dass ich es gemalt habe', 'I say I drew it myself'),
                    t(`Escribo «imagen hecha con IA» en ${E.work}`, `Ich schreibe „Bild mit KI erstellt“ in ${D.workDat}`, `I write “image made with AI” on the ${N.workBare}`),
                    t('Uso la foto de un compañero sin preguntarle', 'Ich nehme das Foto eines Mitschülers, ohne zu fragen', 'I use a classmate’s photo without asking')
                ],
                hint: t('Si usas inteligencia artificial, dilo. Ser honesto sobre cómo hiciste tu trabajo es respetar las reglas.',
                    'Wenn du künstliche Intelligenz benutzt, sag es. Ehrlich zu sagen, wie du gearbeitet hast, heißt die Regeln zu respektieren.',
                    'If you use artificial intelligence, say so. Being honest about how you made your work means respecting the rules.')
            }),
            (E, D, N) => ({
                label: t(`Creas imágenes con inteligencia artificial (IA) para ${E.work} de ${E.name}. ¿Qué es lo correcto?`,
                    `Du erstellst Bilder mit künstlicher Intelligenz (KI) für ${D.work} in ${D.name}. Was ist richtig?`,
                    `You create images with artificial intelligence (AI) for your ${N.workBare} in ${N.name}. What is right?`),
                options: [
                    t('Pedirle a la IA una imagen con la cara de un compañero sin su permiso', 'Die KI um ein Bild mit dem Gesicht eines Mitschülers ohne dessen Erlaubnis bitten', 'Ask the AI for an image with a classmate’s face without their permission'),
                    t(`Revisar la imagen, decir que es de IA y no usar caras ni obras de otros sin permiso en ${E.work}`, `Das Bild prüfen, angeben, dass es von KI ist, und in ${D.workDat} keine Gesichter oder Werke anderer ohne Erlaubnis nutzen`, `Check the image, say it is AI-made and not use other people’s faces or works without permission in your ${N.workBare}`),
                    t('Presentarla como una foto real', 'Es als echtes Foto ausgeben', 'Present it as a real photo')
                ],
                hint: t('Con IA también hay derechos de autor y derecho a la propia imagen. Ser transparente (decir qué hizo la IA) es una norma básica.',
                    'Auch bei KI gibt es Urheberrecht und das Recht am eigenen Bild. Transparent zu sein (sagen, was die KI gemacht hat) ist eine Grundregel.',
                    'With AI there are still copyright and image rights. Being transparent (saying what the AI did) is a basic rule.')
            })),
        4: Q(0,
            (E, D, N) => ({
                label: t(`Quieres mejorar ${E.work} de ${E.name} que hiciste la semana pasada. ¿Qué haces?`,
                    `Du willst ${D.work} für ${D.name} von letzter Woche verbessern. Was tust du?`,
                    `You want to improve the ${N.workBare} for ${N.name} you made last week. What do you do?`),
                options: [
                    t(`Abro el archivo, agrego lo nuevo sobre ${E.topic} y lo guardo otra vez`, `Ich öffne die Datei, ergänze Neues zum Thema „${D.topic}“ und speichere wieder`, `I open the file, add what is new about ${N.topic} and save it again`),
                    t('Empiezo de cero cada vez', 'Ich fange jedes Mal von vorne an', 'I start from scratch every time'),
                    t('Borro el archivo', 'Ich lösche die Datei', 'I delete the file')
                ],
                hint: t('Un trabajo digital se puede mejorar muchas veces: abres, cambias y guardas.',
                    'Eine digitale Arbeit kann man oft verbessern: öffnen, ändern, speichern.',
                    'Digital work can be improved many times: open, change and save.')
            }),
            (E, D, N) => ({
                label: t(`Tienes una foto y un texto para ${E.work} de ${E.name}. ¿Cómo los combinas bien?`,
                    `Du hast ein Foto und einen Text für ${D.work} in ${D.name}. Wie kombinierst du sie gut?`,
                    `You have a photo and a text for your ${N.workBare} in ${N.name}. How do you combine them well?`),
                options: [
                    t(`Recorto la foto, la pongo junto al texto sobre ${E.topic} y escribo un pie de foto`, `Ich schneide das Foto zu, setze es neben den Text zum Thema „${D.topic}“ und schreibe eine Bildunterschrift`, `I crop the photo, place it next to the text about ${N.topic} and write a caption`),
                    t('Pongo la foto encima del texto para que no se lea', 'Ich lege das Foto über den Text, sodass man ihn nicht lesen kann', 'I put the photo over the text so it cannot be read'),
                    t('Estiro la foto hasta que se deforma', 'Ich ziehe das Foto, bis es verzerrt ist', 'I stretch the photo until it is distorted')
                ],
                hint: t('Reelaborar es adaptar lo que ya tienes: recortar, ordenar y explicar con un pie de foto para que todo encaje.',
                    'Weiterverarbeiten heißt Vorhandenes anpassen: zuschneiden, ordnen und mit einer Bildunterschrift erklären, damit alles passt.',
                    'Reworking means adapting what you already have: cropping, arranging and explaining with a caption so everything fits.')
            })),
        5: Q(0,
            (E, D, N) => ({
                label: t(`Quieres poner música en ${E.work} de ${E.name}. ¿Cuál usas?`,
                    `Du willst Musik in ${D.workDat} für ${D.name} einbauen. Welche nimmst du?`,
                    `You want to add music to your ${N.workBare} for ${N.name}. Which do you use?`),
                options: [
                    t(`Música libre para ${E.work}, citando de dónde salió`, `Freie Musik für ${D.work}, mit Angabe der Herkunft`, `Free music for ${N.work}, saying where it came from`),
                    t('Una canción famosa descargada de cualquier página', 'Ein berühmtes Lied von irgendeiner Seite', 'A famous song downloaded from any website'),
                    t('Una canción grabada del celular de otra persona', 'Ein Lied vom Handy einer anderen Person', 'A song recorded from someone else’s phone')
                ],
                hint: t('La música tiene dueño. La música libre se puede usar si dices de dónde la sacaste.',
                    'Musik gehört jemandem. Freie Musik darfst du nutzen, wenn du sagst, woher sie stammt.',
                    'Music belongs to someone. You can use free music if you say where you got it.')
            }),
            (E, D, N) => ({
                label: t(`Para ${E.work} de ${E.name} necesitas imágenes de ${E.topic}. ¿Cuáles puedes usar?`,
                    `Für ${D.work} in ${D.name} brauchst du Bilder zum Thema „${D.topic}“. Welche darfst du nutzen?`,
                    `For your ${N.workBare} in ${N.name} you need images of ${N.topic}. Which can you use?`),
                options: [
                    t(`Imágenes con licencia libre (Creative Commons) sobre ${E.topic}, citando al autor`, `Bilder mit freier Lizenz (Creative Commons) zum Thema „${D.topic}“, mit Angabe des Urhebers`, `Images with a free licence (Creative Commons) of ${N.topic}, crediting the author`),
                    t('Cualquier imagen de internet, porque si está ahí es gratis', 'Jedes Bild aus dem Internet, denn was dort ist, ist gratis', 'Any image from the internet, because if it is there it is free'),
                    t('Imágenes con marca de agua, después de borrarla', 'Bilder mit Wasserzeichen, nachdem man es entfernt hat', 'Watermarked images, after removing the watermark')
                ],
                hint: t('Que algo esté en internet no lo hace libre. Las licencias Creative Commons dicen cómo puedes usarlo, casi siempre citando al autor.',
                    'Was im Internet steht, ist nicht automatisch frei. Creative-Commons-Lizenzen sagen, wie du es nutzen darfst, meist mit Angabe des Urhebers.',
                    'Being online does not make something free. Creative Commons licences tell you how you may use it, usually crediting the author.')
            })),
        6: Q(1,
            (E, D, N) => ({
                label: t(`Vas a presentar ${E.work} de ${E.name} a la clase. ¿Cómo lo haces?`,
                    `Du stellst ${D.work} aus ${D.name} der Klasse vor. Wie machst du das?`,
                    `You are presenting your ${N.workBare} for ${N.name} to the class. How do you do it?`),
                options: [
                    t('Leo todo de la pantalla de espaldas a la clase', 'Ich lese alles vom Bildschirm ab, mit dem Rücken zur Klasse', 'I read everything off the screen with my back to the class'),
                    t(`Practico antes, miro a mis compañeros y explico ${E.topic} con mis palabras`, `Ich übe vorher, schaue meine Mitschüler an und erkläre „${D.topic}“ mit eigenen Worten`, `I practise first, look at my classmates and explain ${N.topic} in my own words`),
                    t('Hablo muy rápido para terminar pronto', 'Ich spreche ganz schnell, um bald fertig zu sein', 'I speak very fast to finish quickly')
                ],
                hint: t('Practicar, mirar al público y explicar con tus palabras hace que todos entiendan tu trabajo.',
                    'Üben, das Publikum anschauen und mit eigenen Worten erklären sorgt dafür, dass alle deine Arbeit verstehen.',
                    'Practising, looking at the audience and explaining in your own words help everyone understand your work.')
            }),
            (E, D, N) => ({
                label: t(`Recibes comentarios sobre ${E.work} de ${E.name}. ¿Qué haces con ellos?`,
                    `Du bekommst Rückmeldungen zu ${D.workDat} in ${D.name}. Was machst du damit?`,
                    `You get feedback on your ${N.workBare} for ${N.name}. What do you do with it?`),
                options: [
                    t('Los ignoro: mi trabajo ya está perfecto', 'Ich ignoriere sie: Meine Arbeit ist perfekt', 'I ignore it: my work is already perfect'),
                    t(`Elijo los útiles, mejoro ${E.work} y guardo una versión nueva`, `Ich wähle die hilfreichen aus, verbessere ${D.work} und speichere eine neue Version`, `I pick the useful points, improve the ${N.workBare} and save a new version`),
                    t('Borro los comentarios que no me gustan', 'Ich lösche die Kommentare, die mir nicht gefallen', 'I delete the comments I don’t like')
                ],
                hint: t('La retroalimentación sirve para mejorar. Guardar versiones permite ver cómo avanzó tu trabajo.',
                    'Rückmeldungen helfen beim Verbessern. Versionen zu speichern zeigt, wie sich deine Arbeit entwickelt hat.',
                    'Feedback helps you improve. Saving versions shows how your work has developed.')
            }))
    },

    // ── Reto 4 · Protegerse y actuar con seguridad ──
    4: {
        1: Q(1,
            (E, D, N) => ({
                label: t(`Terminas de trabajar en ${E.name} en un computador del colegio. ¿Qué haces antes de irte?`,
                    `Du bist mit ${D.name} am Schulcomputer fertig. Was machst du, bevor du gehst?`,
                    `You finish working on ${N.name} on a school computer. What do you do before you leave?`),
                options: [
                    t('Me voy y dejo mi cuenta abierta', 'Ich gehe und lasse mein Konto offen', 'I leave and keep my account open'),
                    t(`Guardo ${E.work} y cierro sesión`, `Ich speichere ${D.work} und melde mich ab`, `I save the ${N.workBare} and sign out`),
                    t('Le pido a un amigo que siga con mi cuenta', 'Ich bitte einen Freund, mit meinem Konto weiterzumachen', 'I ask a friend to carry on with my account')
                ],
                hint: t('Cerrar sesión evita que otra persona use tu cuenta o cambie tu trabajo.',
                    'Abmelden verhindert, dass jemand anderes dein Konto benutzt oder deine Arbeit ändert.',
                    'Signing out stops anyone else from using your account or changing your work.')
            }),
            (E, D, N) => ({
                label: t(`¿Qué contraseña es más segura para tu cuenta del colegio, donde guardas ${E.work} de ${E.name}?`,
                    `Welches Passwort ist für dein Schulkonto, in dem ${D.work} aus ${D.name} liegt, am sichersten?`,
                    `Which password is safest for your school account, where you keep your ${N.workBare} for ${N.name}?`),
                options: [
                    t('123456', '123456', '123456'),
                    t(`Una frase larga con números y símbolos que solo tú sabes, distinta de «${E.name}»`, `Ein langer Satz mit Zahlen und Zeichen, den nur du kennst, nicht „${D.name}“`, `A long phrase with numbers and symbols that only you know, not “${N.name}”`),
                    t('Mi nombre y mi fecha de cumpleaños', 'Mein Name und mein Geburtstag', 'My name and my birthday')
                ],
                hint: t('Una contraseña segura es larga, mezcla letras, números y símbolos, y no se comparte. Los datos personales se adivinan fácil.',
                    'Ein sicheres Passwort ist lang, mischt Buchstaben, Zahlen und Zeichen und wird nicht geteilt. Persönliche Daten errät man leicht.',
                    'A strong password is long, mixes letters, numbers and symbols, and is never shared. Personal details are easy to guess.')
            })),
        2: Q(1,
            (E, D, N) => ({
                label: t(`Te llega un mensaje: «¡Ganaste una tableta para ${E.name}! Escribe tu contraseña». ¿Qué haces?`,
                    `Du bekommst eine Nachricht: „Du hast ein Tablet für ${D.name} gewonnen! Schreib dein Passwort.“ Was tust du?`,
                    `You get a message: “You won a tablet for ${N.name}! Type your password.” What do you do?`),
                options: [
                    t('Escribo mi contraseña rápido', 'Ich schreibe schnell mein Passwort', 'I quickly type my password'),
                    t(`No respondo y se lo muestro a un adulto o a mi profesor de ${E.name}`, `Ich antworte nicht und zeige es einem Erwachsenen oder meiner Lehrkraft in ${D.name}`, `I don’t reply and show it to an adult or my ${N.name} teacher`),
                    t('Se lo reenvío a todos mis amigos', 'Ich leite es an alle Freunde weiter', 'I forward it to all my friends')
                ],
                hint: t('Nadie de verdad te pide tu contraseña para darte un premio. Es un engaño: muéstraselo a un adulto.',
                    'Niemand, der es ehrlich meint, fragt nach deinem Passwort, um dir einen Preis zu geben. Es ist ein Trick: Zeig es einem Erwachsenen.',
                    'No one honest asks for your password to give you a prize. It is a trick: show it to an adult.')
            }),
            (E, D, N) => ({
                label: t(`Un correo dice: «Tu cuenta de ${E.name} se cerrará. Entra a este enlace y escribe tu contraseña». ¿Qué es?`,
                    `Eine E-Mail sagt: „Dein ${D.name}-Konto wird gesperrt. Öffne diesen Link und gib dein Passwort ein.“ Was ist das?`,
                    `An email says: “Your ${N.name} account will be closed. Open this link and type your password.” What is it?`),
                options: [
                    t('Un aviso oficial que hay que responder ya', 'Eine offizielle Nachricht, auf die man sofort antworten muss', 'An official notice you must answer straight away'),
                    t(`Phishing: un engaño para robar tu contraseña; no abro el enlace y aviso a mi profesor de ${E.name}`, `Phishing: ein Trick, um dein Passwort zu stehlen; ich öffne den Link nicht und sage es meiner Lehrkraft in ${D.name}`, `Phishing: a trick to steal your password; I don’t open the link and tell my ${N.name} teacher`),
                    t('Un regalo del colegio', 'Ein Geschenk der Schule', 'A present from the school')
                ],
                hint: t('El phishing usa prisa y miedo («se cerrará tu cuenta») para que des tu contraseña. Nunca la escribas en un enlace de un mensaje.',
                    'Phishing nutzt Eile und Angst („dein Konto wird gesperrt“), damit du dein Passwort verrätst. Gib es nie über einen Link aus einer Nachricht ein.',
                    'Phishing uses hurry and fear (“your account will be closed”) to get your password. Never type it into a link from a message.')
            })),
        3: Q(0,
            (E, D, N) => ({
                label: t(`Un chat de inteligencia artificial (IA) te ayuda con ${E.topic}. ¿Qué NO le debes escribir?`,
                    `Ein Chat mit künstlicher Intelligenz (KI) hilft dir beim Thema „${D.topic}“. Was darfst du NICHT hineinschreiben?`,
                    `An artificial intelligence (AI) chat helps you with ${N.topic}. What must you NOT type into it?`),
                options: [
                    t('Mi nombre completo, mi dirección o mi foto', 'Meinen vollen Namen, meine Adresse oder mein Foto', 'My full name, my address or my photo'),
                    t(`Una pregunta sobre ${E.topic}`, `Eine Frage zum Thema „${D.topic}“`, `A question about ${N.topic}`),
                    t(`Una palabra de ${E.name} que no entiendo`, `Ein Wort aus ${D.name}, das ich nicht verstehe`, `A ${N.name} word I don’t understand`)
                ],
                hint: t('Lo que escribes en una inteligencia artificial puede guardarse. Tus datos personales y tus fotos son tuyos: no los compartas.',
                    'Was du in eine künstliche Intelligenz schreibst, kann gespeichert werden. Deine persönlichen Daten und Fotos gehören dir: Teile sie nicht.',
                    'What you type into an artificial intelligence can be stored. Your personal details and photos are yours: don’t share them.')
            }),
            (E, D, N) => ({
                label: t(`Usas una app de inteligencia artificial (IA) para ${E.work} de ${E.name}. ¿Qué cuida tu privacidad?`,
                    `Du nutzt eine App mit künstlicher Intelligenz (KI) für ${D.work} in ${D.name}. Was schützt deine Privatsphäre?`,
                    `You use an artificial intelligence (AI) app for your ${N.workBare} in ${N.name}. What protects your privacy?`),
                options: [
                    t(`Escribir solo sobre ${E.topic}, sin datos personales, fotos ni contraseñas`, `Nur über „${D.topic}“ schreiben, ohne persönliche Daten, Fotos oder Passwörter`, `Write only about ${N.topic}, with no personal details, photos or passwords`),
                    t('Subir fotos de mi familia para que el trabajo quede mejor', 'Fotos meiner Familie hochladen, damit die Arbeit schöner wird', 'Upload photos of my family so the work looks better'),
                    t('Darle mi contraseña del colegio para que guarde el trabajo', 'Ihr mein Schulpasswort geben, damit sie die Arbeit speichert', 'Give it my school password so it can save the work')
                ],
                hint: t('Muchas apps de IA guardan lo que escribes y lo usan para entrenarse. Proteger tus datos es no darlos si no hace falta.',
                    'Viele KI-Apps speichern, was du eingibst, und nutzen es zum Trainieren. Deine Daten zu schützen heißt, sie nicht zu geben, wenn es nicht nötig ist.',
                    'Many AI apps store what you type and use it for training. Protecting your data means not giving it when it isn’t needed.')
            })),
        4: Q(0,
            (E, D, N) => ({
                label: t(`Quieres publicar una foto de tu clase de ${E.name}. ¿Qué haces primero?`,
                    `Du willst ein Foto aus deinem Unterricht in ${D.name} veröffentlichen. Was tust du zuerst?`,
                    `You want to post a photo from your ${N.name} class. What do you do first?`),
                options: [
                    t(`Pido permiso a los compañeros que salen y a mi profesor de ${E.name}`, `Ich frage die Mitschüler auf dem Foto und meine Lehrkraft in ${D.name} um Erlaubnis`, `I ask the classmates in it and my ${N.name} teacher for permission`),
                    t('La subo sin preguntar', 'Ich lade es hoch, ohne zu fragen', 'I upload it without asking'),
                    t('Escribo el nombre completo de todos', 'Ich schreibe die vollen Namen aller dazu', 'I write everyone’s full name')
                ],
                hint: t('Cada persona decide sobre su imagen. Antes de publicar una foto, pide permiso.',
                    'Jede Person entscheidet über ihr Bild. Bevor du ein Foto veröffentlichst, frag um Erlaubnis.',
                    'Everyone decides about their own image. Before posting a photo, ask for permission.')
            }),
            (E, D, N) => ({
                label: t(`Todo lo que publicas deja una huella digital. ¿Qué publicación sobre ${E.name} es segura?`,
                    `Alles, was du postest, hinterlässt einen digitalen Fußabdruck. Welcher Beitrag zu ${D.name} ist sicher?`,
                    `Everything you post leaves a digital footprint. Which post about ${N.name} is safe?`),
                options: [
                    t(`Una foto de ${E.work}, sin caras, nombre completo ni uniforme del colegio`, `Ein Foto von ${D.workDat}, ohne Gesichter, vollen Namen oder Schuluniform`, `A photo of the ${N.workBare}, with no faces, full names or school uniform`),
                    t('Una foto mía con el uniforme y la dirección de mi casa', 'Ein Foto von mir in Schuluniform mit meiner Adresse', 'A photo of me in uniform with my home address'),
                    t('Un video de un compañero sin su permiso', 'Ein Video eines Mitschülers ohne Erlaubnis', 'A video of a classmate without their permission')
                ],
                hint: t('La huella digital es todo lo que queda de ti en internet y es difícil de borrar. Publica sin datos que digan quién eres o dónde estás.',
                    'Der digitale Fußabdruck ist alles, was im Internet von dir bleibt, und er ist schwer zu löschen. Poste ohne Angaben, die zeigen, wer oder wo du bist.',
                    'Your digital footprint is everything left of you online, and it is hard to delete. Post without details that show who or where you are.')
            })),
        5: Q(1,
            (E, D, N) => ({
                label: t(`Llevas mucho rato en la tableta haciendo ${E.work} de ${E.name}. ¿Qué haces?`,
                    `Du arbeitest schon lange am Tablet an ${D.workDat} für ${D.name}. Was tust du?`,
                    `You have been on the tablet for a long time making your ${N.workBare} for ${N.name}. What do you do?`),
                options: [
                    t('Sigo sin parar hasta la noche', 'Ich mache ohne Pause bis in die Nacht weiter', 'I keep going without a break until night'),
                    t(`Hago una pausa en ${E.work}: me estiro y miro lejos`, `Ich mache bei ${D.workDat} eine Pause: dehne mich und schaue in die Ferne`, `I take a break from ${N.work}: I stretch and look into the distance`),
                    t('Acerco la pantalla a mis ojos', 'Ich halte den Bildschirm näher an die Augen', 'I bring the screen closer to my eyes')
                ],
                hint: t('Las pausas cuidan tus ojos y tu cuerpo. Levántate, estírate y mira lejos un momento.',
                    'Pausen schützen deine Augen und deinen Körper. Steh auf, dehne dich und schau kurz in die Ferne.',
                    'Breaks look after your eyes and body. Get up, stretch and look into the distance for a moment.')
            }),
            (E, D, N) => ({
                label: t(`Para cuidar tu salud mientras haces ${E.work} de ${E.name} en pantalla, ¿qué recomiendan?`,
                    `Was wird empfohlen, um deine Gesundheit zu schützen, während du ${D.work} für ${D.name} am Bildschirm machst?`,
                    `To look after your health while you make your ${N.workBare} for ${N.name} on screen, what is recommended?`),
                options: [
                    t('Usar la pantalla en la cama antes de dormir', 'Den Bildschirm im Bett vor dem Schlafen nutzen', 'Use the screen in bed before sleeping'),
                    t(`La regla 20-20-20 mientras haces ${E.work}: cada 20 minutos, mirar algo a 20 pies (6 m) durante 20 segundos, y sentarse derecho`, `Die 20-20-20-Regel bei ${D.workDat}: alle 20 Minuten 20 Sekunden lang etwas in 6 m Entfernung ansehen und gerade sitzen`, `The 20-20-20 rule while making ${N.work}: every 20 minutes, look at something 20 feet (6 m) away for 20 seconds, and sit up straight`),
                    t('Subir el brillo al máximo', 'Die Helligkeit ganz hochdrehen', 'Turn the brightness all the way up')
                ],
                hint: t('La regla 20-20-20 descansa la vista. Una buena postura y no usar pantallas antes de dormir también protegen tu salud.',
                    'Die 20-20-20-Regel entspannt die Augen. Gute Haltung und keine Bildschirme vor dem Schlafen schützen ebenfalls deine Gesundheit.',
                    'The 20-20-20 rule rests your eyes. Good posture and no screens before bed also protect your health.')
            })),
        6: Q(0,
            (E, D, N) => ({
                label: t(`Al buscar ${E.topic} aparece una ventana: «Descarga este juego gratis». ¿Qué haces?`,
                    `Bei der Suche zum Thema „${D.topic}“ erscheint ein Fenster: „Lade dieses Spiel gratis herunter.“ Was tust du?`,
                    `While searching for ${N.topic}, a window pops up: “Download this free game.” What do you do?`),
                options: [
                    t(`La cierro y sigo con ${E.name}; solo descargo lo que dice el profesor`, `Ich schließe es und mache mit ${D.name} weiter; ich lade nur, was die Lehrkraft sagt`, `I close it and carry on with ${N.name}; I only download what the teacher says`),
                    t('Lo descargo rápido', 'Ich lade es schnell herunter', 'I download it quickly'),
                    t('Desactivo el antivirus para instalarlo', 'Ich schalte den Virenschutz aus, um es zu installieren', 'I switch off the antivirus to install it')
                ],
                hint: t('Las descargas «gratis» de ventanas desconocidas pueden traer virus. Instala solo lo que autorice el colegio.',
                    '„Kostenlose“ Downloads aus unbekannten Fenstern können Viren enthalten. Installiere nur, was die Schule erlaubt.',
                    '“Free” downloads from unknown windows can contain viruses. Only install what the school allows.')
            }),
            (E, D, N) => ({
                label: t(`Una página sobre ${E.topic} pide instalar una extensión para «ver mejor». ¿Qué es lo seguro?`,
                    `Eine Seite zum Thema „${D.topic}“ will eine Erweiterung installieren, um „besser zu sehen“. Was ist sicher?`,
                    `A page about ${N.topic} asks you to install an extension to “see it better”. What is the safe choice?`),
                options: [
                    t(`No instalarla, salir de la página y avisar al profesor de ${E.name}`, `Sie nicht installieren, die Seite verlassen und der Lehrkraft in ${D.name} Bescheid sagen`, `Don’t install it, leave the page and tell the ${N.name} teacher`),
                    t('Instalarla porque la página parece seria', 'Sie installieren, weil die Seite seriös aussieht', 'Install it because the page looks serious'),
                    t('Darle todos los permisos que pida', 'Ihr alle Berechtigungen geben, die sie verlangt', 'Give it all the permissions it asks for')
                ],
                hint: t('Las extensiones y programas desconocidos pueden ser malware: espían o dañan el equipo. Ante la duda, no instales y pregunta.',
                    'Unbekannte Erweiterungen und Programme können Schadsoftware sein: Sie spionieren oder beschädigen das Gerät. Im Zweifel nicht installieren und fragen.',
                    'Unknown extensions and programs can be malware: they spy on or damage the device. If in doubt, don’t install and ask.')
            }))
    },

    // ── Reto 5 · Solucionar problemas y actuar ──
    5: {
        1: Q(1,
            (E, D, N) => ({
                label: t(`Abres ${E.program} para ${E.work} de ${E.name} y la pantalla se congela. ¿Qué intentas primero?`,
                    `Du öffnest ${D.program} für ${D.work} in ${D.name}, und der Bildschirm friert ein. Was versuchst du zuerst?`,
                    `You open ${N.program} for your ${N.name} ${N.workBare} and the screen freezes. What do you try first?`),
                options: [
                    t('Golpear el teclado', 'Auf die Tastatur hauen', 'Bang on the keyboard'),
                    t(`Esperar un momento y, si sigue igual, cerrar y volver a abrir ${E.program} sin perder ${E.work}`, `Kurz warten und, wenn es so bleibt, ${D.program} schließen und neu öffnen, ohne ${D.work} zu verlieren`, `Wait a moment and, if nothing changes, close and reopen ${N.program} without losing ${N.work}`),
                    t('Apagar el computador desde el enchufe', 'Den Computer am Stecker ausschalten', 'Switch the computer off at the plug')
                ],
                hint: t('Muchos problemas se arreglan esperando un poco o volviendo a abrir el programa. Golpear o desconectar puede dañar el equipo.',
                    'Viele Probleme lösen sich, wenn man kurz wartet oder das Programm neu öffnet. Hauen oder Ausstecken kann das Gerät beschädigen.',
                    'Many problems are fixed by waiting a little or reopening the program. Banging or unplugging can damage the device.')
            }),
            (E, D, N) => ({
                label: t(`${E.program} no guarda ${E.work} de ${E.name}. ¿Qué orden de pasos sigues?`,
                    `${D.program} speichert ${D.work} für ${D.name} nicht. In welcher Reihenfolge gehst du vor?`,
                    `${N.program} won’t save your ${N.workBare} for ${N.name}. In what order do you try things?`),
                options: [
                    t('Borrar el archivo y empezar de nuevo', 'Die Datei löschen und neu anfangen', 'Delete the file and start again'),
                    t(`Revisar la conexión a internet, copiar ${E.work}, reiniciar el programa y, si sigue, pedir ayuda`, `Internetverbindung prüfen, ${D.work} kopieren, das Programm neu starten und, wenn es bleibt, Hilfe holen`, `Check the internet connection, copy ${N.work}, restart the program and, if it continues, ask for help`),
                    t('Instalar otro programa de una página desconocida', 'Ein anderes Programm von einer unbekannten Seite installieren', 'Install another program from an unknown website')
                ],
                hint: t('Resolver un problema técnico es ir paso a paso: revisar lo sencillo, proteger tu trabajo y luego pedir ayuda si hace falta.',
                    'Ein technisches Problem löst man Schritt für Schritt: das Einfache prüfen, die Arbeit sichern und dann bei Bedarf Hilfe holen.',
                    'Solving a technical problem means going step by step: check the simple things, protect your work, then ask for help if needed.')
            })),
        2: Q(1,
            (E, D, N) => ({
                label: t(`El sonido no funciona cuando ves un video de ${E.topic}. ¿Qué revisas?`,
                    `Der Ton funktioniert nicht, wenn du ein Video zum Thema „${D.topic}“ ansiehst. Was prüfst du?`,
                    `The sound doesn’t work when you watch a video about ${N.topic}. What do you check?`),
                options: [
                    t('Cambio de computador sin revisar nada', 'Ich wechsle den Computer, ohne etwas zu prüfen', 'I switch computers without checking anything'),
                    t(`El volumen del video de ${E.topic}, que no esté en silencio y que los audífonos estén conectados`, `Die Lautstärke des Videos zum Thema „${D.topic}“, ob es stumm ist und ob die Kopfhörer eingesteckt sind`, `The volume of the ${N.topic} video, that it isn’t muted and that the headphones are plugged in`),
                    t('Grito para que me ayuden todos', 'Ich rufe laut, damit mir alle helfen', 'I shout so everyone helps me')
                ],
                hint: t('Antes de pedir ayuda, revisa lo más sencillo: volumen, silencio y cables.',
                    'Bevor du Hilfe holst, prüfe das Einfachste: Lautstärke, Stummschaltung und Kabel.',
                    'Before asking for help, check the simplest things: volume, mute and cables.')
            }),
            (E, D, N) => ({
                label: t(`Tu micrófono no se oye en la clase en línea de ${E.name}. ¿Qué revisas primero?`,
                    `Dein Mikrofon ist im Online-Unterricht von ${D.name} nicht zu hören. Was prüfst du zuerst?`,
                    `Your microphone can’t be heard in the online ${N.name} class. What do you check first?`),
                options: [
                    t('Salirme de la clase', 'Den Unterricht verlassen', 'Leave the class'),
                    t(`Que el micrófono no esté en silencio en la reunión de ${E.name} en Teams y que el permiso del navegador esté activo`, `Ob das Mikrofon im ${D.name}-Meeting in Teams stummgeschaltet ist und ob die Browser-Berechtigung aktiv ist`, `That the microphone isn’t muted in the ${N.name} meeting in Teams and that the browser permission is on`),
                    t('Comprar un micrófono nuevo', 'Ein neues Mikrofon kaufen', 'Buy a new microphone')
                ],
                hint: t('Muchos fallos son de configuración: silencio, permisos o el dispositivo elegido. Revisarlos resuelve la mayoría.',
                    'Viele Fehler liegen an Einstellungen: Stummschaltung, Berechtigungen oder das gewählte Gerät. Sie zu prüfen löst die meisten.',
                    'Many faults are settings: mute, permissions or the selected device. Checking them fixes most problems.')
            })),
        3: Q(0,
            (E, D, N) => ({
                label: t(`Para ${E.work} de ${E.name}, ¿cuál es un algoritmo (pasos en orden)?`,
                    `Was ist für ${D.work} in ${D.name} ein Algorithmus (Schritte in der richtigen Reihenfolge)?`,
                    `For your ${N.workBare} in ${N.name}, which one is an algorithm (steps in order)?`),
                options: [
                    t(`1. Abrir ${E.program}. 2. Escribir sobre ${E.topic}. 3. Guardar`, `1. ${D.program} öffnen. 2. Zum Thema „${D.topic}“ schreiben. 3. Speichern`, `1. Open ${N.program}. 2. Write about ${N.topic}. 3. Save`),
                    t('Guardar, luego abrir, luego escribir', 'Speichern, dann öffnen, dann schreiben', 'Save, then open, then write'),
                    t('Hacer todo al mismo tiempo', 'Alles gleichzeitig machen', 'Do everything at the same time')
                ],
                hint: t('Un algoritmo es una lista de pasos en el orden correcto. Si cambias el orden, no funciona.',
                    'Ein Algorithmus ist eine Liste von Schritten in der richtigen Reihenfolge. Ändert man die Reihenfolge, funktioniert er nicht.',
                    'An algorithm is a list of steps in the right order. If you change the order, it doesn’t work.')
            }),
            (E, D, N) => ({
                label: t(`Repites la misma acción muchas veces en ${E.work} de ${E.name}. ¿Qué idea de los algoritmos te ayuda?`,
                    `Du wiederholst bei ${D.workDat} in ${D.name} dieselbe Aktion oft. Welche Idee aus den Algorithmen hilft dir?`,
                    `You repeat the same action many times in your ${N.workBare} for ${N.name}. Which algorithm idea helps you?`),
                options: [
                    t(`Un bucle: «repite 5 veces» en lugar de escribir el paso 5 veces (como en ${E.topic})`, `Eine Schleife: „wiederhole 5-mal“, statt den Schritt 5-mal zu schreiben (wie bei „${D.topic}“)`, `A loop: “repeat 5 times” instead of writing the step 5 times (as with ${N.topic})`),
                    t('Escribir los pasos sin orden', 'Die Schritte ohne Reihenfolge aufschreiben', 'Write the steps in no order'),
                    t('Borrar los pasos repetidos y esperar que funcione', 'Die wiederholten Schritte löschen und hoffen, dass es klappt', 'Delete the repeated steps and hope it works')
                ],
                hint: t('Un bucle repite pasos sin escribirlos de nuevo. Reconocer patrones y usar bucles hace los algoritmos más cortos y claros.',
                    'Eine Schleife wiederholt Schritte, ohne sie neu zu schreiben. Muster zu erkennen und Schleifen zu nutzen macht Algorithmen kürzer und klarer.',
                    'A loop repeats steps without writing them again. Spotting patterns and using loops makes algorithms shorter and clearer.')
            })),
        4: Q(1,
            (E, D, N) => ({
                label: t(`No entiendes un ejercicio de ${E.name}. ¿Cómo te ayuda la inteligencia artificial (IA)?`,
                    `Du verstehst eine Aufgabe in ${D.name} nicht. Wie hilft dir künstliche Intelligenz (KI)?`,
                    `You don’t understand an exercise in ${N.name}. How can artificial intelligence (AI) help you?`),
                options: [
                    t('Le pido que me dé la respuesta para copiarla', 'Ich lasse mir die Lösung zum Abschreiben geben', 'I ask it for the answer so I can copy it'),
                    t(`Le pido que me explique ${E.topic} paso a paso, y luego lo intento yo`, `Ich lasse mir „${D.topic}“ Schritt für Schritt erklären und versuche es dann selbst`, `I ask it to explain ${N.topic} step by step, then I try it myself`),
                    t('Le digo que haga todos mis deberes', 'Ich sage ihr, sie soll alle Hausaufgaben machen', 'I tell it to do all my homework')
                ],
                hint: t('La inteligencia artificial puede ser como un tutor: te explica, pero tú aprendes haciéndolo. Copiar no te enseña.',
                    'Künstliche Intelligenz kann wie ein Nachhilfelehrer sein: Sie erklärt, aber du lernst, indem du es selbst machst. Abschreiben bringt nichts bei.',
                    'Artificial intelligence can be like a tutor: it explains, but you learn by doing it yourself. Copying teaches you nothing.')
            }),
            (E, D, N) => ({
                label: t(`Te cuesta ${E.topic} en ${E.name}. ¿Qué instrucción (prompt) para la inteligencia artificial (IA) es la mejor?`,
                    `„${D.topic}“ fällt dir in ${D.name} schwer. Welche Anweisung (Prompt) an die künstliche Intelligenz (KI) ist am besten?`,
                    `You find ${N.topic} hard in ${N.name}. Which instruction (prompt) for artificial intelligence (AI) is best?`),
                options: [
                    t('«Hazme la tarea»', '„Mach meine Hausaufgabe“', '“Do my homework”'),
                    t(`«Explícame ${E.topic} con un ejemplo sencillo y hazme una pregunta para practicar»`, `„Erkläre mir ‚${D.topic}‘ mit einem einfachen Beispiel und stell mir eine Übungsfrage“`, `“Explain ${N.topic} with a simple example and ask me a practice question”`),
                    t('«Escribe algo largo para entregar»', '„Schreib etwas Langes zum Abgeben“', '“Write something long to hand in”')
                ],
                hint: t('Un buen prompt dice qué necesitas y cómo. Pedir explicaciones y práctica te ayuda a aprender; pedir la tarea hecha, no.',
                    'Ein guter Prompt sagt, was du brauchst und wie. Erklärungen und Übungen zu verlangen hilft beim Lernen; eine fertige Aufgabe nicht.',
                    'A good prompt says what you need and how. Asking for explanations and practice helps you learn; asking for finished homework does not.')
            })),
        5: Q(1,
            (E, D, N) => ({
                label: t(`Quieres hacer ${E.work} de ${E.name}. ¿Qué programa eliges?`,
                    `Du willst ${D.work} für ${D.name} machen. Welches Programm wählst du?`,
                    `You want to make ${N.work} for ${N.name}. Which program do you choose?`),
                options: [
                    t('La calculadora', 'Den Taschenrechner', 'The calculator'),
                    t(`${E.program}, porque sirve para ${E.work}`, `${D.program}, weil es für ${D.work} passt`, `${N.program}, because it suits the ${N.workBare}`),
                    t('Un juego que no tiene nada que ver', 'Ein Spiel, das nichts damit zu tun hat', 'A game that has nothing to do with it')
                ],
                hint: t('Cada programa sirve para algo. Elegir el adecuado hace el trabajo más fácil.',
                    'Jedes Programm ist für etwas gut. Das passende zu wählen macht die Arbeit leichter.',
                    'Each program is good for something. Choosing the right one makes the work easier.')
            }),
            (E, D, N) => ({
                label: t(`Para ${E.work} de ${E.name} sobre ${E.topic}, ¿qué combinación de herramientas es la más adecuada?`,
                    `Welche Kombination von Werkzeugen passt am besten für ${D.work} in ${D.name} zum Thema „${D.topic}“?`,
                    `For your ${N.workBare} in ${N.name} about ${N.topic}, which combination of tools fits best?`),
                options: [
                    t('Solo el chat de mensajes', 'Nur den Nachrichten-Chat', 'Only the messaging chat'),
                    t(`${E.program} para crear ${E.work}, OneDrive para guardar y Teams para compartir`, `${D.program} zum Erstellen von ${D.workDat}, OneDrive zum Speichern und Teams zum Teilen`, `${N.program} to create ${N.work}, OneDrive to save and Teams to share`),
                    t('Cualquier app que descargue de una página desconocida', 'Irgendeine App von einer unbekannten Seite', 'Any app downloaded from an unknown website')
                ],
                hint: t('Elegir herramientas según la necesidad (crear, guardar, compartir) hace el trabajo más ordenado y seguro.',
                    'Werkzeuge nach Bedarf zu wählen (erstellen, speichern, teilen) macht die Arbeit geordneter und sicherer.',
                    'Choosing tools by need (create, save, share) makes the work tidier and safer.')
            })),
        6: Q(1,
            (E, D, N) => ({
                label: t(`¿Cómo te ayuda ${E.app} a aprender ${E.topic} en ${E.name}?`,
                    `Wie hilft dir ${D.app} beim Lernen zum Thema „${D.topic}“ in ${D.name}?`,
                    `How does ${N.app} help you learn about ${N.topic} in ${N.name}?`),
                options: [
                    t('Solo sirve para jugar en el recreo', 'Es ist nur zum Spielen in der Pause', 'It is only for playing at break time'),
                    t(`Practico ${E.topic} y veo qué me falta mejorar`, `Ich übe „${D.topic}“ und sehe, was ich noch verbessern muss`, `I practise ${N.topic} and see what I still need to improve`),
                    t('Me dice las respuestas del examen', 'Sie sagt mir die Prüfungsantworten', 'It tells me the test answers')
                ],
                hint: t('Las apps educativas sirven para practicar y ver tu avance. Úsalas para aprender, no para copiar.',
                    'Lern-Apps helfen beim Üben und zeigen deinen Fortschritt. Nutze sie zum Lernen, nicht zum Abschreiben.',
                    'Learning apps help you practise and see your progress. Use them to learn, not to copy.')
            }),
            (E, D, N) => ({
                label: t(`¿Qué uso de ${E.app} te ayuda de verdad a aprender ${E.topic} en ${E.name}?`,
                    `Welche Nutzung von ${D.app} hilft dir wirklich beim Lernen zum Thema „${D.topic}“ in ${D.name}?`,
                    `Which use of ${N.app} really helps you learn about ${N.topic} in ${N.name}?`),
                options: [
                    t('Abrirla mientras veo videos de otra cosa', 'Sie öffnen, während ich Videos über etwas anderes ansehe', 'Open it while watching videos about something else'),
                    t(`Practicar un poco cada día, revisar mis errores y anotar lo que aprendí de ${E.topic}`, `Jeden Tag ein bisschen üben, meine Fehler ansehen und notieren, was ich zum Thema „${D.topic}“ gelernt habe`, `Practise a little every day, review my mistakes and note what I learned about ${N.topic}`),
                    t('Pedirle a otro que la use por mí', 'Jemand anderen bitten, sie für mich zu benutzen', 'Ask someone else to use it for me')
                ],
                hint: t('Aprender con herramientas digitales funciona con práctica corta y frecuente, revisando los errores.',
                    'Mit digitalen Werkzeugen lernt man am besten durch kurzes, regelmäßiges Üben und das Prüfen der Fehler.',
                    'Learning with digital tools works best with short, frequent practice and reviewing mistakes.')
            }))
    },

    // ── Reto 6 · Analizar y reflexionar ──
    6: {
        1: Q(1,
            (E, D, N) => ({
                label: t(`Ves un anuncio: «¡Este juguete te hace experto en ${E.topic}!». ¿Qué piensas?`,
                    `Du siehst eine Werbung: „Dieses Spielzeug macht dich zum Experten für „${D.topic}“!“ Was denkst du?`,
                    `You see an ad: “This toy makes you an expert in ${N.topic}!” What do you think?`),
                options: [
                    t('Que es verdad porque lo dice la televisión', 'Dass es stimmt, weil es im Fernsehen kommt', 'That it is true because it is on TV'),
                    t(`Que es un anuncio que quiere venderme algo; para ${E.name} hay que practicar`, `Dass die Werbung mir etwas verkaufen will; für ${D.name} muss man üben`, `That it is an ad that wants to sell me something; for ${N.name} you have to practise`),
                    t('Que lo tengo que comprar ya', 'Dass ich es sofort kaufen muss', 'That I must buy it now')
                ],
                hint: t('Los anuncios quieren que compres. Exageran para convencerte: piensa antes de creerles.',
                    'Werbung will, dass du kaufst. Sie übertreibt, um dich zu überzeugen: Denk nach, bevor du ihr glaubst.',
                    'Ads want you to buy. They exaggerate to convince you: think before you believe them.')
            }),
            (E, D, N) => ({
                label: t(`Un video sobre ${E.topic} dice «nadie te cuenta esto» y vende un curso. ¿Cómo lo analizas?`,
                    `Ein Video zum Thema „${D.topic}“ sagt „das verrät dir niemand“ und verkauft einen Kurs. Wie analysierst du es?`,
                    `A video about ${N.topic} says “nobody tells you this” and sells a course. How do you analyse it?`),
                options: [
                    t('Lo creo porque el presentador parece seguro', 'Ich glaube es, weil der Moderator sicher wirkt', 'I believe it because the presenter seems confident'),
                    t(`Me pregunto quién lo hizo, qué quiere (vender) y comparo con lo que vimos en ${E.name}`, `Ich frage mich, wer es gemacht hat, was er will (verkaufen), und vergleiche mit dem, was wir in ${D.name} gelernt haben`, `I ask who made it, what they want (to sell) and compare with what we saw in ${N.name}`),
                    t('Lo comparto para que otros decidan', 'Ich teile es, damit andere entscheiden', 'I share it so others can decide')
                ],
                hint: t('Analizar un medio es preguntar: ¿quién lo hizo?, ¿para qué?, ¿qué deja por fuera? Las frases de misterio suelen buscar clics o ventas.',
                    'Ein Medium analysieren heißt fragen: Wer hat es gemacht? Wozu? Was fehlt? Geheimnisvolle Sätze wollen oft Klicks oder Verkäufe.',
                    'Analysing media means asking: who made it? why? what is left out? Mystery phrases usually want clicks or sales.')
            })),
        2: Q(0,
            (E, D, N) => ({
                label: t(`¿Por qué la app te muestra más videos de ${E.topic} después de ver uno?`,
                    `Warum zeigt dir die App mehr Videos zum Thema „${D.topic}“, nachdem du eines gesehen hast?`,
                    `Why does the app show you more videos about ${N.topic} after you watch one?`),
                options: [
                    t('Porque recuerda lo que viste y quiere que sigas mirando', 'Weil sie sich merkt, was du gesehen hast, und will, dass du weiterschaust', 'Because it remembers what you watched and wants you to keep watching'),
                    t(`Porque tu profesor de ${E.name} lo pidió`, `Weil deine Lehrkraft in ${D.name} es so wollte`, `Because your ${N.name} teacher asked for it`),
                    t('Por pura casualidad', 'Durch reinen Zufall', 'By pure chance')
                ],
                hint: t('Las apps recuerdan lo que ves y te muestran más de lo mismo para que pases más tiempo en ellas.',
                    'Apps merken sich, was du ansiehst, und zeigen dir mehr davon, damit du länger bleibst.',
                    'Apps remember what you watch and show you more of the same so you stay longer.')
            }),
            (E, D, N) => ({
                label: t(`Solo te aparecen videos que opinan lo mismo sobre ${E.topic}. ¿Qué es esto?`,
                    `Dir werden nur Videos angezeigt, die dasselbe über „${D.topic}“ meinen. Was ist das?`,
                    `You only get videos that say the same thing about ${N.topic}. What is this?`),
                options: [
                    t(`Una burbuja de filtro: el algoritmo me muestra lo que ya me gusta; busco otras fuentes de ${E.name}`, `Eine Filterblase: Der Algorithmus zeigt mir, was mir schon gefällt; ich suche andere Quellen für ${D.name}`, `A filter bubble: the algorithm shows me what I already like; I look for other ${N.name} sources`),
                    t('La prueba de que todo el mundo piensa igual', 'Der Beweis, dass alle gleich denken', 'Proof that everyone thinks the same'),
                    t('Un error de internet que hay que ignorar', 'Ein Internetfehler, den man ignorieren sollte', 'An internet error to ignore')
                ],
                hint: t('Una burbuja de filtro aparece cuando el algoritmo solo te muestra lo que ya te gusta. Buscar otras fuentes te da una visión más completa.',
                    'Eine Filterblase entsteht, wenn der Algorithmus dir nur zeigt, was dir schon gefällt. Andere Quellen geben dir ein vollständigeres Bild.',
                    'A filter bubble happens when the algorithm only shows you what you already like. Looking at other sources gives you a fuller picture.')
            })),
        3: Q(1,
            (E, D, N) => ({
                label: t(`Una imagen de ${E.topic} se ve rarísima: ¿la hizo una inteligencia artificial (IA)? ¿Qué haces?`,
                    `Ein Bild zum Thema „${D.topic}“ sieht sehr seltsam aus: Hat es eine künstliche Intelligenz (KI) gemacht? Was tust du?`,
                    `A picture of ${N.topic} looks really strange: did an artificial intelligence (AI) make it? What do you do?`),
                options: [
                    t('La creo porque es una foto', 'Ich glaube es, weil es ein Foto ist', 'I believe it because it is a photo'),
                    t(`Miro con cuidado los detalles y le pregunto a mi profesor de ${E.name}`, `Ich schaue mir die Details genau an und frage meine Lehrkraft in ${D.name}`, `I look carefully at the details and ask my ${N.name} teacher`),
                    t('La comparto sin mirar', 'Ich teile es, ohne hinzuschauen', 'I share it without looking')
                ],
                hint: t('La inteligencia artificial puede hacer imágenes que parecen reales. Mira los detalles (manos, letras, sombras) y pregunta.',
                    'Künstliche Intelligenz kann Bilder machen, die echt aussehen. Achte auf Details (Hände, Schrift, Schatten) und frag nach.',
                    'Artificial intelligence can make pictures that look real. Look at the details (hands, writing, shadows) and ask.')
            }),
            (E, D, N) => ({
                label: t(`Una inteligencia artificial (IA) recomienda siempre el mismo tipo de contenido sobre ${E.topic}. ¿Qué reflexión es correcta?`,
                    `Eine künstliche Intelligenz (KI) empfiehlt immer dieselbe Art von Inhalten zum Thema „${D.topic}“. Welche Überlegung ist richtig?`,
                    `An artificial intelligence (AI) always recommends the same kind of content about ${N.topic}. Which reflection is right?`),
                options: [
                    t('La IA es neutral: muestra la única verdad', 'KI ist neutral: Sie zeigt die einzige Wahrheit', 'AI is neutral: it shows the only truth'),
                    t(`La IA aprende de datos que pueden tener sesgos; comparo con otras fuentes de ${E.name}`, `KI lernt aus Daten, die verzerrt sein können; ich vergleiche mit anderen Quellen aus ${D.name}`, `AI learns from data that can be biased; I compare with other ${N.name} sources`),
                    t('Si la IA lo recomienda, no hace falta pensar', 'Wenn die KI es empfiehlt, muss man nicht nachdenken', 'If the AI recommends it, there is no need to think')
                ],
                hint: t('La IA aprende de datos hechos por personas, y esos datos pueden tener sesgos. Pensar de forma crítica es compararla con otras fuentes.',
                    'KI lernt aus Daten, die Menschen erstellt haben, und diese können verzerrt sein. Kritisch denken heißt, sie mit anderen Quellen zu vergleichen.',
                    'AI learns from data made by people, and that data can be biased. Thinking critically means comparing it with other sources.')
            })),
        4: Q(0,
            (E, D, N) => ({
                label: t(`¿Qué cambia cuando haces ${E.work} de ${E.name} en la tableta en vez de en papel?`,
                    `Was ändert sich, wenn du ${D.work} für ${D.name} am Tablet statt auf Papier machst?`,
                    `What changes when you make your ${N.workBare} for ${N.name} on a tablet instead of on paper?`),
                options: [
                    t('Lo puedo corregir, guardar y compartir fácil, pero necesito batería e internet', 'Ich kann es leicht verbessern, speichern und teilen, brauche aber Akku und Internet', 'I can easily correct, save and share it, but I need battery and internet'),
                    t('Nada, es exactamente igual', 'Nichts, es ist genau gleich', 'Nothing, it is exactly the same'),
                    t(`Que ya no tengo que pensar en ${E.topic}`, `Dass ich nicht mehr über „${D.topic}“ nachdenken muss`, `That I no longer have to think about ${N.topic}`)
                ],
                hint: t('Los medios digitales tienen ventajas (corregir, compartir) y también límites (batería, internet). Pensar en ambos te ayuda a elegir.',
                    'Digitale Medien haben Vorteile (verbessern, teilen) und Grenzen (Akku, Internet). An beides zu denken hilft dir beim Wählen.',
                    'Digital media have advantages (correcting, sharing) and limits (battery, internet). Thinking about both helps you choose.')
            }),
            (E, D, N) => ({
                label: t(`Tu clase de ${E.name} compara ${E.work} hecho en papel y en digital. ¿Qué reflexión es más completa?`,
                    `Deine Klasse in ${D.name} vergleicht ${D.work} auf Papier und digital. Welche Überlegung ist am vollständigsten?`,
                    `Your ${N.name} class compares ${N.work} made on paper and digitally. Which reflection is the most complete?`),
                options: [
                    t('Lo digital facilita corregir y compartir, pero deja huella, gasta energía y puede distraer', 'Digital ist leichter zu verbessern und zu teilen, hinterlässt aber Spuren, verbraucht Energie und kann ablenken', 'Digital makes it easier to correct and share, but it leaves a trace, uses energy and can distract'),
                    t('Lo digital siempre es mejor en todo', 'Digital ist immer in allem besser', 'Digital is always better at everything'),
                    t(`El papel ya no sirve para ${E.topic}`, `Papier taugt nicht mehr für „${D.topic}“`, `Paper is no longer useful for ${N.topic}`)
                ],
                hint: t('Reflexionar sobre los medios es ver sus ventajas y sus efectos (huella digital, energía, atención) para usarlos con criterio.',
                    'Über Medien nachdenken heißt, ihre Vorteile und Wirkungen (digitaler Fußabdruck, Energie, Aufmerksamkeit) zu sehen, um sie bewusst zu nutzen.',
                    'Reflecting on media means seeing their advantages and effects (digital footprint, energy, attention) so you use them wisely.')
            })),
        5: Q(0,
            (E, D, N) => ({
                label: t(`Un titular dice: «¡${E.topic}: lo que viste es mentira!». ¿Qué haces?`,
                    `Eine Schlagzeile sagt: „${D.topic}: Was du gesehen hast, ist gelogen!“ Was tust du?`,
                    `A headline says: “${N.topic}: what you saw is a lie!” What do you do?`),
                options: [
                    t(`Leo la noticia completa sobre ${E.topic} y miro quién la escribió antes de creerla`, `Ich lese die ganze Nachricht zum Thema „${D.topic}“ und schaue, wer sie geschrieben hat, bevor ich sie glaube`, `I read the whole story about ${N.topic} and check who wrote it before believing it`),
                    t('Lo comparto solo por el titular', 'Ich teile es nur wegen der Schlagzeile', 'I share it just because of the headline'),
                    t('Me asusto y no le cuento a nadie', 'Ich bekomme Angst und sage niemandem etwas', 'I get scared and tell no one')
                ],
                hint: t('Los titulares exagerados buscan clics. Lee todo y mira quién lo escribió antes de creer o compartir.',
                    'Übertriebene Schlagzeilen wollen Klicks. Lies alles und schau, wer es geschrieben hat, bevor du es glaubst oder teilst.',
                    'Exaggerated headlines want clicks. Read it all and check who wrote it before you believe or share it.')
            }),
            (E, D, N) => ({
                label: t(`Te llega una noticia sobre ${E.topic} con un titular escandaloso. ¿Cómo la evalúas para ${E.name}?`,
                    `Du bekommst eine Nachricht zum Thema „${D.topic}“ mit einer reißerischen Schlagzeile. Wie bewertest du sie für ${D.name}?`,
                    `You receive a news story about ${N.topic} with a sensational headline. How do you evaluate it for ${N.name}?`),
                options: [
                    t(`Reviso fuente, fecha y autor, y busco si otros medios confiables cuentan lo mismo sobre ${E.topic}`, `Ich prüfe Quelle, Datum und Autor und suche, ob andere verlässliche Medien dasselbe zu „${D.topic}“ berichten`, `I check the source, date and author, and see whether other reliable media report the same about ${N.topic}`),
                    t('La creo si tiene muchas reacciones', 'Ich glaube sie, wenn sie viele Reaktionen hat', 'I believe it if it has lots of reactions'),
                    t('La reenvío para avisar a todos', 'Ich leite sie weiter, um alle zu warnen', 'I forward it to warn everyone')
                ],
                hint: t('Ante una posible noticia falsa: fuente, fecha, autor y contraste con otros medios. Las reacciones no prueban que sea verdad.',
                    'Bei einer möglichen Falschnachricht: Quelle, Datum, Autor und Vergleich mit anderen Medien. Reaktionen beweisen nicht, dass sie stimmt.',
                    'With possible fake news: source, date, author and comparison with other media. Reactions do not prove it is true.')
            })),
        6: Q(1,
            (E, D, N) => ({
                label: t(`¿Cuánto tiempo usas pantallas en un día? Piensa en ${E.name} y en tu tiempo libre. ¿Qué es lo mejor?`,
                    `Wie lange nutzt du am Tag Bildschirme? Denk an ${D.name} und an deine Freizeit. Was ist am besten?`,
                    `How long do you use screens in a day? Think about ${N.name} and your free time. What is best?`),
                options: [
                    t('Usar pantallas todo el día, aunque no haga otra cosa', 'Den ganzen Tag Bildschirme nutzen, auch wenn ich nichts anderes mache', 'Use screens all day, even if I do nothing else'),
                    t(`Usarlas para aprender ${E.topic} y también jugar afuera, leer y estar con mi familia`, `Sie zum Lernen über „${D.topic}“ nutzen und auch draußen spielen, lesen und Zeit mit der Familie verbringen`, `Use them to learn about ${N.topic} and also play outside, read and spend time with my family`),
                    t('Dormir con la tableta encendida', 'Mit eingeschaltetem Tablet schlafen', 'Sleep with the tablet switched on')
                ],
                hint: t('Las pantallas son útiles, pero también necesitas moverte, descansar y estar con otros. El equilibrio es lo mejor.',
                    'Bildschirme sind nützlich, aber du brauchst auch Bewegung, Ruhe und Zeit mit anderen. Das Gleichgewicht ist am besten.',
                    'Screens are useful, but you also need to move, rest and be with others. Balance is best.')
            }),
            (E, D, N) => ({
                label: t(`Las apps están diseñadas para que no dejes de mirar. ¿Qué haces para usarlas bien en ${E.name}?`,
                    `Apps sind so gemacht, dass du nicht aufhörst hinzuschauen. Was tust du, um sie in ${D.name} gut zu nutzen?`,
                    `Apps are designed so you never stop watching. What do you do to use them well in ${N.name}?`),
                options: [
                    t('Activar todas las notificaciones para no perderme nada', 'Alle Benachrichtigungen einschalten, um nichts zu verpassen', 'Turn on every notification so I miss nothing'),
                    t(`Poner un tiempo para ${E.topic}, silenciar notificaciones y pensar qué me aportó lo que vi`, `Eine Zeit für „${D.topic}“ festlegen, Benachrichtigungen stummschalten und überlegen, was mir das Gesehene gebracht hat`, `Set a time for ${N.topic}, mute notifications and think about what I got from what I saw`),
                    t('Seguir el reto viral que todos hacen', 'Bei der viralen Challenge mitmachen, die alle machen', 'Join the viral challenge everyone is doing')
                ],
                hint: t('Notificaciones, reproducción automática y desafíos virales buscan tu atención. Poner límites y reflexionar te devuelve el control.',
                    'Benachrichtigungen, automatische Wiedergabe und virale Challenges wollen deine Aufmerksamkeit. Grenzen setzen und nachdenken gibt dir die Kontrolle zurück.',
                    'Notifications, autoplay and viral challenges compete for your attention. Setting limits and reflecting gives you back control.')
            }))
    }
};

// Grados de Primaria con estas preguntas: K3 a K6. basic en K3-K4, plus en K5-K6.
const isPrimaryGrade = grade => grade >= 3 && grade <= 6;
const levelOf = grade => (grade <= 4 ? 'basic' : 'plus');

// Paquete de una materia con su nombre en cada idioma
function primaryPackFor(subject) {
    const { subjects } = require('./data_levels');
    const sub = subjects.find(s => s.id === subject);
    const name = sub ? sub.name : { es: subject, de: subject, en: subject };
    const base = PRIMARY_PACKS[subject] || genericPrimaryPack();
    return {
        es: { ...base.es, name: name.es },
        de: { ...base.de, name: name.de },
        en: { ...base.en, name: name.en }
    };
}

// Contracciones del español cuando el tema empieza con «el» («de el ciclo» -> «del ciclo», «a el» -> «al»)
function fixSpanish(q) {
    const fix = text => text.replace(/(^|[\s(«])([Dd]e|[Aa]) el (?=\p{L})/gu, (m, pre, word) => `${pre}${word}l `);
    const each = o => ({ ...o, es: fix(o.es) });
    return { label: each(q.label), options: q.options.map(each), hint: each(q.hint) };
}

// { label, options[3], hint, correct } de la pregunta q del reto, para un grado de K3 a K6
function primaryQuestion(retoNum, q, subject, grade) {
    const template = PRIMARY_TEMPLATES[retoNum] && PRIMARY_TEMPLATES[retoNum][q];
    if (!template || !isPrimaryGrade(grade)) return null;
    const pack = primaryPackFor(subject);
    const data = fixSpanish(template[levelOf(grade)](pack.es, pack.de, pack.en));
    return { ...data, correct: template.correct };
}

module.exports = { PRIMARY_PACKS, PRIMARY_TEMPLATES, primaryQuestion, isPrimaryGrade, primaryPackFor };
