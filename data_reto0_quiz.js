// ══════════════════════════════════════════════════════════════════════════
// MEDIENPASS - EVALUACIÓN DEL RETO 0 POR MATERIA (10 preguntas, se gana con 8)
// - P1-P2: qué es el Medienpass y la validación docente, contadas desde la materia.
// - P3-P8: una por competencia KMK: ¿qué actividad de la materia corresponde a esa competencia?
//   Las opciones son los ejemplos de la materia (los mismos que muestra la diapositiva
//   "El Medienpass en <materia>" del panel 4, así que todo lo que se pregunta se estudió antes).
// - P9: seguridad, privacidad o derechos de autor en la materia; P10: uso responsable de la
//   inteligencia artificial en la materia (diapositiva 5, que muestra los dos casos de la materia y el de la IA).
// Cada pregunta lleva quiz: true (la usan el juego del panel 5 y services/reto_result.js).
// ══════════════════════════════════════════════════════════════════════════

const { subjects } = require('./data_levels');

const t = (es, de, en) => ({ es, de, en });

// ai: la dimensión de inteligencia artificial de cada competencia (uso «constructivo y crítico» de la
// IA, como pide la recomendación de la KMK sobre IA en la escuela de octubre de 2024, que se apoya en
// la estrategia «Bildung in der digitalen Welt»). Cada reto 1-6 tiene una pregunta sobre esto.
const KMK_COMPETENCES = [
    { icon: '🔍', name: t('Buscar, procesar y archivar', 'Suchen, Verarbeiten und Aufbewahren', 'Search, process and store'),
        ai: t('Usar chatbots y buscadores con IA con preguntas claras y comprobar sus respuestas en fuentes confiables, porque pueden equivocarse o inventar datos.',
            'KI-Chatbots und KI-Suchmaschinen mit klaren Fragen nutzen und ihre Antworten mit verlässlichen Quellen prüfen, weil sie sich irren oder Fakten erfinden können.',
            'Use AI chatbots and AI search with clear questions and check their answers against reliable sources, because they can be wrong or make things up.') },
    { icon: '📡', name: t('Comunicar y cooperar', 'Kommunizieren und Kooperieren', 'Communicate and cooperate'),
        ai: t('Reconocer contenidos falsos hechos con IA (deepfakes), no difundirlos y respetar a las personas en todo lo que se crea o comparte con IA.',
            'Mit KI erstellte Fälschungen (Deepfakes) erkennen, nicht verbreiten und Menschen in allem respektieren, was mit KI erstellt oder geteilt wird.',
            'Recognise fake content made with AI (deepfakes), not spread it, and respect people in everything created or shared with AI.') },
    { icon: '🎨', name: t('Producir y presentar', 'Produzieren und Präsentieren', 'Produce and present'),
        ai: t('Crear con apoyo de IA de forma transparente: revisar el resultado, decir qué se hizo con IA y respetar los derechos de autor y la imagen de las personas.',
            'Mit KI-Unterstützung transparent gestalten: das Ergebnis prüfen, angeben, was mit KI entstanden ist, und Urheberrecht sowie das Recht am eigenen Bild achten.',
            'Create with AI support transparently: check the result, say what was made with AI and respect copyright and people’s image rights.') },
    { icon: '🛡️', name: t('Protegerse y actuar con seguridad', 'Schützen und sicher agieren', 'Protect yourself and act safely'),
        ai: t('No dar datos personales, fotos ni contraseñas a aplicaciones de IA, y saber que lo que se les escribe puede guardarse y usarse para entrenarlas.',
            'KI-Anwendungen keine persönlichen Daten, Fotos oder Passwörter geben und wissen, dass Eingaben gespeichert und zum Training genutzt werden können.',
            'Not giving personal details, photos or passwords to AI apps, and knowing that what you type can be stored and used to train them.') },
    { icon: '⚙️', name: t('Solucionar problemas y actuar', 'Problemlösen und Handeln', 'Solve problems and act'),
        ai: t('Usar la IA como tutor que explica paso a paso y no como atajo: darle instrucciones (prompts) claras y comprobar el resultado.',
            'KI als Tutor nutzen, der Schritt für Schritt erklärt, nicht als Abkürzung: klare Anweisungen (Prompts) geben und das Ergebnis prüfen.',
            'Use AI as a tutor that explains step by step, not as a shortcut: give it clear instructions (prompts) and check the result.') },
    { icon: '🧠', name: t('Analizar y reflexionar', 'Analysieren und Reflektieren', 'Analyse and reflect'),
        ai: t('Entender cómo la IA recomienda, filtra y genera contenidos, reconocer sus sesgos y usarla de forma ética y transparente.',
            'Verstehen, wie KI Inhalte empfiehlt, filtert und erzeugt, ihre Verzerrungen erkennen und sie ethisch und transparent nutzen.',
            'Understand how AI recommends, filters and generates content, recognise its biases and use it ethically and transparently.') }
];

