// ═══════════════════════════════════════════
// MedienPass - Contenido genérico para las materias nuevas (Administración › Materias › Nueva
// materia). Se arma con el nombre de la materia en DE, EN y ES:
// - pack: el paquete temático de los retos 1 a 6, la versión visual y el agente del profesor
//   (mismos campos que data_subject_packs.js).
// - reto0: los 6 ejemplos KMK y los 2 casos de seguridad de la evaluación del Reto 0
//   (mismo formato que data_reto0_quiz.js).
// - openQuestions: las 4 preguntas abiertas del Reto 0 (mismo formato que data_reto0.js).
// Para dar a una materia nueva contenido propio, se agrega su paquete en esos archivos.
// ═══════════════════════════════════════════

const t = (es, de, en) => ({ es, de, en });
const slug = text => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'materia';

function genericPack(name) {
    const es = name.es, de = name.de, en = name.en;
    const file = s => `${s}-${slug(name.es)}_v2_2026-04-15.docx`;
    return {
        es: {
            name: es,
            topic: `un tema de la clase de ${es}`,
            query: `"${es}" tema de clase -anuncios`,
            source: 'páginas de universidades, bibliotecas o instituciones oficiales',
            folder: `2026 > ${es} > Proyecto`,
            file: file('proyecto'),
            fact: `${es} es una de las materias del plan de estudios del colegio.`,
            opinion: `${es} es la materia más interesante de todas.`,
            term: 'competencia digital',
            reference: `el diccionario de la RAE o un glosario de ${es} que recomiende tu profesor`,
            task: `tu trabajo de investigación de ${es}`,
            collab: 'Teams',
            sharedDoc: `el documento del proyecto de ${es}`,
            debate: `¿Deberían usarse más herramientas digitales en las clases de ${es}?`,
            data: `los resultados de la encuesta de tu proyecto de ${es}`,
            images: 'imágenes para tu presentación',
            media: `un video corto que explique un tema de ${es}`,
            product: `una presentación digital sobre un tema de ${es}`,
            app: 'OneNote',
            tool: 'OneNote',
            loop: 'repetir una pregunta del cuestionario hasta que la respuesta sea correcta',
            choice: 'una hoja de cálculo para los datos y un editor de presentaciones para exponer',
            bug: `la presentación de ${es} no muestra las imágenes al abrirla en otro computador`,
            fake: `«Científicos confirman que estudiar ${es} con música hace aprender el doble»`,
            bias: `una página que recomienda «el mejor curso de ${es}» escrita por la empresa que lo vende`,
            k2topic: `cosas nuevas de ${es}`,
            k2search: `${es} para niños`,
            k2fact: `En ${es} aprendemos cosas nuevas.`,
            k2work: `tu dibujo de la clase de ${es}`
        },
        de: {
            name: de,
            topic: `Inhalte des Fachs ${de}`, // nominativo, va entre comillas tras "zum Thema"
            query: `"${de}" Unterricht Thema -Werbung`,
            source: 'Websites von Universitäten, Bibliotheken oder offiziellen Einrichtungen',
            folder: `2026 > ${de} > Projekt`,
            file: file('projekt'),
            fact: `${de} ist ein Fach im Lehrplan der Schule.`,
            opinion: `${de} ist das spannendste Fach von allen.`,
            term: 'Medienkompetenz',
            reference: `der Duden oder ein Glossar für ${de}, das deine Lehrkraft empfiehlt`,
            task: `deine Rechercheaufgabe in ${de}`,
            collab: 'Teams',
            sharedDoc: `das Projektdokument für ${de}`,
            debate: `Sollten im Unterricht in ${de} mehr digitale Werkzeuge genutzt werden?`,
            data: `die Ergebnisse der Umfrage deines Projekts in ${de}`,
            images: 'Bilder für deine Präsentation',
            media: `ein kurzes Video, das ein Thema aus ${de} erklärt`,
            product: `eine digitale Präsentation über ein Thema aus ${de}`,
            app: 'OneNote',
            tool: 'OneNote',
            loop: 'eine Quizfrage so lange wiederholen, bis die Antwort richtig ist',
            choice: 'eine Tabellenkalkulation für die Daten und ein Präsentationsprogramm zum Vortragen',
            bug: `die Präsentation für ${de} zeigt auf einem anderen Computer die Bilder nicht an`,
            fake: `„Forscher bestätigen: Wer ${de} mit Musik lernt, lernt doppelt so viel“`,
            bias: `eine Seite, die „den besten Kurs für ${de}“ empfiehlt und von der Firma stammt, die ihn verkauft`,
            k2topic: `Neues aus ${de}`,
            k2search: `${de} für Kinder`,
            k2fact: `In ${de} lernen wir neue Dinge.`,
            k2work: `dein Bild aus dem Unterricht in ${de}`
        },
        en: {
            name: en,
            topic: `a topic from your ${en} class`,
            query: `"${en}" class topic -ads`,
            source: 'university, library or official institution websites',
            folder: `2026 > ${en} > Project`,
            file: file('project'),
            fact: `${en} is one of the subjects in the school curriculum.`,
            opinion: `${en} is the most interesting subject of all.`,
            term: 'digital literacy',
            reference: `a dictionary or a ${en} glossary your teacher recommends`,
            task: `your ${en} research assignment`,
            collab: 'Teams',
            sharedDoc: `the ${en} project document`,
            debate: `Should ${en} classes use more digital tools?`,
            data: `the survey results of your ${en} project`,
            images: 'pictures for your presentation',
            media: `a short video explaining a ${en} topic`,
            product: `a digital presentation on a ${en} topic`,
            app: 'OneNote',
            tool: 'OneNote',
            loop: 'repeat a quiz question until the answer is right',
            choice: 'a spreadsheet for the data and a presentation tool to present',
            bug: `the ${en} presentation does not show its pictures on another computer`,
            fake: `“Scientists confirm that studying ${en} with music doubles what you learn”`,
            bias: `a page recommending “the best ${en} course” written by the company that sells it`,
            k2topic: `new things from ${en}`,
            k2search: `${en} for kids`,
            k2fact: `In ${en} we learn new things.`,
            k2work: `your drawing from ${en} class`
        }
    };
}

