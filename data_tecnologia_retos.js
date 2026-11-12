// ═══════════════════════════════════════════
// MedienPass - Retos 1-6 de Tecnología (K3-K12), ambientados en las plataformas del colegio:
// Ozaria, CodeCombat, codeSpark, OneNote, Teams, Minecraft Education y BookStudio (su lienzo libre
// para libros interactivos, https://bookstudio.uk/). Las plataformas se mezclan en cada reto.
// Los retos 1 a 3 tienen la temática de la película Ready Player One («Misión OASIS», TECH_RETO_THEMES).
//
// Cada pregunta conserva la subcompetencia KMK (kmk) y la posición de la respuesta correcta
// (correct) de la plantilla común de data_questions.js, para que las respuestas ya guardadas se
// califiquen igual; npm test lo comprueba. La versión visual (Prekínder a K2) sigue en data_visual.js.
// ═══════════════════════════════════════════

const t = (es, de, en) => ({ es, de, en });

// TECHNOLOGY_QUESTIONS[reto][pregunta] = { kmk, correct, label, options: [3], hint }
const TECHNOLOGY_QUESTIONS = {
    // ── Reto 1 · Buscar, procesar y archivar ──
    // Misión OASIS (Ready Player One): como los «gunters», buscar pistas, comprobar fuentes y guardar hallazgos
    1: {
        1: {
            kmk: '1.1', correct: 0,
            label: t('Como los «gunters» de Ready Player One, buscas pistas sobre los videojuegos clásicos para el desafío que estás construyendo en Minecraft Education. ¿Qué búsqueda te da resultados más precisos y confiables?',
                'Wie die „Gunter“ in Ready Player One suchst du Hinweise zu klassischen Videospielen für die Challenge, die du in Minecraft Education baust. Welche Suche liefert die genauesten und verlässlichsten Ergebnisse?',
                'Like the “gunters” in Ready Player One, you are looking for clues about classic video games for the challenge you are building in Minecraft Education. Which search gives you the most precise and reliable results?'),
            options: [
                t('Buscar con comillas y operadores: "Atari Adventure" "easter egg" 1979 -trucos', 'Mit Anführungszeichen und Operatoren suchen: "Atari Adventure" "Easter Egg" 1979 -Cheats', 'Search with quotation marks and operators: "Atari Adventure" "easter egg" 1979 -cheats'),
                t('Escribir «cosas de la peli de los videojuegos» y abrir cualquier resultado', '„Sachen aus dem Videospielfilm“ eingeben und irgendein Ergebnis öffnen', 'Type “stuff from the video game movie” and open any result'),
                t('Abrir el primer video de «trucos para ganar en Minecraft Education» que aparezca', 'Das erste Video mit „Tricks zum Gewinnen in Minecraft Education“ öffnen', 'Open the first “tricks to win in Minecraft Education” video that appears')
            ],
            hint: t('Las comillas buscan la frase exacta y el signo menos (-) deja fuera lo que no quieres. El primer «easter egg» famoso está en Adventure (Atari, 1979), el juego del último desafío de la película.',
                'Anführungszeichen suchen die genaue Wortfolge, das Minuszeichen (-) schließt Unerwünschtes aus. Das erste berühmte „Easter Egg“ steckt in Adventure (Atari, 1979), dem Spiel der letzten Challenge im Film.',
                'Quotation marks search for the exact phrase and the minus sign (-) leaves out what you don’t want. The first famous “easter egg” is in Adventure (Atari, 1979), the game of the film’s last challenge.')
        },
        2: {
            kmk: '1.2', correct: 1,
            label: t('Para tu página de OneNote sobre Ready Player One encuentras varias páginas que dicen en qué se basa la película. ¿Cómo decides cuál es confiable?',
                'Für deine OneNote-Seite über Ready Player One findest du mehrere Seiten, die erklären, worauf der Film beruht. Wie entscheidest du, welche verlässlich ist?',
                'For your OneNote page about Ready Player One you find several pages that say what the film is based on. How do you decide which one is reliable?'),
            options: [
                t('La que tiene más memes y fondos animados', 'Die mit den meisten Memes und animierten Hintergründen', 'The one with the most memes and animated backgrounds'),
                t('La que tiene autor y fecha, cita sus fuentes y coincide con otras: la película (2018) se basa en la novela de Ernest Cline (2011)', 'Die mit Autor und Datum, die ihre Quellen nennt und mit anderen übereinstimmt: Der Film (2018) beruht auf dem Roman von Ernest Cline (2011)', 'The one with an author and a date that cites its sources and matches others: the film (2018) is based on Ernest Cline’s novel (2011)'),
                t('Un comentario anónimo en un foro de fans', 'Ein anonymer Kommentar in einem Fanforum', 'An anonymous comment on a fan forum')
            ],
            hint: t('Una fuente confiable dice quién escribió, cuándo y de dónde salen los datos, y coincide con otras fuentes serias. Los foros anónimos pueden inventar.',
                'Eine verlässliche Quelle nennt, wer wann geschrieben hat und woher die Angaben stammen, und stimmt mit anderen seriösen Quellen überein. Anonyme Foren können erfinden.',
                'A reliable source says who wrote it, when and where the facts come from, and matches other serious sources. Anonymous forums can make things up.')
        },
        3: {
            kmk: '1.3', correct: 1,
            label: t('Como Parzival, que anotaba cada pista de la búsqueda, quieres guardar las pistas de tu misión de CodeCombat. ¿Cuál es la mejor forma de organizarlas en la nube?',
                'Wie Parzival, der jeden Hinweis der Suche notierte, willst du die Hinweise deiner CodeCombat-Mission speichern. Wie ordnest du sie am besten in der Cloud?',
                'Like Parzival, who wrote down every clue of the hunt, you want to keep the clues of your CodeCombat mission. What is the best way to organise them in the cloud?'),
            options: [
                t('Dejarlas en «Descargas» con nombres como «pista1» o «sin título»', 'Sie in „Downloads“ lassen, mit Namen wie „Hinweis1“ oder „Unbenannt“', 'Leave them in “Downloads” with names like “clue1” or “Untitled”'),
                t('Una sección de OneNote por llave (cobre, jade y cristal) con páginas fechadas, y los archivos en carpetas claras: 2026 > Tecnología > Misión OASIS', 'Einen OneNote-Abschnitt pro Schlüssel (Kupfer, Jade und Kristall) mit datierten Seiten und die Dateien in klaren Ordnern: 2026 > Technologie > Mission OASIS', 'One OneNote section per key (copper, jade and crystal) with dated pages, and the files in clear folders: 2026 > Technology > OASIS Mission'),
                t('Guardarlas en el escritorio del computador compartido del colegio', 'Sie auf dem Desktop des gemeinsamen Schulcomputers speichern', 'Save them on the desktop of the shared school computer')
            ],
            hint: t('En la película hay tres llaves: cobre, jade y cristal. Ordenar tus pistas por llave y con fecha te deja encontrarlas rápido, y en la nube del colegio no se pierden.',
                'Im Film gibt es drei Schlüssel: Kupfer, Jade und Kristall. Wenn du deine Hinweise nach Schlüssel und mit Datum ordnest, findest du sie schnell, und in der Schul-Cloud gehen sie nicht verloren.',
                'In the film there are three keys: copper, jade and crystal. Organising your clues by key and with dates lets you find them quickly, and in the school cloud they don’t get lost.')
        },
        4: {
            kmk: '1.2', correct: 0,
            label: t('Para tu libro de BookStudio sobre la película lees dos frases: «En Ready Player One, el OASIS es un mundo de realidad virtual creado por James Halliday.» y «El OASIS es el mejor lugar para vivir.». ¿Cómo distingues el hecho de la opinión?',
                'Für dein BookStudio-Buch über den Film liest du zwei Sätze: „In Ready Player One ist die OASIS eine virtuelle Welt, die James Halliday erschaffen hat.“ und „Die OASIS ist der beste Ort zum Leben.“ Wie unterscheidest du Tatsache und Meinung?',
                'For your BookStudio book about the film you read two sentences: “In Ready Player One, the OASIS is a virtual reality world created by James Halliday.” and “The OASIS is the best place to live.” How do you tell the fact from the opinion?'),
            options: [
                t('La primera es un hecho porque se comprueba viendo la película o leyendo la novela; la segunda es una opinión porque expresa un gusto personal', 'Der erste ist eine Tatsache, weil man ihn im Film oder im Roman prüfen kann; der zweite ist eine Meinung, weil er einen persönlichen Geschmack ausdrückt', 'The first is a fact because you can check it by watching the film or reading the novel; the second is an opinion because it expresses a personal taste'),
                t('Las dos son hechos porque salen en un libro de BookStudio', 'Beide sind Tatsachen, weil sie in einem BookStudio-Buch stehen', 'Both are facts because they appear in a BookStudio book'),
                t('La segunda es un hecho porque a muchos personajes les encanta el OASIS', 'Der zweite ist eine Tatsache, weil viele Figuren die OASIS lieben', 'The second is a fact because many characters love the OASIS')
            ],
            hint: t('Un hecho se puede comprobar en una fuente. Una opinión dice lo que alguien siente o prefiere; en la película, de hecho, los personajes descubren que la vida real también importa.',
                'Eine Tatsache lässt sich in einer Quelle prüfen. Eine Meinung sagt, was jemand fühlt oder bevorzugt; im Film entdecken die Figuren übrigens, dass auch das echte Leben zählt.',
                'A fact can be checked in a source. An opinion says what someone feels or prefers; in the film, in fact, the characters discover that real life matters too.')
        },
        // IA: un chatbot como fuente de información (se comprueba con la ayuda oficial)
        5: {
            kmk: '1.1', correct: 0, ai: true,
            label: t('En Ozaria aparece la palabra «easter egg», como el premio que buscan todos en Ready Player One. Le preguntas a un chatbot de inteligencia artificial (IA) y te da una definición muy segura. ¿Qué haces?',
                'In Ozaria taucht das Wort „Easter Egg“ auf, wie der Preis, den alle in Ready Player One suchen. Du fragst einen KI-Chatbot, und er gibt dir eine sehr selbstsichere Erklärung. Was tust du?',
                'In Ozaria you see the word “easter egg”, like the prize everyone is looking for in Ready Player One. You ask an artificial intelligence (AI) chatbot and it gives you a very confident definition. What do you do?'),
            options: [
                t('La comparo con la ayuda oficial de Ozaria o CodeCombat y con lo visto en clase, porque la IA puede equivocarse, y la anoto en mi glosario de OneNote', 'Ich vergleiche sie mit der offiziellen Hilfe von Ozaria oder CodeCombat und mit dem Unterricht, weil KI sich irren kann, und notiere sie in meinem OneNote-Glossar', 'I compare it with the official Ozaria or CodeCombat help and with what we saw in class, because AI can be wrong, and note it in my OneNote glossary'),
                t('La copio tal cual en OneNote: si la IA lo dice con seguridad, es correcto', 'Ich übernehme sie unverändert in OneNote: Wenn die KI es selbstsicher sagt, stimmt es', 'I copy it as it is into OneNote: if the AI says it confidently, it is right'),
                t('Le pido a la IA que resuelva por mí el nivel de Ozaria, sin leer la explicación', 'Ich lasse die KI das Ozaria-Level für mich lösen, ohne die Erklärung zu lesen', 'I ask the AI to solve the Ozaria level for me without reading the explanation')
            ],
            hint: t('Un «easter egg» es un secreto que los creadores esconden en un juego o programa. Los chatbots de IA responden con seguridad aunque se equivoquen («alucinaciones»): compara siempre con una fuente confiable.',
                'Ein „Easter Egg“ ist ein Geheimnis, das die Entwickler in einem Spiel oder Programm verstecken. KI-Chatbots antworten selbstsicher, auch wenn sie sich irren („Halluzinationen“): Vergleiche immer mit einer verlässlichen Quelle.',
                'An “easter egg” is a secret the creators hide in a game or program. AI chatbots answer confidently even when they are wrong (“hallucinations”): always compare with a reliable source.')
        },
        6: {
            kmk: '1.2', correct: 1,
            label: t('Terminas en BookStudio una guía de los videojuegos clásicos que aparecen en Ready Player One. ¿Cómo validas las referencias que incluyes?',
                'Du stellst in BookStudio einen Leitfaden zu den klassischen Videospielen in Ready Player One fertig. Wie überprüfst du die Quellen, die du angibst?',
                'You are finishing a BookStudio guide to the classic video games that appear in Ready Player One. How do you check the references you include?'),
            options: [
                t('Copio el primer enlace que encuentro, sin revisarlo', 'Ich übernehme den ersten Link, den ich finde, ungeprüft', 'I copy the first link I find without checking it'),
                t('Contrasto cada dato en al menos dos fuentes confiables (museos del videojuego, bibliotecas, sitios de las empresas) y agrego una lista con los enlaces y la fecha de consulta', 'Ich prüfe jede Angabe in mindestens zwei verlässlichen Quellen (Videospielmuseen, Bibliotheken, Seiten der Firmen) und füge eine Liste mit Links und Abrufdatum hinzu', 'I check each fact in at least two reliable sources (video game museums, libraries, company websites) and add a list with the links and the date I looked them up'),
                t('No pongo fuentes: todos ya vieron la película', 'Ich gebe keine Quellen an: Alle haben den Film ja gesehen', 'I don’t add sources: everyone has seen the film anyway')
            ],
            hint: t('Contrastar en dos fuentes evita errores, y la lista de referencias permite que otros comprueben tu guía, como hacían los «gunters» con cada pista.',
                'Der Vergleich mit zwei Quellen vermeidet Fehler, und das Quellenverzeichnis erlaubt anderen, deinen Leitfaden zu prüfen – wie es die „Gunter“ mit jedem Hinweis taten.',
                'Checking two sources avoids mistakes, and the reference list lets others check your guide, just as the “gunters” did with every clue.')
        }
    },

    // ── Reto 2 · Comunicar y cooperar ──
    // Misión OASIS (Ready Player One): como el clan de Parzival, Art3mis y Aech, comunicarse y cooperar con respeto
    2: {
        1: {
            kmk: '2.1', correct: 1,
            label: t('Como Parzival cuando le pide ayuda a Aech, necesitas escribirle por Teams a tu profesor de Tecnología porque no puedes entrar a tu cuenta de CodeCombat. ¿Cómo debe ser el mensaje?',
                'Wie Parzival, als er Aech um Hilfe bittet, musst du deiner Technologie-Lehrkraft in Teams schreiben, weil du nicht in dein CodeCombat-Konto kommst. Wie sollte die Nachricht aussehen?',
                'Like Parzival when he asks Aech for help, you need to write to your Technology teacher on Teams because you can’t get into your CodeCombat account. What should the message look like?'),
            options: [
                t('Un mensaje en el chat general de la clase: «NO ME FUNCIONA» con muchos emojis', 'Eine Nachricht im allgemeinen Klassenchat: „GEHT NICHT“ mit vielen Emojis', 'A message in the general class chat: “IT DOESN’T WORK” with lots of emojis'),
                t('Un mensaje por Teams, respetuoso, con saludo, tu nombre y curso, qué pasa con tu cuenta de CodeCombat y una despedida', 'Eine respektvolle Teams-Nachricht mit Begrüßung, deinem Namen und deiner Klasse, was mit deinem CodeCombat-Konto los ist, und einem Gruß', 'A respectful Teams message with a greeting, your name and class, what is wrong with your CodeCombat account and a sign-off'),
                t('Un audio de cinco minutos enviado a medianoche', 'Eine fünfminütige Sprachnachricht um Mitternacht', 'A five-minute voice message sent at midnight')
            ],
            hint: t('Un mensaje claro y respetuoso, por el canal adecuado y a una hora razonable, ayuda a que tu profesor te responda rápido.',
                'Eine klare, respektvolle Nachricht über den passenden Kanal und zu einer vernünftigen Uhrzeit hilft deiner Lehrkraft, schnell zu antworten.',
                'A clear, respectful message through the right channel and at a reasonable time helps your teacher answer quickly.')
        },
        2: {
            kmk: '2.2', correct: 1,
            label: t('Tu equipo, como el clan de Parzival, Art3mis y Aech en Ready Player One, comparte en Teams la carpeta con el mapa de su mundo de Minecraft Education. ¿Cómo configuras los permisos?',
                'Dein Team teilt wie der Clan von Parzival, Art3mis und Aech in Ready Player One in Teams den Ordner mit der Karte eurer Minecraft-Education-Welt. Wie stellst du die Berechtigungen ein?',
                'Your team, like Parzival, Art3mis and Aech’s clan in Ready Player One, shares the folder with the map of your Minecraft Education world on Teams. How do you set the permissions?'),
            options: [
                t('Un enlace público con permiso de edición para cualquier persona: hasta los «sixers» de IOI podrían borrarlo', 'Ein öffentlicher Link mit Bearbeitungsrecht für alle: Sogar die „Sixer“ von IOI könnten ihn löschen', 'A public link with edit rights for anyone: even IOI’s “sixers” could delete it'),
                t('Solo para los correos del colegio de tu equipo, decidiendo quién edita y quién solo puede ver', 'Nur für die Schul-E-Mail-Adressen deines Teams, und du legst fest, wer bearbeiten und wer nur ansehen darf', 'Only for your team’s school email addresses, deciding who can edit and who can only view'),
                t('Compartir tu usuario y tu contraseña con todo el equipo', 'Deinen Benutzernamen und dein Passwort mit dem ganzen Team teilen', 'Share your username and password with the whole team')
            ],
            hint: t('En la película, el clan protege lo que descubre. Compartir solo con tu equipo y decidir quién edita protege su trabajo; tu contraseña es solo tuya.',
                'Im Film schützt der Clan, was er entdeckt. Nur mit dem Team zu teilen und festzulegen, wer bearbeitet, schützt eure Arbeit; dein Passwort gehört nur dir.',
                'In the film, the clan protects what it discovers. Sharing only with your team and deciding who edits protects your work; your password is yours alone.')
        },
        3: {
            kmk: '2.4', correct: 0,
            label: t('En el chat de Teams de tu clan de Minecraft Education, un compañero escribe todo en MAYÚSCULAS después de perder una carrera, como los jugadores furiosos de la carrera del OASIS. ¿Por qué conviene evitarlo?',
                'Im Teams-Chat deines Minecraft-Education-Clans schreibt ein Mitspieler nach einem verlorenen Rennen alles in GROSSBUCHSTABEN, wie die wütenden Spieler beim Rennen in der OASIS. Warum sollte man das vermeiden?',
                'In your Minecraft Education clan’s Teams chat, a teammate types everything in CAPITALS after losing a race, like the angry players in the OASIS race. Why is it better to avoid this?'),
            options: [
                t('Porque en el chat las mayúsculas se leen como gritos y pueden parecer agresivas', 'Weil Großbuchstaben im Chat wie Schreien wirken und aggressiv erscheinen können', 'Because in the chat capitals read as shouting and can seem aggressive'),
                t('Porque las mayúsculas gastan más datos del celular', 'Weil Großbuchstaben mehr Handydaten verbrauchen', 'Because capitals use more phone data'),
                t('Porque Minecraft Education borra los mensajes en mayúsculas', 'Weil Minecraft Education Nachrichten in Großbuchstaben löscht', 'Because Minecraft Education deletes messages in capitals')
            ],
            hint: t('Escribir en mayúsculas equivale a gritar. Perder es parte del juego: un tono respetuoso mantiene unido al clan.',
                'In Großbuchstaben zu schreiben ist wie Schreien. Verlieren gehört zum Spiel: Ein respektvoller Ton hält den Clan zusammen.',
                'Writing in capitals is like shouting. Losing is part of the game: a respectful tone keeps the clan together.')
        },
        4: {
            kmk: '2.3', correct: 0,
            label: t('Tu grupo diseña en un OneNote compartido su propia búsqueda del tesoro inspirada en Ready Player One, con una prueba por cada llave. ¿Cuál es la mejor forma de coordinarse?',
                'Deine Gruppe plant in einem gemeinsamen OneNote eine eigene Schatzsuche nach dem Vorbild von Ready Player One, mit einer Prüfung pro Schlüssel. Wie stimmt ihr euch am besten ab?',
                'Your group designs its own treasure hunt inspired by Ready Player One in a shared OneNote, with one challenge per key. What is the best way to coordinate?'),
            options: [
                t('Repartir antes las pruebas, usar los comentarios de OneNote para sugerir cambios y respetar lo que escribe cada uno', 'Vorher die Prüfungen aufteilen, Änderungen über Kommentare in OneNote vorschlagen und respektieren, was jeder schreibt', 'Divide the challenges first, use OneNote comments to suggest changes and respect what everyone writes'),
                t('Que cada uno borre en OneNote las pruebas que no le gustan, sin avisar', 'Jeder löscht in OneNote ohne Bescheid die Prüfungen, die ihm nicht gefallen', 'Everyone deletes the challenges they don’t like in OneNote without saying so'),
                t('Escribir todos al mismo tiempo en la misma página de OneNote', 'Alle schreiben gleichzeitig auf dieselbe OneNote-Seite', 'Everyone writes on the same OneNote page at the same time')
            ],
            hint: t('El clan de la película gana cuando cada uno aporta lo suyo. Repartir el trabajo y comentar en vez de borrar evita conflictos.',
                'Der Clan im Film gewinnt, wenn jeder seinen Teil beiträgt. Wer die Arbeit aufteilt und kommentiert statt löscht, vermeidet Streit.',
                'The clan in the film wins when everyone contributes their part. Dividing the work and commenting instead of deleting avoids conflicts.')
        },
        // IA: un montaje hecho con IA (deepfake) también es ciberacoso
        5: {
            kmk: '2.4', correct: 1, ai: true,
            label: t('En Ready Player One, IOI usa engaños para ganar. En el chat de Teams de tu clase alguien comparte un video hecho con inteligencia artificial (un «deepfake») en el que el avatar de un compañero dice cosas que nunca dijo sobre su puntaje en CodeCombat. ¿Qué es lo correcto?',
                'In Ready Player One gewinnt IOI mit Täuschungen. Im Teams-Chat deiner Klasse teilt jemand ein mit künstlicher Intelligenz erstelltes Video (einen „Deepfake“), in dem der Avatar eines Mitschülers Dinge über seine CodeCombat-Punkte sagt, die er nie gesagt hat. Was ist richtig?',
                'In Ready Player One, IOI uses tricks to win. In your class Teams chat someone shares an artificial intelligence video (a “deepfake”) in which a classmate’s avatar says things he never said about his CodeCombat score. What is the right thing to do?'),
            options: [
                t('Reenviarlo por Teams: si lo hizo una IA, no es grave', 'Es in Teams weiterleiten: Wenn eine KI es gemacht hat, ist es nicht schlimm', 'Forward it on Teams: if an AI made it, it is no big deal'),
                t('No reenviarlo, guardar una captura del chat de Teams como evidencia e informar a un profesor o adulto de confianza', 'Es nicht weiterleiten, einen Screenshot des Teams-Chats als Beweis sichern und eine Lehrkraft oder eine vertraute erwachsene Person informieren', 'Don’t forward it, save a screenshot of the Teams chat as evidence and tell a teacher or a trusted adult'),
                t('Hacer con IA otro video del autor y publicarlo en Teams para vengarte', 'Mit KI ein Video über den Verfasser machen und es aus Rache in Teams posten', 'Make another AI video of the person who did it and post it on Teams to get revenge')
            ],
            hint: t('Un video falso hecho con IA que ridiculiza a alguien es ciberacoso, aunque parezca una broma. No se difunde: se guarda la evidencia y se avisa a un adulto.',
                'Ein gefälschtes KI-Video, das jemanden lächerlich macht, ist Cybermobbing, auch wenn es wie ein Scherz wirkt. Man verbreitet es nicht, sondern sichert Beweise und informiert eine erwachsene Person.',
                'A fake AI video that ridicules someone is cyberbullying, even if it looks like a joke. Don’t spread it: keep the evidence and tell an adult.')
        },
        6: {
            kmk: '2.5', correct: 1,
            label: t('En un foro de Teams del colegio debaten: «¿Debería una sola empresa, como IOI en Ready Player One, controlar un mundo virtual donde estudia y juega mucha gente?». ¿Cómo participas de forma constructiva?',
                'In einem Teams-Forum der Schule wird diskutiert: „Sollte eine einzige Firma wie IOI in Ready Player One eine virtuelle Welt kontrollieren, in der viele Menschen lernen und spielen?“ Wie beteiligst du dich konstruktiv?',
                'A school Teams forum is debating: “Should a single company, like IOI in Ready Player One, control a virtual world where many people study and play?” How do you take part constructively?'),
            options: [
                t('Atacar a quienes piensan distinto para ganar la discusión', 'Andersdenkende angreifen, um die Diskussion zu gewinnen', 'Attack those who think differently to win the argument'),
                t('Dar tu opinión con argumentos y ejemplos de la película y de la vida real, citar tus fuentes y responder con respeto a otras ideas', 'Deine Meinung mit Argumenten und Beispielen aus dem Film und aus dem echten Leben begründen, Quellen nennen und respektvoll auf andere Ideen antworten', 'Give your opinion with arguments and examples from the film and from real life, cite your sources and respond respectfully to other ideas'),
                t('Publicar el mismo mensaje muchas veces en Teams para que se vea más', 'Dieselbe Nachricht viele Male in Teams posten, damit sie mehr gesehen wird', 'Post the same message many times on Teams so it gets seen more')
            ],
            hint: t('Participar en una sociedad digital es argumentar con datos y respetar otras opiniones. La película plantea una pregunta real: ¿quién debe decidir las reglas de los mundos digitales?',
                'Mitreden in einer digitalen Gesellschaft heißt, mit Fakten zu argumentieren und andere Meinungen zu respektieren. Der Film stellt eine echte Frage: Wer soll die Regeln digitaler Welten bestimmen?',
                'Taking part in a digital society means arguing with facts and respecting other opinions. The film raises a real question: who should decide the rules of digital worlds?')
        }
    },

    // ── Reto 3 · Producir y presentar ──
    // Misión OASIS (Ready Player One): como Halliday, crear y presentar tu propio mundo digital respetando los derechos
    3: {
        1: {
            kmk: '3.1', correct: 0,
            label: t('Como Halliday cuando diseñó el OASIS, construyes en Minecraft Education un mundo con tres desafíos. Quieres ordenar y graficar los puntajes de cada equipo. ¿Qué programa es el más adecuado?',
                'Wie Halliday beim Entwurf der OASIS baust du in Minecraft Education eine Welt mit drei Challenges. Du willst die Punkte jedes Teams ordnen und als Diagramm zeigen. Welches Programm ist am besten geeignet?',
                'Like Halliday when he designed the OASIS, you are building a world with three challenges in Minecraft Education. You want to sort and chart each team’s scores. Which program is best?'),
            options: [
                t('Una hoja de cálculo, que ordena los puntajes, calcula promedios y crea un gráfico de los desafíos de Minecraft Education', 'Eine Tabellenkalkulation, die die Punkte ordnet, Durchschnitte berechnet und ein Diagramm der Minecraft-Education-Challenges erstellt', 'A spreadsheet, which sorts the scores, calculates averages and makes a chart of the Minecraft Education challenges'),
                t('Un programa de dibujo, para pintar a mano cada puntaje', 'Ein Malprogramm, um jede Punktzahl von Hand zu zeichnen', 'A drawing program, to paint each score by hand'),
                t('Un reproductor de música de los años 80, como los que le gustaban a Halliday', 'Ein Musikplayer mit Hits aus den 80ern, wie Halliday sie mochte', 'A music player with 80s hits, like the ones Halliday liked')
            ],
            hint: t('La hoja de cálculo hace los cálculos por ti y el gráfico muestra de un vistazo qué equipo avanza mejor en tus desafíos.',
                'Die Tabellenkalkulation rechnet für dich, und das Diagramm zeigt auf einen Blick, welches Team in deinen Challenges am besten vorankommt.',
                'The spreadsheet does the maths for you and the chart shows at a glance which team is doing best in your challenges.')
        },
        2: {
            kmk: '3.1', correct: 1,
            label: t('Preparas diapositivas para presentar en Teams el mundo inspirado en el OASIS que construiste en Minecraft Education. ¿Qué pauta de diseño garantiza claridad?',
                'Du bereitest Folien vor, um in Teams deine Welt nach dem Vorbild der OASIS zu präsentieren, die du in Minecraft Education gebaut hast. Welche Gestaltungsregel sorgt für Klarheit?',
                'You are preparing slides to present on Teams the OASIS-inspired world you built in Minecraft Education. Which design rule ensures clarity?'),
            options: [
                t('Llenar cada diapositiva con párrafos largos en letra pequeña', 'Jede Folie mit langen Absätzen in kleiner Schrift füllen', 'Fill each slide with long paragraphs in small print'),
                t('Pocas ideas por diapositiva, capturas claras de tu mundo de Minecraft Education, letra legible y buen contraste', 'Wenige Aussagen pro Folie, klare Screenshots deiner Minecraft-Education-Welt, gut lesbare Schrift und guter Kontrast', 'A few ideas per slide, clear screenshots of your Minecraft Education world, a readable font and good contrast'),
                t('Letra amarilla sobre fondo blanco y muchas animaciones de neón', 'Gelbe Schrift auf weißem Hintergrund und viele Neon-Animationen', 'Yellow text on a white background and lots of neon animations')
            ],
            hint: t('Las capturas de tu mundo explican mejor que un párrafo. Poco texto y buen contraste hacen que toda la clase lo entienda.',
                'Screenshots deiner Welt erklären besser als ein Absatz. Wenig Text und guter Kontrast sorgen dafür, dass die ganze Klasse es versteht.',
                'Screenshots of your world explain better than a paragraph. Little text and good contrast mean the whole class understands.')
        },
        // IA: producir con IA generativa de forma transparente y respetando derechos
        3: {
            kmk: '3.3', correct: 1, ai: true,
            label: t('Para tu libro de BookStudio sobre Ready Player One quieres crear con inteligencia artificial imágenes de avatares y la voz del narrador. ¿Qué es lo correcto?',
                'Für dein BookStudio-Buch über Ready Player One möchtest du Avatarbilder und die Stimme des Erzählers mit künstlicher Intelligenz erstellen. Was ist richtig?',
                'For your BookStudio book about Ready Player One you want to create avatar pictures and the narrator’s voice with artificial intelligence. What is the right thing to do?'),
            options: [
                t('Presentar las imágenes y la voz creadas con IA como si las hubieras hecho tú', 'Die mit KI erstellten Bilder und die Stimme als eigene Arbeit ausgeben', 'Pass off the AI-made pictures and voice as your own work'),
                t('Revisar el resultado, indicar en el libro de BookStudio qué se creó con IA y con qué herramienta, y no imitar la voz ni la cara de personas reales, tampoco de los actores de la película, sin permiso', 'Das Ergebnis prüfen, im BookStudio-Buch angeben, was mit KI und mit welchem Werkzeug erstellt wurde, und keine Stimmen oder Gesichter echter Personen – auch nicht der Filmschauspieler – ohne Erlaubnis nachahmen', 'Check the result, state in the BookStudio book what was made with AI and with which tool, and don’t imitate real people’s voices or faces, not even the film’s actors, without permission'),
                t('Pedirle a la IA que copie las imágenes oficiales de la película para tu libro de BookStudio', 'Die KI bitten, für dein BookStudio-Buch die offiziellen Bilder des Films zu kopieren', 'Ask the AI to copy the film’s official images for your BookStudio book')
            ],
            hint: t('Lo que crea una IA puede tener errores y parecerse a obras ajenas. Decir qué hiciste con IA, revisar el resultado y respetar los derechos de autor y la imagen y la voz de las personas es producir con responsabilidad.',
                'Was eine KI erzeugt, kann Fehler enthalten und fremden Werken ähneln. Angeben, was du mit KI gemacht hast, das Ergebnis prüfen und Urheberrecht sowie Bild und Stimme anderer achten – so produzierst du verantwortungsvoll.',
                'What an AI creates can contain mistakes and look like other people’s work. Saying what you made with AI, checking the result and respecting copyright and people’s image and voice is producing responsibly.')
        },
        4: {
            kmk: '3.2', correct: 0,
            label: t('Escondiste un «easter egg» en el juego que programaste en codeSpark para los niños de primaria, como Halliday en el OASIS. Vas a grabar un video tutorial para que lo encuentren. ¿Cuál es el proceso correcto?',
                'Du hast in dem Spiel, das du in codeSpark für die Grundschulkinder programmiert hast, ein „Easter Egg“ versteckt, wie Halliday in der OASIS. Du nimmst ein Tutorial-Video auf, damit sie es finden. Wie gehst du richtig vor?',
                'You hid an “easter egg” in the game you coded in codeSpark for the primary school children, like Halliday in the OASIS. You are going to record a tutorial video so they can find it. What is the right process?'),
            options: [
                t('Escribir un guion con pistas claras, grabar la pantalla de codeSpark con buen audio y editar para cortar errores y silencios', 'Ein Drehbuch mit klaren Hinweisen schreiben, den codeSpark-Bildschirm mit gutem Ton aufnehmen und schneiden, um Fehler und Pausen zu entfernen', 'Write a script with clear clues, record the codeSpark screen with good audio and edit out mistakes and silences'),
                t('Grabar sin plan durante el recreo y publicarlo sin revisar', 'Ohne Plan in der Pause aufnehmen und ungeprüft veröffentlichen', 'Record with no plan during break and post it without checking'),
                t('Grabar con música muy alta encima para que suene a película', 'Mit sehr lauter Musik darüber aufnehmen, damit es nach Kino klingt', 'Record with very loud music on top so it sounds like a film')
            ],
            hint: t('Planear, grabar bien y editar convierte un video en una buena explicación. Las pistas claras ayudan a los niños a encontrar el secreto sin frustrarse.',
                'Planen, gut aufnehmen und schneiden macht aus einem Video eine gute Erklärung. Klare Hinweise helfen den Kindern, das Geheimnis ohne Frust zu finden.',
                'Planning, recording well and editing turns a video into a good explanation. Clear clues help the children find the secret without getting frustrated.')
        },
        5: {
            kmk: '3.3', correct: 0,
            label: t('Tu historia en BookStudio usa ideas, personajes y escenas de Ready Player One. ¿Por qué es indispensable citar la obra y agregar una lista de fuentes?',
                'Deine Geschichte in BookStudio nutzt Ideen, Figuren und Szenen aus Ready Player One. Warum musst du das Werk zitieren und ein Quellenverzeichnis anlegen?',
                'Your BookStudio story uses ideas, characters and scenes from Ready Player One. Why must you cite the work and add a list of sources?'),
            options: [
                t('Para no cometer plagio: la novela es de Ernest Cline y la película de Steven Spielberg, y otros deben poder ver de dónde vienen las ideas', 'Um kein Plagiat zu begehen: Der Roman ist von Ernest Cline und der Film von Steven Spielberg, und andere sollen sehen können, woher die Ideen stammen', 'To avoid plagiarism: the novel is by Ernest Cline and the film by Steven Spielberg, and others must be able to see where the ideas come from'),
                t('Solo para que el libro de BookStudio tenga más páginas', 'Nur damit das BookStudio-Buch mehr Seiten hat', 'Just so the BookStudio book has more pages'),
                t('No es necesario si cambias los nombres de los personajes', 'Das ist nicht nötig, wenn du die Namen der Figuren änderst', 'It’s not necessary if you change the characters’ names')
            ],
            hint: t('Puedes inspirarte en una obra, pero las ideas tienen autor. Citar la novela y la película reconoce su trabajo, aunque cambies los nombres.',
                'Du darfst dich von einem Werk inspirieren lassen, aber Ideen haben Urheber. Roman und Film zu zitieren, würdigt ihre Arbeit – auch wenn du Namen änderst.',
                'You can be inspired by a work, but ideas have authors. Citing the novel and the film recognises their work, even if you change the names.')
        },
        6: {
            kmk: '3.2', correct: 1,
            label: t('Vas a entregar en Teams el informe de tu mundo inspirado en el OASIS, con capturas de Minecraft Education y tablas. ¿Qué formato evita que se desconfigure?',
                'Du gibst in Teams den Bericht über deine Welt nach dem Vorbild der OASIS mit Screenshots aus Minecraft Education und Tabellen ab. Welches Format verhindert, dass er sich verschiebt?',
                'You are handing in the report on your OASIS-inspired world, with Minecraft Education screenshots and tables, on Teams. Which format keeps it from getting messed up?'),
            options: [
                t('Subir el archivo editable original, aunque tu profesor no tenga el mismo programa', 'Die bearbeitbare Originaldatei hochladen, auch wenn deine Lehrkraft nicht dasselbe Programm hat', 'Upload the original editable file, even if your teacher doesn’t have the same program'),
                t('Exportarlo a PDF, que conserva el diseño, las tablas y las capturas en cualquier dispositivo', 'Ihn als PDF exportieren, das Layout, Tabellen und Screenshots auf jedem Gerät erhält', 'Export it to PDF, which keeps the layout, tables and screenshots on any device'),
                t('Enviar por Teams una foto borrosa de la pantalla', 'Ein unscharfes Foto vom Bildschirm über Teams schicken', 'Send a blurry photo of the screen on Teams')
            ],
            hint: t('El PDF se ve igual en cualquier computador o celular: tu profesor ve tu informe tal como lo hiciste.',
                'Ein PDF sieht auf jedem Computer und Handy gleich aus: Deine Lehrkraft sieht den Bericht genau so, wie du ihn gemacht hast.',
                'A PDF looks the same on any computer or phone: your teacher sees your report exactly as you made it.')
        }
    },

    // ── Reto 4 · Protegerse y actuar con seguridad ──
    4: {
        1: {
            kmk: '4.1', correct: 1,
            label: t('Entras a Minecraft Education y a Teams con tu cuenta del colegio. ¿Qué contraseña es la más segura?',
                'Du meldest dich mit deinem Schulkonto bei Minecraft Education und Teams an. Welches Passwort ist am sichersten?',
                'You sign in to Minecraft Education and Teams with your school account. Which password is the safest?'),
            options: [
                t('«Minecraft» seguido de tu año de nacimiento', '„Minecraft“ und dein Geburtsjahr', '“Minecraft” followed by your year of birth'),
                t('Una frase larga con mayúsculas, minúsculas, números y símbolos, que no compartes con nadie', 'Ein langer Satz mit Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen, den du niemandem verrätst', 'A long phrase with capitals, lower-case letters, numbers and symbols that you share with no one'),
                t('«Colegio123», porque es fácil de recordar', '„Schule123“, weil man es sich leicht merken kann', '“School123”, because it’s easy to remember')
            ],
            hint: t('La misma cuenta del colegio abre Teams, OneNote y Minecraft Education. Una frase larga y secreta la protege; las palabras del juego o tu año de nacimiento se adivinan fácil.',
                'Mit demselben Schulkonto öffnest du Teams, OneNote und Minecraft Education. Ein langer, geheimer Satz schützt es; Wörter aus dem Spiel oder dein Geburtsjahr sind leicht zu erraten.',
                'The same school account opens Teams, OneNote and Minecraft Education. A long, secret phrase protects it; game words or your year of birth are easy to guess.')
        },
        2: {
            kmk: '4.1', correct: 1,
            label: t('Mientras juegas un nivel de CodeCombat aparece en otra pestaña: «¡Gemas gratis! Escribe tu correo y tu contraseña». ¿Qué haces?',
                'Während du ein CodeCombat-Level spielst, erscheint in einem anderen Tab: „Gratis-Edelsteine! Gib deine E-Mail und dein Passwort ein“. Was tust du?',
                'While you play a CodeCombat level, another tab shows: “Free gems! Type your email and password”. What do you do?'),
            options: [
                t('Escribo mis datos rápido para no perder las gemas', 'Ich gebe schnell meine Daten ein, damit ich die Edelsteine nicht verpasse', 'I type my details quickly so I don’t miss the gems'),
                t('Cierro la pestaña sin hacer clic, no doy datos y aviso a mi profesor de Tecnología o a mis padres', 'Ich schließe den Tab ohne zu klicken, gebe keine Daten an und sage meiner Techniklehrkraft oder meinen Eltern Bescheid', 'I close the tab without clicking, give no details and tell my Technology teacher or my parents'),
                t('Comparto el enlace en el chat de Teams para que mis compañeros también ganen', 'Ich teile den Link im Teams-Chat, damit meine Mitschüler auch gewinnen', 'I share the link in the Teams chat so my classmates win too')
            ],
            hint: t('Las ofertas de premios que piden contraseñas son engaños (phishing) para robar cuentas. CodeCombat nunca te pide la contraseña en un anuncio.',
                'Gewinnangebote, die nach Passwörtern fragen, sind Betrug (Phishing), um Konten zu stehlen. CodeCombat fragt in einer Werbung nie nach deinem Passwort.',
                'Prize offers that ask for passwords are scams (phishing) to steal accounts. CodeCombat never asks for your password in an ad.')
        },
        // IA: los datos personales no se le escriben a un chatbot
        3: {
            kmk: '4.2', correct: 0, ai: true,
            label: t('Usas un chatbot de inteligencia artificial para que te ayude con un nivel de Ozaria. ¿Qué datos no debes escribirle nunca?',
                'Du nutzt einen KI-Chatbot als Hilfe für ein Ozaria-Level. Welche Daten solltest du ihm nie schreiben?',
                'You use an artificial intelligence chatbot to help you with an Ozaria level. Which details should you never type into it?'),
            options: [
                t('Tu nombre completo, tu dirección, tu contraseña de Ozaria o del colegio, fotos tuyas o datos de tus compañeros', 'Deinen vollen Namen, deine Adresse, dein Ozaria- oder Schulpasswort, Fotos von dir oder Daten deiner Mitschüler', 'Your full name, your address, your Ozaria or school password, photos of you or details about your classmates'),
                t('El nombre del nivel de Ozaria en el que estás', 'Den Namen des Ozaria-Levels, in dem du gerade bist', 'The name of the Ozaria level you are on'),
                t('El código que no te funciona, sin datos personales', 'Den Code, der nicht funktioniert, ohne persönliche Daten', 'The code that doesn’t work, with no personal details')
            ],
            hint: t('Lo que escribes en un chatbot puede guardarse en sus servidores y usarse para entrenar la IA. Pregunta por el código, pero nunca compartas datos personales tuyos ni de otras personas.',
                'Was du einem Chatbot schreibst, kann auf seinen Servern gespeichert und zum Training der KI genutzt werden. Frag zum Code, aber teile nie persönliche Daten von dir oder anderen.',
                'What you type into a chatbot can be stored on its servers and used to train the AI. Ask about the code, but never share personal details about yourself or others.')
        },
        4: {
            kmk: '4.2', correct: 0,
            label: t('Quieres publicar con enlace público tu libro de BookStudio, que tiene un audio con tu voz y fotos tuyas. ¿Qué debes tener en cuenta?',
                'Du willst dein BookStudio-Buch mit einer Aufnahme deiner Stimme und Fotos von dir über einen öffentlichen Link veröffentlichen. Was musst du bedenken?',
                'You want to publish your BookStudio book, which has a recording of your voice and photos of you, with a public link. What should you keep in mind?'),
            options: [
                t('Que quedará en tu huella digital y podrá verse durante años, así que revisas qué datos y fotos muestras y prefieres el enlace restringido a tu grupo', 'Dass es Teil deines digitalen Fußabdrucks wird und jahrelang sichtbar sein kann, deshalb prüfst du, welche Daten und Fotos du zeigst, und nimmst lieber den auf deine Gruppe beschränkten Link', 'That it will become part of your digital footprint and may be visible for years, so you check which details and photos you show and prefer the link restricted to your group'),
                t('Que el libro desaparece de internet cuando apagas el computador', 'Dass das Buch aus dem Internet verschwindet, wenn du den Computer ausschaltest', 'That the book disappears from the internet when you switch off the computer'),
                t('Que solo tus amigos más cercanos podrán verlo', 'Dass es nur deine engsten Freunde sehen können', 'That only your closest friends will be able to see it')
            ],
            hint: t('Lo que publicas con enlace público puede verlo y copiarlo cualquiera. Tu voz y tu cara son datos personales: compártelos solo con quien debe verlos.',
                'Was du über einen öffentlichen Link veröffentlichst, kann jeder sehen und kopieren. Deine Stimme und dein Gesicht sind persönliche Daten: Teile sie nur mit denen, die sie sehen sollen.',
                'Anyone can see and copy what you publish with a public link. Your voice and your face are personal data: share them only with those who should see them.')
        },
        5: {
            kmk: '4.3', correct: 1,
            label: t('Llevas mucho rato jugando niveles de codeSpark y CodeCombat en la tableta. ¿Qué hábitos cuidan tu salud?',
                'Du spielst schon lange codeSpark- und CodeCombat-Level auf dem Tablet. Welche Gewohnheiten schützen deine Gesundheit?',
                'You have been playing codeSpark and CodeCombat levels on the tablet for a long time. Which habits protect your health?'),
            options: [
                t('Jugar acostado, con la pantalla muy cerca de los ojos', 'Im Liegen spielen, mit dem Bildschirm ganz nah an den Augen', 'Play lying down, with the screen very close to your eyes'),
                t('Sentarte con la espalda recta, la pantalla a unos 50 cm de los ojos y pausas cortas cada 20 a 30 minutos para mirar lejos y moverte', 'Gerade sitzen, den Bildschirm etwa 50 cm von den Augen entfernt halten und alle 20 bis 30 Minuten kurze Pausen machen, um in die Ferne zu schauen und dich zu bewegen', 'Sit up straight, keep the screen about 50 cm from your eyes and take short breaks every 20 to 30 minutes to look into the distance and move'),
                t('No parar hasta terminar todos los niveles, aunque duelan los ojos', 'Nicht aufhören, bis alle Level geschafft sind, auch wenn die Augen wehtun', 'Don’t stop until you finish every level, even if your eyes hurt')
            ],
            hint: t('La buena postura, la distancia a la pantalla y las pausas evitan el cansancio visual y los dolores de espalda. Los niveles te esperan.',
                'Gute Haltung, Abstand zum Bildschirm und Pausen beugen müden Augen und Rückenschmerzen vor. Die Level warten auf dich.',
                'Good posture, distance from the screen and breaks prevent tired eyes and back pain. The levels will wait for you.')
        },
        6: {
            kmk: '4.1', correct: 0,
            label: t('En un mundo de Minecraft Education te escribe alguien que no es de tu clase y te pide tu nombre completo y tu colegio. ¿Por qué es riesgoso responder?',
                'In einer Minecraft-Education-Welt schreibt dir jemand, der nicht in deiner Klasse ist, und fragt nach deinem vollständigen Namen und deiner Schule. Warum ist es riskant zu antworten?',
                'In a Minecraft Education world someone who is not in your class messages you asking for your full name and your school. Why is it risky to answer?'),
            options: [
                t('Porque no sabes quién es en realidad; no das datos y avisas a tu profesor, que controla quién entra al mundo', 'Weil du nicht weißt, wer es wirklich ist; du gibst keine Daten preis und sagst deiner Lehrkraft Bescheid, die bestimmt, wer die Welt betritt', 'Because you don’t know who they really are; you give no details and tell your teacher, who controls who joins the world'),
                t('Porque en Minecraft Education el chat funciona más lento', 'Weil der Chat in Minecraft Education langsamer funktioniert', 'Because the chat in Minecraft Education works more slowly'),
                t('No es riesgoso: en los juegos educativos todos son de confianza', 'Es ist nicht riskant: In Lernspielen sind alle vertrauenswürdig', 'It isn’t risky: everyone in educational games can be trusted')
            ],
            hint: t('Detrás de un personaje puede haber cualquier persona. En clase, el profesor comparte el código para entrar al mundo; si aparece un desconocido, hay que avisarle.',
                'Hinter einer Spielfigur kann jeder stecken. Im Unterricht teilt die Lehrkraft den Code zum Betreten der Welt; taucht ein Unbekannter auf, musst du ihr Bescheid sagen.',
                'Anyone can be behind a character. In class the teacher shares the code to join the world; if a stranger appears, tell the teacher.')
        }
    },

    // ── Reto 5 · Solucionar problemas y actuar ──
    5: {
        1: {
            kmk: '5.1', correct: 1,
            label: t('Empieza la clase de Tecnología y Minecraft Education no abre en tu computador. ¿Qué revisas primero?',
                'Der Technikunterricht beginnt, und Minecraft Education öffnet sich auf deinem Computer nicht. Was prüfst du zuerst?',
                'Technology class starts and Minecraft Education won’t open on your computer. What do you check first?'),
            options: [
                t('Golpear el teclado hasta que funcione', 'Auf die Tastatur schlagen, bis es funktioniert', 'Bang on the keyboard until it works'),
                t('Que el computador tenga internet y que entraste con tu cuenta del colegio; si sigue igual, reiniciar la aplicación', 'Ob der Computer Internet hat und ob du mit deinem Schulkonto angemeldet bist; wenn es so bleibt, die App neu starten', 'That the computer has internet and that you signed in with your school account; if it’s still the same, restart the app'),
                t('Cambiarte de puesto sin avisar a tu profesor', 'Ohne Bescheid zu sagen den Platz wechseln', 'Move to another seat without telling your teacher')
            ],
            hint: t('Empieza por lo más simple: conexión, cuenta y reinicio de la aplicación. Si no se arregla, avisa a tu profesor.',
                'Fang mit dem Einfachsten an: Verbindung, Konto und Neustart der App. Wenn das nicht hilft, sag deiner Lehrkraft Bescheid.',
                'Start with the simplest things: connection, account and restarting the app. If that doesn’t fix it, tell your teacher.')
        },
        2: {
            kmk: '5.1', correct: 1,
            label: t('El navegador se congela mientras trabajas en tu libro de BookStudio y no responde. ¿Qué es lo más lógico?',
                'Der Browser friert ein, während du an deinem BookStudio-Buch arbeitest, und reagiert nicht. Was ist am sinnvollsten?',
                'The browser freezes while you work on your BookStudio book and stops responding. What is the most sensible thing to do?'),
            options: [
                t('Esperar una hora sin hacer nada y perder la clase', 'Eine Stunde lang nichts tun und den Unterricht verpassen', 'Wait an hour doing nothing and miss the class'),
                t('Esperar un momento; si sigue igual, cerrar el navegador (Administrador de tareas o Alt+F4), volver a abrir BookStudio y revisar lo último guardado', 'Kurz warten; wenn es so bleibt, den Browser schließen (Task-Manager oder Alt+F4), BookStudio wieder öffnen und den zuletzt gespeicherten Stand prüfen', 'Wait a moment; if it stays the same, close the browser (Task Manager or Alt+F4), open BookStudio again and check the last saved version'),
                t('Desinstalar el navegador y todos los programas', 'Den Browser und alle Programme deinstallieren', 'Uninstall the browser and every program')
            ],
            hint: t('Forzar el cierre de un programa congelado y volver a abrirlo suele resolver el problema. Después revisa qué quedó guardado y continúa desde ahí.',
                'Ein eingefrorenes Programm zu beenden und neu zu öffnen, löst das Problem meistens. Prüfe danach, was gespeichert ist, und arbeite von dort aus weiter.',
                'Forcing a frozen program to close and opening it again usually fixes the problem. Then check what was saved and carry on from there.')
        },
        3: {
            kmk: '5.5', correct: 0,
            label: t('En CodeCombat tu héroe debe recoger 10 gemas iguales en fila. ¿Qué estructura de código es la más adecuada?',
                'In CodeCombat soll dein Held 10 gleiche Edelsteine in einer Reihe einsammeln. Welche Code-Struktur passt am besten?',
                'In CodeCombat your hero has to collect 10 identical gems in a row. Which code structure is best?'),
            options: [
                t('Un bucle («for» o «while») que repita las mismas instrucciones las veces necesarias', 'Eine Schleife („for“ oder „while“), die dieselben Anweisungen so oft wie nötig wiederholt', 'A loop (“for” or “while”) that repeats the same instructions as many times as needed'),
                t('Copiar y pegar la misma línea de movimiento muchas veces', 'Dieselbe Bewegungszeile viele Male kopieren und einfügen', 'Copy and paste the same movement line many times'),
                t('Escribir al inicio una instrucción que detenga el programa', 'Am Anfang eine Anweisung schreiben, die das Programm stoppt', 'Write an instruction at the start that stops the program')
            ],
            hint: t('Un bucle repite instrucciones sin copiarlas: el código queda más corto y fácil de corregir. Es la misma idea de los bucles con bloques de codeSpark.',
                'Eine Schleife wiederholt Anweisungen, ohne sie zu kopieren: Der Code wird kürzer und leichter zu korrigieren. Es ist dieselbe Idee wie die Schleifen mit Blöcken in codeSpark.',
                'A loop repeats instructions without copying them: the code is shorter and easier to fix. It’s the same idea as the block loops in codeSpark.')
        },
        // IA: un asistente de IA como tutor que explica, no como atajo; instrucciones claras
        4: {
            kmk: '5.3', correct: 1, ai: true,
            label: t('En Ozaria no logras usar una instrucción nueva y te atascas. ¿Cómo te ayuda mejor un asistente de inteligencia artificial?',
                'In Ozaria kommst du mit einem neuen Befehl nicht weiter. Wie hilft dir ein KI-Assistent am besten?',
                'In Ozaria you can’t get a new command to work and you’re stuck. How can an artificial intelligence assistant help you best?'),
            options: [
                t('Le pides el código completo del nivel y lo pegas en Ozaria sin entenderlo', 'Du lässt dir den kompletten Code des Levels geben und fügst ihn in Ozaria ein, ohne ihn zu verstehen', 'You ask for the full code of the level and paste it into Ozaria without understanding it'),
                t('Le pides que te explique la instrucción paso a paso con un ejemplo, lo intentas tú en Ozaria y, si sigues con dudas, preguntas a tu profesor', 'Du bittest ihn, den Befehl Schritt für Schritt mit einem Beispiel zu erklären, probierst es selbst in Ozaria aus und fragst bei Unklarheiten deine Lehrkraft', 'You ask it to explain the command step by step with an example, try it yourself in Ozaria and ask your teacher if you are still unsure'),
                t('Le escribes «ayuda» sin decir qué nivel ni qué error tienes, y aceptas lo primero que diga', 'Du schreibst nur „Hilfe“, ohne Level oder Fehler zu nennen, und nimmst die erste Antwort', 'You just type “help” without saying which level or error, and accept the first answer')
            ],
            hint: t('La IA te ayuda a aprender cuando le das una instrucción clara (qué nivel, qué error, qué no entiendes) y le pides que explique, no que resuelva. Así programas tú.',
                'KI hilft dir beim Lernen, wenn du eine klare Anweisung gibst (welches Level, welcher Fehler, was du nicht verstehst) und um Erklärungen statt Lösungen bittest. So programmierst du selbst.',
                'AI helps you learn when you give it a clear instruction (which level, which error, what you don’t understand) and ask it to explain, not to solve. That way you do the coding.')
        },
        5: {
            kmk: '5.2', correct: 1,
            label: t('Tu equipo prepara un proyecto de Tecnología: programar un juego, planear el trabajo y presentar el resultado. ¿Con qué criterio eligen las herramientas?',
                'Dein Team bereitet ein Technikprojekt vor: ein Spiel programmieren, die Arbeit planen und das Ergebnis präsentieren. Nach welchem Kriterium wählt ihr die Werkzeuge?',
                'Your team is preparing a Technology project: code a game, plan the work and present the result. How do you choose the tools?'),
            options: [
                t('La aplicación más popular en redes sociales, para todo', 'Die beliebteste App in den sozialen Netzwerken, für alles', 'The most popular app on social media, for everything'),
                t('La que mejor sirve para cada parte: codeSpark o CodeCombat para programar, OneNote para planear y BookStudio para presentar', 'Das, was für jeden Teil am besten passt: codeSpark oder CodeCombat zum Programmieren, OneNote zum Planen und BookStudio zum Präsentieren', 'Whatever works best for each part: codeSpark or CodeCombat to code, OneNote to plan and BookStudio to present'),
                t('La que tenga más efectos y colores', 'Das mit den meisten Effekten und Farben', 'The one with the most effects and colours')
            ],
            hint: t('Cada herramienta tiene su fuerte. Elegir según la necesidad ahorra tiempo y da mejores resultados que usar una sola para todo.',
                'Jedes Werkzeug hat seine Stärken. Wer nach Bedarf auswählt, spart Zeit und erzielt bessere Ergebnisse, als wenn er eines für alles nimmt.',
                'Every tool has its strengths. Choosing by need saves time and gives better results than using one for everything.')
        },
        6: {
            kmk: '5.4', correct: 1,
            label: t('En Minecraft Education programas al Agente con Code Builder para que construya un muro, pero gira y construye en la dirección equivocada. ¿Cuál es el método más recomendable para encontrar el error?',
                'In Minecraft Education programmierst du den Agenten mit Code Builder, damit er eine Mauer baut, aber er dreht sich und baut in die falsche Richtung. Wie findest du den Fehler am besten?',
                'In Minecraft Education you program the Agent with Code Builder to build a wall, but it turns and builds in the wrong direction. What is the best method to find the error?'),
            options: [
                t('Borrar todo el programa y empezar de cero', 'Das ganze Programm löschen und von vorn beginnen', 'Delete the whole program and start again'),
                t('Ejecutar el programa paso a paso, revisar cada instrucción de giro y de movimiento, y ver en qué punto el Agente deja de hacer lo esperado', 'Das Programm Schritt für Schritt ausführen, jede Dreh- und Bewegungsanweisung prüfen und feststellen, ab wann der Agent nicht mehr das Erwartete tut', 'Run the program step by step, check each turn and move instruction, and see at which point the Agent stops doing what you expect'),
                t('Cerrar Minecraft a la fuerza y dejar el error sin resolver', 'Minecraft gewaltsam schließen und den Fehler ungelöst lassen', 'Force Minecraft to close and leave the error unsolved')
            ],
            hint: t('Depurar es probar por partes hasta encontrar la instrucción que falla. Así corriges solo lo necesario y entiendes por qué pasó.',
                'Debuggen heißt, Teil für Teil zu testen, bis du die fehlerhafte Anweisung findest. So korrigierst du nur das Nötige und verstehst, warum es passiert ist.',
                'Debugging means testing part by part until you find the instruction that fails. That way you fix only what’s needed and understand why it happened.')
        }
    },

    // ── Reto 6 · Analizar y reflexionar ──
    6: {
        1: {
            kmk: '6.1', correct: 1,
            label: t('Un compañero comparte en Teams este titular: «Minecraft Education desaparecerá de los colegios el próximo mes». ¿Cómo compruebas si es falso?',
                'Ein Mitschüler teilt in Teams diese Schlagzeile: „Minecraft Education verschwindet nächsten Monat aus den Schulen“. Wie prüfst du, ob sie falsch ist?',
                'A classmate shares this headline in Teams: “Minecraft Education will disappear from schools next month”. How do you check whether it’s false?'),
            options: [
                t('Compartirlo rápido en otros chats porque parece importante', 'Sie schnell in andere Chats weiterleiten, weil sie wichtig wirkt', 'Share it quickly in other chats because it seems important'),
                t('Aplicar SIFT: detenerte, investigar la fuente, buscar si medios confiables o la página oficial de Minecraft Education lo publican y rastrear el origen', 'SIFT anwenden: innehalten, die Quelle untersuchen, prüfen, ob verlässliche Medien oder die offizielle Seite von Minecraft Education darüber berichten, und den Ursprung zurückverfolgen', 'Apply SIFT: stop, investigate the source, see whether reliable media or the official Minecraft Education site report it, and trace the origin'),
                t('Creerlo si tiene muchas reacciones en Teams', 'Ihr glauben, wenn sie in Teams viele Reaktionen hat', 'Believe it if it has lots of reactions in Teams')
            ],
            hint: t('SIFT son cuatro pasos: detente, investiga la fuente, busca mejor cobertura y rastrea el origen. Una noticia importante aparece en fuentes oficiales, no solo en un chat.',
                'SIFT sind vier Schritte: innehalten, Quelle untersuchen, bessere Berichte suchen und den Ursprung zurückverfolgen. Eine wichtige Nachricht steht in offiziellen Quellen, nicht nur in einem Chat.',
                'SIFT has four steps: stop, investigate the source, find better coverage and trace the origin. Important news appears in official sources, not just in a chat.')
        },
        2: {
            kmk: '6.2', correct: 0,
            label: t('Para tu clase viste videos con trucos de Minecraft Education y ahora la plataforma de videos solo te recomienda más videos de Minecraft. ¿Qué es una «burbuja de filtro»?',
                'Für den Unterricht hast du Videos mit Tricks für Minecraft Education angesehen, und jetzt empfiehlt dir die Videoplattform nur noch Minecraft-Videos. Was ist eine „Filterblase“?',
                'For class you watched videos with Minecraft Education tips, and now the video platform only recommends more Minecraft videos. What is a “filter bubble”?'),
            options: [
                t('Cuando el algoritmo solo te muestra contenidos parecidos a tu historial y te oculta otras perspectivas', 'Wenn der Algorithmus dir nur Inhalte zeigt, die deinem Verlauf ähneln, und dir andere Sichtweisen vorenthält', 'When the algorithm only shows you content similar to your history and hides other points of view'),
                t('Un filtro de fotos que pone burbujas en los videos de Minecraft', 'Ein Fotofilter, der Blasen in die Minecraft-Videos setzt', 'A photo filter that puts bubbles on the Minecraft videos'),
                t('Un antivirus que bloquea las páginas de trucos', 'Ein Virenschutz, der Seiten mit Tricks sperrt', 'An antivirus that blocks tips pages')
            ],
            hint: t('Los algoritmos aprenden de lo que ves y te ofrecen más de lo mismo. Buscar a propósito otras fuentes te ayuda a salir de la burbuja.',
                'Algorithmen lernen aus dem, was du ansiehst, und bieten dir mehr vom Gleichen an. Wer bewusst andere Quellen sucht, kommt aus der Blase heraus.',
                'Algorithms learn from what you watch and offer you more of the same. Deliberately looking for other sources helps you get out of the bubble.')
        },
        // IA: uso ético y transparente de la IA generativa
        3: {
            kmk: '6.2', correct: 1, ai: true,
            label: t('Quieres usar una inteligencia artificial como Copilot para escribir el texto de tu libro de BookStudio sobre Ozaria. ¿Cuál es el uso ético?',
                'Du möchtest eine KI wie Copilot nutzen, um den Text deines BookStudio-Buches über Ozaria zu schreiben. Was ist ein ethischer Umgang damit?',
                'You want to use an AI such as Copilot to write the text of your BookStudio book about Ozaria. What is the ethical way to use it?'),
            options: [
                t('Copiar el texto que genera y entregarlo como tuyo', 'Den erzeugten Text kopieren und als deinen abgeben', 'Copy the text it generates and hand it in as yours'),
                t('Usarla como apoyo para ordenar ideas, verificar sus datos en fuentes confiables, escribir con tus palabras y declarar que la usaste', 'Sie als Hilfe zum Ordnen der Ideen nutzen, ihre Angaben in verlässlichen Quellen prüfen, mit eigenen Worten schreiben und angeben, dass du sie benutzt hast', 'Use it to help organise ideas, check its facts in reliable sources, write in your own words and say that you used it'),
                t('Pedirle que haga todo el libro y no revisar nada', 'Sie das ganze Buch schreiben lassen und nichts prüfen', 'Ask it to do the whole book and check nothing')
            ],
            hint: t('La IA puede equivocarse e inventar datos. Usarla con transparencia y revisar lo que dice te ayuda a aprender sin hacer trampa.',
                'KI kann sich irren und Angaben erfinden. Wer sie offen nutzt und prüft, was sie sagt, lernt dazu, ohne zu schummeln.',
                'AI can make mistakes and invent facts. Using it openly and checking what it says helps you learn without cheating.')
        },
        4: {
            kmk: '6.2', correct: 0,
            label: t('Entre Minecraft Education, CodeCombat y las tareas de Teams pasas muchas horas frente a pantallas, además de tu tiempo libre en el celular. ¿Por qué conviene autorregular el tiempo de conexión?',
                'Zwischen Minecraft Education, CodeCombat und den Teams-Aufgaben verbringst du viele Stunden vor Bildschirmen, dazu deine Freizeit am Handy. Warum solltest du deine Online-Zeit selbst einteilen?',
                'Between Minecraft Education, CodeCombat and Teams assignments you spend many hours in front of screens, plus your free time on your phone. Why should you manage your time online?'),
            options: [
                t('Para evitar cansancio visual, dolores, problemas de sueño y distracción, y equilibrar estudio, descanso y actividad física', 'Um müde Augen, Schmerzen, Schlafprobleme und Ablenkung zu vermeiden und Lernen, Erholung und Bewegung auszugleichen', 'To avoid tired eyes, aches, sleep problems and distraction, and to balance study, rest and physical activity'),
                t('Porque los juegos educativos dejan de funcionar si se usan mucho', 'Weil Lernspiele nicht mehr funktionieren, wenn man sie viel benutzt', 'Because educational games stop working if you use them a lot'),
                t('No hace falta: mientras más horas de pantalla, mejor se aprende', 'Das ist nicht nötig: Je mehr Bildschirmzeit, desto besser lernt man', 'There’s no need: the more screen time, the better you learn')
            ],
            hint: t('Las pantallas también cansan aunque el juego sea educativo. Organizar el tiempo te deja energía para dormir bien, moverte y estar con otras personas.',
                'Bildschirme ermüden auch, wenn das Spiel lehrreich ist. Wer seine Zeit einteilt, hat Energie, um gut zu schlafen, sich zu bewegen und mit anderen zusammen zu sein.',
                'Screens are tiring even when the game is educational. Managing your time leaves you energy to sleep well, move and be with other people.')
        },
        5: {
            kmk: '6.1', correct: 0,
            label: t('Buscando más retos como los de CodeCombat, encuentras una página que dice «La única forma de aprender a programar es comprar nuestro curso premium de juegos», escrita por la misma empresa que vende el curso. ¿Cómo identificas el sesgo comercial?',
                'Auf der Suche nach weiteren Aufgaben wie in CodeCombat findest du eine Seite mit dem Satz „Programmieren lernt man nur mit unserem Premium-Spielekurs“, geschrieben von derselben Firma, die den Kurs verkauft. Woran erkennst du die kommerzielle Absicht?',
                'Looking for more challenges like the ones in CodeCombat, you find a page saying “The only way to learn coding is to buy our premium games course”, written by the same company that sells the course. How do you spot the commercial bias?'),
            options: [
                t('Por los botones de compra, las ofertas con tiempo límite y un texto que solo elogia su producto y no menciona otras opciones, como las plataformas que ya usas en el colegio', 'An den Kaufknöpfen, den zeitlich begrenzten Angeboten und einem Text, der nur das eigene Produkt lobt und andere Möglichkeiten verschweigt, etwa die Plattformen, die du in der Schule schon nutzt', 'By the buy buttons, the limited-time offers and a text that only praises its own product and leaves out other options, such as the platforms you already use at school'),
                t('Por el color de fondo de la página', 'An der Hintergrundfarbe der Seite', 'By the page’s background colour'),
                t('Porque tiene muchas imágenes de personajes de juegos', 'Daran, dass sie viele Bilder von Spielfiguren hat', 'Because it has lots of pictures of game characters')
            ],
            hint: t('Cuando quien escribe gana dinero con lo que recomienda, el texto busca venderte algo. Compara con otras fuentes antes de decidir.',
                'Wenn die Verfasser mit ihrer Empfehlung Geld verdienen, will der Text dir etwas verkaufen. Vergleiche mit anderen Quellen, bevor du dich entscheidest.',
                'When the writer earns money from what they recommend, the text is trying to sell you something. Compare with other sources before you decide.')
        },
        6: {
            kmk: '6.2', correct: 1,
            label: t('Quieres publicar en un sitio público, con tu nombre, el video de tu mundo de Minecraft Education y tu libro de BookStudio. ¿Qué impacto tiene?',
                'Du willst das Video deiner Minecraft-Education-Welt und dein BookStudio-Buch mit deinem Namen auf einer öffentlichen Seite veröffentlichen. Welche Auswirkungen hat das?',
                'You want to publish the video of your Minecraft Education world and your BookStudio book on a public site with your name. What impact does it have?'),
            options: [
                t('Ninguno: internet se olvida rápido de lo que publicas', 'Keine: Das Internet vergisst schnell, was du veröffentlichst', 'None: the internet quickly forgets what you post'),
                t('Afecta tu reputación digital, así que revisas el contenido, actúas con respeto, respetas los derechos de autor y pides permiso si aparecen compañeros', 'Es prägt deinen digitalen Ruf, deshalb prüfst du den Inhalt, verhältst dich respektvoll, beachtest das Urheberrecht und fragst um Erlaubnis, wenn Mitschüler zu sehen sind', 'It shapes your digital reputation, so you check the content, act respectfully, respect copyright and ask permission if classmates appear'),
                t('Solo importa cuántos «me gusta» reciba', 'Es zählt nur, wie viele „Gefällt mir“ es bekommt', 'All that matters is how many “likes” it gets')
            ],
            hint: t('Lo que publicas con tu nombre forma tu reputación en línea durante años. Revisar antes y pedir permiso a quienes aparecen es parte de actuar con responsabilidad.',
                'Was du mit deinem Namen veröffentlichst, prägt jahrelang deinen Ruf im Netz. Vorher zu prüfen und die Abgebildeten um Erlaubnis zu fragen, gehört zum verantwortungsvollen Handeln.',
                'What you publish under your name shapes your online reputation for years. Checking first and asking those who appear for permission is part of acting responsibly.')
        }
    }
};