// examples[i]: actividad de la materia para la competencia KMK i+1
// safety: { title, text, question, right, wrong: [2] }
const reto0Packs = {
    aleman: {
        examples: [
            t('Buscar la biografía de los hermanos Grimm en fuentes confiables y guardarla en tu carpeta de Alemán', 'Die Biografie der Brüder Grimm in verlässlichen Quellen suchen und im Deutsch-Ordner speichern', "Look up the Brothers Grimm's biography in reliable sources and save it in your German folder"),
            t('Escribir con tu grupo, en el mismo OneNote, el guion de un teatro de títeres', 'Mit deiner Gruppe im selben OneNote ein Drehbuch für ein Puppentheater schreiben', 'Write a puppet-show script with your group in the same OneNote'),
            t('Grabar un pódcast leyendo un poema en alemán', 'Einen Podcast aufnehmen, in dem du ein deutsches Gedicht vorliest', 'Record a podcast reading a German poem'),
            t('Practicar en Quizlet con tu cuenta del colegio, sin publicar datos personales', 'Mit deinem Schulkonto auf Quizlet üben, ohne persönliche Daten zu veröffentlichen', 'Practise on Quizlet with your school account without publishing personal details'),
            t('Usar el Duden en línea para resolver dudas de ortografía y gramática', 'Rechtschreib- und Grammatikfragen mit dem Online-Duden klären', 'Use the online Duden to sort out spelling and grammar questions'),
            t('Comparar cómo cambian los cuentos de los Grimm en las películas de hoy', 'Vergleichen, wie Grimm-Märchen in heutigen Filmen verändert werden', "Compare how Grimm fairy tales are changed in today's films")
        ],
        safety: [
            {
                title: t('Pide permiso antes de grabar', 'Vor dem Aufnehmen um Erlaubnis fragen', 'Ask before you record'),
                text: t('Si grabas un diálogo o un teatro en alemán, pide permiso a tus compañeros antes de grabarlos o publicarlos.', 'Wenn du einen Dialog oder ein Theaterstück auf Deutsch aufnimmst, frag deine Mitschüler, bevor du sie aufnimmst oder veröffentlichst.', 'If you record a dialogue or play in German, ask your classmates before recording or publishing them.'),
                question: t('Quieres subir a internet el video del teatro en alemán de tu curso. ¿Qué haces primero?', 'Du möchtest das Video eures deutschen Theaterstücks ins Internet stellen. Was machst du zuerst?', "You want to upload the video of your class's German play. What do you do first?"),
                right: t('Pedir permiso a los compañeros que aparecen y a tu profesor', 'Die Mitschüler, die zu sehen sind, und deine Lehrkraft um Erlaubnis fragen', 'Ask the classmates who appear in it and your teacher for permission'),
                wrong: [
                    t('Subirlo ya, porque todos sabían que se estaba grabando', 'Es sofort hochladen, weil alle wussten, dass gefilmt wurde', 'Upload it straight away, since everyone knew it was being filmed'),
                    t('Subirlo con el nombre completo y el colegio de cada uno', 'Es mit vollem Namen und Schule aller hochladen', "Upload it with everyone's full name and school")
                ]
            },
            {
                title: t('Las traducciones también se citan', 'Auch Übersetzungen werden angegeben', 'Translations are cited too'),
                text: t('Si usas un texto o una traducción de otra persona, indica el autor y la fuente. Entregar lo que da un traductor automático como propio es plagio.', 'Wenn du einen Text oder eine Übersetzung von jemand anderem nutzt, nenne Autor und Quelle. Eine Übersetzung aus einem Online-Übersetzer als eigene Arbeit abzugeben, ist ein Plagiat.', "If you use someone else's text or translation, name the author and source. Passing off an online translator's output as your own is plagiarism."),
                question: t('Para una tarea de Alemán pegas un texto en un traductor automático. ¿Qué es lo correcto?', 'Für eine Deutschaufgabe gibst du einen Text in einen Online-Übersetzer ein. Was ist richtig?', 'For a German assignment you paste a text into an online translator. What is right?'),
                right: t('Usarlo solo como ayuda, revisar el resultado y decir que lo usaste', 'Ihn nur als Hilfe nutzen, das Ergebnis prüfen und angeben, dass du ihn benutzt hast', 'Use it only as a help, check the result and say that you used it'),
                wrong: [
                    t('Entregar la traducción como si la hubieras escrito tú', 'Die Übersetzung abgeben, als hättest du sie selbst geschrieben', 'Hand in the translation as if you had written it'),
                    t('Copiar la traducción sin leerla', 'Die Übersetzung ungelesen kopieren', 'Copy the translation without reading it')
                ]
            }
        ]
    },

    espanol: {
        examples: [
            t('Buscar en el Centro Virtual Cervantes información sobre García Márquez y guardarla en tu carpeta de Español', 'Im Centro Virtual Cervantes Informationen über García Márquez suchen und im Spanisch-Ordner speichern', 'Search the Centro Virtual Cervantes for information on García Márquez and save it in your Spanish folder'),
            t('Escribir con tu curso, en Word Online, una antología de cuentos', 'Mit der Klasse in Word Online eine Kurzgeschichten-Anthologie schreiben', 'Write a short-story anthology with your class in Word Online'),
            t('Diseñar en Canva una infografía sobre el realismo mágico', 'In Canva eine Infografik zum magischen Realismus gestalten', 'Design an infographic on magical realism in Canva'),
            t('Publicar tus textos en el blog del colegio con tu cuenta escolar y sin datos personales', 'Deine Texte mit dem Schulkonto und ohne persönliche Daten im Schulblog veröffentlichen', 'Publish your texts on the school blog with your school account and no personal details'),
            t('Usar el corrector y el diccionario de la RAE para resolver dudas de ortografía', 'Rechtschreibprüfung und RAE-Wörterbuch nutzen, um Rechtschreibfragen zu klären', 'Use the spell checker and the RAE dictionary to resolve spelling questions'),
            t('Analizar cómo un anuncio usa las palabras para convencerte de comprar', 'Analysieren, wie eine Werbung mit Sprache zum Kaufen überreden will', 'Analyse how an advert uses words to persuade you to buy')
        ],
        safety: [
            {
                title: t('Cita a los autores', 'Autoren angeben', 'Credit the authors'),
                text: t('Cuando uses frases o ideas de un libro o una página web, ponlas entre comillas y escribe el autor y la fuente. Así evitas el plagio.', 'Wenn du Sätze oder Ideen aus einem Buch oder von einer Website übernimmst, setze sie in Anführungszeichen und nenne Autor und Quelle. So vermeidest du ein Plagiat.', 'When you use sentences or ideas from a book or website, put them in quotation marks and name the author and source. That way you avoid plagiarism.'),
                question: t('En tu ensayo de Español quieres usar una frase de un artículo de internet. ¿Qué haces?', 'In deinem Spanischaufsatz willst du einen Satz aus einem Internetartikel verwenden. Was tust du?', 'In your Spanish essay you want to use a sentence from an online article. What do you do?'),
                right: t('Ponerla entre comillas y citar el autor y la página', 'Ihn in Anführungszeichen setzen und Autor und Seite angeben', 'Put it in quotation marks and cite the author and the page'),
                wrong: [
                    t('Copiarla y cambiar una palabra para que parezca tuya', 'Ihn kopieren und ein Wort ändern, damit er wie deiner aussieht', 'Copy it and change one word so it looks like yours'),
                    t('Copiarla sin decir de dónde salió', 'Ihn kopieren, ohne die Herkunft zu nennen', 'Copy it without saying where it came from')
                ]
            },
            {
                title: t('Respeto en los comentarios', 'Respekt in Kommentaren', 'Respect in comments'),
                text: t('Al comentar los textos de tus compañeros en el blog, critica las ideas con respeto y nunca a la persona.', 'Wenn du Texte deiner Mitschüler im Blog kommentierst, kritisiere respektvoll die Ideen und nie die Person.', "When you comment on classmates' texts on the blog, criticise ideas respectfully and never the person."),
                question: t('Un compañero publicó en el blog del curso un cuento que no te gustó. ¿Cómo comentas?', 'Ein Mitschüler hat im Klassenblog eine Geschichte veröffentlicht, die dir nicht gefällt. Wie kommentierst du?', "A classmate posted a story on the class blog that you didn't like. How do you comment?"),
                right: t('Con una sugerencia respetuosa sobre el texto, por ejemplo sobre el final', 'Mit einem respektvollen Vorschlag zum Text, z. B. zum Ende', 'With a respectful suggestion about the text, for example about the ending'),
                wrong: [
                    t('Burlándome para que todos se rían', 'Indem ich mich lustig mache, damit alle lachen', 'By making fun of it so everyone laughs'),
                    t('Copiando su cuento en otro sitio con mi nombre', 'Indem ich die Geschichte mit meinem Namen woanders veröffentliche', 'By copying the story elsewhere under my name')
                ]
            }
        ]
    },

    ingles: {
        examples: [
            t('Buscar en NASA Climate Kids datos sobre el cambio climático y guardarlos en tu carpeta de Inglés', 'Bei NASA Climate Kids Daten zum Klimawandel suchen und im Englisch-Ordner speichern', 'Find climate-change data on NASA Climate Kids and save it in your English folder'),
            t('Hacer una videollamada en inglés con un colegio aliado, con tu profesor presente', 'Mit deiner Lehrkraft einen Videoanruf auf Englisch mit einer Partnerschule führen', 'Hold a video call in English with a partner school, with your teacher present'),
            t('Grabar un video explicativo en inglés sobre tu ciudad', 'Ein Erklärvideo auf Englisch über deine Stadt drehen', 'Make an explainer video in English about your city'),
            t('Jugar Kahoot! en clase con un apodo en lugar de tu nombre completo', 'In der Klasse Kahoot! mit einem Spitznamen statt deines vollen Namens spielen', 'Play Kahoot! in class using a nickname instead of your full name'),
            t('Usar el Cambridge Dictionary para comprobar la pronunciación de una palabra', 'Mit dem Cambridge Dictionary die Aussprache eines Wortes überprüfen', 'Use the Cambridge Dictionary to check how a word is pronounced'),
            t('Comparar cómo dos periódicos en inglés cuentan la misma noticia', 'Vergleichen, wie zwei englische Zeitungen über dieselbe Nachricht berichten', 'Compare how two English newspapers report the same story')
        ],
        safety: [
            {
                title: t('Cuidado con los desconocidos', 'Vorsicht bei Fremden', 'Careful with strangers'),
                text: t('Practicar inglés en línea es útil, pero no compartas tu dirección, tu teléfono ni fotos personales con personas que no conoces.', 'Englisch online zu üben ist nützlich, aber teile deine Adresse, Telefonnummer oder persönliche Fotos nicht mit Fremden.', "Practising English online is useful, but don't share your address, phone number or personal photos with people you don't know."),
                question: t('En una app para practicar inglés, un desconocido te pide tu número de teléfono y una foto. ¿Qué haces?', 'In einer App zum Englischüben fragt dich ein Fremder nach deiner Telefonnummer und einem Foto. Was tust du?', 'In an app for practising English, a stranger asks for your phone number and a photo. What do you do?'),
                right: t('No se los doy, bloqueo a la persona y le aviso a un adulto', 'Ich gebe sie nicht heraus, blockiere die Person und sage es einem Erwachsenen', "I don't give them, block the person and tell an adult"),
                wrong: [
                    t('Se los doy para practicar más inglés', 'Ich gebe sie her, um mehr Englisch zu üben', 'I give them so I can practise more English'),
                    t('Le envío solo la foto', 'Ich schicke nur das Foto', 'I send only the photo')
                ]
            },
            {
                title: t('Las canciones tienen derechos de autor', 'Songs sind urheberrechtlich geschützt', 'Songs are copyrighted'),
                text: t('Para tus videos en inglés usa música libre de derechos o con licencia Creative Commons, y menciona al autor.', 'Verwende für deine englischen Videos lizenzfreie Musik oder Musik mit Creative-Commons-Lizenz und nenne den Urheber.', 'For your English videos use royalty-free or Creative Commons music, and credit the artist.'),
                question: t('Quieres poner música de fondo a tu video en inglés. ¿Cuál eliges?', 'Du willst dein englisches Video mit Hintergrundmusik unterlegen. Welche wählst du?', 'You want background music for your English video. Which do you choose?'),
                right: t('Música con licencia Creative Commons, citando al autor', 'Musik mit Creative-Commons-Lizenz, mit Angabe des Urhebers', 'Music with a Creative Commons licence, crediting the artist'),
                wrong: [
                    t('La canción más famosa del momento, descargada de cualquier página', 'Den aktuell bekanntesten Hit, von irgendeiner Seite heruntergeladen', 'The most famous hit right now, downloaded from any site'),
                    t('Una canción grabada de la radio', 'Ein Lied, das du aus dem Radio aufgenommen hast', 'A song recorded off the radio')
                ]
            }
        ]
    },

    tecnologia: {
        examples: [
            t('Leer en la documentación oficial de micro:bit cómo funciona un sensor y guardar tus notas', 'In der offiziellen micro:bit-Dokumentation nachlesen, wie ein Sensor funktioniert, und Notizen speichern', 'Read the official micro:bit documentation on how a sensor works and save your notes'),
            t('Llevar con tu equipo la bitácora del robot en Teams y repartir las tareas', 'Mit deinem Team das Projekttagebuch des Roboters in Teams führen und Aufgaben verteilen', 'Keep the robot project log with your team in Teams and share out the tasks'),
            t('Diseñar en Tinkercad una pieza para tu robot y presentarla a la clase', 'In Tinkercad ein Bauteil für deinen Roboter entwerfen und der Klasse vorstellen', 'Design a part for your robot in Tinkercad and present it to the class'),
            t('Cerrar sesión en MakeCode al terminar en el computador del laboratorio', 'Dich am Laborcomputer nach der Arbeit bei MakeCode abmelden', 'Log out of MakeCode on the lab computer when you finish'),
            t('Encontrar por qué tu robot no sigue la línea probando el programa paso a paso', 'Herausfinden, warum dein Roboter der Linie nicht folgt, indem du das Programm Schritt für Schritt testest', "Find out why your robot doesn't follow the line by testing the program step by step"),
            t('Reflexionar sobre qué trabajos podrían hacer los robots y cuáles no', 'Darüber nachdenken, welche Arbeiten Roboter übernehmen könnten und welche nicht', "Reflect on which jobs robots could do and which they couldn't")
        ],
        safety: [
            {
                title: t('Descarga solo de sitios oficiales', 'Nur von offiziellen Seiten herunterladen', 'Download only from official sites'),
                text: t('Las extensiones, juegos o programas «gratis» de páginas desconocidas pueden traer virus. Instala solo lo que autorice el colegio.', 'Erweiterungen, Spiele oder „kostenlose“ Programme von unbekannten Seiten können Viren enthalten. Installiere nur, was die Schule erlaubt.', 'Extensions, games or “free” programs from unknown sites can contain viruses. Install only what the school allows.'),
                question: t('Una página te ofrece una versión «gratis y premium» de un programa de robótica. ¿Qué haces?', 'Eine Website bietet dir eine „kostenlose Premium-Version“ eines Robotikprogramms an. Was tust du?', 'A website offers you a “free premium version” of a robotics program. What do you do?'),
                right: t('No la descargo y uso solo la versión oficial que indica el profesor', 'Ich lade sie nicht herunter und nutze nur die offizielle Version, die die Lehrkraft nennt', "I don't download it and only use the official version the teacher recommends"),
                wrong: [
                    t('La descargo en el computador del colegio', 'Ich lade sie auf den Schulcomputer herunter', 'I download it onto the school computer'),
                    t('Desactivo el antivirus para instalarla', 'Ich schalte den Virenschutz aus, um sie zu installieren', 'I switch off the antivirus to install it')
                ]
            },
            {
                title: t('Da crédito al código que reutilizas', 'Wiederverwendeten Code kennzeichnen', 'Credit the code you reuse'),
                text: t('Si reutilizas código de otra persona en Scratch o MakeCode, menciónala («remix») y respeta su licencia.', 'Wenn du Code einer anderen Person in Scratch oder MakeCode wiederverwendest, nenne sie („Remix“) und beachte die Lizenz.', "If you reuse someone else's code in Scratch or MakeCode, credit them (“remix”) and respect the licence."),
                question: t('Usaste parte de un proyecto de Scratch de otra persona en el tuyo. ¿Qué es lo correcto?', 'Du hast einen Teil eines fremden Scratch-Projekts in deines übernommen. Was ist richtig?', "You used part of someone else's Scratch project in yours. What is right?"),
                right: t('Publicarlo como «remix» y mencionar al autor original', 'Es als „Remix“ veröffentlichen und den ursprünglichen Autor nennen', 'Publish it as a “remix” and credit the original author'),
                wrong: [
                    t('Decir que todo el código es tuyo', 'Behaupten, der ganze Code sei von dir', 'Say all the code is yours'),
                    t('Borrar el nombre del autor del proyecto', 'Den Namen des Autors aus dem Projekt löschen', "Delete the author's name from the project")
                ]
            }
        ]
    },

    ciencias: {
        examples: [
            t('Buscar en el portal de la NASA datos del ciclo del agua y guardarlos en tu carpeta de Ciencias', 'Auf der Kinderseite der NASA Daten zum Wasserkreislauf suchen und im Naturwissenschaften-Ordner speichern', "Find water-cycle data on NASA's site and save it in your Science folder"),
            t('Escribir con tu grupo el informe de laboratorio en el mismo OneNote', 'Mit deiner Gruppe den Laborbericht im selben OneNote schreiben', 'Write the lab report with your group in the same OneNote'),
            t('Grabar un video corto que explique la fotosíntesis', 'Ein kurzes Erklärvideo zur Fotosynthese drehen', 'Make a short video explaining photosynthesis'),
            t('Fotografiar el experimento sin mostrar las caras de tus compañeros', 'Das Experiment fotografieren, ohne die Gesichter der Mitschüler zu zeigen', "Photograph the experiment without showing your classmates' faces"),
            t('Probar en el simulador PhET un circuito antes de armarlo de verdad', 'Einen Stromkreis im PhET-Simulator testen, bevor du ihn wirklich aufbaust', 'Test a circuit in the PhET simulator before building it for real'),
            t('Revisar si un video viral sobre el «agua con memoria» tiene pruebas científicas', 'Prüfen, ob ein virales Video über „Wasser mit Gedächtnis“ wissenschaftliche Belege hat', 'Check whether a viral video about “water with memory” has scientific evidence')
        ],
        safety: [
            {
                title: t('Datos del experimento sin nombres', 'Versuchsdaten ohne Namen', 'Experiment data without names'),
                text: t('Si haces una encuesta o mides algo a tus compañeros (estatura, pulso), usa números o iniciales en vez de nombres antes de compartir los datos.', 'Wenn du Mitschüler befragst oder etwas misst (Größe, Puls), verwende Nummern oder Initialen statt Namen, bevor du die Daten teilst.', 'If you survey or measure classmates (height, pulse), use numbers or initials instead of names before sharing the data.'),
                question: t('Mediste el pulso de tus compañeros para Ciencias y vas a publicar la tabla. ¿Qué haces?', 'Du hast für Naturwissenschaften den Puls deiner Mitschüler gemessen und willst die Tabelle veröffentlichen. Was tust du?', "You measured your classmates' pulse for Science and are going to publish the table. What do you do?"),
                right: t('Reemplazo los nombres por números o iniciales', 'Ich ersetze die Namen durch Nummern oder Initialen', 'I replace the names with numbers or initials'),
                wrong: [
                    t('Publico los nombres completos y una foto de cada uno', 'Ich veröffentliche volle Namen und ein Foto von allen', "I publish everyone's full names and a photo of each"),
                    t('Agrego también su dirección para que la tabla sea más completa', 'Ich füge auch ihre Adressen hinzu, damit die Tabelle vollständiger ist', 'I add their addresses too so the table is more complete')
                ]
            },
            {
                title: t('Imágenes científicas con crédito', 'Wissenschaftliche Bilder mit Quelle', 'Credit scientific images'),
                text: t('Muchas imágenes de la NASA o de museos se pueden usar libremente, pero siempre debes indicar de dónde vienen.', 'Viele Bilder der NASA oder von Museen dürfen frei genutzt werden, aber du musst immer angeben, woher sie stammen.', 'Many NASA or museum images can be used freely, but you must always say where they come from.'),
                question: t('Usas una foto de la NASA en tu presentación de Ciencias. ¿Qué debes hacer?', 'Du verwendest ein NASA-Foto in deiner Präsentation für Naturwissenschaften. Was musst du tun?', 'You use a NASA photo in your Science presentation. What must you do?'),
                right: t('Escribir debajo «Imagen: NASA» con el enlace', 'Darunter „Bild: NASA“ mit dem Link angeben', 'Write “Image: NASA” with the link underneath'),
                wrong: [
                    t('Nada: si es de la NASA, ya es mía', 'Nichts: NASA-Bilder gehören mir', 'Nothing: NASA images belong to me'),
                    t('Recortarla para que no se note de dónde es', 'Es zuschneiden, damit man die Herkunft nicht erkennt', "Crop it so nobody can tell where it's from")
                ]
            }
        ]
    },

    individuos: {
        examples: [
            t('Buscar en la web del Museo del Oro información sobre los muiscas y guardarla en tu carpeta de Sociales', 'Auf der Website des Goldmuseums Informationen über die Muisca suchen und im Ordner für Gesellschaftslehre speichern', 'Find information on the Muisca on the Gold Museum website and save it in your Individuals & Societies folder'),
            t('Construir con tu grupo una línea de tiempo compartida en PowerPoint Online', 'Mit deiner Gruppe einen gemeinsamen Zeitstrahl in PowerPoint Online erstellen', 'Build a shared timeline with your group in PowerPoint Online'),
            t('Hacer un minidocumental entrevistando a tus abuelos', 'Eine Mini-Doku mit einem Interview mit deinen Großeltern drehen', 'Make a mini-documentary interviewing your grandparents'),
            t('Pedir permiso antes de publicar la entrevista con tu familia', 'Um Erlaubnis bitten, bevor du das Interview mit deiner Familie veröffentlichst', 'Ask permission before publishing the interview with your family'),
            t('Usar Google Earth para ubicar correctamente las regiones de Colombia', 'Mit Google Earth die Regionen Kolumbiens richtig verorten', "Use Google Earth to locate Colombia's regions correctly"),
            t('Comparar cómo dos fuentes cuentan de forma distinta la independencia', 'Vergleichen, wie zwei Quellen die Unabhängigkeit unterschiedlich darstellen', 'Compare how two sources tell the story of independence differently')
        ],
        safety: [
            {
                title: t('Entrevistas con permiso', 'Interviews nur mit Erlaubnis', 'Interviews with permission'),
                text: t('Antes de grabar o publicar una entrevista, explica para qué es y pide permiso. La voz y la imagen de una persona son datos personales.', 'Erkläre vor einem Interview, wofür es ist, und frage um Erlaubnis. Stimme und Bild eines Menschen sind persönliche Daten.', "Before recording or publishing an interview, explain what it's for and ask permission. A person's voice and image are personal data."),
                question: t('Entrevistaste a un vecino para tu trabajo de Sociales. ¿Qué haces antes de subir la entrevista al blog del curso?', 'Du hast für Gesellschaftslehre einen Nachbarn interviewt. Was tust du, bevor du das Interview in den Klassenblog stellst?', 'You interviewed a neighbour for Individuals & Societies. What do you do before uploading the interview to the class blog?'),
                right: t('Le pido permiso y le explico dónde se publicará', 'Ich frage ihn um Erlaubnis und erkläre, wo es veröffentlicht wird', 'I ask their permission and explain where it will be published'),
                wrong: [
                    t('La subo con su dirección para que todos lo conozcan', 'Ich stelle es mit seiner Adresse online, damit ihn alle kennen', 'I upload it with their address so everyone knows them'),
                    t('La subo sin decirle nada', 'Ich stelle es online, ohne ihm etwas zu sagen', 'I upload it without telling them')
                ]
            },
            {
                title: t('Mapas e imágenes históricas con fuente', 'Historische Karten mit Quelle', 'Historical maps with a source'),
                text: t('Los mapas y las fotos históricas de bibliotecas y museos se citan con su archivo de origen; así otros pueden comprobar la información.', 'Historische Karten und Fotos aus Bibliotheken und Museen werden mit ihrem Archiv angegeben – so können andere die Information überprüfen.', 'Historical maps and photos from libraries and museums are cited with their archive, so others can check the information.'),
                question: t('Encuentras un mapa antiguo de la Nueva Granada en la Biblioteca Nacional. ¿Cómo lo usas en tu presentación?', 'Du findest eine alte Karte von Neugranada in der Nationalbibliothek. Wie verwendest du sie in deiner Präsentation?', 'You find an old map of New Granada at the National Library. How do you use it in your presentation?'),
                right: t('Con la fuente: «Biblioteca Nacional de Colombia» y el enlace', 'Mit Quelle: „Kolumbianische Nationalbibliothek“ und Link', 'With the source: “National Library of Colombia” and the link'),
                wrong: [
                    t('Sin fuente, porque es muy antiguo', 'Ohne Quelle, weil sie sehr alt ist', "Without a source, because it's very old"),
                    t('Pongo mi nombre como autor', 'Ich gebe mich als Urheber an', 'I put my name as the author')
                ]
            }
        ]
    },

    matematicas: {
        examples: [
            t('Buscar en Khan Academy ejercicios resueltos de Pitágoras y guardarlos en tu carpeta de Matemáticas', 'Bei Khan Academy gelöste Pythagoras-Aufgaben suchen und im Mathe-Ordner speichern', 'Find worked Pythagoras examples on Khan Academy and save them in your Maths folder'),
            t('Resolver un problema con tu equipo en la pizarra digital compartida', 'Mit deinem Team eine Aufgabe am gemeinsamen digitalen Whiteboard lösen', 'Solve a problem with your team on the shared digital whiteboard'),
            t('Construir en GeoGebra un modelo del teorema de Pitágoras y presentarlo', 'In GeoGebra ein Modell zum Satz des Pythagoras bauen und vorstellen', 'Build a model of the Pythagorean theorem in GeoGebra and present it'),
            t('Hacer una encuesta para estadística sin pedir nombres ni datos personales', 'Für Statistik eine Umfrage ohne Namen oder persönliche Daten durchführen', 'Run a statistics survey without asking for names or personal details'),
            t('Encontrar el error de una fórmula en Excel revisando celda por celda', 'Einen Formelfehler in Excel finden, indem du Zelle für Zelle prüfst', 'Find a formula error in Excel by checking cell by cell'),
            t('Descubrir cómo una gráfica con el eje recortado exagera los resultados', 'Erkennen, wie ein Diagramm mit abgeschnittener Achse Ergebnisse übertreibt', 'Spot how a chart with a cut-off axis exaggerates the results')
        ],
        safety: [
            {
                title: t('Encuestas anónimas', 'Anonyme Umfragen', 'Anonymous surveys'),
                text: t('En tus encuestas de estadística pregunta solo lo necesario y no pidas nombres, direcciones ni teléfonos.', 'Frag in Statistik-Umfragen nur das Nötige und keine Namen, Adressen oder Telefonnummern.', "In statistics surveys ask only what you need and don't ask for names, addresses or phone numbers."),
                question: t('Haces una encuesta en línea sobre el tiempo de estudio del curso. ¿Qué preguntas incluyes?', 'Du machst eine Online-Umfrage zur Lernzeit in der Klasse. Welche Fragen stellst du?', "You're running an online survey on your class's study time. Which questions do you include?"),
                right: t('Solo las horas de estudio y el curso, sin nombres', 'Nur die Lernstunden und die Klasse, ohne Namen', 'Only study hours and class, without names'),
                wrong: [
                    t('Nombre completo, dirección y teléfono de cada uno', 'Vollständiger Name, Adresse und Telefonnummer', 'Full name, address and phone number'),
                    t('Una foto de cada persona', 'Ein Foto von jeder Person', 'A photo of each person')
                ]
            },
            {
                title: t('Revisa lo que dan las calculadoras y la IA', 'Rechner und KI überprüfen', 'Check calculators and AI'),
                text: t('Una calculadora o una IA pueden dar un resultado equivocado si los datos están mal. Estima primero y revisa el procedimiento.', 'Ein Rechner oder eine KI kann falsche Ergebnisse liefern, wenn die Eingaben falsch sind. Schätze zuerst und überprüfe den Rechenweg.', 'A calculator or AI can give a wrong result if the input is wrong. Estimate first and check the working.'),
                question: t('Una app resuelve un problema de Matemáticas y da un resultado muy raro. ¿Qué haces?', 'Eine App löst eine Matheaufgabe und gibt ein sehr seltsames Ergebnis aus. Was tust du?', 'An app solves a maths problem and gives a very odd result. What do you do?'),
                right: t('Estimo el resultado, reviso los datos que escribí y compruebo el procedimiento', 'Ich schätze das Ergebnis, prüfe meine Eingaben und kontrolliere den Rechenweg', 'I estimate the result, check what I typed and verify the working'),
                wrong: [
                    t('Lo copio, porque las apps nunca se equivocan', 'Ich schreibe es ab, Apps irren sich nie', 'I copy it, apps are never wrong'),
                    t('Entrego solo el resultado sin procedimiento', 'Ich gebe nur das Ergebnis ohne Rechenweg ab', 'I hand in just the answer without working')
                ]
            }
        ]
    },

    musica: {
        examples: [
            t('Buscar la biografía de Beethoven en la web del Beethoven-Haus y guardarla en tu carpeta de Música', 'Auf der Website des Beethoven-Hauses seine Biografie suchen und im Musik-Ordner speichern', "Look up Beethoven's biography on the Beethoven-Haus website and save it in your Music folder"),
            t('Componer una canción con tu grupo en Soundtrap, cada uno con su pista', 'Mit deiner Gruppe in Soundtrap einen Song komponieren, jeder mit seiner eigenen Spur', 'Compose a song with your group in Soundtrap, each with their own track'),
            t('Grabar y editar en Audacity tu propia base rítmica', 'In Audacity deinen eigenen Rhythmus aufnehmen und schneiden', 'Record and edit your own beat in Audacity'),
            t('Usar audífonos a volumen moderado para cuidar tus oídos', 'Kopfhörer in mäßiger Lautstärke nutzen, um deine Ohren zu schützen', 'Use headphones at a moderate volume to protect your ears'),
            t('Corregir el tempo cuando la pista de batería se desfasa del resto', 'Das Tempo korrigieren, wenn die Schlagzeugspur nicht zum Rest passt', 'Fix the tempo when the drum track drifts from the rest'),
            t('Analizar cómo la música de un anuncio busca provocar emociones', 'Analysieren, wie die Musik in einer Werbung Gefühle auslösen will', 'Analyse how the music in an advert tries to trigger emotions')
        ],
        safety: [
            {
                title: t('La música tiene autor', 'Musik hat Urheber', 'Music has an author'),
                text: t('Usar o subir canciones de otros sin permiso viola los derechos de autor. Busca música con licencia Creative Commons o crea la tuya.', 'Fremde Songs ohne Erlaubnis zu nutzen oder hochzuladen, verletzt das Urheberrecht. Nutze Musik mit Creative-Commons-Lizenz oder mach deine eigene.', "Using or uploading other people's songs without permission breaks copyright. Look for Creative Commons music or make your own."),
                question: t('Quieres subir un cover de una canción famosa al canal del colegio. ¿Qué debes saber?', 'Du willst ein Cover eines bekannten Songs auf den Schulkanal hochladen. Was solltest du wissen?', 'You want to upload a cover of a famous song to the school channel. What should you know?'),
                right: t('La canción tiene derechos de autor: necesito permiso o una licencia que lo permita', 'Der Song ist urheberrechtlich geschützt: Ich brauche eine Erlaubnis oder eine passende Lizenz', 'The song is copyrighted: I need permission or a licence that allows it'),
                wrong: [
                    t('Si la canto yo, ya es mía', 'Wenn ich ihn singe, gehört er mir', "If I sing it, it's mine"),
                    t('Solo importa que suene bien', 'Hauptsache, es klingt gut', 'All that matters is that it sounds good')
                ]
            },
            {
                title: t('Cuida tus oídos', 'Schütze deine Ohren', 'Protect your ears'),
                text: t('Escuchar con audífonos a todo volumen durante mucho tiempo daña la audición. Usa la regla 60/60: máximo 60 % de volumen durante 60 minutos.', 'Lange und sehr laut über Kopfhörer zu hören, schädigt das Gehör. Nutze die 60/60-Regel: höchstens 60 % Lautstärke für 60 Minuten.', 'Listening on headphones at full volume for a long time damages your hearing. Use the 60/60 rule: at most 60% volume for 60 minutes.'),
                question: t('Editas tu canción con audífonos durante toda la clase de Música. ¿Qué haces para cuidar tus oídos?', 'Du bearbeitest deinen Song die ganze Musikstunde über mit Kopfhörern. Wie schützt du deine Ohren?', 'You edit your song on headphones for the whole Music lesson. How do you protect your ears?'),
                right: t('Volumen moderado (máximo 60 %) y pausas', 'Mäßige Lautstärke (höchstens 60 %) und Pausen', 'Moderate volume (60% max) and breaks'),
                wrong: [
                    t('Volumen al máximo para escuchar cada detalle', 'Volle Lautstärke, um jedes Detail zu hören', 'Full volume to hear every detail'),
                    t('Dormir con los audífonos puestos', 'Mit Kopfhörern schlafen', 'Sleep with headphones on')
                ]
            }
        ]
    },

    arte: {
        examples: [
            t('Buscar en Google Arts & Culture obras de Botero y guardarlas con su fuente en tu carpeta de Arte', 'In Google Arts & Culture Werke von Botero suchen und mit Quelle im Kunst-Ordner speichern', "Find Botero's works on Google Arts & Culture and save them with their source in your Art folder"),
            t('Montar con el curso una galería virtual en Padlet y comentar con respeto', 'Mit der Klasse eine virtuelle Galerie in Padlet erstellen und respektvoll kommentieren', 'Set up a virtual gallery on Padlet with your class and comment respectfully'),
            t('Crear en Canva un collage digital inspirado en Botero', 'In Canva eine digitale Collage nach Botero gestalten', 'Create a Botero-inspired digital collage in Canva'),
            t('Usar en tu collage solo imágenes propias o con licencia libre', 'In deiner Collage nur eigene oder frei lizenzierte Bilder verwenden', 'Use only your own or freely licensed images in your collage'),
            t('Ajustar la resolución para que tu imagen no salga pixelada al imprimirla', 'Die Auflösung anpassen, damit dein Bild beim Drucken nicht verpixelt', "Adjust the resolution so your image doesn't print pixelated"),
            t('Reflexionar si una imagen hecha con IA es arte y quién es su autor', 'Darüber nachdenken, ob ein KI-Bild Kunst ist und wer der Urheber ist', 'Reflect on whether an AI-made image is art and who its author is')
        ],
        safety: [
            {
                title: t('Las imágenes tienen autor', 'Bilder haben Urheber', 'Images have authors'),
                text: t('Una obra no es libre solo porque esté en internet. Usa imágenes Creative Commons, de dominio público o tuyas, y da el crédito.', 'Ein Bild ist nicht frei, nur weil es im Internet steht. Nutze Creative-Commons-, gemeinfreie oder eigene Bilder und nenne den Urheber.', "An image isn't free just because it's online. Use Creative Commons, public-domain or your own images, and give credit."),
                question: t('Para tu collage encuentras una ilustración preciosa en una red social. ¿Qué haces?', 'Für deine Collage findest du eine tolle Illustration in einem sozialen Netzwerk. Was tust du?', 'For your collage you find a beautiful illustration on social media. What do you do?'),
                right: t('Reviso su licencia o pido permiso al artista, y doy el crédito', 'Ich prüfe die Lizenz oder frage die Künstlerin oder den Künstler und nenne sie', 'I check its licence or ask the artist, and give credit'),
                wrong: [
                    t('La uso, porque si está en internet es gratis', 'Ich nutze sie, weil alles im Internet kostenlos ist', 'I use it because anything online is free'),
                    t('Le quito la firma del artista', 'Ich entferne die Signatur', "I remove the artist's signature")
                ]
            },
            {
                title: t('Tu obra, tus datos', 'Dein Werk, deine Daten', 'Your work, your data'),
                text: t('Al publicar tu arte, firma con tu nombre de pila o un seudónimo y no muestres tu uniforme, tu dirección ni datos que te ubiquen.', 'Signiere veröffentlichte Kunst mit deinem Vornamen oder einem Künstlernamen und zeige keine Schuluniform, Adresse oder Daten, die dich auffindbar machen.', "When publishing your art, sign with your first name or a pseudonym and don't show your uniform, address or anything that locates you."),
                question: t('Vas a publicar tu obra en una galería en línea. ¿Cómo la firmas?', 'Du veröffentlichst dein Werk in einer Online-Galerie. Wie signierst du es?', "You're publishing your artwork in an online gallery. How do you sign it?"),
                right: t('Con mi nombre de pila o un seudónimo, sin datos personales', 'Mit meinem Vornamen oder einem Künstlernamen, ohne persönliche Daten', 'With my first name or a pseudonym, no personal details'),
                wrong: [
                    t('Con mi nombre completo, mi colegio y mi dirección', 'Mit vollem Namen, Schule und Adresse', 'With my full name, school and address'),
                    t('Con mi número de teléfono para que me contacten', 'Mit meiner Telefonnummer, damit man mich erreicht', 'With my phone number so people can contact me')
                ]
            }
        ]
    },

    mint_sach: {
        examples: [
            t('Buscar en una enciclopedia infantil cómo funciona un panel solar y guardar tus notas', 'Im Kinderlexikon nachlesen, wie eine Solarzelle funktioniert, und Notizen speichern', "Look up how a solar panel works in a children's encyclopedia and save your notes"),
            t('Llevar con tu grupo el diario de investigación en Padlet', 'Mit deiner Gruppe das Forschertagebuch in Padlet führen', "Keep your group's research journal on Padlet"),
            t('Grabar un video del experimento del carro solar y presentarlo', 'Ein Video vom Solarauto-Experiment drehen und vorstellen', 'Film the solar car experiment and present it'),
            t('Usar la cuenta del colegio en las apps de MINT y cerrar sesión al terminar', 'In MINT-Apps das Schulkonto nutzen und dich am Ende abmelden', 'Use your school account in MINT apps and log out when you finish'),
            t('Programar el Calliope mini para medir la luz y revisar por qué no arranca el carro', 'Den Calliope mini zum Lichtmessen programmieren und prüfen, warum das Auto nicht startet', "Program the Calliope mini to measure light and check why the car won't start"),
            t('Comprobar si un video de «experimentos fáciles» es ciencia o publicidad', 'Prüfen, ob ein Video mit „einfachen Experimenten“ Wissenschaft oder Werbung ist', 'Check whether an “easy experiments” video is science or advertising')
        ],
        safety: [
            {
                title: t('Experimentos con supervisión', 'Experimente nur unter Aufsicht', 'Experiments with supervision'),
                text: t('No repitas en casa experimentos de videos de internet sin un adulto: algunos son peligrosos o falsos.', 'Mach Experimente aus Internetvideos nie ohne Erwachsene nach: Manche sind gefährlich oder gefälscht.', 'Never repeat experiments from online videos at home without an adult: some are dangerous or fake.'),
                question: t('Ves un video viral de un experimento con fuego y quieres repetirlo para tu proyecto MINT. ¿Qué haces?', 'Du siehst ein virales Video mit einem Feuer-Experiment und willst es für dein MINT-Projekt nachmachen. Was tust du?', 'You see a viral video of a fire experiment and want to repeat it for your MINT project. What do you do?'),
                right: t('Le pregunto a mi profesor y solo lo hago con supervisión de un adulto', 'Ich frage meine Lehrkraft und mache es nur unter Aufsicht eines Erwachsenen', 'I ask my teacher and only do it with an adult supervising'),
                wrong: [
                    t('Lo hago solo en casa para grabarlo', 'Ich mache es allein zu Hause und filme es', 'I do it alone at home to film it'),
                    t('Lo hago más grande para que se vea mejor', 'Ich mache es größer, damit es besser aussieht', 'I make it bigger so it looks better')
                ]
            },
            {
                title: t('Cuida el planeta también en lo digital', 'Auch digital die Umwelt schützen', 'Protect the planet digitally too'),
                text: t('Los aparatos usan energía y sus pilas contaminan. Apágalos al terminar y lleva las pilas usadas a un punto de reciclaje.', 'Geräte verbrauchen Energie und Batterien belasten die Umwelt. Schalte sie nach der Arbeit aus und bring alte Batterien zur Sammelstelle.', 'Devices use energy and batteries pollute. Switch them off when you finish and take used batteries to a recycling point.'),
                question: t('Terminaste tu proyecto con el Calliope mini y las pilas ya no sirven. ¿Qué haces?', 'Dein Projekt mit dem Calliope mini ist fertig und die Batterien sind leer. Was tust du?', 'Your Calliope mini project is finished and the batteries are dead. What do you do?'),
                right: t('Llevo las pilas a un punto de reciclaje y apago los aparatos', 'Ich bringe die Batterien zur Sammelstelle und schalte die Geräte aus', 'I take the batteries to a recycling point and switch the devices off'),
                wrong: [
                    t('Las boto a la basura normal', 'Ich werfe sie in den Hausmüll', 'I throw them in the normal bin'),
                    t('Las dejo dentro del aparato encendido', 'Ich lasse sie im eingeschalteten Gerät', 'I leave them in the device switched on')
                ]
            }
        ]
    },

    // Deportes: natación, polimotor, voleibol, baloncesto y atletismo
    deportes: {
        examples: [
            t('Buscar en la página oficial de World Aquatics las reglas del estilo libre y guardarlas en tu carpeta de Deportes', 'Auf der offiziellen Website von World Aquatics die Regeln des Freistilschwimmens suchen und im Sport-Ordner speichern', 'Look up the freestyle rules on the official World Aquatics website and save them in your Sports folder'),
            t('Planear con tu equipo de voleibol, en un chat de Teams, la rotación para el próximo partido', 'Mit deinem Volleyballteam im Teams-Chat die Rotation für das nächste Spiel planen', 'Plan the rotation for the next match with your volleyball team in a Teams chat'),
            t('Grabar y editar un video corto que explique el lanzamiento en suspensión del baloncesto', 'Ein kurzes Video aufnehmen und schneiden, das den Sprungwurf im Basketball erklärt', 'Record and edit a short video explaining the basketball jump shot'),
            t('Usar tu reloj deportivo al entrenar atletismo sin publicar tu ubicación ni tu ruta', 'Deine Sportuhr beim Leichtathletiktraining nutzen, ohne deinen Standort oder deine Route zu veröffentlichen', 'Use your sports watch for athletics training without publishing your location or your route'),
            t('Revisar por qué los tiempos del cronómetro digital del circuito de polimotor no quedaron en la hoja de cálculo y corregirlo', 'Prüfen, warum die Zeiten der digitalen Stoppuhr vom Polimotor-Parcours nicht in der Tabelle gelandet sind, und es beheben', 'Work out why the digital stopwatch times from the polymotor circuit did not reach the spreadsheet, and fix it'),
            t('Analizar cómo los anuncios de bebidas energéticas usan a deportistas famosos para venderte', 'Analysieren, wie Werbung für Energydrinks berühmte Sportler nutzt, um dir etwas zu verkaufen', 'Analyse how energy-drink adverts use famous athletes to sell to you')
        ],
        safety: [
            {
                title: t('En la piscina, la privacidad primero', 'Im Schwimmbad geht Privatsphäre vor', 'At the pool, privacy comes first'),
                text: t('Grabar o fotografiar a otros en la piscina o en los vestidores sin permiso viola su privacidad. Pide permiso al profesor y a tus compañeros, y nunca grabes en los vestidores.', 'Andere im Schwimmbad oder in der Umkleide ohne Erlaubnis zu filmen oder zu fotografieren, verletzt ihre Privatsphäre. Frag deine Lehrkraft und deine Mitschüler um Erlaubnis und filme nie in der Umkleide.', 'Filming or photographing others at the pool or in the changing rooms without permission violates their privacy. Ask your teacher and classmates first, and never film in the changing rooms.'),
                question: t('Quieres grabar a tus compañeros en la clase de natación para un video de Deportes. ¿Qué haces?', 'Du willst deine Mitschüler im Schwimmunterricht für ein Sportvideo filmen. Was tust du?', 'You want to film your classmates in swimming class for a Sports video. What do you do?'),
                right: t('Pido permiso al profesor y a mis compañeros antes de grabar, y nunca grabo en los vestidores', 'Ich frage vorher die Lehrkraft und meine Mitschüler um Erlaubnis und filme nie in der Umkleide', 'I ask the teacher and my classmates first, and I never film in the changing rooms'),
                wrong: [
                    t('Grabo sin preguntar, porque es una clase', 'Ich filme ohne zu fragen, es ist ja Unterricht', 'I film without asking, because it is a class'),
                    t('Lo subo a mis redes con el nombre de cada uno', 'Ich lade es mit allen Namen in meine sozialen Netzwerke hoch', 'I post it on my social media with everyone’s name')
                ]
            },
            {
                title: t('Tu salud va primero', 'Deine Gesundheit geht vor', 'Your health comes first'),
                text: t('Las apps y los relojes deportivos ayudan, pero no reemplazan a tu profesor ni a tu cuerpo: descansa, hidrátate y detente si sientes dolor.', 'Apps und Sportuhren helfen, ersetzen aber weder deine Lehrkraft noch deinen Körper: Ruh dich aus, trink genug und hör auf, wenn es wehtut.', 'Apps and sports watches help, but they do not replace your teacher or your body: rest, drink water and stop if it hurts.'),
                question: t('Una app de entrenamiento te reta a correr todos los días sin descanso para subir en su ranking. ¿Qué haces?', 'Eine Trainings-App fordert dich heraus, jeden Tag ohne Pause zu laufen, um im Ranking aufzusteigen. Was tust du?', 'A training app challenges you to run every day without rest to climb its ranking. What do you do?'),
                right: t('Sigo el plan de mi profesor, con descanso e hidratación, y no entreno con dolor', 'Ich folge dem Plan meiner Lehrkraft, mit Pausen und genug Trinken, und trainiere nicht mit Schmerzen', 'I follow my teacher’s plan, with rest and water, and I do not train in pain'),
                wrong: [
                    t('Entreno todos los días aunque me duela, para subir en el ranking', 'Ich trainiere jeden Tag, auch wenn es wehtut, um im Ranking aufzusteigen', 'I train every day even if it hurts, to climb the ranking'),
                    t('Le doy a la app todos mis datos de salud para que decida por mí', 'Ich gebe der App alle meine Gesundheitsdaten, damit sie für mich entscheidet', 'I give the app all my health data so it decides for me')
                ]
            }
        ]
    }
};

