// ═══════════════════════════════════════════
// MedienPass App - Preguntas de los retos 1-6 por materia y grado
// Cada reto evalúa una competencia KMK con 6 preguntas (K3-K12, con pista y argumento). La situación
// y las tres opciones salen del paquete temático de cada materia (data_subject_packs.js): dos materias
// nunca repiten un enunciado ni un grupo de opciones (lo comprueba npm test).
// Prekínder, Kinder, K1 y K2 tienen su versión visual en data_visual.js.
// Ids (r{reto}_{materia}_k{grado}_q{n}) y la posición de la respuesta correcta son las de la versión
// anterior, para que las respuestas ya guardadas se califiquen igual.
// ═══════════════════════════════════════════

const { getSubjectPack } = require('./data_subject_packs');
const { buildVisualQuestions } = require('./data_visual');
const { TECHNOLOGY_QUESTIONS } = require('./data_tecnologia_retos');
const { SPORTS_QUESTIONS } = require('./data_deportes_retos');
// K3 a K6: preguntas más sencillas, de todas las materias (data_questions_primary.js)
const { primaryQuestion } = require('./data_questions_primary');

// Materias con preguntas propias en los retos 1-6 (K3-K12); las demás usan la plantilla común
// con su paquete temático. Cada pregunta propia conserva la subcompetencia KMK y la posición de
// la respuesta correcta de la plantilla (npm test lo comprueba).
const OWN_QUESTIONS = { tecnologia: TECHNOLOGY_QUESTIONS, deportes: SPORTS_QUESTIONS };

// Pregunta propia de la materia, o null si usa la plantilla común
function subjectQuestion(subject, retoNum, q) {
    const set = OWN_QUESTIONS[subject];
    return (set && set[retoNum] && set[retoNum][q]) || null;
}

const t = (es, de, en) => ({ es, de, en });

