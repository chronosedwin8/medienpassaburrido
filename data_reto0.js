// ══════════════════════════════════════════════════════════════════════════
// MEDIENPASS - RETO 0 ("ESTE SOY YO") ADAPTADO POR ASIGNATURA
// Estructura modular y dinámica: Preguntas base + Preguntas específicas del área
// Máximo 10 preguntas en total por materia (5 base + 4 del área = 9 preguntas)
// ══════════════════════════════════════════════════════════════════════════

const { subjects } = require('./data_levels');

// ─── 1. PREGUNTAS BÁSICAS "ESTE SOY YO" (COMUNES A TODAS LAS MATERIAS) ───
const baseProfileEvidence = [
    { 
        id: "name", 
        label: { 
            de: "Mein vollständiger Name ist:", 
            en: "My full name is:", 
            es: "Mi nombre completo es:" 
        }, 
        type: "text" 
    },
    { 
        id: "class", 
        label: { 
            de: "Meine Klasse / Mein Kurs:", 
            en: "My class / grade:", 
            es: "Mi clase o curso:" 
        }, 
        type: "text" 
    },
    { 
        id: "about_me", 
        label: { 
            de: "Wer bin ich und was mache ich gerne in meiner Freizeit?", 
            en: "Who am I and what do I enjoy doing in my free time?", 
            es: "¿Quién soy y qué me apasiona hacer en mi tiempo libre?" 
        }, 
        type: "textarea",
        rows: 2
    },
    { 
        id: "devices", 
        label: { 
            de: "Digitale Geräte, die ich am häufigsten nutze (z. B. Computer, Tablet, Handy):", 
            en: "Digital devices I use most frequently (e.g. computer, tablet, smartphone):", 
            es: "Dispositivos digitales que uso con mayor frecuencia (ej. computador, tableta, celular):" 
        }, 
        type: "text" 
    },
    { 
        id: "digital_citizenship", 
        label: { 
            de: "Mein persönliches Versprechen für eine sichere und verantwortungsvolle digitale Mediennutzung:", 
            en: "My personal commitment to safe and responsible digital citizenship:", 
            es: "Mi compromiso personal para ser un ciudadano digital responsable y seguro en internet:" 
        }, 
        type: "textarea",
        rows: 2
    }
];