const MEDIENPASS_ABOUT = t(
    'El Medienpass es un cuaderno de retos centrado en el estudiante, transversal (sirve en todas las materias) e híbrido (impreso y digital).',
    'Der Medienpass ist ein schülerzentriertes Heft mit Challenges, fächerübergreifend (für alle Fächer) und hybrid (gedruckt und digital).',
    'The Medienpass is a student-centred challenge workbook, cross-curricular (for every subject) and hybrid (print and digital).');
const VALIDATION_ABOUT = t(
    'Ciclo del Medienpass: haces el reto, recibes estrellas como recompensa y tu profesor revisa y valida el trabajo.',
    'Der Medienpass-Zyklus: Du machst die Challenge, bekommst Sterne als Belohnung und deine Lehrkraft prüft und bestätigt die Arbeit.',
    'The Medienpass cycle: you do the challenge, earn stars as a reward and your teacher reviews and validates the work.');

// Coloca la respuesta correcta en la posición `pos` (0-2)
function placeOptions(right, wrong, pos) {
    const options = wrong.map(w => ({ ...w, correct: false }));
    options.splice(pos, 0, { ...right, correct: true });
    return options;
}

function subjectNames(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : t(subjectId, subjectId, subjectId);
}

// Ejemplos y casos de una materia; una materia nueva usa los genéricos con su nombre
function reto0PackOf(subjectId) {
    if (reto0Packs[subjectId]) return reto0Packs[subjectId];
    const custom = subjects.find(s => s.id === subjectId && s.custom);
    return custom ? require('./data_generic_subject').genericReto0Pack(custom.name) : reto0Packs.tecnologia;
}