function genericReto0Pack(name) {
    const { es, de, en } = name;
    return {
        examples: [
            t(`Buscar información sobre un tema de ${es} en fuentes confiables y guardarla en tu carpeta de ${es}`,
                `Informationen zu einem Thema aus ${de} in verlässlichen Quellen suchen und im Ordner für ${de} speichern`,
                `Look up information on a ${en} topic in reliable sources and save it in your ${en} folder`),
            t(`Organizar con tu grupo, en un chat de Teams, las tareas del proyecto de ${es}`,
                `Mit deiner Gruppe im Teams-Chat die Aufgaben für das Projekt in ${de} verteilen`,
                `Organise the ${en} project tasks with your group in a Teams chat`),
            t(`Crear una presentación digital que explique un tema de ${es}`,
                `Eine digitale Präsentation erstellen, die ein Thema aus ${de} erklärt`,
                `Create a digital presentation explaining a ${en} topic`),
            t(`Usar las apps de ${es} con tu cuenta del colegio, sin publicar datos personales`,
                `Die Apps für ${de} mit deinem Schulkonto nutzen, ohne persönliche Daten zu veröffentlichen`,
                `Use the ${en} apps with your school account, without publishing personal details`),
            t(`Revisar paso a paso por qué un archivo de ${es} no abre en otro computador y corregirlo`,
                `Schritt für Schritt prüfen, warum eine Datei für ${de} auf einem anderen Computer nicht öffnet, und es beheben`,
                `Work out step by step why a ${en} file will not open on another computer, and fix it`),
            t(`Analizar si un video sobre ${es} en redes sociales informa o solo busca vender`,
                `Analysieren, ob ein Video über ${de} in sozialen Netzwerken informiert oder nur verkaufen will`,
                `Analyse whether a ${en} video on social media informs you or just wants to sell`)
        ],
        safety: [
            {
                title: t('Pide permiso antes de publicar', 'Vor dem Veröffentlichen um Erlaubnis fragen', 'Ask before you publish'),
                text: t(`Antes de grabar o publicar a tus compañeros en un trabajo de ${es}, pide su permiso y el de tu profesor.`,
                    `Bevor du deine Mitschüler für eine Arbeit in ${de} filmst oder veröffentlichst, frag sie und deine Lehrkraft um Erlaubnis.`,
                    `Before you film or publish your classmates in a ${en} assignment, ask them and your teacher for permission.`),
                question: t(`Quieres publicar en internet el video de tu grupo de ${es}. ¿Qué haces primero?`,
                    `Du möchtest das Video deiner Gruppe in ${de} ins Internet stellen. Was machst du zuerst?`,
                    `You want to post your ${en} group's video online. What do you do first?`),
                right: t('Pedir permiso a los compañeros que aparecen y a tu profesor', 'Die Mitschüler, die zu sehen sind, und deine Lehrkraft um Erlaubnis fragen', 'Ask the classmates who appear in it and your teacher for permission'),
                wrong: [
                    t('Publicarlo ya, porque todos sabían que se estaba grabando', 'Es sofort veröffentlichen, weil alle wussten, dass gefilmt wurde', 'Post it straight away, since everyone knew it was being filmed'),
                    t('Publicarlo con el nombre completo y el colegio de cada uno', 'Es mit vollem Namen und Schule aller veröffentlichen', "Post it with everyone's full name and school")
                ]
            },
            {
                title: t('Cita tus fuentes', 'Quellen angeben', 'Cite your sources'),
                text: t(`Si usas textos, imágenes o ideas de otras personas en ${es}, indica el autor y la fuente. Entregar lo que hizo otro como propio es plagio.`,
                    `Wenn du in ${de} Texte, Bilder oder Ideen anderer nutzt, nenne Autor und Quelle. Fremde Arbeit als eigene abzugeben, ist ein Plagiat.`,
                    `If you use other people's texts, pictures or ideas in ${en}, name the author and source. Handing in someone else's work as your own is plagiarism.`),
                question: t(`Para un trabajo de ${es} encuentras en internet un texto perfecto. ¿Qué es lo correcto?`,
                    `Für eine Arbeit in ${de} findest du im Internet einen perfekten Text. Was ist richtig?`,
                    `For a ${en} assignment you find a perfect text online. What is right?`),
                right: t('Usar solo las ideas que necesitas, con tus palabras, y citar la fuente', 'Nur die nötigen Ideen mit eigenen Worten nutzen und die Quelle angeben', 'Use only the ideas you need, in your own words, and cite the source'),
                wrong: [
                    t('Copiarlo completo y entregarlo como tuyo', 'Ihn ganz kopieren und als deinen abgeben', 'Copy it all and hand it in as yours'),
                    t('Cambiar algunas palabras para que no se note', 'Ein paar Wörter ändern, damit es nicht auffällt', 'Change a few words so nobody notices')
                ]
            }
        ]
    };
}