// ─── 2. PREGUNTAS ESPECÍFICAS SEGÚN EL ÁREA ACADÉMICA (4 POR MATERIA) ───
const subjectSpecificEvidence = {
    // 1. ALEMÁN (DEUTSCH)
    aleman: [
        {
            id: "reto0_aleman_q1",
            label: {
                de: "Was motiviert dich beim Deutschlernen und welche digitalen Hilfsmittel (Online-Wörterbücher, Apps, Videos) nutzt du?",
                en: "What motivates you to learn German and which digital tools (online dictionaries, apps, videos) do you use?",
                es: "¿Qué es lo que más te motiva de aprender alemán y qué recursos digitales (diccionarios online, apps, videos) utilizas para practicar?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_aleman_q2",
            label: {
                de: "Was ist dein deutsches Lieblingswort oder dein Lieblingsausdruck und warum?",
                en: "What is your favorite German word or phrase and why?",
                es: "¿Cuál es tu palabra o frase favorita en alemán y qué significa para ti?"
            },
            type: "text"
        },
        {
            id: "reto0_aleman_q3",
            label: {
                de: "Welche Strategien nutzt du beim Lesen oder Hören auf Deutsch im Internet, wenn du ein Wort nicht verstehst?",
                en: "What strategies do you use when reading or listening in German online when you don't understand a word?",
                es: "Cuando lees o escuchas alemán en internet, ¿qué estrategias o herramientas digitales usas cuando encuentras palabras difíciles?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_aleman_q4",
            label: {
                de: "Welches digitale Projekt auf Deutsch möchtest du dieses Schuljahr erstellen (z.B. Podcast, Video, Comic)?",
                en: "What digital project in German would you like to create this school year (e.g. podcast, video, digital comic)?",
                es: "¿Qué proyecto multimedia en alemán te gustaría crear este año escolar (ej. un video corto, podcast o cómic digital)?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 2. ESPAÑOL
    espanol: [
        {
            id: "reto0_espanol_q1",
            label: {
                de: "Welche Art von Texten oder digitalen Inhalten (Bücher, Artikel, Blogs, Hörbücher) liest du gerne auf Spanisch?",
                en: "What type of texts or digital content (books, articles, blogs, audiobooks) do you enjoy reading in Spanish?",
                es: "¿Qué tipo de lecturas o contenidos digitales (artículos, cuentos, blogs, audiolibros) disfrutas más en español?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_espanol_q2",
            label: {
                de: "Wie helfen dir digitale Schreibwerkzeuge (Textverarbeitungsprogramme, DLE-Wörterbuch, Rechtschreibprüfung) beim Verfassen deiner Texte?",
                en: "How do digital writing tools (word processors, RAE dictionary, spell checkers) help you write better texts?",
                es: "¿Cómo utilizas herramientas digitales (procesadores de texto, diccionario RAE, correctores) para enriquecer tu redacción?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_espanol_q3",
            label: {
                de: "Wenn du einen digitalen Schülerartikel oder Schulblog schreiben würdest, welches aktuelle Thema würdest du wählen?",
                en: "If you were to write a digital school article or blog post, what topic of interest would you choose?",
                es: "Si tuvieras que redactar un artículo o publicación escolar en internet, ¿sobre qué tema de interés social o juvenil escribirías?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_espanol_q4",
            label: {
                de: "Woran erkennst du, ob ein Informationstext im Internet verlässlich ist oder ob es sich um Falschnachrichten (Fake News) handelt?",
                en: "How do you identify whether an informational text on the internet is trustworthy or fake news?",
                es: "¿Qué criterios aplicas para verificar si un texto informativo que encuentras en internet es confiable o información falsa?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 3. INGLÉS (ENGLISH)
    ingles: [
        {
            id: "reto0_ingles_q1",
            label: {
                de: "Wie nutzt du digitale Medien (Musik, Serien, Gaming, Podcasts), um dein Hör- und Sprachverständnis auf Englisch zu verbessern?",
                en: "How do you use digital media (music, shows, gaming, podcasts) to practice listening and speaking in English?",
                es: "¿Cómo utilizas los medios digitales (música, series, videojuegos, podcasts) para practicar tu comprensión y expresión en inglés?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_ingles_q2",
            label: {
                de: "Welche Online-Wörterbücher oder Sprachplattformen auf Englisch findest du am nützlichsten für deinen Wortschatz?",
                en: "What online English dictionaries or language platforms do you find most helpful for vocabulary building?",
                es: "¿Qué diccionarios en línea o aplicaciones en inglés te resultan más útiles para ampliar tu vocabulario?"
            },
            type: "text"
        },
        {
            id: "reto0_ingles_q3",
            label: {
                de: "Welches digitale Medienprodukt auf Englisch möchtest du dieses Jahr gestalten (z.B. Vlog, Präsentation, Infografik)?",
                en: "What digital media project in English would you like to design this year (e.g. vlog, presentation, infographic)?",
                es: "¿Qué producto multimedia en inglés te gustaría diseñar este año (ej. un vlog, presentación interactiva o infografía)?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_ingles_q4",
            label: {
                de: "Beschreibe eine Situation, in der dir die englische Sprache im Internet geholfen hat, neue Informationen zu entdecken.",
                en: "Describe a situation where using English online helped you discover something new or connect with someone.",
                es: "Describe una situación en la que usar inglés en internet te haya ayudado a encontrar información o comunicarte eficazmente."
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 4. TECNOLOGÍA
    tecnologia: [
        {
            id: "reto0_tec_q1",
            label: {
                de: "Welche Erfahrungen hast du bereits mit Programmieren oder kreativer Software gesammelt (z. B. Scratch, Canva, Tinkercad)?",
                en: "What prior experience do you have with programming or creative software (e.g. Scratch, Canva, Tinkercad)?",
                es: "¿Qué experiencia previa tienes programando o usando software creativo (ej. Scratch, Canva, Tinkercad, Python)?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_tec_q2",
            label: {
                de: "Wenn du eine App oder einen Roboter für deine Schule erfinden könntest, welches Problem würde deine Erfindung lösen?",
                en: "If you could create an app or robot for your school, what problem would your invention solve?",
                es: "Si pudieras programar una aplicación o diseñar un robot para tu colegio, ¿qué problema resolvería tu invento?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_tec_q3",
            label: {
                de: "Welche Sicherheitsmaßnahmen ergreifst du, um deine Passwörter und privaten Daten auf digitalen Plattformen zu schützen?",
                en: "What security measures do you take to protect your passwords and privacy across digital platforms?",
                es: "¿Qué precauciones tomas habitualmente para mantener tus contraseñas seguras y proteger tu privacidad online?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_tec_q4",
            label: {
                de: "Wie strukturierst und organisierst du deine Dateien und Ordner auf deinem Computer, um den Überblick zu behalten?",
                en: "How do you organize your files, documents, and folders on your computer so you can easily find them?",
                es: "¿Cómo organizas tus archivos, documentos y carpetas en tu computadora para encontrarlos rápidamente?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 5. CIENCIAS (NATURWISSENSCHAFTEN)
    ciencias: [
        {
            id: "reto0_ciencias_q1",
            label: {
                de: "Welches naturwissenschaftliche Thema oder Phänomen weckt deine Neugierde und recherchierst du gerne online?",
                en: "What scientific topic or natural phenomenon sparks your curiosity and do you like to research online?",
                es: "¿Qué fenómeno natural o tema científico te despierta mayor curiosidad e investigas en internet?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_ciencias_q2",
            label: {
                de: "Welche digitalen Simulatoren (z. B. PhET), virtuellen Labore oder Tabellen hast du schon für Experimente genutzt?",
                en: "What digital lab simulations (e.g. PhET), virtual charts, or spreadsheets have you used for science investigations?",
                es: "¿Qué simuladores de laboratorio (ej. PhET), tablas de datos o gráficos digitales has utilizado para comprender experimentos?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_ciencias_q3",
            label: {
                de: "Wie dokumentierst du deine wissenschaftlichen Beobachtungen und Messwerte mit digitalen Werkzeugen?",
                en: "How do you document your scientific observations and measurements using digital tools?",
                es: "¿Cómo registras y analizas datos de tus observaciones y experimentos científicos mediante herramientas digitales?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_ciencias_q4",
            label: {
                de: "Warum ist es bei wissenschaftlichen Recherchen im Internet entscheidend, fundierte Quellen von Falschmeldungen zu unterscheiden?",
                en: "Why is it crucial in scientific research online to distinguish verified evidence from myths and misinformation?",
                es: "¿Por qué es fundamental consultar fuentes científicas comprobadas al investigar sobre salud o medio ambiente en la web?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 6. INDIVIDUOS Y SOCIEDADES (GESCHICHTE / SOZIALKUNDE)
    individuos: [
        {
            id: "reto0_individuos_q1",
            label: {
                de: "Welche Epoche, Kultur oder gesellschaftliche Frage interessiert dich besonders und erkundest du gerne digital?",
                en: "What historical era, culture, or social issue interests you most and do you like to explore digitally?",
                es: "¿Qué época histórica, cultura o tema social del mundo te apasiona investigar mediante mapas y archivos digitales?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_individuos_q2",
            label: {
                de: "Wie beeinflussen soziale Medien und digitale Kanäle deiner Meinung nach die öffentliche Meinung und das Zusammenleben?",
                en: "How do social media and digital platforms influence public opinion and democratic coexistence in your view?",
                es: "¿Cómo consideras que las redes sociales y medios digitales influyen en la opinión de las personas y la convivencia ciudadana?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_individuos_q3",
            label: {
                de: "Welche virtuellen Museen, interaktiven historischen Karten oder Online-Archive kennst du oder möchtest du entdecken?",
                en: "What virtual museums, interactive maps, or digital historical archives have you explored or would you like to discover?",
                es: "¿Qué museos virtuales, hemerotecas o mapas interactivos has explorado o te gustaría conocer para aprender sobre historia?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_individuos_q4",
            label: {
                de: "Was ist dein Vorschlag, um Respekt, Empathie und ein faires Miteinander in digitalen Schulgruppen zu stärken?",
                en: "What is your proposal to foster empathy, respect, and positive communication in school digital communities?",
                es: "¿Cuál es tu propuesta para promover el respeto, la empatía y prevenir el ciberacoso en comunidades y grupos escolares virtuales?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 7. MATEMÁTICAS (MATHEMATIK)
    matematicas: [
        {
            id: "reto0_mate_q1",
            label: {
                de: "Welche digitalen Mathematik-Werkzeuge (z. B. GeoGebra, Tabellenkalkulation, interaktive Rechner) helfen dir beim Verstehen?",
                en: "What digital mathematics tools (e.g. GeoGebra, spreadsheets, graphing calculators) help you understand math concepts?",
                es: "¿Qué herramientas o calculadoras digitales (GeoGebra, hojas de cálculo, apps de cálculo) te ayudan a visualizar conceptos matemáticos?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_mate_q2",
            label: {
                de: "In welchen alltäglichen oder digitalen Situationen wendest du logisches und mathematisches Denken an?",
                en: "In what everyday or digital situations do you apply logical and mathematical reasoning?",
                es: "¿En qué situaciones cotidianas, juegos o proyectos digitales aplicas el razonamiento lógico y matemático?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_mate_q3",
            label: {
                de: "Welches mathematische Thema findest du besonders herausfordernd und welche interaktive Ressource hilft dir beim Üben?",
                en: "What math topic do you find most challenging and what interactive digital resource has helped you practice it?",
                es: "¿Qué tema de matemáticas te parece más retador y qué recurso digital interactivo te ha servido para practicarlo?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_mate_q4",
            label: {
                de: "Wie helfen dir digitale Diagramme und Datenanalysen, reale Probleme und Statistiken besser zu interpretieren?",
                en: "How do digital charts, graphs, and statistical data help you solve real-world problems?",
                es: "¿Cómo te ayudan los gráficos digitales y tablas estadísticas a interpretar problemas y tomar decisiones en la vida real?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 8. MÚSICA (MUSIK)
    musica: [
        {
            id: "reto0_musica_q1",
            label: {
                de: "Welche Musikstile oder Instrumente begeistern dich und welche digitalen Plattformen nutzt du, um Musik zu hören?",
                en: "What musical styles or instruments inspire you and which digital platforms do you use to listen to music?",
                es: "¿Qué géneros musicales o instrumentos te apasionan y qué plataformas digitales utilizas habitualmente para escucharlos?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_musica_q2",
            label: {
                de: "Hast du schon einmal Musik-Software (z. B. GarageBand, Audacity, Soundtrap) verwendet, um Audio aufzunehmen oder Beats zu kreieren?",
                en: "Have you ever used music creation software (e.g. GarageBand, Audacity, Soundtrap) to record audio or arrange beats?",
                es: "¿Has utilizado programas digitales para componer, editar audio o mezclar sonidos (GarageBand, Audacity, Soundtrap)?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_musica_q3",
            label: {
                de: "Wie verändern moderne Technologien und Künstliche Intelligenz deiner Ansicht nach die Entstehung und Verbreitung von Musik?",
                en: "How do modern technologies and AI influence the way music is composed, produced, and shared today?",
                es: "¿Cómo crees que la tecnología y la inteligencia artificial están transformando la forma en que se crea y comparte la música?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_musica_q4",
            label: {
                de: "Wenn du einen digitalen Soundtrack für einen normalen Schultag komponieren würdest, welche Rhythmen und Stimmungen würdest du wählen?",
                en: "If you composed a digital soundtrack for a school day, what musical elements, rhythms, and emotions would you incorporate?",
                es: "Si crearas una banda sonora o paisaje sonoro digital para tu curso escolar, ¿qué ritmos y emociones buscarías transmitir?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 9. ARTE (KUNST)
    arte: [
        {
            id: "reto0_arte_q1",
            label: {
                de: "Welche traditionellen und digitalen Kunsttechniken (Vektorzeichnung, digitale Malerei, 3D, Animation) interessieren dich?",
                en: "What traditional and digital art techniques (vector art, digital painting, 3D modeling, animation) do you enjoy exploring?",
                es: "¿Qué técnicas artísticas tradicionales y digitales (dibujo vectorial, pintura digital, modelado 3D, animación) te gusta explorar?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_arte_q2",
            label: {
                de: "Welche Grafik-, Foto- oder Zeichen-Apps (Canva, Photoshop, Procreate, Paint) nutzt du am liebsten für deine Arbeiten?",
                en: "What graphic design, photo editing, or illustration apps (Canva, Photoshop, Procreate, Paint) do you prefer using?",
                es: "¿Qué programas de diseño gráfico, edición fotográfica o dibujo (Canva, Photoshop, Procreate, Paint) utilizas habitualmente?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_arte_q3",
            label: {
                de: "Welche virtuellen Kunstgalerien, Illustratoren oder Digitalkünstler inspirieren dich bei deinen eigenen kreativen Projekten?",
                en: "What virtual art galleries, illustrators, or digital creators inspire you in your own artistic explorations?",
                es: "¿Qué museos virtuales, ilustradores o artistas visuales sigues o te inspiran para tus proyectos creativos?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_arte_q4",
            label: {
                de: "Welches multimediale Kunstwerk möchtest du dieses Jahr gestalten, bei dem Bildende Kunst und digitale Medien verschmelzen?",
                en: "What multimedia art project combining visual arts and technology would you like to develop this year?",
                es: "¿Qué proyecto artístico multimedia te gustaría realizar este año combinando artes plásticas con herramientas digitales?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 10. MINT Y CIENCIAS NATURALES (SACHUNTERRICHT / MINT)
    mint_sach: [
        {
            id: "reto0_mint_q1",
            label: {
                de: "Welches MINT-Projekt (Mathematik, Informatik, Naturwissenschaften, Technik) möchtest du in diesem Schuljahr erforschen?",
                en: "What STEM project (science, technology, engineering, math) would you like to research or build this school year?",
                es: "¿Qué proyecto o reto MINT (ciencia, tecnología, ingeniería, matemáticas) te gustaría desarrollar e investigar este año escolar?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_mint_q2",
            label: {
                de: "Wie setzt du digitale Messgeräte oder Umweltsensoren ein, um Daten über die Natur und Umwelt zu sammeln?",
                en: "How do you use digital sensors or measurement tools to collect and analyze environmental data?",
                es: "¿Cómo utilizas herramientas de medición o sensores digitales para registrar y analizar datos del entorno natural?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_mint_q3",
            label: {
                de: "Welche innovativen technologischen Lösungen stellst du dir vor, um Wasser, Energie oder die Umwelt an deiner Schule zu schützen?",
                en: "What technological solutions can you imagine to conserve water, energy, or environmental resources in your community?",
                es: "¿Qué soluciones tecnológicas e innovadoras imaginas para cuidar el agua, la energía o el medio ambiente en tu colegio?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_mint_q4",
            label: {
                de: "Auf welche Weise hilft dir digitale Teamarbeit, komplexe wissenschaftliche Probleme strukturiert zu lösen?",
                en: "In what ways does collaborative work on digital platforms help you solve complex scientific inquiries?",
                es: "¿De qué manera el trabajo colaborativo en plataformas digitales te ayuda a resolver retos de investigación científica?"
            },
            type: "textarea",
            rows: 2
        }
    ],

    // 11. DEPORTES (SPORT): natación, polimotor, voleibol, baloncesto y atletismo
    deportes: [
        {
            id: "reto0_deportes_q1",
            label: {
                de: "Welchen Sport treibst du oder würdest du gern treiben (Schwimmen, Volleyball, Basketball, Leichtathletik oder anderes) und welche Apps oder digitalen Uhren nutzt du, um deine Bewegung zu verfolgen?",
                en: "Which sport do you play or would you like to play (swimming, volleyball, basketball, athletics or another) and which apps or digital watches do you use to track your physical activity?",
                es: "¿Qué deporte practicas o te gustaría practicar (natación, voleibol, baloncesto, atletismo u otro) y qué apps o relojes digitales usas para seguir tu actividad física?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_deportes_q2",
            label: {
                de: "Hast du schon einmal ein Video aufgenommen oder angesehen, um deine Technik zu verbessern (einen Schwimmstil, einen Volleyball-Aufschlag, einen Basketball-Wurf oder einen Leichtathletik-Start)? Was hast du gelernt?",
                en: "Have you ever recorded or watched a video to improve your technique (a swimming stroke, a volleyball serve, a basketball shot or an athletics start)? What did you learn?",
                es: "¿Has grabado o visto alguna vez un video para mejorar tu técnica (un estilo de natación, un saque de voleibol, un lanzamiento de baloncesto o una salida de atletismo)? ¿Qué aprendiste?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_deportes_q3",
            label: {
                de: "Wie könnte dir Technik bei Polimotor-Parcours (Laufen, Springen, Werfen, Gleichgewicht) helfen, deinen Fortschritt sicher zu messen, ohne zu viele persönliche Daten zu teilen?",
                en: "In polymotor circuits (running, jumping, throwing, balance), how could technology help you measure your progress safely without sharing too much personal data?",
                es: "En los circuitos de polimotor (correr, saltar, lanzar, equilibrio), ¿cómo te ayudaría la tecnología a medir tu progreso de forma segura y sin compartir datos personales de más?"
            },
            type: "textarea",
            rows: 2
        },
        {
            id: "reto0_deportes_q4",
            label: {
                de: "Welches digitale Projekt über Sport möchtest du dieses Jahr erstellen (ein Video mit Spielzügen, eine Tabelle mit Leichtathletik-Bestleistungen, einen Schwimmratgeber) und mit welchen Werkzeugen?",
                en: "What digital sports project would you like to create this year (a video of plays, a table of athletics records, a swimming guide) and with which tools?",
                es: "¿Qué proyecto digital sobre deporte te gustaría crear este año (un video de jugadas, una tabla de marcas de atletismo, una guía de natación) y con qué herramientas?"
            },
            type: "textarea",
            rows: 2
        }
    ]
};

// ─── 3. FÁBRICA / ADAPTADOR DE RETO 0 POR ASIGNATURA ───
function getReto0ForSubject(subjectId) {
    const normSubj = (subjectId || 'individuos').toLowerCase().trim();
    const foundSubject = subjects.find(s => s.id === normSubj) || {
        id: normSubj,
        name: { de: "MedienPass", en: "MedienPass", es: "MedienPass" },
        icon: "👤",
        color: "#d946ef"
    };

    // Materia nueva (Administración › Materias): preguntas abiertas genéricas con su nombre
    const specificQuestions = subjectSpecificEvidence[normSubj]
        || (foundSubject.custom ? require('./data_generic_subject').genericOpenQuestions(normSubj, foundSubject.name) : null)
        || subjectSpecificEvidence['individuos'] || [];

    // Combinar: 5 básicas + 4 de la materia = 9 preguntas (<= 10 en total)
    const combinedEvidence = [
        ...baseProfileEvidence,
        ...specificQuestions
    ];

    const subjNameEs = foundSubject.name?.es || foundSubject.name || normSubj;
    const subjNameDe = foundSubject.name?.de || subjNameEs;
    const subjNameEn = foundSubject.name?.en || subjNameEs;

    return {
        id: "profile",
        subject: normSubj,
        level: "0",
        title: {
            de: `Das bin ich - Reto 0 (${subjNameDe})`,
            en: `This is me - Challenge 0 (${subjNameEn})`,
            es: `Este soy yo - Reto 0 (${subjNameEs})`
        },
        subtitle: {
            de: `Persönliches Profil & Digitale Reflexion: ${subjNameDe}`,
            en: `Personal Profile & Digital Reflection: ${subjNameEn}`,
            es: `Perfil Personal y Reflexión Digital: ${subjNameEs}`
        },
        instruction: {
            de: `Willkommen zu Reto 0 in ${subjNameDe}. Beantworte die grundlegenden Fragen zu deiner Person und reflektiere über deine Fähigkeiten und Interessen im Fachbereich.`,
            en: `Welcome to Challenge 0 in ${subjNameEn}. Answer the basic questions about yourself and reflect on your digital skills and interests in this subject.`,
            es: `Te damos la bienvenida al Reto 0 en el área de ${subjNameEs}. Completa tus datos personales básicos y responde las preguntas de reflexión diagnóstica de la asignatura.`
        },
        icon: foundSubject.icon || "👤",
        color: foundSubject.color || "#d946ef",
        competencies: [],
        evidence: combinedEvidence
    };
}

// Pre-construir mapa de todos los Reto 0 adaptados por asignatura
const reto0BySubject = {};
subjects.forEach(s => {
    reto0BySubject[s.id] = getReto0ForSubject(s.id);
});

module.exports = {
    baseProfileEvidence,
    subjectSpecificEvidence,
    getReto0ForSubject,
    reto0BySubject
};