// Caso de seguridad sobre inteligencia artificial en la materia (pregunta 10 de la evaluación y
// tercera tarjeta de la diapositiva de seguridad). Usa la tarea de la materia (data_subject_packs.js).
function aiSafety(subjectId) {
    const n = subjectNames(subjectId);
    const task = require('./data_subject_packs').getSubjectPack(subjectId);
    return {
        ai: true,
        title: t('Usa la IA con responsabilidad', 'KI verantwortungsvoll nutzen', 'Use AI responsibly'),
        text: t(`Un chatbot de inteligencia artificial puede ayudarte en ${n.es}, pero puede equivocarse o inventar datos. Comprueba lo que dice, no le des datos personales y cuenta que lo usaste.`,
            `Ein KI-Chatbot kann dir in ${n.de} helfen, aber er kann sich irren oder Fakten erfinden. Prüfe, was er sagt, gib ihm keine persönlichen Daten und sag, dass du ihn genutzt hast.`,
            `An artificial intelligence chatbot can help you in ${n.en}, but it can be wrong or make things up. Check what it says, don't give it personal details and say that you used it.`),
        question: t(`Para ${task.es.task} quieres usar un chatbot de inteligencia artificial. ¿Qué es lo correcto?`,
            `Für ${task.de.task} möchtest du einen KI-Chatbot nutzen. Was ist richtig?`,
            `You want to use an artificial intelligence chatbot for ${task.en.task}. What is the right thing to do?`),
        right: t('Usarlo como apoyo, comprobar lo que dice y contarle a mi profesor que lo usé', 'Ihn als Hilfe nutzen, seine Antworten prüfen und meiner Lehrkraft sagen, dass ich ihn genutzt habe', 'Use it as support, check what it says and tell my teacher that I used it'),
        wrong: [
            t('Copiar su respuesta y entregarla como mía', 'Seine Antwort kopieren und als meine abgeben', 'Copy its answer and hand it in as mine'),
            t('Escribirle mi nombre completo y mi dirección para que me ayude mejor', 'Ihm meinen vollen Namen und meine Adresse schreiben, damit er besser hilft', 'Type in my full name and address so it helps me better')
        ]
    };
}

