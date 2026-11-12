// ═══════════════════════════════════════════
// MedienPass - Retos 1-6 de Deportes (K3-K12), con los contenidos de cinco áreas deportivas:
// natación, polimotor, voleibol, baloncesto y atletismo. Las áreas se mezclan en cada reto y cada
// pregunta indica la suya (area).
//
// Cada pregunta conserva la subcompetencia KMK (kmk) y la posición de la respuesta correcta
// (correct) de la plantilla común de data_questions.js; npm test lo comprueba. La versión visual
// (Prekínder a K2) sale del paquete de Deportes en data_subject_packs.js.
// ═══════════════════════════════════════════

const t = (es, de, en) => ({ es, de, en });

const SPORTS_AREAS = ['natacion', 'polimotor', 'voleibol', 'baloncesto', 'atletismo'];

// SPORTS_QUESTIONS[reto][pregunta] = { area, kmk, correct, label, options: [3], hint }
const SPORTS_QUESTIONS = {
    // ── Reto 1 · Buscar, procesar y archivar ──
    1: {
        1: {
            area: 'natacion', kmk: '1.1', correct: 0,
            label: t('Preparas una exposición sobre los cuatro estilos de natación. ¿Qué búsqueda te da resultados más precisos y confiables?',
                'Du bereitest ein Referat über die vier Schwimmstile vor. Welche Suche liefert die genauesten und verlässlichsten Ergebnisse?',
                'You are preparing a talk on the four swimming strokes. Which search gives you the most precise and reliable results?'),
            options: [
                t('Buscar con palabras exactas y operadores: "estilo mariposa" técnica natación -tienda', 'Mit genauen Begriffen und Operatoren suchen: "Schmetterlingsschwimmen" Technik Anleitung -Shop', 'Search with exact words and operators: "butterfly stroke" technique swimming -shop'),
                t('Escribir «cosas de natación para la tarea» y abrir cualquier resultado', '„Sachen über Schwimmen für die Hausaufgabe“ eingeben und irgendein Ergebnis öffnen', 'Type “swimming stuff for homework” and open any result'),
                t('Abrir el primer anuncio de una tienda de trajes de baño', 'Die erste Anzeige eines Badeanzug-Shops öffnen', 'Open the first ad from a swimwear shop')
            ],
            hint: t('Las comillas buscan la frase exacta y el signo menos (-) deja fuera las tiendas. Así encuentras explicaciones de la técnica y no anuncios.',
                'Anführungszeichen suchen die genaue Wortfolge, und das Minuszeichen (-) schließt Shops aus. So findest du Erklärungen zur Technik statt Werbung.',
                'Quotation marks search for the exact phrase, and the minus sign (-) leaves out shops. That way you find technique explanations instead of ads.')
        },
        2: {
            area: 'voleibol', kmk: '1.2', correct: 1,
            label: t('Encuentras varias páginas que explican cuántos toques puede dar un equipo de voleibol. ¿Cómo decides cuál es confiable?',
                'Du findest mehrere Seiten, die erklären, wie viele Ballkontakte eine Volleyballmannschaft hat. Wie entscheidest du, welche verlässlich ist?',
                'You find several pages explaining how many touches a volleyball team may make. How do you decide which one is reliable?'),
            options: [
                t('La que tiene más videos de jugadas espectaculares', 'Die mit den meisten Videos von spektakulären Spielzügen', 'The one with the most videos of spectacular plays'),
                t('La que coincide con el reglamento oficial de la FIVB, dice quién la escribió y tiene fecha', 'Die, die mit dem offiziellen Regelwerk der FIVB übereinstimmt, einen Autor nennt und ein Datum hat', 'The one that matches the official FIVB rules, names its author and has a date'),
                t('Un comentario anónimo en un foro de apuestas', 'Ein anonymer Kommentar in einem Wettforum', 'An anonymous comment on a betting forum')
            ],
            hint: t('El reglamento oficial es la fuente más confiable. Una página seria dice quién la escribió y cuándo, y coincide con él (en voleibol, máximo tres toques por equipo).',
                'Das offizielle Regelwerk ist die verlässlichste Quelle. Eine seriöse Seite nennt Autor und Datum und stimmt damit überein (im Volleyball höchstens drei Ballkontakte pro Mannschaft).',
                'The official rulebook is the most reliable source. A serious page says who wrote it and when, and matches it (in volleyball, three touches per team at most).')
        },
        3: {
            area: 'atletismo', kmk: '1.3', correct: 1,
            label: t('Tienes muchos archivos con tus marcas de atletismo de todo el año. ¿Cuál es la mejor forma de organizarlos en la nube?',
                'Du hast viele Dateien mit deinen Leichtathletik-Bestleistungen aus dem ganzen Jahr. Wie ordnest du sie am besten in der Cloud?',
                'You have lots of files with your athletics results from the whole year. What is the best way to organise them in the cloud?'),
            options: [
                t('Dejarlos en «Descargas» con nombres como «Libro1» o «sin título»', 'Sie in „Downloads“ lassen, mit Namen wie „Mappe1“ oder „Unbenannt“', 'Leave them in “Downloads” with names like “Book1” or “Untitled”'),
                t('Carpetas por año, deporte y prueba (2026 > Deportes > Atletismo > 100 m) y nombres claros con fecha: marcas-100m_2026-04-15.xlsx', 'Ordner nach Jahr, Sportart und Disziplin (2026 > Sport > Leichtathletik > 100 m) und klare Namen mit Datum: bestzeiten-100m_2026-04-15.xlsx', 'Folders by year, sport and event (2026 > Sports > Athletics > 100 m) and clear names with dates: 100m-times_2026-04-15.xlsx'),
                t('Guardarlos en el escritorio del computador compartido del colegio', 'Sie auf dem Desktop des gemeinsamen Schulcomputers speichern', 'Save them on the desktop of the shared school computer')
            ],
            hint: t('Con carpetas ordenadas y nombres con fecha ves rápido cómo mejoraste en cada prueba. En la nube del colegio, además, no se pierden.',
                'Mit geordneten Ordnern und Dateinamen mit Datum siehst du schnell, wie du dich in jeder Disziplin verbessert hast. In der Schul-Cloud gehen sie außerdem nicht verloren.',
                'With tidy folders and dated file names you quickly see how you improved in each event. In the school cloud they don’t get lost either.')
        },
        4: {
            area: 'baloncesto', kmk: '1.2', correct: 0,
            label: t('Lees dos frases sobre baloncesto: «Un tiro desde detrás de la línea de tres puntos vale tres puntos.» y «El baloncesto es el deporte más emocionante de todos.». ¿Cómo distingues el hecho de la opinión?',
                'Du liest zwei Sätze über Basketball: „Ein Wurf von hinter der Dreierlinie zählt drei Punkte.“ und „Basketball ist der spannendste Sport von allen.“ Wie unterscheidest du Tatsache und Meinung?',
                'You read two sentences about basketball: “A shot from behind the three-point line is worth three points.” and “Basketball is the most exciting sport of all.” How do you tell the fact from the opinion?'),
            options: [
                t('La primera es un hecho porque se comprueba en el reglamento; la segunda es una opinión porque expresa un gusto personal', 'Der erste ist eine Tatsache, weil man ihn im Regelwerk prüfen kann; der zweite ist eine Meinung, weil er einen persönlichen Geschmack ausdrückt', 'The first is a fact because you can check it in the rules; the second is an opinion because it expresses a personal taste'),
                t('Las dos son hechos porque hablan de deporte', 'Beide sind Tatsachen, weil es um Sport geht', 'Both are facts because they are about sport'),
                t('La segunda es un hecho porque a mucha gente le gusta el baloncesto', 'Der zweite ist eine Tatsache, weil viele Leute Basketball mögen', 'The second is a fact because lots of people like basketball')
            ],
            hint: t('Un hecho se puede comprobar en una fuente, como el reglamento de la FIBA. Una opinión dice lo que alguien siente o prefiere, aunque mucha gente esté de acuerdo.',
                'Eine Tatsache lässt sich in einer Quelle prüfen, etwa im Regelwerk der FIBA. Eine Meinung sagt, was jemand fühlt oder bevorzugt – auch wenn viele zustimmen.',
                'A fact can be checked in a source, such as the FIBA rulebook. An opinion says what someone feels or prefers, even if many people agree.')
        },
        // IA: un chatbot como fuente de información (se comprueba en una fuente confiable)
        5: {
            area: 'polimotor', kmk: '1.1', correct: 0, ai: true,
            label: t('En la clase aparece la palabra «polimotor». Le preguntas a un chatbot de inteligencia artificial (IA) y te da una explicación muy segura. ¿Qué haces?',
                'Im Unterricht taucht das Wort „Polimotor“ auf. Du fragst einen KI-Chatbot, und er gibt dir eine sehr selbstsichere Erklärung. Was tust du?',
                'In class you hear the word “polymotor”. You ask an artificial intelligence (AI) chatbot and it gives you a very confident explanation. What do you do?'),
            options: [
                t('La comparo con una fuente confiable de educación física y con lo visto en clase, porque la IA puede equivocarse, y la anoto en mi glosario de Deportes', 'Ich vergleiche sie mit einer verlässlichen sportpädagogischen Quelle und mit dem Unterricht, weil KI sich irren kann, und notiere sie in meinem Sport-Glossar', 'I compare it with a reliable physical-education source and with what we saw in class, because AI can be wrong, and note it in my Sports glossary'),
                t('La copio tal cual: si suena segura, es correcta', 'Ich übernehme sie unverändert: Wenn sie sicher klingt, stimmt sie', 'I copy it as it is: if it sounds sure, it must be right'),
                t('Le pido que me arme todo el circuito de polimotor y lo entrego sin revisarlo', 'Ich lasse sie den ganzen Polimotor-Parcours planen und gebe ihn ungeprüft ab', 'I ask it to plan the whole polymotor circuit and hand it in without checking it')
            ],
            hint: t('El trabajo polimotor desarrolla varias capacidades a la vez: correr, saltar, lanzar, equilibrio y coordinación. Los chatbots de IA responden con seguridad aunque se equivoquen: compara siempre con una fuente confiable.',
                'Polimotorisches Training fördert mehrere Fähigkeiten gleichzeitig: Laufen, Springen, Werfen, Gleichgewicht und Koordination. KI-Chatbots antworten selbstsicher, auch wenn sie sich irren: Vergleiche immer mit einer verlässlichen Quelle.',
                'Polymotor training develops several abilities at once: running, jumping, throwing, balance and coordination. AI chatbots answer confidently even when they are wrong: always compare with a reliable source.')
        },
        6: {
            area: 'natacion', kmk: '1.2', correct: 1,
            label: t('Terminas una guía digital de los estilos de natación. ¿Cómo validas las referencias que incluyes?',
                'Du stellst eine digitale Anleitung zu den Schwimmstilen fertig. Wie überprüfst du die Quellen, die du angibst?',
                'You are finishing a digital guide to the swimming strokes. How do you check the references you include?'),
            options: [
                t('Copio el primer enlace que encuentro, sin revisarlo', 'Ich übernehme den ersten Link, den ich finde, ungeprüft', 'I copy the first link I find without checking it'),
                t('Contrasto cada dato en al menos dos fuentes confiables, como World Aquatics, y agrego una lista con los enlaces y la fecha de consulta', 'Ich prüfe jede Angabe in mindestens zwei verlässlichen Quellen wie World Aquatics und füge eine Liste mit den Links und dem Abrufdatum hinzu', 'I check each fact in at least two reliable sources, such as World Aquatics, and add a list with the links and the date I looked them up'),
                t('No pongo fuentes: mi profesor de Deportes ya sabe de dónde salió', 'Ich gebe keine Quellen an: Meine Sportlehrkraft weiß ja, woher alles stammt', 'I don’t add sources: my Sports teacher already knows where it came from')
            ],
            hint: t('Contrastar en dos fuentes evita errores, y la lista de fuentes permite que otros comprueben los datos de tu guía.',
                'Der Vergleich mit zwei Quellen vermeidet Fehler, und die Quellenliste erlaubt anderen, die Angaben in deiner Anleitung zu überprüfen.',
                'Checking two sources avoids mistakes, and the list of sources lets others check the facts in your guide.')
        }
    },

    // ── Reto 2 · Comunicar y cooperar ──
    2: {
        1: {
            area: 'atletismo', kmk: '2.1', correct: 1,
            label: t('Necesitas escribirle a tu profesor de Deportes porque te lesionaste el tobillo y no podrás correr en la prueba de atletismo. ¿Cómo debe ser el mensaje?',
                'Du musst deiner Sportlehrkraft schreiben, weil du dir den Knöchel verletzt hast und beim Leichtathletik-Wettkampf nicht laufen kannst. Wie sollte die Nachricht aussehen?',
                'You need to write to your Sports teacher because you hurt your ankle and cannot run in the athletics event. What should the message look like?'),
            options: [
                t('Un mensaje en el grupo de la clase: «NO VOY» con muchos emojis', 'Eine Nachricht in der Klassengruppe: „ICH KOMME NICHT“ mit vielen Emojis', 'A message in the class group: “NOT COMING” with lots of emojis'),
                t('Un mensaje respetuoso con saludo, tu nombre y curso, qué pasó, qué prueba te pierdes y una despedida', 'Eine respektvolle Nachricht mit Begrüßung, deinem Namen und deiner Klasse, was passiert ist, welche Disziplin du verpasst, und einem Gruß', 'A respectful message with a greeting, your name and class, what happened, which event you will miss and a sign-off'),
                t('Un audio de cinco minutos enviado a medianoche', 'Eine fünfminütige Sprachnachricht um Mitternacht', 'A five-minute voice message sent at midnight')
            ],
            hint: t('Un mensaje claro y respetuoso, enviado por el canal adecuado y a una hora razonable, ayuda a que tu profesor te responda y te proponga otra actividad.',
                'Eine klare, respektvolle Nachricht über den passenden Kanal und zu einer vernünftigen Uhrzeit hilft deiner Lehrkraft, dir zu antworten und eine andere Aufgabe vorzuschlagen.',
                'A clear, respectful message sent through the right channel at a reasonable time helps your teacher reply and suggest another activity.')
        },
        2: {
            area: 'baloncesto', kmk: '2.2', correct: 1,
            label: t('Vas a compartir con tu equipo de baloncesto la carpeta con los videos de los partidos. ¿Cómo configuras los permisos?',
                'Du willst mit deiner Basketballmannschaft den Ordner mit den Spielvideos teilen. Wie stellst du die Berechtigungen ein?',
                'You are going to share the folder with the match videos with your basketball team. How do you set the permissions?'),
            options: [
                t('Un enlace público con permiso de edición para cualquier persona en internet', 'Ein öffentlicher Link mit Bearbeitungsrecht für alle im Internet', 'A public link with edit rights for anyone on the internet'),
                t('Solo para los correos del colegio de tu equipo, decidiendo quién edita y quién solo puede ver', 'Nur für die Schul-E-Mail-Adressen deiner Mannschaft, und du legst fest, wer bearbeiten und wer nur ansehen darf', 'Only for your team’s school email addresses, deciding who can edit and who can only view'),
                t('Compartir tu usuario y tu contraseña con todo el equipo', 'Deinen Benutzernamen und dein Passwort mit der ganzen Mannschaft teilen', 'Share your username and password with the whole team')
            ],
            hint: t('Los videos muestran a tus compañeros: compártelos solo con el equipo y decide quién puede cambiarlos. Tu contraseña es solo tuya.',
                'Die Videos zeigen deine Mitspieler: Teile sie nur mit der Mannschaft und bestimme, wer sie ändern darf. Dein Passwort gehört nur dir.',
                'The videos show your teammates: share them only with the team and decide who can change them. Your password is yours alone.')
        },
        3: {
            area: 'voleibol', kmk: '2.4', correct: 0,
            label: t('En el chat del equipo de voleibol, un compañero escribe todo en MAYÚSCULAS después de perder un partido. ¿Por qué conviene evitarlo?',
                'Im Chat der Volleyballmannschaft schreibt ein Mitspieler nach einer Niederlage alles in GROSSBUCHSTABEN. Warum sollte man das vermeiden?',
                'In the volleyball team chat, a teammate types everything in CAPITALS after losing a match. Why is it better to avoid this?'),
            options: [
                t('Porque en el chat las mayúsculas se leen como gritos y pueden parecer agresivas', 'Weil Großbuchstaben im Chat wie Schreien wirken und aggressiv erscheinen können', 'Because in the chat capitals read as shouting and can seem aggressive'),
                t('Porque las mayúsculas gastan más datos del celular', 'Weil Großbuchstaben mehr Handydaten verbrauchen', 'Because capitals use more phone data'),
                t('Porque el entrenador no puede leer mayúsculas', 'Weil der Trainer keine Großbuchstaben lesen kann', 'Because the coach can’t read capitals')
            ],
            hint: t('Escribir en mayúsculas equivale a gritar. Después de una derrota, un tono respetuoso ayuda al equipo a mejorar juntos.',
                'In Großbuchstaben zu schreiben ist wie Schreien. Nach einer Niederlage hilft ein respektvoller Ton der Mannschaft, gemeinsam besser zu werden.',
                'Writing in capitals is like shouting. After a defeat, a respectful tone helps the team improve together.')
        },
        4: {
            area: 'polimotor', kmk: '2.3', correct: 0,
            label: t('Tu grupo diseña en un documento compartido un circuito de polimotor con seis estaciones. ¿Cuál es la mejor forma de coordinarse?',
                'Deine Gruppe plant in einem gemeinsamen Dokument einen Polimotor-Parcours mit sechs Stationen. Wie stimmt ihr euch am besten ab?',
                'Your group is designing a polymotor circuit with six stations in a shared document. What is the best way to coordinate?'),
            options: [
                t('Repartir antes las estaciones, usar los comentarios para sugerir cambios y respetar lo que escribe cada uno', 'Vorher die Stationen aufteilen, Änderungen über Kommentare vorschlagen und respektieren, was jeder schreibt', 'Divide the stations first, use comments to suggest changes and respect what everyone writes'),
                t('Que cada uno borre las estaciones que no le gustan, sin avisar', 'Jeder löscht ohne Bescheid die Stationen, die ihm nicht gefallen', 'Everyone deletes the stations they don’t like without saying so'),
                t('Escribir todos al mismo tiempo en la misma estación', 'Alle schreiben gleichzeitig an derselben Station', 'Everyone writes on the same station at the same time')
            ],
            hint: t('Repartir el trabajo y comentar en vez de borrar evita conflictos. Así el circuito queda completo y cada uno aporta su parte.',
                'Wer die Arbeit aufteilt und kommentiert statt löscht, vermeidet Streit. So wird der Parcours vollständig, und jeder trägt seinen Teil bei.',
                'Dividing the work and commenting instead of deleting avoids conflicts. That way the circuit is complete and everyone contributes their part.')
        },
        // IA: un montaje hecho con IA (deepfake) también es ciberacoso
        5: {
            area: 'natacion', kmk: '2.4', correct: 1, ai: true,
            label: t('En el chat de la clase alguien comparte un montaje hecho con inteligencia artificial (un «deepfake») que se burla de un compañero en su prueba de natación. ¿Qué es lo correcto?',
                'Im Klassenchat teilt jemand eine mit künstlicher Intelligenz erstellte Fälschung (einen „Deepfake“), die sich über einen Mitschüler bei seinem Schwimmwettkampf lustig macht. Was ist richtig?',
                'In the class chat someone shares an artificial intelligence fake (a “deepfake”) that makes fun of a classmate at his swimming race. What is the right thing to do?'),
            options: [
                t('Reenviarlo a otros grupos: si lo hizo una IA, no es grave', 'Sie an andere Gruppen weiterleiten: Wenn eine KI sie gemacht hat, ist es nicht schlimm', 'Forward it to other groups: if an AI made it, it is no big deal'),
                t('No reenviarlo, guardar capturas como evidencia e informar a un profesor o adulto de confianza', 'Sie nicht weiterleiten, Screenshots als Beweis sichern und eine Lehrkraft oder eine erwachsene Vertrauensperson informieren', 'Don’t forward it, save screenshots as evidence and tell a teacher or a trusted adult'),
                t('Hacer con IA otro montaje de natación para responderle', 'Mit KI eine weitere Schwimm-Fälschung erstellen, um zurückzuschlagen', 'Make another AI swimming fake to hit back')
            ],
            hint: t('Un montaje hecho con IA que ridiculiza a alguien es ciberacoso, aunque parezca una broma. No se difunde: se guarda la evidencia y se avisa a un adulto.',
                'Eine KI-Fälschung, die jemanden lächerlich macht, ist Cybermobbing, auch wenn sie wie ein Scherz wirkt. Man verbreitet sie nicht, sondern sichert Beweise und informiert eine erwachsene Person.',
                'An AI fake that ridicules someone is cyberbullying, even if it looks like a joke. Don’t spread it: keep the evidence and tell an adult.')
        },
        6: {
            area: 'atletismo', kmk: '2.5', correct: 1,
            label: t('En un foro del colegio debaten: «¿Deberían usarse videos y sensores para arbitrar todos los partidos escolares?». ¿Cómo participas de forma constructiva?',
                'In einem Schulforum wird diskutiert: „Sollten Videos und Sensoren alle Schulspiele entscheiden?“ Wie beteiligst du dich konstruktiv?',
                'A school forum is debating: “Should videos and sensors referee every school match?” How do you take part constructively?'),
            options: [
                t('Atacar a quienes piensan distinto para ganar la discusión', 'Andersdenkende angreifen, um die Diskussion zu gewinnen', 'Attack those who think differently to win the argument'),
                t('Dar tu opinión con argumentos y ejemplos, como el foto-finish del atletismo, citar tus fuentes y responder con respeto a otras ideas', 'Deine Meinung mit Argumenten und Beispielen begründen, etwa dem Zielfoto in der Leichtathletik, Quellen nennen und respektvoll auf andere Ideen antworten', 'Give your opinion with arguments and examples, such as the photo finish in athletics, cite your sources and respond respectfully to other ideas'),
                t('Publicar el mismo mensaje muchas veces para que se vea más', 'Dieselbe Nachricht viele Male posten, damit sie mehr gesehen wird', 'Post the same message many times so it gets seen more')
            ],
            hint: t('Participar en una sociedad digital es argumentar con datos y respetar otras opiniones. Así el debate sirve para aprender.',
                'Mitreden in einer digitalen Gesellschaft heißt, mit Fakten zu argumentieren und andere Meinungen zu respektieren. So hilft die Diskussion beim Lernen.',
                'Taking part in a digital society means arguing with facts and respecting other opinions. That way the debate helps everyone learn.')
        }
    },

    // ── Reto 3 · Producir y presentar ──
    3: {
        1: {
            area: 'atletismo', kmk: '3.1', correct: 0,
            label: t('Necesitas ordenar y graficar tus tiempos de los 100 metros durante el año. ¿Qué programa es el más adecuado?',
                'Du willst deine 100-Meter-Zeiten aus dem ganzen Jahr ordnen und als Diagramm darstellen. Welches Programm ist am besten geeignet?',
                'You need to sort and chart your 100-metre times over the year. Which program is best?'),
            options: [
                t('Una hoja de cálculo, que ordena los tiempos, calcula tu promedio y crea un gráfico de tu progreso', 'Eine Tabellenkalkulation, die die Zeiten ordnet, deinen Durchschnitt berechnet und ein Diagramm deines Fortschritts erstellt', 'A spreadsheet, which sorts the times, calculates your average and makes a chart of your progress'),
                t('Un programa de dibujo, para pintar a mano cada tiempo', 'Ein Malprogramm, um jede Zeit von Hand zu zeichnen', 'A drawing program, to paint each time by hand'),
                t('Un reproductor de música, para escuchar mientras miras los tiempos', 'Ein Musikplayer, um beim Anschauen der Zeiten Musik zu hören', 'A music player, to listen to while you look at the times')
            ],
            hint: t('La hoja de cálculo hace los cálculos por ti y el gráfico muestra de un vistazo si estás mejorando.',
                'Die Tabellenkalkulation rechnet für dich, und das Diagramm zeigt auf einen Blick, ob du besser wirst.',
                'The spreadsheet does the maths for you and the chart shows at a glance whether you are improving.')
        },
        2: {
            area: 'voleibol', kmk: '3.1', correct: 1,
            label: t('Preparas diapositivas para explicar las posiciones en la cancha de voleibol. ¿Qué pauta de diseño garantiza claridad?',
                'Du bereitest Folien vor, um die Positionen auf dem Volleyballfeld zu erklären. Welche Gestaltungsregel sorgt für Klarheit?',
                'You are preparing slides to explain the positions on the volleyball court. Which design rule ensures clarity?'),
            options: [
                t('Llenar cada diapositiva con párrafos largos en letra pequeña', 'Jede Folie mit langen Absätzen in kleiner Schrift füllen', 'Fill each slide with long paragraphs in small print'),
                t('Pocas ideas por diapositiva, un esquema claro de la cancha, letra legible y buen contraste', 'Wenige Aussagen pro Folie, eine klare Skizze des Feldes, gut lesbare Schrift und guter Kontrast', 'A few ideas per slide, a clear diagram of the court, a readable font and good contrast'),
                t('Letra amarilla sobre fondo blanco y muchas animaciones', 'Gelbe Schrift auf weißem Hintergrund und viele Animationen', 'Yellow text on a white background and lots of animations')
            ],
            hint: t('Un esquema de la cancha explica las posiciones mejor que un párrafo. Poco texto y buen contraste hacen que todos lo entiendan.',
                'Eine Skizze des Feldes erklärt die Positionen besser als ein Absatz. Wenig Text und guter Kontrast sorgen dafür, dass alle es verstehen.',
                'A diagram of the court explains the positions better than a paragraph. Little text and good contrast mean everyone understands.')
        },
        // IA: producir con IA generativa de forma transparente y respetando derechos
        3: {
            area: 'natacion', kmk: '3.3', correct: 1, ai: true,
            label: t('Para tu guía de natación quieres crear con inteligencia artificial imágenes de los estilos. ¿Qué es lo correcto?',
                'Für deine Schwimmanleitung möchtest du Bilder der Schwimmstile mit künstlicher Intelligenz erstellen. Was ist richtig?',
                'For your swimming guide you want to create pictures of the strokes with artificial intelligence. What is the right thing to do?'),
            options: [
                t('Presentarlas como fotos tuyas de la clase de natación', 'Sie als eigene Fotos aus dem Schwimmunterricht ausgeben', 'Pass them off as your own photos from swimming class'),
                t('Revisar que la técnica que muestran sea correcta, indicar que se crearon con IA y con qué herramienta, y no usar fotos de compañeros reales sin permiso', 'Prüfen, ob die gezeigte Technik stimmt, angeben, dass sie mit KI und mit welchem Werkzeug erstellt wurden, und keine Fotos echter Mitschüler ohne Erlaubnis verwenden', 'Check that the technique they show is correct, state that they were made with AI and with which tool, and don’t use photos of real classmates without permission'),
                t('Pedirle a la IA que copie las fotos de un nadador famoso, con su nombre, para tu guía', 'Die KI bitten, für deine Anleitung die Fotos eines berühmten Schwimmers samt Namen zu kopieren', 'Ask the AI to copy a famous swimmer’s photos, name included, for your guide')
            ],
            hint: t('Una imagen hecha con IA puede mostrar una técnica equivocada y parecerse a fotos ajenas. Revísala, di que usaste IA y respeta la imagen de las personas, sobre todo en traje de baño.',
                'Ein KI-Bild kann eine falsche Technik zeigen und fremden Fotos ähneln. Prüfe es, gib an, dass du KI genutzt hast, und achte das Recht am eigenen Bild – besonders in Badekleidung.',
                'An AI picture can show the wrong technique and look like other people’s photos. Check it, say that you used AI and respect people’s image rights, especially in swimwear.')
        },
        4: {
            area: 'baloncesto', kmk: '3.2', correct: 0,
            label: t('Vas a grabar un video tutorial del lanzamiento en suspensión de baloncesto. ¿Cuál es el proceso correcto?',
                'Du nimmst ein Tutorial-Video zum Sprungwurf im Basketball auf. Wie gehst du richtig vor?',
                'You are going to record a tutorial video on the basketball jump shot. What is the right process?'),
            options: [
                t('Escribir un guion, grabar con buena luz desde un ángulo que muestre todo el movimiento y editar para cortar errores y silencios', 'Ein Drehbuch schreiben, bei gutem Licht aus einem Winkel filmen, der die ganze Bewegung zeigt, und schneiden, um Fehler und Pausen zu entfernen', 'Write a script, film in good light from an angle that shows the whole movement and edit out mistakes and silences'),
                t('Grabar sin plan durante el recreo y publicarlo sin revisar', 'Ohne Plan in der Pause filmen und ungeprüft veröffentlichen', 'Film with no plan during break and post it without checking'),
                t('Grabar con música muy alta encima para que suene profesional', 'Mit sehr lauter Musik darüber filmen, damit es professionell klingt', 'Film with very loud music on top so it sounds professional')
            ],
            hint: t('Planear, grabar bien y editar convierte un video en una buena explicación. El ángulo correcto deja ver toda la técnica.',
                'Planen, gut filmen und schneiden macht aus einem Video eine gute Erklärung. Der richtige Winkel zeigt die ganze Technik.',
                'Planning, filming well and editing turns a video into a good explanation. The right angle shows the whole technique.')
        },
        5: {
            area: 'polimotor', kmk: '3.3', correct: 0,
            label: t('Tu guía digital de juegos de polimotor usa ideas de un libro de educación física. ¿Por qué es indispensable citarlo y agregar una lista de fuentes?',
                'Deine digitale Anleitung mit Polimotor-Spielen nutzt Ideen aus einem Sportbuch. Warum musst du es zitieren und ein Quellenverzeichnis anlegen?',
                'Your digital guide to polymotor games uses ideas from a physical-education book. Why must you cite it and add a list of sources?'),
            options: [
                t('Para no cometer plagio y para que otros puedan comprobar de dónde viene la información', 'Um kein Plagiat zu begehen und damit andere prüfen können, woher die Informationen stammen', 'To avoid plagiarism and so others can check where the information comes from'),
                t('Solo para que la guía tenga más páginas', 'Nur damit die Anleitung mehr Seiten hat', 'Just so the guide has more pages'),
                t('No es necesario si cambias algunas palabras del libro', 'Das ist nicht nötig, wenn du ein paar Wörter aus dem Buch änderst', 'It’s not necessary if you change a few words from the book')
            ],
            hint: t('Usar ideas ajenas sin citarlas es plagio, aunque cambies palabras. Citar reconoce el trabajo del autor.',
                'Fremde Ideen ohne Quellenangabe zu verwenden, ist ein Plagiat, auch wenn du Wörter änderst. Zitieren würdigt die Arbeit der Autoren.',
                'Using other people’s ideas without citing them is plagiarism, even if you change words. Citing recognises the author’s work.')
        },
        6: {
            area: 'atletismo', kmk: '3.2', correct: 1,
            label: t('Vas a entregar en la plataforma del colegio el informe de tu entrenamiento de atletismo, con tablas y fotos. ¿Qué formato evita que se desconfigure?',
                'Du gibst auf der Schulplattform den Bericht über dein Leichtathletiktraining mit Tabellen und Fotos ab. Welches Format verhindert, dass er sich verschiebt?',
                'You are handing in the report on your athletics training, with tables and photos, on the school platform. Which format keeps it from getting messed up?'),
            options: [
                t('Subir el archivo editable original, aunque tu profesor no tenga el mismo programa', 'Die bearbeitbare Originaldatei hochladen, auch wenn deine Lehrkraft nicht dasselbe Programm hat', 'Upload the original editable file, even if your teacher doesn’t have the same program'),
                t('Exportarlo a PDF, que conserva el diseño, las tablas y las fotos en cualquier dispositivo', 'Ihn als PDF exportieren, das Layout, Tabellen und Fotos auf jedem Gerät erhält', 'Export it to PDF, which keeps the layout, tables and photos on any device'),
                t('Enviar una foto borrosa de la pantalla', 'Ein unscharfes Foto vom Bildschirm schicken', 'Send a blurry photo of the screen')
            ],
            hint: t('El PDF se ve igual en cualquier computador o celular: tu profesor ve el informe tal como lo hiciste.',
                'Ein PDF sieht auf jedem Computer und Handy gleich aus: Deine Lehrkraft sieht den Bericht genau so, wie du ihn gemacht hast.',
                'A PDF looks the same on any computer or phone: your teacher sees the report exactly as you made it.')
        }
    },

    // ── Reto 4 · Protegerse y actuar con seguridad ──
    4: {
        1: {
            area: 'atletismo', kmk: '4.1', correct: 1,
            label: t('Creas tu cuenta en una app de entrenamiento para registrar tus carreras de atletismo. ¿Qué contraseña es la más segura?',
                'Du erstellst ein Konto in einer Trainings-App, um deine Läufe zu speichern. Welches Passwort ist am sichersten?',
                'You are creating an account in a training app to log your athletics runs. Which password is the safest?'),
            options: [
                t('El nombre de tu deporte seguido de tu año de nacimiento', 'Der Name deiner Sportart und dein Geburtsjahr', 'The name of your sport followed by your year of birth'),
                t('Una frase larga con mayúsculas, minúsculas, números y símbolos, solo para esa app, que no compartes con nadie', 'Ein langer Satz mit Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen, nur für diese App, den du niemandem verrätst', 'A long phrase with capitals, lower-case letters, numbers and symbols, only for that app, that you share with no one'),
                t('«Deportes123», porque es fácil de recordar', '„Sport123“, weil man es sich leicht merken kann', '“Sports123”, because it’s easy to remember')
            ],
            hint: t('Una frase larga y única es difícil de adivinar. Si usas la misma contraseña en todo, una sola filtración abre todas tus cuentas.',
                'Ein langer, einmaliger Satz ist schwer zu erraten. Wenn du überall dasselbe Passwort nutzt, öffnet ein einziges Datenleck alle deine Konten.',
                'A long, unique phrase is hard to guess. If you use the same password everywhere, a single leak opens all your accounts.')
        },
        2: {
            area: 'baloncesto', kmk: '4.1', correct: 1,
            label: t('Mientras ves videos de baloncesto aparece: «¡Ganaste unas zapatillas de tu jugador favorito! Escribe tu correo y tu contraseña». ¿Qué haces?',
                'Während du Basketballvideos schaust, erscheint: „Du hast Schuhe deines Lieblingsspielers gewonnen! Gib deine E-Mail und dein Passwort ein“. Was tust du?',
                'While you watch basketball videos a message appears: “You won shoes from your favourite player! Type your email and password”. What do you do?'),
            options: [
                t('Escribo mis datos rápido para no perder el premio', 'Ich gebe schnell meine Daten ein, damit ich den Preis nicht verpasse', 'I type my details quickly so I don’t miss the prize'),
                t('Cierro la ventana sin hacer clic, no doy datos y aviso a mi profesor o a mis padres', 'Ich schließe das Fenster ohne zu klicken, gebe keine Daten an und sage meiner Lehrkraft oder meinen Eltern Bescheid', 'I close the window without clicking, give no details and tell my teacher or my parents'),
                t('Comparto el enlace con mi equipo para que todos ganen', 'Ich teile den Link mit meiner Mannschaft, damit alle gewinnen', 'I share the link with my team so everyone wins')
            ],
            hint: t('Los premios que piden contraseñas son engaños (phishing) para robar cuentas. Ninguna marca seria te pide la contraseña para darte un regalo.',
                'Preise, die nach Passwörtern fragen, sind Betrug (Phishing), um Konten zu stehlen. Keine seriöse Marke fragt nach deinem Passwort, um dir etwas zu schenken.',
                'Prizes that ask for passwords are scams (phishing) to steal accounts. No serious brand asks for your password to give you a gift.')
        },
        // IA: los datos personales no se le escriben a un chatbot
        3: {
            area: 'atletismo', kmk: '4.2', correct: 0, ai: true,
            label: t('Le pides a un chatbot de inteligencia artificial un plan para mejorar en los 100 metros. ¿Qué datos no debes escribirle?',
                'Du bittest einen KI-Chatbot um einen Trainingsplan für die 100 Meter. Welche Daten solltest du ihm nicht schreiben?',
                'You ask an artificial intelligence chatbot for a plan to improve your 100 metres. Which details should you not type into it?'),
            options: [
                t('Tu nombre completo, tu dirección, la ruta y los horarios en que corres, tus contraseñas o fotos tuyas', 'Deinen vollen Namen, deine Adresse, die Route und die Uhrzeiten deiner Läufe, deine Passwörter oder Fotos von dir', 'Your full name, your address, the route and times you run, your passwords or photos of you'),
                t('Tu marca actual en los 100 metros, sin más datos', 'Deine aktuelle Zeit über 100 Meter, ohne weitere Angaben', 'Your current 100-metre time, with nothing else'),
                t('El nombre de tu deporte: atletismo', 'Den Namen deiner Sportart: Leichtathletik', 'The name of your sport: athletics')
            ],
            hint: t('Lo que escribes en un chatbot puede guardarse y usarse para entrenar la IA. Para un plan basta con tu marca; tu ruta y tus horarios dicen dónde estás y cuándo.',
                'Was du einem Chatbot schreibst, kann gespeichert und zum Training der KI genutzt werden. Für einen Plan reicht deine Zeit; Route und Uhrzeiten verraten, wo und wann du unterwegs bist.',
                'What you type into a chatbot can be stored and used to train the AI. Your time is enough for a plan; your route and times show where you are and when.')
        },
        4: {
            area: 'natacion', kmk: '4.2', correct: 0,
            label: t('Piensas subir a una red social pública las fotos de la competencia de natación, con tu nombre y el de tus compañeros. ¿Qué debes tener en cuenta?',
                'Du willst die Fotos vom Schwimmwettkampf mit deinem Namen und den Namen deiner Mitschüler in einem öffentlichen sozialen Netzwerk posten. Was musst du bedenken?',
                'You are thinking of posting the swimming competition photos, with your name and your teammates’ names, on a public social network. What should you keep in mind?'),
            options: [
                t('Que esas fotos quedan en tu huella digital y en la de tus compañeros durante años, así que pides permiso y cuidas lo que muestras', 'Dass diese Fotos jahrelang Teil deines digitalen Fußabdrucks und dem deiner Mitschüler bleiben, deshalb fragst du um Erlaubnis und achtest darauf, was du zeigst', 'That those photos stay in your digital footprint and your teammates’ for years, so you ask for permission and are careful about what you show'),
                t('Que las fotos desaparecen de internet cuando apagas el celular', 'Dass die Fotos aus dem Internet verschwinden, wenn du das Handy ausschaltest', 'That the photos disappear from the internet when you switch off your phone'),
                t('Que solo tus amigos más cercanos podrán verlas', 'Dass sie nur deine engsten Freunde sehen können', 'That only your closest friends will be able to see them')
            ],
            hint: t('Las fotos en traje de baño son especialmente delicadas. Lo que publicas puede copiarse y quedarse en internet para siempre.',
                'Fotos in Badekleidung sind besonders heikel. Was du veröffentlichst, kann kopiert werden und für immer im Internet bleiben.',
                'Photos in swimwear are especially sensitive. What you post can be copied and stay on the internet forever.')
        },
        5: {
            area: 'voleibol', kmk: '4.3', correct: 1,
            label: t('Pasas mucho tiempo frente a la pantalla analizando videos de voleibol para tu equipo. ¿Qué hábitos cuidan tu salud?',
                'Du verbringst viel Zeit vor dem Bildschirm, um Volleyballvideos für deine Mannschaft zu analysieren. Welche Gewohnheiten schützen deine Gesundheit?',
                'You spend a lot of time in front of the screen analysing volleyball videos for your team. Which habits protect your health?'),
            options: [
                t('Ver los videos acostado, con la pantalla muy cerca de los ojos', 'Die Videos im Liegen anschauen, mit dem Bildschirm ganz nah an den Augen', 'Watch the videos lying down, with the screen very close to your eyes'),
                t('Sentarte con la espalda recta, la pantalla a unos 50 cm y hacer pausas activas cada 20 a 30 minutos', 'Gerade sitzen, den Bildschirm etwa 50 cm entfernt halten und alle 20 bis 30 Minuten aktive Pausen machen', 'Sit up straight, keep the screen about 50 cm away and take active breaks every 20 to 30 minutes'),
                t('No parar hasta terminar todos los videos, aunque duelan los ojos', 'Nicht aufhören, bis alle Videos angesehen sind, auch wenn die Augen wehtun', 'Don’t stop until you have watched every video, even if your eyes hurt')
            ],
            hint: t('La postura, la distancia y las pausas cuidan tus ojos y tu espalda. Y moverte en las pausas también es entrenar.',
                'Haltung, Abstand und Pausen schützen Augen und Rücken. Und Bewegung in den Pausen ist auch Training.',
                'Posture, distance and breaks protect your eyes and back. And moving during breaks is training too.')
        },
        6: {
            area: 'polimotor', kmk: '4.1', correct: 0,
            label: t('Para cronometrar el circuito de polimotor descargas una app que pide acceso a tus contactos, tu cámara y tu ubicación. ¿Por qué es riesgoso aceptar todo?',
                'Um den Polimotor-Parcours zu stoppen, lädst du eine App herunter, die Zugriff auf deine Kontakte, deine Kamera und deinen Standort verlangt. Warum ist es riskant, alles zu erlauben?',
                'To time the polymotor circuit you download an app that asks for access to your contacts, camera and location. Why is it risky to allow everything?'),
            options: [
                t('Porque un cronómetro no necesita esos datos: dar permisos de más puede exponer tu información sin necesidad', 'Weil eine Stoppuhr diese Daten nicht braucht: Unnötige Berechtigungen können deine Informationen preisgeben', 'Because a stopwatch doesn’t need that data: giving extra permissions can expose your information for no reason'),
                t('Porque la app tarda más en abrir', 'Weil die App länger zum Öffnen braucht', 'Because the app takes longer to open'),
                t('No es riesgoso: todas las apps piden lo mismo', 'Es ist nicht riskant: Alle Apps verlangen dasselbe', 'It isn’t risky: all apps ask for the same')
            ],
            hint: t('Antes de aceptar, pregúntate si la app necesita ese permiso para funcionar. Si no lo necesita, no se lo des o busca otra app con tu profesor.',
                'Frag dich vor dem Zustimmen, ob die App diese Berechtigung zum Funktionieren braucht. Wenn nicht, erteile sie nicht oder such mit deiner Lehrkraft eine andere App.',
                'Before accepting, ask yourself whether the app needs that permission to work. If not, don’t give it, or look for another app with your teacher.')
        }
    },

    // ── Reto 5 · Solucionar problemas y actuar ──
    5: {
        1: {
            area: 'polimotor', kmk: '5.1', correct: 1,
            label: t('Empieza la clase de Deportes y el parlante bluetooth no suena para la música del circuito de polimotor. ¿Qué revisas primero?',
                'Der Sportunterricht beginnt, und der Bluetooth-Lautsprecher für die Musik beim Polimotor-Parcours spielt nicht. Was prüfst du zuerst?',
                'Sports class starts and the Bluetooth speaker for the polymotor circuit music won’t play. What do you check first?'),
            options: [
                t('Golpear el parlante hasta que suene', 'Auf den Lautsprecher schlagen, bis er funktioniert', 'Bang the speaker until it plays'),
                t('Que el parlante esté encendido y cargado, que el bluetooth esté activado y emparejado con el dispositivo correcto, y el volumen', 'Ob der Lautsprecher eingeschaltet und geladen ist, ob Bluetooth aktiviert und mit dem richtigen Gerät gekoppelt ist, und die Lautstärke', 'That the speaker is on and charged, that Bluetooth is on and paired with the right device, and the volume'),
                t('Cancelar el circuito sin avisar al profesor', 'Den Parcours absagen, ohne der Lehrkraft Bescheid zu sagen', 'Cancel the circuit without telling the teacher')
            ],
            hint: t('Empieza por lo más simple: encendido, batería, conexión y volumen. La mayoría de las fallas se resuelven así.',
                'Fang mit dem Einfachsten an: Einschalten, Akku, Verbindung und Lautstärke. Die meisten Störungen lassen sich so beheben.',
                'Start with the simplest things: power, battery, connection and volume. Most faults are fixed that way.')
        },
        2: {
            area: 'atletismo', kmk: '5.1', correct: 1,
            label: t('El programa de análisis de video se congela mientras revisas tu salida de atletismo en cámara lenta. ¿Qué es lo más lógico?',
                'Das Videoanalyse-Programm friert ein, während du deinen Leichtathletik-Start in Zeitlupe ansiehst. Was ist am sinnvollsten?',
                'The video analysis program freezes while you review your athletics start in slow motion. What is the most sensible thing to do?'),
            options: [
                t('Esperar una hora sin hacer nada y perder la clase', 'Eine Stunde lang nichts tun und den Unterricht verpassen', 'Wait an hour doing nothing and miss the class'),
                t('Esperar un momento; si sigue igual, cerrar el programa (Administrador de tareas o Alt+F4), volver a abrirlo y cargar el video otra vez', 'Kurz warten; wenn es so bleibt, das Programm schließen (Task-Manager oder Alt+F4), wieder öffnen und das Video neu laden', 'Wait a moment; if it stays the same, close the program (Task Manager or Alt+F4), open it again and reload the video'),
                t('Borrar el video y todos los programas del computador', 'Das Video und alle Programme vom Computer löschen', 'Delete the video and every program on the computer')
            ],
            hint: t('Forzar el cierre de un programa congelado y abrirlo de nuevo suele resolver el problema. El video sigue guardado en tu carpeta.',
                'Ein eingefrorenes Programm zu beenden und neu zu öffnen, löst das Problem meistens. Das Video bleibt in deinem Ordner gespeichert.',
                'Forcing a frozen program to close and opening it again usually fixes the problem. The video is still saved in your folder.')
        },
        3: {
            area: 'baloncesto', kmk: '5.5', correct: 0,
            label: t('Escribes en una app de entrenamiento la rutina de baloncesto: repetir 10 veces «lanzar, recoger el balón y volver a la línea». ¿Qué estructura es la más adecuada?',
                'Du schreibst in einer Trainings-App die Basketball-Routine: 10-mal „werfen, Ball holen und zur Linie zurück“. Welche Struktur passt am besten?',
                'You are writing the basketball routine in a training app: repeat 10 times “shoot, get the ball and go back to the line”. Which structure is best?'),
            options: [
                t('Un bucle («repetir 10 veces») con las tres instrucciones dentro', 'Eine Schleife („10-mal wiederholen“) mit den drei Anweisungen darin', 'A loop (“repeat 10 times”) with the three instructions inside'),
                t('Copiar y pegar las tres instrucciones diez veces', 'Die drei Anweisungen zehnmal kopieren und einfügen', 'Copy and paste the three instructions ten times'),
                t('Poner al principio la instrucción «terminar entrenamiento»', 'Am Anfang die Anweisung „Training beenden“ setzen', 'Put the instruction “end training” at the start')
            ],
            hint: t('Un bucle repite instrucciones sin copiarlas: la rutina queda más corta y fácil de cambiar. Es un algoritmo, como los de programación.',
                'Eine Schleife wiederholt Anweisungen, ohne sie zu kopieren: Die Routine wird kürzer und lässt sich leichter ändern. Das ist ein Algorithmus wie beim Programmieren.',
                'A loop repeats instructions without copying them: the routine is shorter and easier to change. It’s an algorithm, just like in coding.')
        },
        // IA: un asistente de IA como tutor, sin reemplazar al profesor ni poner en riesgo la salud
        4: {
            area: 'natacion', kmk: '5.3', correct: 1, ai: true,
            label: t('Quieres aprender el viraje de natación y no te sale. ¿Cómo te ayuda mejor un asistente de inteligencia artificial?',
                'Du willst die Wende beim Schwimmen lernen, aber sie klappt nicht. Wie hilft dir ein KI-Assistent am besten?',
                'You want to learn the swimming turn but you can’t get it right. How can an artificial intelligence assistant help you best?'),
            options: [
                t('Le pides que te diga que ya lo haces bien para no practicar más', 'Du lässt dir sagen, dass du es schon gut machst, damit du nicht mehr üben musst', 'You ask it to tell you that you already do it well so you don’t have to practise any more'),
                t('Le pides que te explique el viraje paso a paso, lo practicas por partes con tu profesor y compruebas con él lo que te dijo la IA', 'Du bittest ihn, die Wende Schritt für Schritt zu erklären, übst sie in Teilschritten mit deiner Lehrkraft und prüfst mit ihr, was die KI gesagt hat', 'You ask it to explain the turn step by step, practise it in parts with your teacher and check with them what the AI said'),
                t('Sigues al pie de la letra cualquier ejercicio que te proponga, aunque sea peligroso en la piscina', 'Du machst jede vorgeschlagene Übung genau nach, auch wenn sie im Schwimmbad gefährlich ist', 'You follow any exercise it suggests to the letter, even if it is dangerous in the pool')
            ],
            hint: t('La IA puede explicarte la técnica, pero no te ve nadar ni reemplaza a tu profesor. Úsala para entender y practica con supervisión.',
                'KI kann dir die Technik erklären, aber sie sieht dich nicht schwimmen und ersetzt deine Lehrkraft nicht. Nutze sie zum Verstehen und übe unter Aufsicht.',
                'AI can explain the technique, but it can’t see you swim and doesn’t replace your teacher. Use it to understand and practise under supervision.')
        },
        5: {
            area: 'voleibol', kmk: '5.2', correct: 1,
            label: t('Tu equipo organiza un torneo de voleibol del colegio. ¿Con qué criterio eligen las herramientas digitales?',
                'Dein Team organisiert ein Volleyballturnier der Schule. Nach welchem Kriterium wählt ihr die digitalen Werkzeuge?',
                'Your team is organising a school volleyball tournament. How do you choose the digital tools?'),
            options: [
                t('La aplicación más popular en redes sociales, para todo', 'Die beliebteste App in den sozialen Netzwerken, für alles', 'The most popular app on social media, for everything'),
                t('La que mejor sirve para cada parte: una hoja de cálculo para el fixture y los resultados, Teams para avisar y un formulario para las inscripciones', 'Das, was für jeden Teil am besten passt: eine Tabellenkalkulation für Spielplan und Ergebnisse, Teams für Mitteilungen und ein Formular für die Anmeldungen', 'Whatever works best for each part: a spreadsheet for the fixtures and results, Teams for announcements and a form for sign-ups'),
                t('La que tenga más efectos y colores', 'Das mit den meisten Effekten und Farben', 'The one with the most effects and colours')
            ],
            hint: t('Cada herramienta tiene su fuerte. Elegir según la necesidad ahorra tiempo y evita errores en los resultados.',
                'Jedes Werkzeug hat seine Stärken. Wer nach Bedarf auswählt, spart Zeit und vermeidet Fehler bei den Ergebnissen.',
                'Every tool has its strengths. Choosing by need saves time and avoids mistakes in the results.')
        },
        6: {
            area: 'atletismo', kmk: '5.4', correct: 1,
            label: t('Problema: la hoja de cálculo de tus tiempos de atletismo muestra un promedio imposible de 95 segundos en los 100 metros. ¿Cuál es el método más recomendable para encontrar el error?',
                'Problem: Die Tabelle mit deinen Leichtathletikzeiten zeigt über 100 Meter einen unmöglichen Durchschnitt von 95 Sekunden. Wie findest du den Fehler am besten?',
                'Problem: the spreadsheet with your athletics times shows an impossible average of 95 seconds for the 100 metres. What is the best method to find the error?'),
            options: [
                t('Borrar toda la hoja y empezar de cero', 'Die ganze Tabelle löschen und von vorn beginnen', 'Delete the whole sheet and start again'),
                t('Revisar paso a paso: los datos de cada carrera, la fórmula del promedio y el rango de celdas que toma, hasta encontrar dónde falla', 'Schritt für Schritt prüfen: die Daten jedes Laufs, die Formel für den Durchschnitt und den Zellbereich, bis du findest, wo der Fehler liegt', 'Check step by step: each race’s data, the average formula and the cell range it uses, until you find where it goes wrong'),
                t('Cambiar el número a mano para que se vea bien', 'Die Zahl von Hand ändern, damit sie gut aussieht', 'Change the number by hand so it looks right')
            ],
            hint: t('Revisar por partes (datos, fórmula, celdas) te lleva al error exacto. Cambiar el resultado a mano solo esconde el problema.',
                'Teil für Teil zu prüfen (Daten, Formel, Zellen) führt dich zum genauen Fehler. Das Ergebnis von Hand zu ändern, versteckt das Problem nur.',
                'Checking part by part (data, formula, cells) leads you to the exact error. Changing the result by hand only hides the problem.')
        }
    },

    // ── Reto 6 · Analizar y reflexionar ──
    6: {
        1: {
            area: 'natacion', kmk: '6.1', correct: 1,
            label: t('Ves este titular en redes: «Un nadador cruzó el océano Atlántico en un solo día». ¿Cómo compruebas si es falso?',
                'Du siehst diese Schlagzeile in sozialen Netzwerken: „Ein Schwimmer hat den Atlantik an einem einzigen Tag durchquert“. Wie prüfst du, ob sie falsch ist?',
                'You see this headline on social media: “A swimmer crossed the Atlantic Ocean in a single day”. How do you check whether it is false?'),
            options: [
                t('Compartirlo rápido porque parece una hazaña increíble', 'Sie schnell teilen, weil es eine unglaubliche Leistung zu sein scheint', 'Share it quickly because it seems like an incredible feat'),
                t('Aplicar SIFT: detenerte, investigar la fuente, buscar si medios deportivos confiables lo publican y rastrear el origen', 'SIFT anwenden: innehalten, die Quelle untersuchen, prüfen, ob verlässliche Sportmedien darüber berichten, und den Ursprung zurückverfolgen', 'Apply SIFT: stop, investigate the source, see whether reliable sports media report it, and trace the origin'),
                t('Creerlo si tiene muchos «me gusta»', 'Ihr glauben, wenn sie viele „Gefällt mir“ hat', 'Believe it if it has lots of “likes”')
            ],
            hint: t('SIFT: detente, investiga la fuente, busca mejor cobertura y rastrea el origen. Una hazaña así estaría en todos los medios deportivos serios.',
                'SIFT: innehalten, Quelle untersuchen, bessere Berichte suchen und den Ursprung zurückverfolgen. Eine solche Leistung stünde in allen seriösen Sportmedien.',
                'SIFT: stop, investigate the source, find better coverage and trace the origin. A feat like that would be in every serious sports outlet.')
        },
        2: {
            area: 'baloncesto', kmk: '6.2', correct: 0,
            label: t('Después de ver algunos videos de jugadas de baloncesto, la plataforma solo te recomienda videos de baloncesto. ¿Qué es una «burbuja de filtro»?',
                'Nachdem du einige Basketball-Videos angesehen hast, empfiehlt dir die Plattform nur noch Basketball-Videos. Was ist eine „Filterblase“?',
                'After watching a few basketball highlight videos, the platform only recommends basketball videos. What is a “filter bubble”?'),
            options: [
                t('Cuando el algoritmo solo te muestra contenidos parecidos a tu historial y te oculta otros deportes y otras perspectivas', 'Wenn der Algorithmus dir nur Inhalte zeigt, die deinem Verlauf ähneln, und dir andere Sportarten und Sichtweisen vorenthält', 'When the algorithm only shows you content similar to your history and hides other sports and points of view'),
                t('Un filtro que pone burbujas en los videos de baloncesto', 'Ein Filter, der Blasen in die Basketball-Videos setzt', 'A filter that puts bubbles on the basketball videos'),
                t('Un antivirus que bloquea los videos de deportes', 'Ein Virenschutz, der Sportvideos sperrt', 'An antivirus that blocks sports videos')
            ],
            hint: t('Los algoritmos aprenden de lo que ves y te ofrecen más de lo mismo. Buscar a propósito otros deportes y otras fuentes te ayuda a salir de la burbuja.',
                'Algorithmen lernen aus dem, was du ansiehst, und bieten dir mehr vom Gleichen an. Wer bewusst andere Sportarten und Quellen sucht, kommt aus der Blase heraus.',
                'Algorithms learn from what you watch and offer you more of the same. Deliberately looking for other sports and sources helps you get out of the bubble.')
        },
        // IA: uso ético y transparente de la IA generativa
        3: {
            area: 'voleibol', kmk: '6.2', correct: 1, ai: true,
            label: t('Quieres usar una inteligencia artificial como Copilot para escribir el informe de tu torneo de voleibol. ¿Cuál es el uso ético?',
                'Du möchtest eine KI wie Copilot nutzen, um den Bericht über euer Volleyballturnier zu schreiben. Was ist ein ethischer Umgang damit?',
                'You want to use an AI such as Copilot to write the report on your volleyball tournament. What is the ethical way to use it?'),
            options: [
                t('Copiar el texto que genera y entregarlo como tuyo', 'Den erzeugten Text kopieren und als deinen abgeben', 'Copy the text it generates and hand it in as yours'),
                t('Usarla como apoyo para ordenar ideas, verificar los datos y los resultados, escribir con tus palabras y declarar que la usaste', 'Sie als Hilfe zum Ordnen der Ideen nutzen, Angaben und Ergebnisse prüfen, mit eigenen Worten schreiben und angeben, dass du sie benutzt hast', 'Use it to help organise ideas, check the facts and results, write in your own words and say that you used it'),
                t('Pedirle que invente los resultados que no recuerdas', 'Sie die Ergebnisse erfinden lassen, an die du dich nicht erinnerst', 'Ask it to make up the results you can’t remember')
            ],
            hint: t('La IA puede equivocarse o inventar datos, como un marcador que nunca existió. Úsala con transparencia y revisa todo con tus registros.',
                'KI kann sich irren oder Angaben erfinden, etwa einen Spielstand, den es nie gab. Nutze sie offen und prüfe alles mit deinen Aufzeichnungen.',
                'AI can make mistakes or invent facts, like a score that never happened. Use it openly and check everything against your records.')
        },
        4: {
            area: 'polimotor', kmk: '6.2', correct: 0,
            label: t('Entre videojuegos, videos y tareas pasas muchas horas sentado frente a pantallas y te queda poco tiempo para moverte. ¿Por qué conviene autorregular el tiempo de conexión?',
                'Zwischen Videospielen, Videos und Hausaufgaben sitzt du viele Stunden vor Bildschirmen, und dir bleibt wenig Zeit für Bewegung. Warum solltest du deine Bildschirmzeit selbst einteilen?',
                'Between video games, videos and homework you spend many hours sitting in front of screens and have little time left to move. Why should you manage your screen time?'),
            options: [
                t('Para dormir bien, evitar dolores y cansancio visual, y dejar tiempo para el juego y el movimiento, como el circuito de polimotor', 'Um gut zu schlafen, Schmerzen und müde Augen zu vermeiden und Zeit für Spiel und Bewegung zu lassen, etwa für den Polimotor-Parcours', 'To sleep well, avoid aches and tired eyes, and leave time for play and movement, such as the polymotor circuit'),
                t('Porque las pantallas se dañan si se usan mucho', 'Weil Bildschirme kaputtgehen, wenn man sie viel benutzt', 'Because screens break if you use them a lot'),
                t('No hace falta: mientras más horas de pantalla, mejor', 'Das ist nicht nötig: Je mehr Bildschirmzeit, desto besser', 'There’s no need: the more screen time, the better')
            ],
            hint: t('El cuerpo necesita moverse cada día. Equilibrar pantallas, descanso y actividad física te ayuda a rendir en el deporte y en el colegio.',
                'Der Körper braucht jeden Tag Bewegung. Wer Bildschirm, Erholung und Sport ausgleicht, ist im Sport und in der Schule leistungsfähiger.',
                'Your body needs to move every day. Balancing screens, rest and physical activity helps you perform in sport and at school.')
        },
        5: {
            area: 'atletismo', kmk: '6.1', correct: 0,
            label: t('Investigando para Deportes encuentras una reseña de «las mejores zapatillas para correr», escrita por la misma marca que las vende. ¿Cómo identificas el sesgo comercial?',
                'Bei deiner Recherche für Sport findest du einen Test der „besten Laufschuhe“, geschrieben von der Marke, die sie verkauft. Woran erkennst du die kommerzielle Absicht?',
                'Researching for Sports, you find a review of “the best running shoes” written by the brand that sells them. How do you spot the commercial bias?'),
            options: [
                t('Por los botones de compra, los descuentos «solo por hoy» y un texto que solo elogia esas zapatillas sin compararlas con otras', 'An den Kaufknöpfen, den Rabatten „nur heute“ und einem Text, der nur diese Schuhe lobt, ohne sie mit anderen zu vergleichen', 'By the buy buttons, the “today only” discounts and a text that only praises those shoes without comparing them with others'),
                t('Por el color de fondo de la página', 'An der Hintergrundfarbe der Seite', 'By the page’s background colour'),
                t('Porque tiene muchas fotos de atletas corriendo', 'Daran, dass sie viele Fotos von laufenden Athleten hat', 'Because it has lots of photos of athletes running')
            ],
            hint: t('Si quien escribe gana dinero con lo que recomienda, el texto busca venderte algo. Compara con pruebas independientes antes de decidir.',
                'Wenn die Verfasser mit ihrer Empfehlung Geld verdienen, will der Text dir etwas verkaufen. Vergleiche mit unabhängigen Tests, bevor du dich entscheidest.',
                'If the writer earns money from what they recommend, the text is trying to sell you something. Compare with independent tests before you decide.')
        },
        6: {
            area: 'baloncesto', kmk: '6.2', correct: 1,
            label: t('Quieres publicar en un sitio público, con tu nombre, un video con las mejores jugadas de tu equipo de baloncesto. ¿Qué impacto tiene?',
                'Du willst ein Video mit den besten Spielzügen deiner Basketballmannschaft mit deinem Namen auf einer öffentlichen Seite veröffentlichen. Welche Auswirkungen hat das?',
                'You want to post a video of your basketball team’s best plays on a public site with your name. What impact does it have?'),
            options: [
                t('Ninguno: internet se olvida rápido de los videos', 'Keine: Das Internet vergisst Videos schnell', 'None: the internet quickly forgets videos'),
                t('Afecta tu reputación digital y la de tus compañeros, así que revisas el video, pides permiso a quienes aparecen y respetas los derechos de la música que usas', 'Es prägt deinen digitalen Ruf und den deiner Mitspieler, deshalb prüfst du das Video, fragst die Abgebildeten um Erlaubnis und beachtest die Rechte an der Musik', 'It shapes your digital reputation and your teammates’, so you check the video, ask the people in it for permission and respect the rights to the music you use'),
                t('Solo importa cuántas visualizaciones tenga', 'Es zählt nur, wie viele Aufrufe es hat', 'All that matters is how many views it gets')
            ],
            hint: t('Lo que publicas con tu nombre forma tu reputación en línea durante años. Pedir permiso y respetar los derechos de autor es actuar con responsabilidad.',
                'Was du mit deinem Namen veröffentlichst, prägt jahrelang deinen Ruf im Netz. Um Erlaubnis zu fragen und das Urheberrecht zu beachten, ist verantwortungsvolles Handeln.',
                'What you post under your name shapes your online reputation for years. Asking permission and respecting copyright is acting responsibly.')
        }
    }
};

module.exports = { SPORTS_QUESTIONS, SPORTS_AREAS };