// TEMPLATES[reto][pregunta] = { kmk, k3: (es, de, en) => {...} }
// kmk es la subcompetencia KMK del área del reto que evalúa la pregunta (data_kmk_competences.js).
// Cada función recibe el paquete de la materia en cada idioma y devuelve
// { label, options: [3], correct: índice, hint }.
const TEMPLATES = {
    // ── Reto 1 · Buscar, procesar y archivar ──
    1: {
        1: {
            kmk: '1.1',
            k3: (E, D, N) => ({
                label: t(`Preparas un trabajo sobre ${E.topic} para ${E.name}. ¿Qué búsqueda te da resultados más precisos y confiables?`,
                    `Du recherchierst im Fach ${D.name} zum Thema „${D.topic}“. Welche Suche liefert die genauesten und verlässlichsten Ergebnisse?`,
                    `You are researching ${N.topic} for ${N.name}. Which search gives you the most precise and reliable results?`),
                options: [
                    t(`Buscar con palabras clave exactas y operadores: ${E.query}`, `Mit genauen Suchbegriffen und Operatoren suchen: ${D.query}`, `Search with exact keywords and operators: ${N.query}`),
                    t(`Escribir una pregunta larga y vaga, como «cosas de ${E.name} para la tarea»`, `Eine lange, ungenaue Frage eingeben, z. B. „Sachen für die Hausaufgabe in ${D.name}“`, `Type a long, vague question such as “${N.name} stuff for homework”`),
                    t('Abrir el primer anuncio patrocinado que aparezca arriba', 'Die erste gesponserte Anzeige ganz oben öffnen', 'Open the first sponsored ad at the top')
                ],
                correct: 0,
                hint: t(`Las comillas buscan la frase exacta, los operadores (AND, OR, -) filtran y «site:» limita a sitios educativos. Así encuentras más rápido información fiable sobre ${E.topic}.`,
                    `Anführungszeichen suchen die genaue Wortfolge, Operatoren (AND, OR, -) filtern und „site:“ beschränkt die Suche auf Bildungsseiten. So findest du schneller verlässliche Informationen zum Thema „${D.topic}“.`,
                    `Quotation marks search for the exact phrase, operators (AND, OR, -) filter, and “site:” limits results to educational sites. That way you quickly find reliable information about ${N.topic}.`)
            })
        },
        2: {
            kmk: '1.2',
            k3: (E, D, N) => ({
                label: t(`Encuentras varias páginas sobre ${E.topic}. ¿Cómo decides cuál es confiable para tu trabajo de ${E.name}?`,
                    `Du findest mehrere Seiten zum Thema „${D.topic}“. Wie entscheidest du, welche für ${D.name} verlässlich ist?`,
                    `You find several pages about ${N.topic}. How do you decide which one is reliable for your ${N.name} work?`),
                options: [
                    t('Elijo la que tiene el diseño más llamativo y carga más rápido', 'Ich nehme die Seite mit dem auffälligsten Design, die am schnellsten lädt', 'I pick the one with the flashiest design that loads fastest'),
                    t(`Reviso que tenga autor, fecha y referencias, y prefiero fuentes reconocidas (p. ej. ${E.source})`, `Ich prüfe Autor, Datum und Quellenangaben und bevorzuge anerkannte Quellen (z. B. ${D.source})`, `I check for an author, a date and references, and prefer recognised sources (e.g. ${N.source})`),
                    t('Confío en un foro donde cualquiera puede escribir sin firmar', 'Ich vertraue einem Forum, in dem jeder anonym schreiben kann', 'I trust a forum where anyone can post anonymously')
                ],
                correct: 1,
                hint: t('Una fuente confiable dice quién escribió el texto, cuándo y de dónde salen los datos. Las instituciones educativas, los museos y las bibliotecas suelen ser más fiables que los foros anónimos.',
                    'Eine verlässliche Quelle nennt, wer den Text wann geschrieben hat und woher die Daten stammen. Bildungseinrichtungen, Museen und Bibliotheken sind meist verlässlicher als anonyme Foren.',
                    'A reliable source tells you who wrote the text, when, and where the data comes from. Schools, museums and libraries are usually more reliable than anonymous forums.')
            })
        },
        3: {
            kmk: '1.3',
            k3: (E, D, N) => ({
                label: t(`Ya tienes varios archivos de tu trabajo de ${E.name}. ¿Cuál es la mejor forma de organizarlos en la nube?`,
                    `Du hast schon mehrere Dateien für deine Arbeit in ${D.name}. Wie organisierst du sie am besten in der Cloud?`,
                    `You already have several files for your ${N.name} work. What is the best way to organise them in the cloud?`),
                options: [
                    t('Dejarlos en «Descargas» con nombres como «Documento1» o «sin título»', 'Sie in „Downloads“ lassen, mit Namen wie „Dokument1“ oder „Unbenannt“', 'Leave them in “Downloads” with names like “Document1” or “Untitled”'),
                    t(`Usar carpetas por año, materia y proyecto (${E.folder}) y nombres claros con versión y fecha: ${E.file}`, `Ordner nach Jahr, Fach und Projekt anlegen (${D.folder}) und klare Namen mit Version und Datum verwenden: ${D.file}`, `Use folders by year, subject and project (${N.folder}) and clear names with version and date: ${N.file}`),
                    t('Guardarlos en el escritorio del computador compartido del colegio', 'Sie auf dem Desktop des gemeinsamen Schulcomputers speichern', 'Save them on the desktop of the shared school computer')
                ],
                correct: 1,
                hint: t('Una estructura de carpetas y nombres descriptivos te permiten encontrar cada versión rápido y no perder trabajo. En la nube del colegio, además, tus archivos quedan protegidos.',
                    'Eine klare Ordnerstruktur und aussagekräftige Dateinamen helfen dir, jede Version schnell zu finden und nichts zu verlieren. In der Schul-Cloud sind deine Dateien außerdem geschützt.',
                    'A folder structure and descriptive names let you find each version quickly and avoid losing work. In the school cloud your files are also protected.')
            })
        },
        4: {
            kmk: '1.2',
            k3: (E, D, N) => ({
                label: t(`Lees dos frases relacionadas con ${E.name}: «${E.fact}» y «${E.opinion}». ¿Cómo distingues el hecho de la opinión?`,
                    `Du liest zwei Sätze zum Fach ${D.name}: „${D.fact}“ und „${D.opinion}“ Wie unterscheidest du Tatsache und Meinung?`,
                    `You read two sentences about ${N.name}: “${N.fact}” and “${N.opinion}” How do you tell the fact from the opinion?`),
                options: [
                    t(`«${E.fact}» es un hecho porque se puede comprobar con fuentes; «${E.opinion}» es una opinión porque expresa un gusto personal`, `„${D.fact}“ ist eine Tatsache, weil man sie mit Quellen überprüfen kann; „${D.opinion}“ ist eine Meinung, weil sie einen persönlichen Geschmack ausdrückt`, `“${N.fact}” is a fact because it can be checked against sources; “${N.opinion}” is an opinion because it expresses a personal taste`),
                    t(`Las dos son hechos porque aparecen en internet, en páginas de ${E.name}`, `Beide sind Tatsachen, weil sie im Internet auf Seiten zu ${D.name} stehen`, `Both are facts because they appear online, on ${N.name} pages`),
                    t(`«${E.opinion}» es un hecho porque mucha gente está de acuerdo`, `„${D.opinion}“ ist eine Tatsache, weil viele Leute zustimmen`, `“${N.opinion}” is a fact because many people agree with it`)
                ],
                correct: 0,
                hint: t('Un hecho se puede verificar con datos, fechas o experimentos. Una opinión expresa lo que alguien siente o prefiere; puede ser respetable, pero no se comprueba.',
                    'Eine Tatsache lässt sich mit Daten, Jahreszahlen oder Experimenten überprüfen. Eine Meinung drückt aus, was jemand fühlt oder bevorzugt; sie kann berechtigt sein, ist aber nicht überprüfbar.',
                    "A fact can be verified with data, dates or experiments. An opinion expresses what someone feels or prefers; it may be valid, but it can't be proven.")
            })
        },
        // IA: un chatbot como fuente de información (se comprueba en una fuente confiable)
        5: {
            kmk: '1.1',
            ai: true,
            k3: (E, D, N) => ({
                label: t(`En ${E.name} aparece el término «${E.term}». Le preguntas a un chatbot de inteligencia artificial (IA) y te da una explicación muy segura. ¿Qué haces con su respuesta?`,
                    `Im Fach ${D.name} taucht der Begriff „${D.term}“ auf. Du fragst einen KI-Chatbot, und er gibt dir eine sehr selbstsichere Erklärung. Was machst du mit seiner Antwort?`,
                    `In ${N.name} you come across the term “${N.term}”. You ask an artificial intelligence (AI) chatbot and it gives you a very confident explanation. What do you do with its answer?`),
                options: [
                    t(`La comparo con un diccionario o glosario confiable (p. ej. ${E.reference}) y con lo visto en clase, porque la IA puede equivocarse`, `Ich vergleiche sie mit einem verlässlichen Wörterbuch oder Glossar (z. B. ${D.reference}) und mit dem Unterricht, weil KI sich irren kann`, `I compare it with a reliable dictionary or glossary (e.g. ${N.reference}) and with what we saw in class, because AI can be wrong`),
                    t(`La copio tal cual en mi cuaderno de ${E.name}: si suena segura, es correcta`, `Ich übernehme sie unverändert in mein Heft für ${D.name}: Wenn sie sicher klingt, stimmt sie`, `I copy it as it is into my ${N.name} notebook: if it sounds sure, it must be right`),
                    t(`Le pido que haga por mí todo el trabajo sobre «${E.term}» y lo entrego sin leerlo`, `Ich lasse sie die ganze Arbeit zu „${D.term}“ für mich machen und gebe sie ungelesen ab`, `I ask it to do all the work on “${N.term}” for me and hand it in without reading it`)
                ],
                correct: 0,
                hint: t('Los chatbots de IA responden con seguridad aunque se equivoquen o inventen datos («alucinaciones»). Úsalos para empezar, pero comprueba siempre en una fuente confiable.',
                    'KI-Chatbots antworten selbstsicher, auch wenn sie sich irren oder Fakten erfinden („Halluzinationen“). Nutze sie als Einstieg, aber prüfe immer mit einer verlässlichen Quelle.',
                    'AI chatbots answer confidently even when they are wrong or make things up (“hallucinations”). Use them as a starting point, but always check a reliable source.')
            })
        },
        6: {
            kmk: '1.2',
            k3: (E, D, N) => ({
                label: t(`Vas a entregar ${E.task}. ¿Cómo validas las referencias digitales que vas a incluir?`,
                    `Du gibst ${D.task} ab. Wie überprüfst du die digitalen Quellen, die du angibst?`,
                    `You are about to hand in ${N.task}. How do you check the digital references you will include?`),
                options: [
                    t(`Copio en ${E.task} el primer enlace que encuentro, sin revisarlo`, `Ich übernehme für ${D.task} den ersten Link, ohne ihn zu prüfen`, `I copy the first link I find into ${N.task} without checking it`),
                    t(`Contrasto los datos de ${E.task} en al menos dos fuentes confiables (p. ej. ${E.source}) y agrego una lista con los enlaces y la fecha de consulta`, `Ich vergleiche die Angaben für ${D.task} mit mindestens zwei verlässlichen Quellen (z. B. ${D.source}) und füge eine Liste mit Links und Abrufdatum hinzu`, `I compare the information for ${N.task} with at least two reliable sources (e.g. ${N.source}) and add a list with the links and access dates`),
                    t(`No pongo fuentes en ${E.task}: mi profesor de ${E.name} ya sabe de dónde salió`, `Ich gebe für ${D.task} keine Quellen an, die Lehrkraft in ${D.name} weiß ja, woher alles stammt`, `I don't include sources in ${N.task}; my ${N.name} teacher already knows where it came from`)
                ],
                correct: 1,
                hint: t('Comparar al menos dos fuentes evita errores, y la lista de referencias permite que otros comprueben tu trabajo.',
                    'Der Vergleich von mindestens zwei Quellen vermeidet Fehler, und das Quellenverzeichnis ermöglicht anderen, deine Arbeit zu überprüfen.',
                    'Comparing at least two sources avoids mistakes, and the reference list lets others check your work.')
            })
        }
    },

    // ── Reto 2 · Comunicar y cooperar ──
    2: {
        1: {
            kmk: '2.1',
            k3: (E, D, N) => ({
                label: t(`Necesitas escribirle a tu profesor o profesora de ${E.name} sobre ${E.task}. ¿Cómo debe ser el mensaje?`,
                    `Du schreibst deiner Lehrkraft in ${D.name} eine Nachricht über ${D.task}. Wie sollte die Nachricht aussehen?`,
                    `You need to write to your ${N.name} teacher about ${N.task}. What should the message be like?`),
                options: [
                    t(`Un mensaje corto sobre ${E.task}, sin saludo, en mayúsculas y lleno de emojis`, `Eine kurze Nachricht über ${D.task}, ohne Anrede, in Großbuchstaben und voller Emojis`, `A short message about ${N.task}, with no greeting, in capitals and full of emojis`),
                    t(`Respetuoso, con un asunto claro que mencione ${E.name}, saludo, tu nombre y curso, la pregunta concreta sobre ${E.task} y una despedida`, `Höflich, mit einem klaren Betreff zu ${D.name}, Anrede, deinem Namen und deiner Klasse, der konkreten Frage über ${D.task} und einem Gruß`, `Polite, with a clear subject line mentioning ${N.name}, a greeting, your name and class, the specific question about ${N.task} and a sign-off`),
                    t(`Un audio de cinco minutos sobre ${E.task}, enviado a medianoche`, `Eine fünfminütige Sprachnachricht über ${D.task}, um Mitternacht geschickt`, `A five-minute voice note about ${N.task}, sent at midnight`)
                ],
                correct: 1,
                hint: t('Un mensaje formal y claro facilita que te respondan rápido y muestra respeto. Escríbelo por los canales oficiales del colegio.',
                    'Eine höfliche, klare Nachricht wird schneller beantwortet und zeigt Respekt. Nutze dafür die offiziellen Kanäle der Schule.',
                    "A clear, formal message gets answered faster and shows respect. Use the school's official channels.")
            })
        },
        2: {
            kmk: '2.2',
            k3: (E, D, N) => ({
                label: t(`Vas a compartir la carpeta de ${E.task} en ${E.collab} con tu equipo. ¿Cómo configuras los permisos?`,
                    `Du teilst den Ordner für ${D.task} in ${D.collab} mit deinem Team. Wie stellst du die Berechtigungen ein?`,
                    `You are sharing the folder for ${N.task} in ${N.collab} with your team. How do you set the permissions?`),
                options: [
                    t(`Enlace público de ${E.collab} para cualquier persona en internet, con permiso de edición`, `Öffentlicher Link zu ${D.collab} für alle im Internet, mit Bearbeitungsrechten`, `A public ${N.collab} link for anyone on the internet, with edit rights`),
                    t(`En ${E.collab}, solo para los correos institucionales de tu equipo de ${E.name}, decidiendo quién edita y quién solo puede ver`, `Nur für die Schul-E-Mail-Adressen deines Teams in ${D.name} freigeben und in ${D.collab} festlegen, wer bearbeiten und wer nur lesen darf`, `In ${N.collab}, only for your ${N.name} team's school email addresses, deciding who can edit and who can only view`),
                    t(`Compartir tu usuario y contraseña de ${E.collab} con todo el grupo`, `Deinen Benutzernamen für ${D.collab} und dein Passwort mit der ganzen Gruppe teilen`, `Share your ${N.collab} username and password with the whole group`)
                ],
                correct: 1,
                hint: t('Compartir con permisos restringidos protege tu trabajo de cambios no deseados y de personas ajenas al colegio.',
                    'Eingeschränkte Freigaben schützen deine Arbeit vor ungewollten Änderungen und vor Personen außerhalb der Schule.',
                    'Sharing with restricted permissions protects your work from unwanted changes and from people outside the school.')
            })
        },
        3: {
            kmk: '2.4',
            k3: (E, D, N) => ({
                label: t(`Mientras trabajan en ${E.sharedDoc}, un compañero escribe todo en MAYÚSCULAS en el canal de ${E.name}. ¿Por qué conviene evitarlo?`,
                    `Während ihr ${D.sharedDoc} bearbeitet, schreibt jemand im Kanal für ${D.name} alles in GROSSBUCHSTABEN. Warum sollte man das vermeiden?`,
                    `While your group works on ${N.sharedDoc}, a classmate writes everything in CAPITALS in the ${N.name} channel. Why should this be avoided?`),
                options: [
                    t(`Porque en el canal de ${E.name} las mayúsculas se leen como gritos y pueden parecer agresivas`, `Weil Großbuchstaben im Kanal für ${D.name} wie Schreien wirken und aggressiv erscheinen können`, `Because capitals read like shouting in the ${N.name} channel and can seem aggressive`),
                    t(`Porque las mayúsculas hacen que ${E.sharedDoc} ocupe más memoria`, `Weil Großbuchstaben ${D.sharedDoc} speicherintensiver machen`, `Because capitals make ${N.sharedDoc} take up more memory`),
                    t(`Porque tu profesor de ${E.name} no puede leer mayúsculas`, `Weil die Lehrkraft in ${D.name} keine Großbuchstaben lesen kann`, `Because your ${N.name} teacher can't read capitals`)
                ],
                correct: 0,
                hint: t('La netiqueta son las normas de cortesía en internet. Escribir en mayúsculas sostenidas equivale a gritar y puede generar malentendidos en el equipo.',
                    'Netiquette sind die Höflichkeitsregeln im Internet. Durchgehende Großbuchstaben gelten als Schreien und führen leicht zu Missverständnissen im Team.',
                    'Netiquette is the set of courtesy rules online. Writing in all caps counts as shouting and can cause misunderstandings in the team.')
            })
        },
        4: {
            kmk: '2.3',
            k3: (E, D, N) => ({
                label: t(`Tu grupo coedita en tiempo real ${E.sharedDoc} en ${E.collab}. ¿Cuál es la mejor forma de coordinarse?`,
                    `Deine Gruppe bearbeitet ${D.sharedDoc} gleichzeitig in ${D.collab}. Wie stimmt ihr euch am besten ab?`,
                    `Your group is co-editing ${N.sharedDoc} in real time in ${N.collab}. What is the best way to coordinate?`),
                options: [
                    t(`Repartir antes las secciones de ${E.sharedDoc}, usar los comentarios de ${E.collab} para sugerir cambios y respetar lo que escribe cada uno`, `Die Abschnitte für ${D.sharedDoc} vorher verteilen, Änderungen über die Kommentare in ${D.collab} vorschlagen und die Beiträge der anderen respektieren`, `Split the sections of ${N.sharedDoc} beforehand, use ${N.collab} comments to suggest changes and respect what everyone writes`),
                    t(`Que cada uno borre de ${E.sharedDoc} lo que no le gusta, sin avisar`, `Jeder bearbeitet ${D.sharedDoc} für sich und löscht ohne Absprache, was ihm nicht gefällt`, `Everyone deletes what they don't like from ${N.sharedDoc} without warning`),
                    t(`Trabajar todos al mismo tiempo en la misma frase de ${E.sharedDoc}`, `Alle bearbeiten ${D.sharedDoc} gleichzeitig am selben Satz`, `Everyone works on the same sentence of ${N.sharedDoc} at the same time`)
                ],
                correct: 0,
                hint: t('En un documento compartido, el orden y los comentarios evitan que se pierda trabajo. Cada aporte se discute con respeto antes de cambiarlo.',
                    'In einem gemeinsamen Dokument verhindern klare Aufgaben und Kommentare, dass Arbeit verloren geht. Änderungen an Beiträgen anderer werden respektvoll besprochen.',
                    "In a shared document, organisation and comments prevent work from being lost. Changes to others' contributions are discussed respectfully first.")
            })
        },
        // IA: un montaje hecho con IA (deepfake) también es ciberacoso
        5: {
            kmk: '2.4',
            ai: true,
            k3: (E, D, N) => ({
                label: t(`En el chat de ${E.name} alguien comparte un montaje hecho con inteligencia artificial (un «deepfake») que se burla de un compañero. ¿Qué es lo correcto?`,
                    `Im Chat für ${D.name} teilt jemand eine mit künstlicher Intelligenz erstellte Fälschung (einen „Deepfake“), die sich über einen Mitschüler lustig macht. Was ist richtig?`,
                    `In the ${N.name} chat someone shares an artificial intelligence fake (a “deepfake”) that makes fun of a classmate. What is the right thing to do?`),
                options: [
                    t(`Reenviarlo a otros grupos de ${E.name}: si lo hizo una IA, no es grave`, `Sie an andere Gruppen in ${D.name} weiterleiten: Wenn eine KI sie gemacht hat, ist es nicht schlimm`, `Forward it to other ${N.name} groups: if an AI made it, it's no big deal`),
                    t(`No reenviarlo, guardar una captura del chat de ${E.name} como evidencia e informar a un profesor o adulto de confianza`, `Sie nicht weiterleiten, einen Screenshot des Chats für ${D.name} als Beweis sichern und eine Lehrkraft oder eine vertraute erwachsene Person informieren`, `Don't forward it, save a screenshot of the ${N.name} chat as evidence and tell a teacher or trusted adult`),
                    t(`Crear con IA otro montaje en el chat de ${E.name} para responderle`, `Mit KI im Chat für ${D.name} eine weitere Fälschung erstellen, um zurückzuschlagen`, `Make another AI fake in the ${N.name} chat to hit back`)
                ],
                correct: 1,
                hint: t('Un montaje hecho con IA que ridiculiza a alguien es ciberacoso, aunque parezca una broma. No se difunde: se guarda la evidencia y se avisa a un adulto.',
                    'Eine KI-Fälschung, die jemanden lächerlich macht, ist Cybermobbing, auch wenn sie wie ein Scherz wirkt. Man verbreitet sie nicht, sondern sichert Beweise und informiert eine erwachsene Person.',
                    "An AI fake that ridicules someone is cyberbullying, even if it looks like a joke. Don't spread it: keep the evidence and tell an adult.")
            })
        },
        6: {
            kmk: '2.5',
            k3: (E, D, N) => ({
                label: t(`En el foro de ${E.name} debaten: «${E.debate}». ¿Cómo participas de forma constructiva?`,
                    `Im Forum für ${D.name} wird diskutiert: „${D.debate}“ Wie beteiligst du dich konstruktiv?`,
                    `In the ${N.name} forum the debate is: “${N.debate}” How do you take part constructively?`),
                options: [
                    t(`Atacar a quienes piensan distinto en el foro de ${E.name} para ganar la discusión`, `Andersdenkende im Forum für ${D.name} angreifen, um die Diskussion zu gewinnen`, `Attack those who disagree in the ${N.name} forum to win the argument`),
                    t(`Dar tu opinión con argumentos y datos verificados (p. ej. ${E.source}), citar la fuente y responder con respeto a otras ideas`, `Deine Meinung mit Argumenten und geprüften Fakten begründen (z. B. ${D.source}), die Quelle nennen und respektvoll auf andere Ideen eingehen`, `Give your opinion with arguments and verified data (e.g. ${N.source}), cite your source and respond respectfully to other ideas`),
                    t(`Publicar el mismo mensaje muchas veces en el foro de ${E.name} para que se vea más`, `Dieselbe Nachricht im Forum für ${D.name} mehrmals posten, damit sie mehr auffällt`, `Post the same message many times in the ${N.name} forum so it gets noticed`)
                ],
                correct: 1,
                hint: t('La ciudadanía digital se demuestra argumentando con datos y respetando a los demás, aunque no estés de acuerdo.',
                    'Digitale Mündigkeit zeigt sich, wenn man mit Fakten argumentiert und andere respektiert, auch bei unterschiedlichen Meinungen.',
                    'Digital citizenship shows when you argue with facts and respect others, even when you disagree.')
            })
        }
    },

    // ── Reto 3 · Producir y presentar ──
    3: {
        1: {
            kmk: '3.1',
            k3: (E, D, N) => ({
                label: t(`Necesitas ordenar y graficar ${E.data}. ¿Qué programa es el más adecuado?`,
                    `Du sollst ${D.data} ordnen und als Diagramm darstellen. Welches Programm eignet sich am besten?`,
                    `You need to sort and chart ${N.data}. Which program is the most suitable?`),
                options: [
                    t(`Una hoja de cálculo (Excel o Google Sheets), que ordena ${E.data}, calcula con fórmulas y crea gráficos`, `Eine Tabellenkalkulation (Excel oder Google Sheets), die ${D.data} sortiert, mit Formeln rechnet und Diagramme erstellt`, `A spreadsheet (Excel or Google Sheets), which sorts ${N.data}, calculates with formulas and makes charts`),
                    t(`Un programa de dibujo como Paint, para pintar a mano ${E.data}`, `Ein Malprogramm wie Paint, um ${D.data} von Hand zu zeichnen`, `A drawing program like Paint, to draw ${N.data} by hand`),
                    t(`Un reproductor de video, para mirar en pantalla ${E.data}`, `Ein Videoplayer, um ${D.data} auf dem Bildschirm anzusehen`, `A video player, to watch ${N.data} on the screen`)
                ],
                correct: 0,
                hint: t('Las hojas de cálculo están hechas para datos: ordenan, calculan promedios y convierten los números en gráficos claros.',
                    'Tabellenkalkulationen sind für Daten gemacht: Sie sortieren, berechnen Mittelwerte und verwandeln Zahlen in klare Diagramme.',
                    'Spreadsheets are made for data: they sort, calculate averages and turn numbers into clear charts.')
            })
        },
        2: {
            kmk: '3.1',
            k3: (E, D, N) => ({
                label: t(`Preparas diapositivas sobre ${E.topic} para tu clase de ${E.name}. ¿Qué pauta de diseño garantiza claridad?`,
                    `Du gestaltest Folien zum Thema „${D.topic}“ für ${D.name}. Welche Gestaltungsregel sorgt für Klarheit?`,
                    `You are making slides about ${N.topic} for your ${N.name} class. Which design rule ensures clarity?`),
                options: [
                    t(`Llenar cada diapositiva sobre ${E.topic} con párrafos largos en letra pequeña`, `Jede Folie zum Thema „${D.topic}“ mit langen Absätzen in kleiner Schrift füllen`, `Fill every slide about ${N.topic} with long paragraphs in small print`),
                    t(`Pocas ideas clave sobre ${E.topic} por diapositiva (regla 6x6), letra legible, buen contraste e imágenes que apoyen el tema`, `Wenige Kernaussagen zum Thema „${D.topic}“ pro Folie (6x6-Regel), gut lesbare Schrift, starker Kontrast und passende Bilder`, `A few key ideas about ${N.topic} per slide (6x6 rule), readable fonts, good contrast and images that support the topic`),
                    t(`Letra amarilla sobre fondo blanco y muchas animaciones en cada diapositiva de ${E.name}`, `Gelbe Schrift auf weißem Hintergrund und viele Animationen auf jeder Folie für ${D.name}`, `Yellow text on a white background and lots of animations on every ${N.name} slide`)
                ],
                correct: 1,
                hint: t('Una diapositiva clara apoya lo que dices, no lo reemplaza: pocas palabras, buen contraste y una imagen que explique.',
                    'Eine klare Folie unterstützt deinen Vortrag, statt ihn zu ersetzen: wenige Wörter, guter Kontrast und ein erklärendes Bild.',
                    'A clear slide supports what you say rather than replacing it: few words, good contrast and an explanatory image.')
            })
        },
        // IA: producir con IA generativa de forma transparente y respetando derechos
        3: {
            kmk: '3.3',
            ai: true,
            k3: (E, D, N) => ({
                label: t(`Para tu trabajo de ${E.name} quieres crear con inteligencia artificial ${E.images}. ¿Qué es lo correcto?`,
                    `Für deine Arbeit in ${D.name} möchtest du ${D.images} mit künstlicher Intelligenz erstellen. Was ist richtig?`,
                    `For your ${N.name} work you want to create ${N.images} with artificial intelligence. What is the right thing to do?`),
                options: [
                    t(`Hacer con IA ${E.images} y presentar el resultado como fotos o dibujos tuyos`, `${D.images} mit KI erstellen und das Ergebnis als eigene Fotos oder Zeichnungen ausgeben`, `Make ${N.images} with AI and pass the result off as your own photos or drawings`),
                    t(`Revisar que el resultado sea correcto, indicar que ${E.images} se crearon con IA y con qué herramienta, y no usar la imagen de personas reales sin permiso`, `Prüfen, ob das Ergebnis stimmt, angeben, dass ${D.images} mit KI und mit welchem Werkzeug erstellt wurden, und keine echten Personen ohne Erlaubnis zeigen`, `Check that the result is correct, state that ${N.images} were made with AI and with which tool, and don't show real people without permission`),
                    t(`Pedirle a la IA que copie a un artista famoso, con su firma, para ${E.images}`, `Die KI bitten, für ${D.images} einen berühmten Künstler samt Signatur zu kopieren`, `Ask the AI to copy a famous artist, signature included, for ${N.images}`)
                ],
                correct: 1,
                hint: t('Lo que crea una IA puede tener errores y parecerse a obras ajenas. Decir que usaste IA (y cuál), revisar el resultado y respetar los derechos de autor y la imagen de las personas es producir con responsabilidad.',
                    'Was eine KI erzeugt, kann Fehler enthalten und fremden Werken ähneln. Angeben, dass (und welche) KI du genutzt hast, das Ergebnis prüfen und Urheberrecht sowie das Recht am eigenen Bild achten – so produzierst du verantwortungsvoll.',
                    "What an AI creates can contain mistakes and look like other people's work. Saying that you used AI (and which one), checking the result and respecting copyright and people's image rights is producing responsibly.")
            })
        },
        4: {
            kmk: '3.2',
            k3: (E, D, N) => ({
                label: t(`Vas a grabar ${E.media} para ${E.name}. ¿Cuál es el proceso correcto?`,
                    `Du willst für ${D.name} ${D.media} aufnehmen. Wie gehst du richtig vor?`,
                    `You are going to record ${N.media} for ${N.name}. What is the right process?`),
                options: [
                    t(`Escribir un guion para ${E.media}, grabar en un lugar silencioso y editar para cortar errores y silencios`, `Ein Skript für ${D.media} schreiben, an einem ruhigen Ort aufnehmen und Fehler sowie Pausen herausschneiden`, `Write a script for ${N.media}, record in a quiet place and edit out mistakes and silences`),
                    t(`Improvisar ${E.media} en el patio durante el recreo, sin revisar el resultado`, `In der Pause auf dem Schulhof ${D.media} improvisieren, ohne das Ergebnis zu prüfen`, `Improvise ${N.media} in the playground at break without checking the result`),
                    t(`Grabar ${E.media} con música de fondo muy alta para que suene profesional`, `Mit sehr lauter Hintergrundmusik ${D.media} aufnehmen, damit es professionell klingt`, `Record ${N.media} with very loud background music so it sounds professional`)
                ],
                correct: 0,
                hint: t('Un buen audio o video se planifica: el guion ordena las ideas, el lugar silencioso mejora el sonido y la edición deja solo lo importante.',
                    'Gute Audio- oder Videoaufnahmen werden geplant: Das Skript ordnet die Gedanken, ein ruhiger Ort verbessert den Ton und der Schnitt lässt nur das Wichtige übrig.',
                    'Good audio or video is planned: the script organises ideas, a quiet place improves the sound and editing keeps only what matters.')
            })
        },
        5: {
            kmk: '3.3',
            k3: (E, D, N) => ({
                label: t(`Al terminar ${E.product} para ${E.name}, ¿por qué es indispensable citar las ideas ajenas y agregar una lista de fuentes?`,
                    `Du stellst ${D.product} für ${D.name} fertig. Warum musst du fremde Ideen zitieren und ein Quellenverzeichnis anlegen?`,
                    `When you finish ${N.product} for ${N.name}, why must you cite other people's ideas and add a list of sources?`),
                options: [
                    t(`Para no cometer plagio en ${E.product} y para que otros puedan comprobar de dónde viene la información`, `Um für ${D.product} kein Plagiat zu begehen und damit andere prüfen können, woher die Informationen stammen`, `To avoid plagiarism in ${N.product} and so others can check where the information comes from`),
                    t(`Solo para alargar ${E.product}`, `Nur um ${D.product} länger aussehen zu lassen`, `Just to make ${N.product} look longer`),
                    t(`No es necesario en ${E.name} si cambias algunas palabras`, `In ${D.name} ist das nicht nötig, wenn du ein paar Wörter änderst`, `It isn't necessary in ${N.name} if you change a few words`)
                ],
                correct: 0,
                hint: t('Citar reconoce el trabajo de otros y da credibilidad al tuyo. Cambiar algunas palabras de un texto ajeno sigue siendo plagio.',
                    'Zitieren würdigt die Arbeit anderer und macht deine glaubwürdig. Ein paar Wörter eines fremden Textes zu ändern, bleibt ein Plagiat.',
                    "Citing acknowledges others' work and makes yours credible. Changing a few words of someone else's text is still plagiarism.")
            })
        },
        6: {
            kmk: '3.2',
            k3: (E, D, N) => ({
                label: t(`Vas a entregar ${E.task} en la plataforma del colegio. ¿Qué formato evita que se desconfigure?`,
                    `Du lädst ${D.task} auf der Schulplattform hoch. Welches Format verhindert, dass sich das Layout verschiebt?`,
                    `You are uploading ${N.task} to the school platform. Which format keeps the layout from breaking?`),
                options: [
                    t(`Subir ${E.task} como archivo editable original, aunque tu profesor de ${E.name} no tenga el mismo programa`, `Für ${D.task} die bearbeitbare Originaldatei hochladen, auch wenn die Lehrkraft in ${D.name} das Programm nicht hat`, `Upload ${N.task} as the original editable file, even if your ${N.name} teacher doesn't have the same program`),
                    t(`Exportar ${E.task} a PDF, que conserva el diseño, las imágenes y las fuentes en cualquier dispositivo`, `Für ${D.task} eine PDF-Datei exportieren, die Layout, Bilder und Schriften auf jedem Gerät erhält`, `Export ${N.task} as a PDF, which keeps the layout, images and fonts on any device`),
                    t(`Enviar una foto borrosa de la pantalla con ${E.task}`, `Für ${D.task} ein unscharfes Handyfoto vom Bildschirm hochladen`, `Send a blurry phone photo of the screen showing ${N.task}`)
                ],
                correct: 1,
                hint: t('El PDF «congela» el diseño: lo que ves es lo que verá tu profesor, sin importar el programa o el dispositivo.',
                    'PDF „friert“ das Layout ein: Deine Lehrkraft sieht genau, was du siehst, unabhängig von Programm oder Gerät.',
                    'PDF “freezes” the layout: your teacher sees exactly what you see, whatever the program or device.')
            })
        }
    },

    // ── Reto 4 · Protegerse y actuar con seguridad ──
    4: {
        1: {
            kmk: '4.1',
            k3: (E, D, N) => ({
                label: t(`Creas tu cuenta de ${E.app} para ${E.name}. ¿Qué contraseña es la más segura?`,
                    `Du erstellst dein Konto bei ${D.app} für ${D.name}. Welches Passwort ist am sichersten?`,
                    `You are creating your ${N.app} account for ${N.name}. Which password is the safest?`),
                options: [
                    t(`«${E.app}» seguido de tu año de nacimiento`, `„${D.app}“ und dein Geburtsjahr`, `“${N.app}” followed by your year of birth`),
                    t(`Una frase larga con mayúsculas, minúsculas, números y símbolos, solo para ${E.app}, que no compartes con nadie`, `Ein langer Satz mit Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen, nur für ${D.app}, den du niemandem verrätst`, `A long phrase with capitals, lowercase letters, numbers and symbols, only for ${N.app}, that you share with no one`),
                    t(`«${E.name}123», porque es fácil de recordar`, `„${D.name}123“, weil man es sich leicht merkt`, `“${N.name}123”, because it's easy to remember`)
                ],
                correct: 1,
                hint: t('Una contraseña larga y variada es difícil de adivinar. Usa una distinta para cada cuenta y no la compartas, ni siquiera con amigos.',
                    'Ein langes, abwechslungsreiches Passwort ist schwer zu erraten. Verwende für jedes Konto ein anderes und gib es niemandem, auch nicht Freunden.',
                    "A long, varied password is hard to guess. Use a different one for each account and don't share it, not even with friends.")
            })
        },
        2: {
            kmk: '4.1',
            k3: (E, D, N) => ({
                label: t(`Mientras trabajas en ${E.task} aparece: «¡Ganaste una tableta! Escribe tu correo y tu contraseña». ¿Qué haces?`,
                    `Du arbeitest gerade für ${D.name}, als ein Fenster erscheint: „Du hast ein Tablet gewonnen! Gib deine E-Mail und dein Passwort ein.“ Was tust du?`,
                    `While you are working on ${N.task}, a pop-up says: “You won a tablet! Enter your email and password.” What do you do?`),
                options: [
                    t(`Escribo mis datos rápido para no perder el premio y sigo con ${E.task}`, `Ich gebe schnell meine Daten ein, damit ich den Preis nicht verpasse, und mache für ${D.name} weiter`, `I enter my details quickly so I don't miss the prize, then carry on with ${N.task}`),
                    t(`Cierro la ventana sin hacer clic, no doy datos, sigo con ${E.task} y aviso a mi profesor de ${E.name} o a mis padres`, `Ich schließe das Fenster, ohne zu klicken, gebe keine Daten ein, mache für ${D.name} weiter und sage meiner Lehrkraft oder meinen Eltern Bescheid`, `I close the window without clicking, give no details, carry on with ${N.task} and tell my ${N.name} teacher or my parents`),
                    t(`Comparto el enlace en el grupo de ${E.name} para que mis compañeros también ganen`, `Ich teile den Link in der Gruppe für ${D.name}, damit meine Mitschüler auch gewinnen`, `I share the link in the ${N.name} group so my classmates can win too`)
                ],
                correct: 1,
                hint: t('Los premios inesperados que piden datos son intentos de «phishing» para robar cuentas. Nunca escribas tu contraseña en ventanas emergentes.',
                    'Unerwartete Gewinne, die nach Daten fragen, sind Phishing-Versuche, um Konten zu stehlen. Gib dein Passwort nie in Pop-up-Fenstern ein.',
                    'Unexpected prizes that ask for details are phishing attempts to steal accounts. Never type your password into pop-ups.')
            })
        },
        // IA: los datos personales no se le escriben a un chatbot
        3: {
            kmk: '4.2',
            ai: true,
            k3: (E, D, N) => ({
                label: t(`Usas un chatbot de inteligencia artificial para que te ayude con ${E.task}. ¿Qué datos no debes escribirle?`,
                    `Du nutzt einen KI-Chatbot als Hilfe für ${D.task}. Welche Daten solltest du ihm nicht schreiben?`,
                    `You use an artificial intelligence chatbot to help you with ${N.task}. Which details should you not type into it?`),
                options: [
                    t(`Tu nombre completo, tu dirección, tu teléfono, tus contraseñas, fotos tuyas o datos de tus compañeros de ${E.name}`, `Deinen vollen Namen, deine Adresse, Telefonnummer, Passwörter, Fotos von dir oder Daten deiner Mitschüler in ${D.name}`, `Your full name, address, phone number, passwords, photos of you or details about your ${N.name} classmates`),
                    t(`La pregunta sobre ${E.topic} que quieres entender`, `Die Frage zum Thema „${D.topic}“, die du verstehen willst`, `The question about ${N.topic} that you want to understand`),
                    t(`El nombre de la materia: ${E.name}`, `Den Namen des Fachs: ${D.name}`, `The name of the subject: ${N.name}`)
                ],
                correct: 0,
                hint: t('Lo que escribes en un chatbot puede guardarse en sus servidores y usarse para entrenar la IA. Pregunta sobre el tema, pero nunca compartas datos personales tuyos ni de otras personas.',
                    'Was du einem Chatbot schreibst, kann auf seinen Servern gespeichert und zum Training der KI genutzt werden. Frag zum Thema, aber teile nie persönliche Daten von dir oder anderen.',
                    "What you type into a chatbot can be stored on its servers and used to train the AI. Ask about the topic, but never share personal details about yourself or others.")
            })
        },
        4: {
            kmk: '4.2',
            k3: (E, D, N) => ({
                label: t(`Piensas subir ${E.product} a una red social pública con tu nombre. ¿Qué debes tener en cuenta?`,
                    `Du willst ${D.product} mit deinem Namen in einem öffentlichen sozialen Netzwerk posten. Was solltest du bedenken?`,
                    `You plan to post ${N.product} on a public social network under your name. What should you keep in mind?`),
                options: [
                    t(`Que ${E.product} pasará a formar parte de tu huella digital y podrá verse durante años, así que debes cuidar lo que muestras y hacerlo con respeto`, `Dass du ${D.product} dauerhaft in deinen digitalen Fußabdruck aufnimmst: Er kann jahrelang sichtbar bleiben, also achte auf Respekt und Sorgfalt`, `That ${N.product} will become part of your digital footprint and may be visible for years, so be respectful and careful`),
                    t(`Que ${E.product} desaparece de internet cuando apagas el computador`, `Dass du ${D.product} nur bis zum Ausschalten des Computers veröffentlichst`, `That ${N.product} disappears from the internet when you switch off the computer`),
                    t(`Que solo tus amigos más cercanos verán ${E.product}`, `Dass nur deine engsten Freunde ${D.product} sehen`, `That only your closest friends will see ${N.product}`)
                ],
                correct: 0,
                hint: t('Lo que publicas deja una huella digital duradera: profesores, familias o futuros colegios podrían verlo. Publica solo lo que te enorgullezca.',
                    'Was du veröffentlichst, hinterlässt einen dauerhaften digitalen Fußabdruck: Lehrkräfte, Familien oder spätere Schulen könnten es sehen. Poste nur, worauf du stolz bist.',
                    "What you post leaves a lasting digital footprint: teachers, families or future schools could see it. Only post what you're proud of.")
            })
        },
        5: {
            kmk: '4.3',
            k3: (E, D, N) => ({
                label: t(`Pasas mucho rato frente a la pantalla usando ${E.tool} para ${E.name}. ¿Qué hábitos cuidan tu salud?`,
                    `Du arbeitest für ${D.name} lange mit ${D.tool} am Bildschirm. Welche Gewohnheiten schützen deine Gesundheit?`,
                    `You spend a long time at the screen using ${N.tool} for ${N.name}. Which habits protect your health?`),
                options: [
                    t(`Usar ${E.tool} acostado, con la pantalla muy cerca de los ojos`, `${D.tool} im Liegen nutzen, mit dem Bildschirm ganz nah an den Augen`, `Use ${N.tool} lying down with the screen very close to your eyes`),
                    t(`Trabajar en ${E.tool} con la espalda recta, la pantalla a unos 50 cm de los ojos y pausas cortas cada 20–30 minutos`, `Mit ${D.tool} bei geradem Rücken arbeiten, den Bildschirm etwa 50 cm von den Augen entfernt, und alle 20–30 Minuten eine kurze Pause machen`, `Work in ${N.tool} with a straight back, the screen about 50 cm from your eyes and short breaks every 20–30 minutes`),
                    t(`No dejar ${E.tool} hasta terminar lo de ${E.name}, aunque duelan los ojos`, `${D.tool} nicht schließen, bis alles für ${D.name} fertig ist, auch wenn die Augen wehtun`, `Stay in ${N.tool} until your ${N.name} work is done, even if your eyes hurt`)
                ],
                correct: 1,
                hint: t('La buena postura, la distancia correcta y las pausas evitan dolores de espalda, cansancio visual y dolores de cabeza.',
                    'Gute Haltung, der richtige Abstand und Pausen verhindern Rückenschmerzen, müde Augen und Kopfschmerzen.',
                    'Good posture, the right distance and breaks prevent back pain, eye strain and headaches.')
            })
        },
        6: {
            kmk: '4.1',
            k3: (E, D, N) => ({
                label: t(`En un café quieres terminar ${E.task} conectado a una red Wi-Fi abierta sin contraseña. ¿Por qué es riesgoso?`,
                    `In einem Café willst du ${D.task} über ein offenes WLAN ohne Passwort fertigstellen. Warum ist das riskant?`,
                    `At a café you want to finish ${N.task} on an open Wi-Fi network with no password. Why is that risky?`),
                options: [
                    t(`Porque la información de ${E.task} no va cifrada y otras personas podrían ver tus datos o contraseñas`, `Weil die Daten für ${D.task} nicht verschlüsselt sind und andere deine Daten oder Passwörter mitlesen könnten`, `Because the data for ${N.task} isn't encrypted and others could see your details or passwords`),
                    t(`Porque en las redes abiertas ${E.tool} funciona más lento`, `Weil ${D.tool} in offenen Netzen langsamer läuft`, `Because ${N.tool} runs more slowly on open networks`),
                    t(`No es riesgoso: ${E.tool} hace seguras todas las redes`, `Es ist nicht riskant: ${D.tool} macht alle Netze sicher`, `It isn't risky: ${N.tool} makes every network safe`)
                ],
                correct: 0,
                hint: t('En redes abiertas, otros pueden interceptar lo que envías. Evita iniciar sesión en cuentas importantes, o usa los datos móviles o la red del colegio.',
                    'In offenen Netzen können andere mitlesen, was du sendest. Melde dich dort nicht bei wichtigen Konten an, oder nutze mobile Daten bzw. das Schulnetz.',
                    'On open networks others can intercept what you send. Avoid logging in to important accounts, or use mobile data or the school network.')
            })
        }
    },

    // ── Reto 5 · Solucionar problemas y actuar ──
    5: {
        1: {
            kmk: '5.1',
            k3: (E, D, N) => ({
                label: t(`Empieza la clase de ${E.name} y el monitor no muestra imagen. ¿Qué revisas primero?`,
                    `Der Unterricht in ${D.name} beginnt und der Monitor zeigt kein Bild. Was prüfst du zuerst?`,
                    `Your ${N.name} lesson starts and the monitor shows no picture. What do you check first?`),
                options: [
                    t(`Golpear el monitor hasta que funcione, porque la clase de ${E.name} ya empezó`, `Auf den Monitor klopfen, bis er funktioniert, weil ${D.name} schon angefangen hat`, `Hit the monitor until it works, because ${N.name} has already started`),
                    t(`Que el cable de energía y el de video (HDMI) estén bien conectados y que el monitor esté encendido antes de abrir ${E.tool}`, `Ob Strom- und Videokabel (HDMI) richtig stecken und der Monitor eingeschaltet ist, bevor du ${D.tool} öffnest`, `That the power and video (HDMI) cables are plugged in properly and the monitor is on before you open ${N.tool}`),
                    t(`Cambiarte de puesto sin avisar a tu profesor de ${E.name}`, `Den Platz wechseln, ohne der Lehrkraft in ${D.name} Bescheid zu sagen`, `Move to another seat without telling your ${N.name} teacher`)
                ],
                correct: 1,
                hint: t('Ante un fallo, empieza por lo más simple: energía, cables y botones. Muchos problemas se resuelven en el primer paso.',
                    'Bei einer Störung fängst du mit dem Einfachsten an: Strom, Kabel und Schalter. Viele Probleme sind damit schon gelöst.',
                    'When something fails, start with the simplest things: power, cables and buttons. Many problems are solved at the first step.')
            })
        },
        2: {
            kmk: '5.1',
            k3: (E, D, N) => ({
                label: t(`${E.tool} se congela mientras trabajas en ${E.task} y no te deja guardar. ¿Qué es lo más lógico?`,
                    `${D.tool} reagiert nicht mehr, während du für ${D.name} arbeitest, und du kannst nicht speichern. Was ist sinnvoll?`,
                    `${N.tool} freezes while you are working on ${N.task} and won't let you save. What is the sensible thing to do?`),
                options: [
                    t(`Esperar una hora sin hacer nada y perder la clase de ${E.name}`, `Eine Stunde lang warten, ohne etwas zu tun, und den Unterricht in ${D.name} verpassen`, `Wait for an hour doing nothing and miss your ${N.name} lesson`),
                    t(`Esperar un momento; si sigue igual, forzar el cierre de ${E.tool} (Administrador de tareas o Alt+F4), reabrirlo y recuperar la última versión guardada`, `Kurz warten; wenn sich nichts tut, ${D.tool} über den Task-Manager (oder Alt+F4) beenden, neu öffnen und die zuletzt gespeicherte Version wiederherstellen`, `Wait a moment; if nothing changes, force-close ${N.tool} (Task Manager or Alt+F4), reopen it and recover the last saved version`),
                    t(`Desinstalar ${E.tool} y todo el sistema operativo`, `${D.tool} und das ganze Betriebssystem deinstallieren`, `Uninstall ${N.tool} and the whole operating system`)
                ],
                correct: 1,
                hint: t('Forzar el cierre libera el programa bloqueado. Muchas aplicaciones recuperan el trabajo al reabrirlas; por eso conviene guardar seguido.',
                    'Das erzwungene Beenden befreit das blockierte Programm. Viele Anwendungen stellen beim Neustart deine Arbeit wieder her – deshalb regelmäßig speichern.',
                    'Force-closing frees the stuck program. Many apps recover your work when reopened, which is why it pays to save often.')
            })
        },
        3: {
            kmk: '5.5',
            k3: (E, D, N) => ({
                label: t(`Programas en Scratch o MakeCode para ${E.name}. Tu programa debe ${E.loop}. ¿Qué estructura es la más adecuada?`,
                    `Du programmierst in Scratch oder MakeCode für ${D.name}. Dein Programm soll ${D.loop}. Welche Struktur ist am besten geeignet?`,
                    `You are coding in Scratch or MakeCode for ${N.name}. Your program must ${N.loop}. Which structure is the most suitable?`),
                options: [
                    t(`Un bucle («repetir» o «mientras») que ejecute las mismas instrucciones las veces necesarias para ${E.loop}`, `Eine Schleife („wiederhole“ oder „solange“), die dieselben Anweisungen so oft wie nötig ausführt: ${D.loop}`, `A loop (“repeat” or “while”) that runs the same instructions as many times as needed to ${N.loop}`),
                    t(`Copiar y pegar el mismo bloque muchas veces para ${E.loop}`, `Denselben Block viele Male kopieren und einfügen: ${D.loop}`, `Copy and paste the same block many times to ${N.loop}`),
                    t(`Poner el bloque «detener todo» al inicio de tu programa de ${E.name}`, `Den Block „stoppe alles“ an den Anfang deines Programms für ${D.name} setzen`, `Put the “stop all” block at the start of your ${N.name} program`)
                ],
                correct: 0,
                hint: t('Un bucle evita repetir código: el programa es más corto, más fácil de revisar y basta cambiar un número para ajustar las repeticiones.',
                    'Eine Schleife vermeidet doppelten Code: Das Programm wird kürzer und übersichtlicher, und eine Zahl genügt, um die Wiederholungen anzupassen.',
                    'A loop avoids repeated code: the program is shorter, easier to check, and changing one number adjusts the repetitions.')
            })
        },
        // IA: un asistente de IA como tutor que explica, no como atajo; instrucciones claras
        4: {
            kmk: '5.3',
            ai: true,
            k3: (E, D, N) => ({
                label: t(`Te atascas en ${E.task} y no sabes cómo seguir. ¿Cómo te ayuda mejor un asistente de inteligencia artificial?`,
                    `Für ${D.task} kommst du gerade nicht weiter. Wie hilft dir ein KI-Assistent am besten?`,
                    `You're stuck on ${N.task} and don't know how to go on. How can an artificial intelligence assistant help you best?`),
                options: [
                    t(`Le pides solo la respuesta final de ${E.task} y la copias`, `Du lässt dir nur das Endergebnis für ${D.task} geben und schreibst es ab`, `You ask only for the final answer to ${N.task} and copy it`),
                    t(`Le pides que te explique paso a paso y te dé pistas, lo intentas tú y compruebas el resultado con tus apuntes de ${E.name} o con tu profesor`, `Du bittest ihn, Schritt für Schritt zu erklären und Tipps zu geben, versuchst es selbst und prüfst das Ergebnis mit deinen Unterlagen in ${D.name} oder mit deiner Lehrkraft`, `You ask it to explain step by step and give hints, try it yourself and check the result with your ${N.name} notes or your teacher`),
                    t(`Le escribes «ayúdame con ${E.name}», sin más contexto, y aceptas lo primero que diga`, `Du schreibst nur „Hilf mir in ${D.name}“ ohne Zusammenhang und nimmst die erste Antwort`, `You just type “help me with ${N.name}” with no context and accept the first answer`)
                ],
                correct: 1,
                hint: t('La IA te ayuda a aprender cuando le das una instrucción clara (qué necesitas y para qué) y le pides que explique, no que resuelva. Lo que aprendes es tuyo; lo que copias, no.',
                    'KI hilft dir beim Lernen, wenn du eine klare Anweisung gibst (was du brauchst und wofür) und um Erklärungen statt Lösungen bittest. Was du lernst, gehört dir – was du abschreibst, nicht.',
                    "AI helps you learn when you give it a clear instruction (what you need and why) and ask it to explain, not to solve. What you learn is yours; what you copy isn't.")
            })
        },
        5: {
            kmk: '5.2',
            k3: (E, D, N) => ({
                label: t(`Tu equipo planea una actividad de ${E.name}. ¿Con qué criterio eligen las herramientas digitales?`,
                    `Dein Team plant eine Aktivität für ${D.name}. Nach welchem Kriterium wählt ihr die digitalen Werkzeuge aus?`,
                    `Your team is planning a ${N.name} activity. How do you choose the digital tools?`),
                options: [
                    t('La aplicación más popular en redes sociales', 'Die beliebteste App in den sozialen Netzwerken', 'The most popular app on social media'),
                    t(`La que mejor sirve para cada parte del producto (p. ej. ${E.choice})`, `Das Werkzeug, das am besten zu jedem Teil des Produkts passt (z. B. ${D.choice})`, `Whatever fits each part of the product best (e.g. ${N.choice})`),
                    t('La que tenga más efectos y colores', 'Das mit den meisten Effekten und Farben', 'The one with the most effects and colours')
                ],
                correct: 1,
                hint: t('Elegir la herramienta según la tarea ahorra tiempo y mejora el resultado: cada programa tiene fortalezas distintas.',
                    'Wer das Werkzeug passend zur Aufgabe wählt, spart Zeit und erzielt bessere Ergebnisse – jedes Programm hat andere Stärken.',
                    'Choosing the tool for the task saves time and improves the result: each program has different strengths.')
            })
        },
        6: {
            kmk: '5.4',
            k3: (E, D, N) => ({
                label: t(`Problema: ${E.bug}. ¿Cuál es el método más recomendable para encontrar el error?`,
                    `Problem: ${D.bug}. Wie findest du den Fehler am besten?`,
                    `Problem: ${N.bug}. What is the best method to find the bug?`),
                options: [
                    t(`Borrar todo el trabajo de ${E.name} y empezar de cero`, `Die ganze Arbeit für ${D.name} löschen und von vorn beginnen`, `Delete all your ${N.name} work and start from scratch`),
                    t(`Revisar paso a paso tu trabajo de ${E.name}, probar cada parte por separado y comprobar en qué punto el resultado deja de ser el esperado`, `Deine Arbeit für ${D.name} Schritt für Schritt prüfen, jeden Teil einzeln testen und herausfinden, ab wann das Ergebnis nicht mehr stimmt`, `Go through your ${N.name} work step by step, test each part separately and find the point where the result stops being what you expect`),
                    t(`Apagar el computador a la fuerza y dejar sin resolver el error de ${E.name}`, `Den Computer gewaltsam ausschalten und den Fehler für ${D.name} ungelöst lassen`, `Force the computer off and leave the ${N.name} bug unsolved`)
                ],
                correct: 1,
                hint: t('Depurar es investigar: aislar las partes y probarlas una por una permite encontrar el error sin perder el trabajo que sí funciona.',
                    'Fehlersuche ist Detektivarbeit: Wer die Teile einzeln testet, findet den Fehler, ohne funktionierende Arbeit zu verlieren.',
                    'Debugging is detective work: isolating parts and testing them one by one finds the bug without losing the work that does function.')
            })
        }
    },

    // ── Reto 6 · Analizar y reflexionar ──
    6: {
        1: {
            kmk: '6.1',
            k3: (E, D, N) => ({
                label: t(`Ves este titular en redes: ${E.fake}. ¿Cómo compruebas si es falso?`,
                    `Du siehst diese Schlagzeile in sozialen Netzwerken: ${D.fake}. Wie prüfst du, ob sie falsch ist?`,
                    `You see this headline on social media: ${N.fake}. How do you check whether it's fake?`),
                options: [
                    t(`Compartir rápido ${E.fake} porque parece importante para ${E.name}`, `${D.fake} schnell teilen, weil es für ${D.name} wichtig klingt`, `Share ${N.fake} quickly because it seems important for ${N.name}`),
                    t(`Aplicar SIFT: detenerte, investigar la fuente, buscar si medios confiables lo publican (p. ej. ${E.source}) y rastrear el origen`, `Die SIFT-Methode anwenden: innehalten, die Quelle prüfen, nach seriösen Angaben suchen (z. B. ${D.source}) und den Ursprung zurückverfolgen`, `Use SIFT: stop, investigate the source, look for trusted coverage (e.g. ${N.source}) and trace the claim to its origin`),
                    t(`Creer ${E.fake} si tiene muchos «me gusta»`, `${D.fake} glauben, wenn es viele Likes hat`, `Believe ${N.fake} if it has lots of likes`)
                ],
                correct: 1,
                hint: t('Los titulares sorprendentes buscan clics. Si ningún medio o institución confiable lo confirma, probablemente es falso.',
                    'Spektakuläre Schlagzeilen wollen Klicks. Wenn kein seriöses Medium und keine Institution sie bestätigt, ist sie vermutlich falsch.',
                    "Sensational headlines are after clicks. If no trusted outlet or institution confirms it, it's probably fake.")
            })
        },
        2: {
            kmk: '6.2',
            k3: (E, D, N) => ({
                label: t(`Después de ver algunos videos sobre ${E.topic}, la plataforma solo te recomienda contenidos parecidos. ¿Qué es una «burbuja de filtro»?`,
                    `Nachdem du ein paar Videos zum Thema „${D.topic}“ angesehen hast, empfiehlt dir die Plattform nur noch Ähnliches. Was ist eine „Filterblase“?`,
                    `After watching a few videos about ${N.topic}, the platform only recommends similar content. What is a “filter bubble”?`),
                options: [
                    t(`Cuando el algoritmo solo te muestra contenidos sobre ${E.topic} que coinciden con tu historial y tus opiniones, y te oculta otras perspectivas`, `Wenn der Algorithmus dir zum Thema „${D.topic}“ nur zeigt, was zu deinem Verlauf und deinen Meinungen passt, und andere Sichtweisen ausblendet`, `When the algorithm only shows you content about ${N.topic} that matches your history and opinions and hides other perspectives`),
                    t(`Un filtro de fotos que pone burbujas en los videos sobre ${E.topic}`, `Ein Fotofilter, der Videos zum Thema „${D.topic}“ mit Blasen verziert`, `A photo filter that adds bubbles to videos about ${N.topic}`),
                    t(`Un antivirus que bloquea las páginas peligrosas sobre ${E.topic}`, `Ein Virenschutz, der gefährliche Seiten zum Thema „${D.topic}“ blockiert`, `An antivirus that blocks dangerous sites about ${N.topic}`)
                ],
                correct: 0,
                hint: t('Los algoritmos aprenden de lo que ves. Buscar a propósito fuentes y opiniones diferentes te ayuda a salir de la burbuja.',
                    'Algorithmen lernen aus dem, was du ansiehst. Wer bewusst andere Quellen und Meinungen sucht, kommt aus der Blase heraus.',
                    'Algorithms learn from what you watch. Deliberately looking for different sources and opinions helps you get out of the bubble.')
            })
        },
        // IA: uso ético y transparente de la IA generativa
        3: {
            kmk: '6.2',
            ai: true,
            k3: (E, D, N) => ({
                label: t(`Quieres usar una inteligencia artificial como ChatGPT o Copilot para ${E.task}. ¿Cuál es el uso ético?`,
                    `Du möchtest eine KI wie ChatGPT oder Copilot für ${D.task} nutzen. Was ist ein ethischer Umgang?`,
                    `You want to use an AI like ChatGPT or Copilot for ${N.task}. What is the ethical way to use it?`),
                options: [
                    t(`Copiar el texto que genera y entregarlo como ${E.task}`, `Den erzeugten Text kopieren und als ${D.task} abgeben`, `Copy the text it generates and hand it in as ${N.task}`),
                    t(`Usarla como apoyo para ordenar ideas de ${E.task}, verificar sus datos en fuentes confiables (p. ej. ${E.source}) y declarar que la usaste`, `Sie als Hilfe zum Ordnen von Ideen für ${D.task} nutzen, ihre Angaben mit verlässlichen Quellen (z. B. ${D.source}) prüfen und angeben, dass du sie verwendet hast`, `Use it as support to organise ideas for ${N.task}, check its facts against reliable sources (e.g. ${N.source}) and declare that you used it`),
                    t(`Pedirle que haga por ti ${E.task} y no revisar nada`, `Sie ${D.task} komplett machen lassen und nichts prüfen`, `Ask it to do ${N.task} for you and check nothing`)
                ],
                correct: 1,
                hint: t('La IA puede equivocarse o inventar datos. Úsala para pensar mejor, no para que piense por ti, y sé transparente sobre su uso.',
                    'KI kann sich irren oder Fakten erfinden. Nutze sie, um besser zu denken – nicht, damit sie für dich denkt – und sei offen über ihren Einsatz.',
                    'AI can be wrong or make up facts. Use it to think better, not to think for you, and be open about using it.')
            })
        },
        4: {
            kmk: '6.2',
            k3: (E, D, N) => ({
                label: t(`Para ${E.name} pasas muchas horas frente a pantallas, además de tu tiempo libre en el celular. ¿Por qué conviene autorregular el tiempo de conexión?`,
                    `Für ${D.name} verbringst du viele Stunden am Bildschirm, dazu kommt deine Freizeit am Handy. Warum solltest du deine Bildschirmzeit selbst regulieren?`,
                    `For ${N.name} you spend many hours on screens, on top of your free time on your phone. Why should you regulate your screen time?`),
                options: [
                    t(`Para evitar cansancio visual, dolores, problemas de sueño y distracción en ${E.name}, y equilibrar estudio, descanso y actividad física`, `Um müde Augen, Schmerzen, Schlafprobleme und Ablenkung in ${D.name} zu vermeiden und Lernen, Erholung und Bewegung auszugleichen`, `To avoid eye strain, aches, sleep problems and distraction in ${N.name}, and balance study, rest and physical activity`),
                    t(`Porque ${E.tool} deja de funcionar si se usa mucho`, `Weil ${D.tool} bei viel Nutzung nicht mehr funktioniert`, `Because ${N.tool} stops working if it is used a lot`),
                    t(`No hace falta: mientras más horas frente a ${E.tool}, mejor se aprende ${E.name}`, `Das ist nicht nötig: Je mehr Stunden mit ${D.tool}, desto besser lernt man ${D.name}`, `There's no need: the more hours on ${N.tool}, the better you learn ${N.name}`)
                ],
                correct: 0,
                hint: t('El equilibrio digital cuida tu salud y tu concentración. Programar pausas y desconectarte antes de dormir mejora el aprendizaje.',
                    'Digitale Balance schützt Gesundheit und Konzentration. Geplante Pausen und bildschirmfreie Zeit vor dem Schlafen verbessern das Lernen.',
                    'Digital balance protects your health and concentration. Planned breaks and switching off before bed improve learning.')
            })
        },
        5: {
            kmk: '6.1',
            k3: (E, D, N) => ({
                label: t(`Investigando para ${E.name} encuentras ${E.bias}. ¿Cómo identificas el sesgo comercial?`,
                    `Bei deiner Recherche für ${D.name} findest du ${D.bias}. Woran erkennst du die kommerzielle Absicht?`,
                    `While researching for ${N.name} you find ${N.bias}. How do you spot the commercial bias?`),
                options: [
                    t(`Por los anuncios constantes, los enlaces de compra y un texto que solo elogia un producto relacionado con ${E.name}, sin mostrar otras opciones`, `An ständiger Werbung, Kauflinks und einem Text, der nur ein Produkt zu ${D.name} lobt, ohne Alternativen zu nennen`, `By the constant ads, the buy links and text that only praises one ${N.name} product without showing alternatives`),
                    t(`Por el color de fondo de la página de ${E.name}`, `An der Hintergrundfarbe der Seite zu ${D.name}`, `By the background colour of the ${N.name} page`),
                    t(`Porque tiene muchas imágenes sobre ${E.topic}`, `Weil sie viele Bilder zum Thema „${D.topic}“ hat`, `Because it has lots of images about ${N.topic}`)
                ],
                correct: 0,
                hint: t('Si quien informa también vende, su información puede estar inclinada. Contrasta con fuentes independientes antes de confiar.',
                    'Wer informiert und gleichzeitig verkauft, ist möglicherweise nicht neutral. Vergleiche mit unabhängigen Quellen, bevor du vertraust.',
                    'If the people informing you are also selling, their information may be biased. Compare with independent sources before trusting it.')
            })
        },
        6: {
            kmk: '6.2',
            k3: (E, D, N) => ({
                label: t(`Quieres publicar ${E.product} en un sitio público con tu nombre. ¿Qué impacto tiene?`,
                    `Du willst ${D.product} mit deinem Namen auf einer öffentlichen Seite veröffentlichen. Welche Folgen hat das?`,
                    `You want to publish ${N.product} on a public site under your name. What impact does it have?`),
                options: [
                    t(`Ninguno: internet se olvida rápido de ${E.product}`, `Keine: Das Internet vergisst ${D.product} schnell`, `None: the internet quickly forgets ${N.product}`),
                    t(`Afecta tu reputación académica en línea, así que debes revisar ${E.product}, actuar con respeto y cumplir los derechos de autor`, `Es wird Teil deines digitalen Rufs, deshalb solltest du ${D.product} prüfen, respektvoll bleiben und das Urheberrecht einhalten`, `It becomes part of your online academic reputation, so check ${N.product}, be respectful and follow copyright rules`),
                    t(`Solo importa cuántos «me gusta» reciba ${E.product}`, `Nur die Likes für ${D.product} zählen`, `Only the number of likes ${N.product} gets matters`)
                ],
                correct: 1,
                hint: t('Tu trabajo publicado habla de ti. Un producto cuidado y con fuentes citadas construye una buena reputación digital.',
                    'Veröffentlichte Arbeiten sagen etwas über dich aus. Ein sorgfältiges Produkt mit Quellenangaben baut einen guten digitalen Ruf auf.',
                    'Your published work speaks about you. A careful product with cited sources builds a good digital reputation.')
            })
        }
    }
};