// Las 10 preguntas de la evaluación del Reto 0 de una materia
function buildReto0Questions(subjectId) {
    const pack = reto0PackOf(subjectId);
    const n = subjectNames(subjectId);
    const id = q => `r0_${subjectId}_q${q}`;
    const questions = [];

    questions.push({
        id: id(1), quiz: true, type: 'radio_group',
        label: t(`¿Qué es el Medienpass en tu clase de ${n.es}?`, `Was ist der Medienpass in deinem Fach ${n.de}?`, `What is the Medienpass in your ${n.en} class?`),
        options: placeOptions(
            t(`Un cuaderno de retos para aprender a usar los medios digitales con criterio, también en ${n.es}`, `Ein Heft mit Challenges, um digitale Medien kompetent zu nutzen – auch in ${n.de}`, `A challenge workbook for learning to use digital media wisely, in ${n.en} too`),
            [t(`Un examen final de ${n.es} sin computador`, `Eine Abschlussprüfung in ${n.de} ohne Computer`, `A final ${n.en} exam without a computer`),
                t('Un videojuego para el recreo', 'Ein Videospiel für die Pause', 'A video game for break time')],
            1),
        practice_explanation: MEDIENPASS_ABOUT
    });

    questions.push({
        id: id(2), quiz: true, type: 'radio_group',
        label: t(`Terminaste un reto de ${n.es}. ¿Qué pasa después?`, `Du hast eine Challenge in ${n.de} abgeschlossen. Was passiert danach?`, `You finished a ${n.en} challenge. What happens next?`),
        options: placeOptions(
            t(`Tu profesor o profesora de ${n.es} revisa y valida tu trabajo, y ganas estrellas`, `Deine Lehrkraft in ${n.de} überprüft und bestätigt deine Arbeit, und du bekommst Sterne`, `Your ${n.en} teacher reviews and validates your work, and you earn stars`),
            [t('El reto se borra automáticamente', 'Die Challenge löscht sich automatisch', 'The challenge deletes itself'),
                t('Nadie lo revisa: basta con abrirlo', 'Niemand prüft sie, es reicht, sie zu öffnen', 'Nobody checks it; opening it is enough')],
            0),
        practice_explanation: VALIDATION_ABOUT
    });

    // P3-P8: una por competencia KMK; distractores = ejemplos de otras dos competencias
    KMK_COMPETENCES.forEach((comp, i) => {
        questions.push({
            id: id(3 + i), quiz: true, type: 'radio_group',
            label: t(`En ${n.es}, ¿qué actividad corresponde a la competencia KMK «${comp.name.es}»?`,
                `Welche Aktivität in ${n.de} gehört zur KMK-Kompetenz „${comp.name.de}“?`,
                `In ${n.en}, which activity belongs to the KMK competence “${comp.name.en}”?`),
            options: placeOptions(pack.examples[i], [pack.examples[(i + 2) % 6], pack.examples[(i + 4) % 6]], i % 3),
            practice_explanation: t(`${comp.icon} ${comp.name.es}: ${pack.examples[i].es}.`, `${comp.icon} ${comp.name.de}: ${pack.examples[i].de}.`, `${comp.icon} ${comp.name.en}: ${pack.examples[i].en}.`)
        });
    });

    // P9: seguridad o derechos en la materia; P10: uso responsable de la inteligencia artificial
    [pack.safety[0], aiSafety(subjectId)].forEach((s, i) => {
        questions.push({
            id: id(9 + i), quiz: true, type: 'radio_group',
            ...(s.ai ? { ai: true } : {}),
            label: s.question,
            options: placeOptions(s.right, s.wrong, i === 0 ? 2 : 1),
            practice_explanation: s.text
        });
    });

    return questions;
}