function genericOpenQuestions(id, name) {
    const { es, de, en } = name;
    const open = (n, label) => ({ id: `reto0_${id}_q${n}`, label, type: 'textarea', rows: 2 });
    return [
        open(1, { de: `Was gefällt dir an ${de} am meisten und welche digitalen Werkzeuge nutzt du in diesem Fach?`,
            en: `What do you like most about ${en} and which digital tools do you use in this subject?`,
            es: `¿Qué es lo que más te gusta de ${es} y qué herramientas digitales usas en esta materia?` }),
        open(2, { de: `Hast du schon einmal Informationen oder Videos gesucht, um etwas in ${de} zu lernen? Woran hast du erkannt, dass sie verlässlich waren?`,
            en: `Have you ever looked for information or videos to learn something in ${en}? How did you know they were reliable?`,
            es: `¿Has buscado alguna vez información o videos para aprender algo de ${es}? ¿Cómo supiste que eran confiables?` }),
        open(3, { de: `Wie könnte dir Technik helfen, ${de} sicher und verantwortungsvoll zu lernen?`,
            en: `How could technology help you learn ${en} safely and responsibly?`,
            es: `¿Cómo podría ayudarte la tecnología a aprender ${es} de forma segura y responsable?` }),
        open(4, { de: `Welches digitale Projekt möchtest du dieses Jahr in ${de} erstellen und mit welchen Werkzeugen?`,
            en: `What digital project would you like to create in ${en} this year, and with which tools?`,
            es: `¿Qué proyecto digital te gustaría crear este año en ${es} y con qué herramientas?` })
    ];
}

module.exports = { genericPack, genericReto0Pack, genericOpenQuestions };