const LETTERS = ['a', 'b', 'c'];

const EXPLAIN_LABEL = t('¿Puedes explicar por qué seleccionaste esa respuesta?',
    'Kannst du erklären, warum du diese Antwort gewählt hast?',
    'Can you explain why you selected that answer?');

// Main function that constructs the evidence array for a given reto, subject and grade
function generateEvidenceForReto(retoNum, subject, grade) {
    // Grado 2: versión visual de Prekínder, Kinder, K1 y K2 (data_visual.js)
    if (grade === 2) return buildVisualQuestions(retoNum, subject);

    const evidence = [];
    const pack = getSubjectPack(subject);

    for (let q = 1; q <= 6; q++) {
        const template = TEMPLATES[retoNum] && TEMPLATES[retoNum][q];
        if (!template) continue;
        // Tecnología (data_tecnologia_retos.js) y Deportes (data_deportes_retos.js) tienen sus
        // propias preguntas; las demás materias usan la plantilla con su paquete temático.
        // K3-K6 (Primaria): primaryQuestion para todas las materias, también Tecnología y Deportes.
        // Conserva id, subcompetencia KMK, la pregunta de IA y la posición de la respuesta correcta.
        const primary = primaryQuestion(retoNum, q, subject, grade);
        const own = primary ? null : subjectQuestion(subject, retoNum, q);
        const qData = primary || own || template.k3(pack.es, pack.de, pack.en);

        // Construct unique ID containing reto, subject, grade, question number
        const mainId = `r${retoNum}_${subject}_k${grade}_q${q}`;

        const mcItem = {
            id: mainId,
            label: qData.label,
            type: 'radio_group',
            kmk: (own && own.kmk) || template.kmk,
            options: qData.options.map((opt, idx) => ({
                de: `${LETTERS[idx]}) ${opt.de}`,
                en: `${LETTERS[idx]}) ${opt.en}`,
                es: `${LETTERS[idx]}) ${opt.es}`,
                correct: idx === qData.correct,
                val: idx
            }))
        };

        if (qData.hint) {
            mcItem.hint = qData.hint;
        }
        // Pregunta sobre inteligencia artificial (una por reto en cada materia): la página la marca «IA»
        if (own ? own.ai : template.ai) mcItem.ai = true;

        evidence.push(mcItem);

        // Interleave the justification textarea right after each multiple choice
        evidence.push({ id: `${mainId}_explain`, label: EXPLAIN_LABEL, type: 'textarea' });
    }

    return evidence;
}

// Ejemplo de evidencia de cada materia, debajo del formulario de vínculos de los retos 1-6
function evidenceExampleFor(subject) {
    const { es: E, de: D, en: N } = getSubjectPack(subject);
    return t(`Ejemplo en ${E.name}: ${E.product} o ${E.media}.`,
        `Beispiel in ${D.name}: ${D.product} oder ${D.media}.`,
        `Example in ${N.name}: ${N.product} or ${N.media}.`);
}

module.exports = { generateEvidenceForReto, evidenceExampleFor, EXPLAIN_LABEL };