// Contenido de las diapositivas 4 y 5 del panel 4 (lo que pregunta la evaluación)
function getReto0Study(subjectId) {
    const pack = reto0PackOf(subjectId);
    return {
        subjectName: subjectNames(subjectId),
        examples: KMK_COMPETENCES.map((comp, i) => ({ icon: comp.icon, competence: comp.name, text: pack.examples[i], ai: comp.ai })),
        // Los dos casos de la materia y el de la IA (el que pregunta la evaluación en P10)
        safety: [...pack.safety, aiSafety(subjectId)].map(s => ({ title: s.title, text: s.text }))
    };
}

// ═══ Reto 0 sencillo (K3, K4 y K5) ═══
// Pedido (13 nov 2026): Klasse 4 con terminología sencilla y, en Tecnología, herramientas como Word y
// Microsoft 365. Se hizo para K3, K4 y K5. Mismas preguntas, mismos identificadores y la respuesta
// correcta en el mismo lugar: solo cambian las palabras (frases cortas) y los ejemplos de cada materia.
const isSimpleGrade = grade => { const g = parseInt(grade, 10); return g >= 3 && g <= 5; };

const SIMPLE_COMPETENCES = [
    { name: t('Buscar y guardar', 'Suchen und speichern', 'Find and save'),
        ai: t('Si le preguntas algo a una inteligencia artificial, revisa su respuesta: a veces se equivoca.', 'Wenn du eine künstliche Intelligenz etwas fragst, prüfe die Antwort: Manchmal irrt sie sich.', 'If you ask an artificial intelligence something, check its answer: sometimes it is wrong.') },
    { name: t('Hablar y trabajar con otros', 'Sprechen und mit anderen arbeiten', 'Talk and work with others'),
        ai: t('Hay fotos y videos falsos hechos con IA. No los compartas y trata bien a todos.', 'Es gibt falsche Fotos und Videos, die mit KI gemacht sind. Teile sie nicht und sei zu allen freundlich.', 'There are fake photos and videos made with AI. Don’t share them and be kind to everyone.') },
    { name: t('Crear y mostrar', 'Gestalten und zeigen', 'Create and show'),
        ai: t('Si la IA te ayuda a crear algo, dilo y revisa lo que hizo.', 'Wenn dir eine KI beim Gestalten hilft, sag es und prüfe, was sie gemacht hat.', 'If AI helps you create something, say so and check what it made.') },
    { name: t('Cuidarme en internet', 'Im Internet auf mich aufpassen', 'Stay safe online'),
        ai: t('No le des a una IA tu nombre completo, tu dirección, tus fotos ni tus contraseñas.', 'Gib einer KI nicht deinen vollen Namen, deine Adresse, deine Fotos oder Passwörter.', 'Don’t give an AI your full name, address, photos or passwords.') },
    { name: t('Resolver problemas', 'Probleme lösen', 'Solve problems'),
        ai: t('Pídele a la IA que te explique paso a paso; no que haga la tarea por ti.', 'Bitte die KI, dir Schritt für Schritt zu erklären, nicht, deine Aufgabe zu machen.', 'Ask AI to explain step by step, not to do your homework for you.') },
    { name: t('Pensar sobre lo que veo', 'Über das nachdenken, was ich sehe', 'Think about what I see'),
        ai: t('Las apps y la IA eligen qué te muestran. Pregúntate por qué ves eso.', 'Apps und KI wählen aus, was sie dir zeigen. Frag dich, warum du das siehst.', 'Apps and AI choose what they show you. Ask yourself why you see it.') }
];