// Plataformas que deben aparecer en los retos de Tecnología (lo comprueba npm test)
const TECHNOLOGY_PLATFORMS = ['Ozaria', 'CodeCombat', 'codeSpark', 'OneNote', 'Teams', 'Minecraft Education', 'BookStudio'];

// Retos 1 a 3: «Misión OASIS», con la temática de la película Ready Player One (2018, basada en la
// novela de Ernest Cline). La página del reto muestra este texto al comienzo (activity.theme).
const TECH_RETO_THEMES = {
    1: t('Misión OASIS · Como los «gunters» de Ready Player One, que buscaban las tres llaves y el «easter egg» de James Halliday, en este reto buscas pistas, compruebas tus fuentes y guardas tus hallazgos.',
        'Mission OASIS · Wie die „Gunter“ in Ready Player One, die die drei Schlüssel und James Hallidays „Easter Egg“ suchten, suchst du in dieser Herausforderung Hinweise, prüfst deine Quellen und speicherst deine Funde.',
        'OASIS Mission · Like the “gunters” in Ready Player One, who hunted for the three keys and James Halliday’s “easter egg”, in this challenge you look for clues, check your sources and keep your findings.'),
    2: t('Misión OASIS · Como el clan de Parzival, Art3mis y Aech en Ready Player One, en este reto te comunicas y cooperas con tu equipo con respeto, aunque otros, como IOI, jueguen sucio.',
        'Mission OASIS · Wie der Clan von Parzival, Art3mis und Aech in Ready Player One kommunizierst und kooperierst du in dieser Herausforderung respektvoll mit deinem Team, auch wenn andere wie IOI unfair spielen.',
        'OASIS Mission · Like Parzival, Art3mis and Aech’s clan in Ready Player One, in this challenge you communicate and cooperate respectfully with your team, even when others, like IOI, play dirty.'),
    3: t('Misión OASIS · Como James Halliday, que creó el OASIS, en este reto creas y presentas tu propio mundo digital, citando tus fuentes y respetando los derechos de autor.',
        'Mission OASIS · Wie James Halliday, der die OASIS erschuf, erstellst und präsentierst du in dieser Herausforderung deine eigene digitale Welt, nennst deine Quellen und achtest das Urheberrecht.',
        'OASIS Mission · Like James Halliday, who created the OASIS, in this challenge you create and present your own digital world, citing your sources and respecting copyright.')
};

module.exports = { TECHNOLOGY_QUESTIONS, TECHNOLOGY_PLATFORMS, TECH_RETO_THEMES };