// examples[i]: actividad sencilla de la materia para la competencia i+1
const SIMPLE_EXAMPLES = {
    aleman: [
        t('Buscar un cuento de hadas en la biblioteca digital y guardarlo en OneDrive', 'Ein Märchen in der digitalen Bibliothek suchen und in OneDrive speichern', 'Find a fairy tale in the digital library and save it in OneDrive'),
        t('Escribir con mi grupo un cuento en el mismo Word', 'Mit meiner Gruppe eine Geschichte im selben Word schreiben', 'Write a story with my group in the same Word file'),
        t('Grabar mi voz leyendo un poema en alemán', 'Meine Stimme aufnehmen, wenn ich ein deutsches Gedicht lese', 'Record my voice reading a German poem'),
        t('Practicar en Anton con mi cuenta del colegio', 'Mit meinem Schulkonto in Anton üben', 'Practise in Anton with my school account'),
        t('Usar un diccionario en línea cuando no sé una palabra', 'Ein Online-Wörterbuch nutzen, wenn ich ein Wort nicht kenne', 'Use an online dictionary when I don’t know a word'),
        t('Comparar un cuento del libro con su película', 'Ein Märchen aus dem Buch mit seinem Film vergleichen', 'Compare a fairy tale in the book with its film')
    ],
    espanol: [
        t('Buscar una fábula en la biblioteca digital del colegio', 'Eine Fabel in der digitalen Schulbibliothek suchen', 'Find a fable in the school’s digital library'),
        t('Escribir con mi grupo una fábula en el mismo Word', 'Mit meiner Gruppe eine Fabel im selben Word schreiben', 'Write a fable with my group in the same Word file'),
        t('Hacer un libro con dibujos en Book Creator', 'In Book Creator ein Buch mit Bildern machen', 'Make a book with drawings in Book Creator'),
        t('Entrar a mi cuenta sin decirle a nadie mi contraseña', 'In mein Konto gehen, ohne jemandem mein Passwort zu sagen', 'Sign in without telling anyone my password'),
        t('Usar el corrector de Word para revisar mi ortografía', 'Mit der Rechtschreibprüfung von Word meine Schreibweise prüfen', 'Use the Word spell checker to check my spelling'),
        t('Pensar si un video de cuentos dice la verdad', 'Überlegen, ob ein Geschichtenvideo die Wahrheit sagt', 'Think about whether a story video tells the truth')
    ],
    ingles: [
        t('Buscar fotos de animales de la granja y guardarlas en mi carpeta', 'Fotos von Bauernhoftieren suchen und in meinem Ordner speichern', 'Find photos of farm animals and save them in my folder'),
        t('Hacer con mi grupo una presentación en PowerPoint', 'Mit meiner Gruppe eine PowerPoint-Präsentation machen', 'Make a PowerPoint presentation with my group'),
        t('Grabar un video corto presentándome en inglés', 'Ein kurzes Video aufnehmen, in dem ich mich auf Englisch vorstelle', 'Record a short video introducing myself in English'),
        t('Practicar palabras en Quizlet sin poner mi nombre completo', 'In Quizlet Wörter üben, ohne meinen vollen Namen anzugeben', 'Practise words in Quizlet without giving my full name'),
        t('Escuchar cómo se dice una palabra en un diccionario en línea', 'In einem Online-Wörterbuch hören, wie man ein Wort ausspricht', 'Listen to how a word is said in an online dictionary'),
        t('Pensar por qué una canción en inglés se volvió famosa', 'Überlegen, warum ein englisches Lied berühmt wurde', 'Think about why an English song became famous')
    ],
    tecnologia: [
        t('Guardar mi trabajo en OneDrive con un nombre claro', 'Meine Arbeit mit einem klaren Namen in OneDrive speichern', 'Save my work in OneDrive with a clear name'),
        t('Escribirle a mi profesor en Teams con respeto', 'Meiner Lehrkraft in Teams respektvoll schreiben', 'Write to my teacher respectfully in Teams'),
        t('Hacer una presentación en PowerPoint o un texto en Word', 'Eine Präsentation in PowerPoint oder einen Text in Word machen', 'Make a PowerPoint presentation or a Word text'),
        t('Cerrar sesión en Microsoft 365 al terminar', 'Mich nach der Arbeit bei Microsoft 365 abmelden', 'Sign out of Microsoft 365 when I finish'),
        t('Ordenar los bloques en codeSpark hasta que el juego funcione', 'Die Blöcke in codeSpark ordnen, bis das Spiel funktioniert', 'Put the blocks in order in codeSpark until the game works'),
        t('Anotar en OneNote qué aprendí y qué me costó', 'In OneNote notieren, was ich gelernt habe und was schwer war', 'Write in OneNote what I learned and what was hard')
    ],
    ciencias: [
        t('Buscar cómo llueve en una página para niños y guardarlo', 'Auf einer Kinderseite suchen, wie Regen entsteht, und es speichern', 'Look up how rain forms on a kids’ page and save it'),
        t('Anotar con mi grupo en OneNote lo que vimos en el experimento', 'Mit meiner Gruppe in OneNote notieren, was wir beim Experiment gesehen haben', 'Write down with my group in OneNote what we saw in the experiment'),
        t('Hacer un cartel del ciclo del agua en PowerPoint', 'Ein Plakat zum Wasserkreislauf in PowerPoint machen', 'Make a water cycle poster in PowerPoint'),
        t('Pedir permiso antes de tomar fotos en el laboratorio', 'Vor dem Fotografieren im Labor um Erlaubnis fragen', 'Ask before taking photos in the lab'),
        t('Usar una tabla para anotar la temperatura cada día', 'Mit einer Tabelle jeden Tag die Temperatur notieren', 'Use a table to write down the temperature every day'),
        t('Pensar si un video de ciencia dice la verdad', 'Überlegen, ob ein Wissenschaftsvideo die Wahrheit sagt', 'Think about whether a science video tells the truth')
    ],
    individuos: [
        t('Buscar mi barrio en un mapa en línea', 'Mein Viertel auf einer Online-Karte suchen', 'Find my neighbourhood on an online map'),
        t('Hacer con mi grupo una entrevista a un familiar', 'Mit meiner Gruppe ein Familienmitglied interviewen', 'Interview a family member with my group'),
        t('Hacer un mapa de mi barrio en PowerPoint', 'Eine Karte meines Viertels in PowerPoint machen', 'Make a map of my neighbourhood in PowerPoint'),
        t('No publicar la dirección de mi casa', 'Meine Adresse nicht veröffentlichen', 'Not posting my home address'),
        t('Ordenar fotos viejas de Barranquilla en una línea de tiempo', 'Alte Fotos von Barranquilla auf einem Zeitstrahl ordnen', 'Put old photos of Barranquilla on a timeline'),
        t('Pensar qué cuentan las noticias de mi ciudad', 'Überlegen, was die Nachrichten über meine Stadt erzählen', 'Think about what the news says about my city')
    ],
    matematicas: [
        t('Buscar un video que explique las fracciones y guardar el enlace', 'Ein Video suchen, das Brüche erklärt, und den Link speichern', 'Find a video that explains fractions and save the link'),
        t('Resolver un problema con mi grupo en Teams', 'Mit meiner Gruppe in Teams eine Aufgabe lösen', 'Solve a problem with my group in Teams'),
        t('Hacer una gráfica de barras en Excel', 'In Excel ein Balkendiagramm machen', 'Make a bar chart in Excel'),
        t('Practicar en una app de matemáticas con la cuenta del colegio', 'Mit dem Schulkonto in einer Mathe-App üben', 'Practise in a maths app with my school account'),
        t('Revisar mis cuentas con la calculadora', 'Meine Rechnungen mit dem Taschenrechner prüfen', 'Check my sums with the calculator'),
        t('Pensar si un anuncio de «50 % de descuento» es verdad', 'Überlegen, ob eine Werbung mit „50 % Rabatt“ stimmt', 'Think about whether a “50 % off” ad is true')
    ],
    musica: [
        t('Buscar el sonido de los instrumentos en una página del colegio', 'Den Klang der Instrumente auf einer Schulseite suchen', 'Find what the instruments sound like on a school page'),
        t('Ensayar una canción con mi grupo y compartirla en Teams', 'Mit meiner Gruppe ein Lied üben und in Teams teilen', 'Rehearse a song with my group and share it in Teams'),
        t('Crear un ritmo en Chrome Music Lab', 'In Chrome Music Lab einen Rhythmus erstellen', 'Create a rhythm in Chrome Music Lab'),
        t('Usar audífonos sin subir mucho el volumen', 'Kopfhörer benutzen, ohne die Lautstärke zu hoch zu stellen', 'Use headphones without turning the volume up too high'),
        t('Grabar mi canción otra vez si algo salió mal', 'Mein Lied noch einmal aufnehmen, wenn etwas schiefging', 'Record my song again if something went wrong'),
        t('Pensar cómo la música de un anuncio nos hace sentir', 'Überlegen, wie die Musik einer Werbung auf uns wirkt', 'Think about how the music in an ad makes us feel')
    ],
    arte: [
        t('Buscar pinturas famosas en la página de un museo', 'Berühmte Gemälde auf der Seite eines Museums suchen', 'Find famous paintings on a museum website'),
        t('Hacer un mural digital con mi grupo', 'Mit meiner Gruppe ein digitales Wandbild machen', 'Make a digital mural with my group'),
        t('Hacer un collage con colores primarios en Paint', 'In Paint eine Collage mit Grundfarben machen', 'Make a collage with primary colours in Paint'),
        t('Pedir permiso antes de usar la foto de un compañero', 'Fragen, bevor ich das Foto eines Mitschülers benutze', 'Ask before using a classmate’s photo'),
        t('Deshacer un paso cuando el dibujo no me gusta', 'Einen Schritt rückgängig machen, wenn mir das Bild nicht gefällt', 'Undo a step when I don’t like my drawing'),
        t('Pensar si una imagen fue cambiada con un programa', 'Überlegen, ob ein Bild mit einem Programm verändert wurde', 'Think about whether a picture was changed with a program')
    ],
    mint_sach: [
        t('Buscar qué comen los insectos en una página para niños', 'Auf einer Kinderseite suchen, was Insekten fressen', 'Find out what insects eat on a kids’ page'),
        t('Anotar con mi grupo cómo crecen nuestras semillas', 'Mit meiner Gruppe notieren, wie unsere Samen wachsen', 'Write down with my group how our seeds grow'),
        t('Tomar fotos de mi planta cada semana', 'Jede Woche Fotos von meiner Pflanze machen', 'Take photos of my plant every week'),
        t('Cuidar la tableta del salón y cerrar sesión', 'Auf das Klassen-Tablet aufpassen und mich abmelden', 'Look after the class tablet and sign out'),
        t('Medir y anotar cuánto creció la planta', 'Messen und notieren, wie viel die Pflanze gewachsen ist', 'Measure and write down how much the plant grew'),
        t('Pensar qué pasaría si no hubiera abejas', 'Überlegen, was passieren würde, wenn es keine Bienen gäbe', 'Think about what would happen if there were no bees')
    ],
    deportes: [
        t('Buscar ejercicios de calentamiento en una página confiable', 'Aufwärmübungen auf einer verlässlichen Seite suchen', 'Find warm-up exercises on a reliable website'),
        t('Organizar con mi equipo los turnos del juego', 'Mit meinem Team die Spielreihenfolge planen', 'Plan the game turns with my team'),
        t('Grabar un video corto de mi salto, con permiso', 'Mit Erlaubnis ein kurzes Video von meinem Sprung aufnehmen', 'Record a short video of my jump, with permission'),
        t('Usar la tableta poco tiempo y moverme más', 'Das Tablet nur kurz benutzen und mich mehr bewegen', 'Use the tablet for a short time and move more'),
        t('Usar el cronómetro para medir mi carrera', 'Mit der Stoppuhr meinen Lauf messen', 'Use the stopwatch to time my run'),
        t('Pensar si lo que hacen los deportistas en los videos es seguro para mí', 'Überlegen, ob das, was Sportler in Videos machen, für mich sicher ist', 'Think about whether what athletes do in videos is safe for me')
    ]
};

const SIMPLE_MEDIENPASS_ABOUT = t(
    'El Medienpass es un cuaderno de retos. Te ayuda a usar bien el computador y la tableta en todas las materias.',
    'Der Medienpass ist ein Heft mit Challenges. Er hilft dir, Computer und Tablet in allen Fächern gut zu nutzen.',
    'The Medienpass is a challenge workbook. It helps you use the computer and tablet well in every subject.');
const SIMPLE_VALIDATION_ABOUT = t(
    'Haces el reto, ganas estrellas y tu profesor revisa tu trabajo.',
    'Du machst die Challenge, bekommst Sterne und deine Lehrkraft prüft deine Arbeit.',
    'You do the challenge, earn stars and your teacher checks your work.');

// Ejemplos sencillos de una materia (una materia nueva usa los generales)
function simpleExamplesOf(subjectId) {
    return SIMPLE_EXAMPLES[subjectId] || reto0PackOf(subjectId).examples;
}

function simpleAiSafety(subjectId) {
    const n = subjectNames(subjectId);
    const base = aiSafety(subjectId);
    return {
        ...base,
        text: t(`Un chat de inteligencia artificial puede ayudarte en ${n.es}, pero a veces se equivoca. Revisa lo que dice, no le des tus datos y cuenta que lo usaste.`,
            `Ein KI-Chat kann dir in ${n.de} helfen, aber manchmal irrt er sich. Prüfe, was er sagt, gib ihm keine Daten und sag, dass du ihn benutzt hast.`,
            `An artificial intelligence chat can help you in ${n.en}, but sometimes it is wrong. Check what it says, don’t give it your details and say that you used it.`),
        question: t(`En ${n.es} quieres usar un chat de inteligencia artificial. ¿Qué es lo correcto?`,
            `In ${n.de} willst du einen Chat mit künstlicher Intelligenz benutzen. Was ist richtig?`,
            `In ${n.en} you want to use an artificial intelligence chat. What is right?`),
        right: t('Usarlo como ayuda, revisar lo que dice y contarle a mi profesor', 'Ihn als Hilfe nutzen, prüfen, was er sagt, und es meiner Lehrkraft sagen', 'Use it as help, check what it says and tell my teacher'),
        wrong: [
            t('Copiar lo que dice y entregarlo como mío', 'Abschreiben, was er sagt, und es als meins abgeben', 'Copy what it says and hand it in as mine'),
            t('Escribirle mi nombre completo y mi dirección', 'Ihm meinen vollen Namen und meine Adresse schreiben', 'Type in my full name and address')
        ]
    };
}

// Las 10 preguntas del Reto 0 con frases cortas (mismos ids y posiciones que buildReto0Questions)
function buildSimpleReto0Questions(subjectId) {
    const base = buildReto0Questions(subjectId);
    const n = subjectNames(subjectId);
    const examples = simpleExamplesOf(subjectId);
    const pack = reto0PackOf(subjectId);
    const keep = (q, changes) => ({ ...q, ...changes, options: placeOptions(changes.right, changes.wrong, q.options.findIndex(o => o.correct)) });
    return base.map((q, i) => {
        if (i === 0) return keep(q, {
            label: t(`¿Qué es el Medienpass en ${n.es}?`, `Was ist der Medienpass in ${n.de}?`, `What is the Medienpass in ${n.en}?`),
            right: t(`Un cuaderno de retos para usar bien el computador, también en ${n.es}`, `Ein Heft mit Challenges, um den Computer gut zu nutzen, auch in ${n.de}`, `A challenge workbook for using the computer well, in ${n.en} too`),
            wrong: [t(`Un examen de ${n.es}`, `Eine Prüfung in ${n.de}`, `A ${n.en} test`), t('Un juego para el recreo', 'Ein Spiel für die Pause', 'A game for break time')],
            practice_explanation: SIMPLE_MEDIENPASS_ABOUT
        });
        if (i === 1) return keep(q, {
            label: t(`Terminaste un reto de ${n.es}. ¿Qué pasa después?`, `Du hast eine Challenge in ${n.de} geschafft. Was passiert dann?`, `You finished a ${n.en} challenge. What happens next?`),
            right: t('Mi profesor revisa mi trabajo y gano estrellas', 'Meine Lehrkraft prüft meine Arbeit und ich bekomme Sterne', 'My teacher checks my work and I earn stars'),
            wrong: [t('El reto se borra solo', 'Die Challenge löscht sich von selbst', 'The challenge deletes itself'), t('Nadie lo mira', 'Niemand schaut es an', 'Nobody looks at it')],
            practice_explanation: SIMPLE_VALIDATION_ABOUT
        });
        if (i >= 2 && i <= 7) {
            const c = i - 2;
            const comp = SIMPLE_COMPETENCES[c];
            return keep(q, {
                label: t(`En ${n.es}, ¿qué actividad es de «${comp.name.es}»?`, `Welche Aktivität in ${n.de} gehört zu „${comp.name.de}“?`, `In ${n.en}, which activity is about “${comp.name.en}”?`),
                right: examples[c],
                wrong: [examples[(c + 2) % 6], examples[(c + 4) % 6]],
                practice_explanation: t(`${KMK_COMPETENCES[c].icon} ${comp.name.es}: ${examples[c].es}.`, `${KMK_COMPETENCES[c].icon} ${comp.name.de}: ${examples[c].de}.`, `${KMK_COMPETENCES[c].icon} ${comp.name.en}: ${examples[c].en}.`)
            });
        }
        if (i === 8) return q; // caso de seguridad de la materia: ya es una situación concreta
        const ai = simpleAiSafety(subjectId);
        return keep(q, { label: ai.question, right: ai.right, wrong: ai.wrong, practice_explanation: ai.text });
    }).map(q => { delete q.right; delete q.wrong; return q; });
}

// Diapositivas 4 y 5 con nombres cortos de las competencias y los ejemplos sencillos
function getSimpleReto0Study(subjectId) {
    const pack = reto0PackOf(subjectId);
    const examples = simpleExamplesOf(subjectId);
    return {
        subjectName: subjectNames(subjectId),
        simple: true,
        examples: KMK_COMPETENCES.map((comp, i) => ({ icon: comp.icon, competence: SIMPLE_COMPETENCES[i].name, text: examples[i], ai: SIMPLE_COMPETENCES[i].ai })),
        safety: [...pack.safety, simpleAiSafety(subjectId)].map(s => ({ title: s.title, text: s.text }))
    };
}

module.exports = { KMK_COMPETENCES, reto0Packs, buildReto0Questions, getReto0Study, isSimpleGrade, buildSimpleReto0Questions, getSimpleReto0Study, SIMPLE_EXAMPLES };

