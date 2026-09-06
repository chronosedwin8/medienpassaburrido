// ═══════════════════════════════════════════
// MedienPass App - Question Generator Module
// Generates unique, progressive questions for grades K2 to K12
// ═══════════════════════════════════════════

const subjectsConfig = {
    aleman: {
        es: "Alemán", de: "Deutsch", en: "German",
        tool: { es: "diccionario Duden", de: "Duden-Wörterbuch", en: "Duden dictionary" },
        task: { es: "tu reporte de lectura sobre Goethe", de: "deinen Lesebereicht über Goethe", en: "your reading report on Goethe" },
        collabTool: { es: "Microsoft Teams", de: "Microsoft Teams", en: "Microsoft Teams" },
        digitalProduct: { es: "un podcast literario", de: "einen Literatur-Podcast", en: "a literary podcast" }
    },
    ingles: {
        es: "Inglés", de: "Englisch", en: "English",
        tool: { es: "traductor de Cambridge", de: "Cambridge-Wörterbuch", en: "Cambridge dictionary" },
        task: { es: "tu presentación sobre el cambio climático", de: "deine Präsentation über den Klimawandel", en: "your presentation on climate change" },
        collabTool: { es: "OneDrive compartido", de: "geteiltes OneDrive", en: "shared OneDrive" },
        digitalProduct: { es: "un video explicativo en inglés", de: "ein Erklärvideo auf Englisch", en: "an explainer video in English" }
    },
    espanol: {
        es: "Español", de: "Spanisch", en: "Spanish",
        tool: { es: "diccionario de la RAE", de: "RAE-Wörterbuch", en: "RAE dictionary" },
        task: { es: "tu ensayo de análisis literario", de: "deinen literarischen Aufsatz", en: "your literary analysis essay" },
        collabTool: { es: "Word Online", de: "Word Online", en: "Word Online" },
        digitalProduct: { es: "una infografía sobre el realismo mágico", de: "eine Infografik über den magischen Realismus", en: "an infographic on magical realism" }
    },
    tecnologia: {
        es: "Tecnología", de: "Technologie", en: "Technology",
        tool: { es: "computadora o tablet", de: "Computer oder Tablet", en: "computer or tablet" },
        task: { es: "tu programa de bloques o sitio web", de: "dein Blockprogramm oder deine Website", en: "your block program or website" },
        collabTool: { es: "Google Drive compartido", de: "geteiltes Google Drive", en: "shared Google Drive" },
        digitalProduct: { es: "una página web interactiva", de: "eine interaktive Webseite", en: "an interactive webpage" }
    },
    ciencias: {
        es: "Ciencias", de: "Naturwissenschaften", en: "Science",
        tool: { es: "simulador PhET de ciencias", de: "PhET-Naturwissenschafts-Simulator", en: "PhET science simulator" },
        task: { es: "tu reporte digital de laboratorio", de: "deinen digitalen Laborbericht", en: "your digital lab report" },
        collabTool: { es: "documento compartido de Google Docs", de: "geteiltes Google Docs Dokument", en: "shared Google Docs document" },
        digitalProduct: { es: "un informe científico interactivo", de: "einen interaktiven wissenschaftlichen Bericht", en: "an interactive scientific report" }
    },
    individuos: {
        es: "Individuos y Sociedades", de: "Gesellschaftslehre", en: "Individuals & Societies",
        tool: { es: "mapa digital o atlas virtual", de: "digitale Karte oder virtueller Atlas", en: "digital map or virtual atlas" },
        task: { es: "tu infografía histórica sobre civilizaciones", de: "deine historische Infografik über Zivilisationen", en: "your historical infographic on civilizations" },
        collabTool: { es: "diapositivas compartidas", de: "geteilte Präsentationsfolien", en: "shared presentation slides" },
        digitalProduct: { es: "un video histórico documental", de: "einen historischen Dokumentarfilm", en: "a historical documentary video" }
    },
    matematicas: {
        es: "Matemáticas", de: "Mathematik", en: "Mathematics",
        tool: { es: "software GeoGebra", de: "GeoGebra-Software", en: "GeoGebra software" },
        task: { es: "tu resolución digital de problemas geométricos", de: "deine digitale Lösung geometrischer Probleme", en: "your digital resolution of geometric problems" },
        collabTool: { es: "pizarra digital interactiva", de: "interaktives digitales Whiteboard", en: "interactive digital whiteboard" },
        digitalProduct: { es: "un modelo matemático en GeoGebra", de: "ein mathematisches Modell in GeoGebra", en: "a mathematical model in GeoGebra" }
    },
    musica: {
        es: "Música", de: "Musik", en: "Music",
        tool: { es: "editor de audio GarageBand o Audacity", de: "Audio-Editor GarageBand oder Audacity", en: "GarageBand or Audacity audio editor" },
        task: { es: "tu composición musical o mezcla digital", de: "deine Musikkomposition oder digitale Mischung", en: "your music composition or digital mix" },
        collabTool: { es: "plataforma de colaboración musical", de: "Musik-Kollaborationsplattform", en: "musical collaboration platform" },
        digitalProduct: { es: "una pista de audio o podcast musical", de: "eine Audiospur oder einen Musik-Podcast", en: "an audio track or musical podcast" }
    },
    arte: {
        es: "Arte", de: "Kunst", en: "Art",
        tool: { es: "software de dibujo digital o Canva", de: "digitale Zeichensoftware oder Canva", en: "digital drawing software or Canva" },
        task: { es: "tu pintura digital o collage multimedia", de: "dein digitales Gemälde oder deine Multimedia-Collage", en: "your digital painting or multimedia collage" },
        collabTool: { es: "galería de arte virtual compartida", de: "geteilte virtuelle Kunstgalerie", en: "shared virtual art gallery" },
        digitalProduct: { es: "un portafolio artístico digital", de: "ein digitales Kunstportfolio", en: "a digital art portfolio" }
    },
    mint_sach: {
        es: "MINT y Sachunterricht", de: "Sachunterricht & MINT", en: "MINT & Sachunterricht",
        tool: { es: "herramientas interactivas de MINT", de: "interaktive MINT-Werkzeuge", en: "interactive MINT tools" },
        task: { es: "tu proyecto técnico de investigación MINT", de: "dein technisches MINT-Forschungsprojekt", en: "your technical MINT research project" },
        collabTool: { es: "pizarra virtual compartida Padlet", de: "geteiltes Padlet-Whiteboard", en: "shared Padlet virtual whiteboard" },
        digitalProduct: { es: "una presentación interactiva MINT", de: "eine interaktive MINT-Präsentation", en: "an interactive MINT presentation" }
    }
};

// Generates the core text templates scaled by difficulty (+1 to +10)
function getBaseTemplates(retoNum, qNum, sub, grade) {
    const isK2 = grade === 2;
    const diff = grade - 2; // +0 for K2, +1 for K3, ..., +10 for K12
    const nameS = subjectsConfig[sub] || {
        es: "Tecnología", de: "Technologie", en: "Technology",
        tool: { es: "herramienta digital", de: "digitales Tool", en: "digital tool" },
        task: { es: "tu proyecto digital", de: "dein digitales Projekt", en: "your digital project" },
        collabTool: { es: "plataforma colaborativa", de: "kollaborative Plattform", en: "collaborative platform" },
        digitalProduct: { es: "un producto digital", de: "ein digitales Produkt", en: "a digital product" }
    };

    switch (retoNum) {
        case 1: // Suchen & Verarbeiten (Búsqueda y Procesamiento de Información)
            if (qNum === 1) {
                return {
                    label: {
                        es: isK2 
                            ? `🔍 ¿Qué palabra es mejor para buscar información en internet sobre ${nameS.es}? 🐕`
                            : `Cuando investigas o buscas recursos para tu proyecto de ${nameS.es} en internet (en navegadores, Canva o suites de oficina) (Dificultad +${diff}), ¿cuál es la mejor estrategia para obtener resultados precisos y seguros?`,
                        de: isK2
                            ? `🔍 Welches Wort ist am besten, um im Internet nach Informationen über ${nameS.de} zu suchen? 🐕`
                            : `Welche Suchstrategie ist am besten geeignet, um präzise und sichere Ergebnisse bei der Recherche zu deinem ${nameS.de}-Projekt im Web (z. B. in Browsern, Canva oder Office) zu erzielen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🔍 Which word is best to search online for information about ${nameS.en}? 🐕`
                            : `When researching or searching for resources for your ${nameS.en} project online (in browsers, Canva, or office suites) (Difficulty +${diff}), what is the best strategy to get precise and safe results?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Solo escribir 'hola'" : "a) Usar palabras clave específicas y operadores booleanos (AND, OR, NOT) para filtrar los resultados de búsqueda.",
                            de: isK2 ? "a) Einfach nur 'Hallo' schreiben" : "a) Spezifische Schlüsselwörter und Boolesche Operatoren (AND, OR, NOT) nutzen, um die Suchergebnisse zu filtern.",
                            en: isK2 ? "a) Just typing 'hello'" : "a) Use specific keywords and Boolean operators (AND, OR, NOT) to filter the search results.",
                            correct: !isK2
                        },
                        {
                            es: isK2 ? `b) '${nameS.es} para niños'` : "b) Escribir oraciones completas y muy largas de manera aleatoria en cualquier buscador comercial.",
                            de: isK2 ? `b) '${nameS.de} für Kinder'` : "b) Zufällige, sehr lange und vollständige Sätze in irgendeine kommerzielle Suchmaschine eingeben.",
                            en: isK2 ? `b) '${nameS.en} for kids'` : "b) Write full and very long sentences randomly in any commercial search engine.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "c) No escribir nada" : "c) Hacer clic en los primeros resultados promocionales o anuncios publicitarios que aparezcan en la parte superior.",
                            de: isK2 ? "c) Gar nichts schreiben" : "c) Auf die ersten gesponserten Ergebnisse oder Werbeanzeigen klicken, die ganz oben erscheinen.",
                            en: isK2 ? "c) Typing nothing at all" : "c) Click on the first sponsored results or advertisements that appear at the top.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las búsquedas inteligentes usando términos precisos, comillas o filtros de búsqueda avanzada te ayudan a encontrar la información escolar de forma rápida, segura y confiable en cualquier herramienta (como Office 365, Canva o navegadores).",
                        de: "Intelligente Suchen mit präzisen Begriffen, Anführungszeichen oder Filtern für die erweiterte Suche helfen dir, schulische Informationen schnell, sicher und zuverlässig in jedem Tool (wie Office 365, Canva oder Browsern) zu finden.",
                        en: "Smart searches using precise terms, quotation marks, or advanced search filters help you find school information quickly, safely, and reliably in any tool (like Office 365, Canva, or browsers)."
                    }
                };
            }
            if (qNum === 2) {
                return {
                    label: {
                        es: isK2
                            ? `🔍 ¿Cómo sabemos si una página web de ${nameS.es} es buena para estudiar? 📚`
                            : `Al utilizar recursos de internet o plataformas educativas (como Anton, Canva o blogs escolares) para estudiar ${nameS.es} (Dificultad +${diff}), ¿cómo evalúas si la información es confiable y segura?`,
                        de: isK2
                            ? `🔍 Wie erkennen wir, ob eine Webseite über ${nameS.de} gut zum Lernen ist? 📚`
                            : `Wie beurteilst du bei der Nutzung von Internetquellen oder Bildungsplattformen (wie Anton, Canva oder Schulblogs) für das Fach ${nameS.de}, ob die Informationen zuverlässig und sicher sind (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🔍 How do we know if a webpage about ${nameS.en} is good for studying? 📚`
                            : `When using internet resources or educational platforms (like Anton, Canva, or school blogs) to study ${nameS.en} (Difficulty +${diff}), how do you evaluate if the information is reliable and safe?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Tiene muchos colores y juegos" : "a) Guiarse únicamente por el aspecto visual, los colores llamativos y la rapidez de carga de la página.",
                            de: isK2 ? "a) Sie hat viele Farben und Spiele" : "a) Sich ausschließlich nach dem Design, den auffälligen Farben und der Ladegeschwindigkeit der Seite richten.",
                            en: isK2 ? "a) It has lots of colors and games" : "a) Base your judgment solely on the visual appearance, bright colors, and loading speed of the webpage.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Es recomendada por el colegio u oficial" : "b) Verificar que la fuente cuente con un autor claro, referencias bibliográficas, esté avalada por instituciones educativas oficiales o recomendada por tus profesores.",
                            de: isK2 ? "b) Sie wird von der Schule empfohlen oder ist offiziell" : "b) Überprüfen, ob die Quelle einen klaren Autor und Literaturangaben hat, von offiziellen Bildungseinrichtungen unterstützt oder von Lehrern empfohlen wird.",
                            en: isK2 ? "b) It is recommended by school or official" : "b) Verify that the source has a clear author, references, is endorsed by official educational institutions, or recommended by your teachers.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) El título es muy chistoso" : "c) Confiar en foros de opinión abiertos donde cualquier persona en internet pueda editar el contenido libremente.",
                            de: isK2 ? "c) Der Titel ist sehr lustig" : "c) Offenen Diskussionsforen vertrauen, in denen jeder im Internet die Inhalte frei bearbeiten kann.",
                            en: isK2 ? "c) The title is very funny" : "c) Trust open opinion forums where anyone on the internet can edit the content freely.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La veracidad de la información en internet se comprueba contrastando el origen de los datos. Priorizar sitios con dominio oficial (.edu, .org, .gov) o validados por la escuela (como Anton) garantiza que tu aprendizaje se base en fuentes académicas correctas.",
                        de: "Die Richtigkeit von Informationen im Internet wird durch die Überprüfung der Datenquelle kontrolliert. Die Bevorzugung von offiziellen Domänen (.edu, .org, .gov) oder von der Schule validierten Seiten (wie Anton) stellt sicher, dass dein Lernen auf korrekten akademischen Quellen basiert.",
                        en: "The truthfulness of information on the internet is verified by checking the origin of the data. Prioritizing sites with official domains (.edu, .org, .gov) or validated by the school (like Anton) guarantees that your learning is based on correct academic sources."
                    }
                };
            }
            if (qNum === 3) {
                return {
                    label: {
                        es: isK2
                            ? `🔍 ¿Dónde debemos guardar nuestros archivos de ${nameS.es} para no perderlos? 📂`
                            : `Al crear evidencias digitales de tu proyecto de ${nameS.es} (presentaciones, documentos, lienzos de Canva o mundos de Minecraft) (Dificultad +${diff}), ¿cuál es el mejor método para organizar y proteger tus archivos en la nube?`,
                        de: isK2
                            ? `🔍 Wo sollten wir unsere ${nameS.de}-Dateien speichern, damit sie nicht verloren gehen? 📂`
                            : `Welches ist die beste Methode zur Organisation und zum Schutz deiner Dateien in der Cloud (Schwierigkeit +${diff}), wenn du digitale Nachweise für dein ${nameS.de}-Projekt erstellst (Präsentationen, Dokumente, Canva-Entwürfe oder Minecraft-Welten)?`,
                        en: isK2
                            ? `🔍 Where should we save our ${nameS.en} files so we do not lose them? 📂`
                            : `When creating digital evidence for your ${nameS.en} project (presentations, documents, Canva designs, or Minecraft worlds) (Difficulty +${diff}), what is the best method to organize and protect your files in the cloud?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) En la papelera de reciclaje" : "a) Guardar todo en una carpeta temporal con nombres genéricos como 'Documento1' o 'SinTítulo'.",
                            de: isK2 ? "a) Im Papierkorb" : "a) Alles in einem temporären Ordner mit generischen Namen wie 'Dokument1' oder 'OhneTitel' speichern.",
                            en: isK2 ? "a) In the recycle bin" : "a) Save everything in a temporary folder with generic names like 'Document1' or 'Untitled'.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) En una carpeta con el nombre de la materia" : "b) Crear una estructura de carpetas jerárquica (Año > Materia > Proyecto) y usar nombres descriptivos con versión y fecha.",
                            de: isK2 ? "b) In einem Ordner mit dem Namen des Fachs" : "b) Eine hierarchische Ordnerstruktur (Jahr > Fach > Projekt) erstellen und aussagekräftige Namen mit Version und Datum verwenden.",
                            en: isK2 ? "b) In a folder named after the subject" : "b) Create a hierarchical folder structure (Year > Subject > Project) and use descriptive names with version and date.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) En la computadora de un compañero" : "c) Dejar los archivos dispersos en el escritorio local de la computadora compartida del colegio.",
                            de: isK2 ? "c) Auf dem Computer eines Mitschülers" : "c) Die Dateien verstreut auf dem lokalen Desktop des gemeinsam genutzten Schulcomputers liegen lassen.",
                            en: isK2 ? "c) On a classmate's computer" : "c) Leave files scattered on the local desktop of the shared school computer.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La organización lógica de archivos en servicios de almacenamiento en la nube (como OneDrive) previene la pérdida accidental de datos. Usar carpetas ordenadas y nombres que indiquen el contenido y la versión es clave para el trabajo académico.",
                        de: "Die logische Dateiorganisation in Cloud-Speicherdiensten (wie OneDrive) verhindert versehentlichen Datenverlust. Die Verwendung geordneter Ordner und Namen, die den Inhalt und die Version angeben, ist der Schlüssel zur akademischen Arbeit.",
                        en: "Logical file organization in cloud storage services (like OneDrive) prevents accidental data loss. Using ordered folders and names indicating the content and the version is key to academic work."
                    }
                };
            }
            if (qNum === 4) {
                return {
                    label: {
                        es: isK2
                            ? `🔍 Si leemos en internet que 'el perro es el mejor amigo del hombre', ¿eso es: 🐾`
                            : `Cuando analizas contenidos en internet o en plataformas digitales para tus tareas de ${nameS.es} (Dificultad +${diff}), ¿cómo diferencias un hecho contrastable de una opinión personal del autor?`,
                        de: isK2
                            ? `🔍 Wenn wir im Internet lesen: 'Der Hund ist der beste Freund des Menschen', ist das: 🐾`
                            : `Wie unterscheidest du bei der Analyse von Inhalten im Internet oder auf digitalen Plattformen für deine ${nameS.de}-Aufgaben einen überprüfbaren Fakt von einer persönlichen Meinung des Autors (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🔍 If we read online that 'dogs are humans' best friends', is that: 🐾`
                            : `When analyzing content on the internet or digital platforms for your ${nameS.en} assignments (Difficulty +${diff}), how do you distinguish a verifiable fact from a personal opinion of the author?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Un hecho (algo que se puede probar)" : "a) Los hechos se respaldan con datos comprobables, experimentos o estudios científicos; las opiniones son juicios subjetivos basados en gustos o creencias.",
                            de: isK2 ? "a) Ein Fakt (etwas, das man beweisen kann)" : "a) Fakten werden durch überprüfbare Daten, Experimente oder wissenschaftliche Studien gestützt; Meinungen sind subjektive Urteile, die auf Vorlieben oder Überzeugungen basieren.",
                            en: isK2 ? "a) A fact (something that can be proven)" : "a) Facts are supported by verifiable data, experiments, or scientific studies; opinions are subjective judgments based on tastes or beliefs.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Una opinión (lo que alguien piensa)" : "b) Toda información en internet se considera un hecho científico si la página web tiene imágenes profesionales.",
                            de: isK2 ? "b) Eine Meinung (was jemand denkt)" : "b) Alle Informationen im Internet gelten als wissenschaftliche Fakten, wenn die Webseite professionelle Bilder hat.",
                            en: isK2 ? "b) An opinion (what someone thinks)" : "b) All information on the internet is considered a scientific fact if the webpage has professional images.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) Una mentira total" : "c) Las opiniones son hechos absolutos si el autor es un creador de contenido con millones de seguidores.",
                            de: isK2 ? "c) Eine absolute Lüge" : "c) Meinungen sind absolute Fakten, wenn der Autor ein Content Creator mit Millionen von Followern ist.",
                            en: isK2 ? "c) A complete lie" : "c) Opinions are absolute facts if the author is a content creator with millions of followers.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Aprender a distinguir hechos comprobables de juicios u opiniones subjetivas es una habilidad crítica en internet. Los hechos se demuestran con evidencias consistentes, mientras que las opiniones usan adjetivos calificativos y expresan posturas personales.",
                        de: "Zu lernen, überprüfbare Fakten von subjektiven Urteilen oder Meinungen zu unterscheiden, ist eine wichtige Fähigkeit im Internet. Fakten werden durch konsistente Beweise belegt, während Meinungen wertende Adjektive verwenden und persönliche Haltungen ausdrücken.",
                        en: "Learning to distinguish verifiable facts from subjective judgments or opinions is a critical skill online. Facts are demonstrated by consistent evidence, while opinions use qualifying adjectives and express personal stances."
                    }
                };
            }
            if (qNum === 5) {
                return {
                    label: {
                        es: isK2
                            ? `🔍 ¿Cuál de estas herramientas te ayuda a traducir o buscar palabras de ${nameS.es}? 📖`
                            : `Si estás realizando una actividad digital de ${nameS.es} y necesitas precisar significados o traducir términos formales (Dificultad +${diff}), ¿qué herramienta es más recomendable y segura?`,
                        de: isK2
                            ? `🔍 Welches dieser Tools hilft dir, Wörter für ${nameS.de} zu übersetzen oder zu suchen? 📖`
                            : `Welches Tool ist am empfehlenswertesten und sichersten (Schwierigkeit +${diff}), wenn du eine digitale Aktivität für ${nameS.de} durchführst und Bedeutungen präzisieren oder formelle Begriffe übersetzen musst?`,
                        en: isK2
                            ? `🔍 Which of these tools helps you translate or look up words for ${nameS.en}? 📖`
                            : `If you are doing a digital activity for ${nameS.en} and need to clarify meanings or translate formal terms (Difficulty +${diff}), which tool is most recommended and safe?`
                    },
                    options: [
                        {
                            es: isK2 ? `a) El ${nameS.tool.es}` : "a) Consultar diccionarios oficiales en línea, traductores respaldados por editoriales académicas o enciclopedias virtuales reconocidas.",
                            de: isK2 ? `a) Das ${nameS.tool.de}` : "a) Offizielle Online-Wörterbücher, von akademischen Verlagen unterstützte Übersetzer oder anerkannte virtuelle Enzyklopädien konsultieren.",
                            en: isK2 ? `a) The ${nameS.tool.en}` : "a) Consult official online dictionaries, translators backed by academic publishers, or recognized virtual encyclopedias.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Un videojuego de carreras" : "b) Usar un traductor automático simple sin revisar la gramática ni contrastar el contexto escolar.",
                            de: isK2 ? "b) Ein Autorennspiel" : "b) Einen einfachen automatischen Übersetzer verwenden, ohne die Grammatik zu prüfen oder den schulischen Kontext abzugleichen.",
                            en: isK2 ? "b) A car racing game" : "b) Use a simple automatic translator without checking grammar or cross-referencing the school context.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) El chat de tus amigos" : "c) Preguntar a un foro abierto en internet o buscar en una red social de videos cortos.",
                            de: isK2 ? "c) Der Chat deiner Freunde" : "c) In einem offenen Internetforum nachfragen oder in einem sozialen Netzwerk für Kurzvideos suchen.",
                            en: isK2 ? "c) The chat of your friends" : "c) Ask an open internet forum or search on a short video social network.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las herramientas lingüísticas y académicas de referencia garantizan traducciones precisas y sin errores de contexto. Usar recursos avalados evita interpretaciones erróneas en tus tareas escolares y proyectos colaborativos.",
                        de: "Sprachliche und akademische Referenzwerkzeuge garantieren präzise Übersetzungen ohne Kontextfehler. Die Nutzung anerkannter Ressourcen verhindert Fehlinterpretationen bei deinen Hausaufgaben und Veröffentlichungen.",
                        en: "Reference linguistic and academic tools guarantee precise translations without context errors. Using endorsed resources prevents misinterpretations in your homework and collaborative projects."
                    }
                };
            }
            if (qNum === 6) {
                return {
                    label: {
                        es: isK2
                            ? `🔍 Si necesitas información para ${nameS.es}, ¿dónde es más seguro buscar? 🌐`
                            : `Al elaborar un informe digital de ${nameS.es} en la computadora (Dificultad +${diff}), ¿cómo debes validar las referencias digitales que vas a incluir?`,
                        de: isK2
                            ? `🔍 Wenn du Informationen für ${nameS.de} brauchst, wo suchst du am sichersten? 🌐`
                            : `Wie solltest du die digitalen Referenzen validieren, die du einbeziehen willst, wenn du einen digitalen Bericht für ${nameS.de} am Computer erstellst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🔍 If you need information for ${nameS.en}, where is the safest place to search? 🌐`
                            : `When preparing a digital report for ${nameS.en} on the computer (Difficulty +${diff}), how should you validate the digital references you are going to include?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) En cualquier enlace que parpadee" : "a) Utilizar el primer enlace que aparezca en el buscador sin revisar la fecha, el autor o la institución que lo publica.",
                            de: isK2 ? "a) Auf jedem blinkenden Link" : "a) Den ersten Link verwenden, der in der Suchmaschine erscheint, ohne das Datum, den Autor oder die herausgebende Institution zu prüfen.",
                            en: isK2 ? "a) On any flashing link" : "a) Use the first link that appears in the search engine without reviewing the date, author, or the institution publishing it.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) En páginas de videos de memes" : "b) Contrastar la información en al menos dos fuentes independientes y confiables, y añadir una sección con los enlaces oficiales correspondientes.",
                            de: isK2 ? "b) Auf Videoseiten mit Memes" : "b) Die Informationen in mindestens zwei unabhängigen und zuverlässigen Quellen abgleichen und einen Abschnitt mit den entsprechenden offiziellen Links hinzufügen.",
                            en: isK2 ? "b) On video sites with memes" : "b) Cross-reference the information in at least two independent and reliable sources, and add a section with the corresponding official links.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) En bibliotecas virtuales y portales educativos recomendados" : "c) Evitar citar o listar las fuentes para que el documento se vea más corto y limpio.",
                            de: isK2 ? "c) In virtuellen Bibliotheken und empfohlenen Bildungsportalen" : "c) Auf Zitate oder Quellenangaben verzichten, damit das Dokument kürzer und sauberer aussieht.",
                            en: isK2 ? "c) In virtual libraries and recommended educational portals" : "c) Avoid citing or listing sources so the document looks shorter and cleaner.",
                            correct: isK2
                        }
                    ],
                    hint: {
                        es: "La validación y el cotejo de datos (contraste de fuentes) es una norma fundamental del rigor académico escolar. Citar fuentes formales demuestra honestidad en tu trabajo de clase, ya sea que uses Office 365, Canva o programas de programación.",
                        de: "Die Validierung und der Vergleich von Daten (Quellenvergleich) ist eine grundlegende Regel wissenschaftlicher Arbeit in der Schule. Das Zitieren formeller Quellen zeugt von Ehrlichkeit bei deiner Arbeit, egal ob du Office 365, Canva oder Programmier-Tools nutzt.",
                        en: "Data validation and comparison (source cross-referencing) is a fundamental rule of school academic rigor. Citing formal sources demonstrates honesty in your classwork, whether you use Office 365, Canva, or coding platforms."
                    }
                };
            }
            break;

        case 2: // Kommunizieren & Kooperieren (Comunicación y Cooperación)
            if (qNum === 1) {
                return {
                    label: {
                        es: isK2
                            ? `📡 Si vas a enviarle una pregunta a tu profesor de ${nameS.es}, ¿qué debes usar? 📧`
                            : `Al enviar un correo o mensaje institucional a tu profesor sobre tu tarea de ${nameS.es} (Dificultad +${diff}), ¿cuál es el tono y estructura adecuada de comunicación?`,
                        de: isK2
                            ? `📡 Wenn du deinem ${nameS.de}-Lehrer eine Frage schicken möchtest, was solltest du benutzen? 📧`
                            : `Welcher Tonfall und welche Struktur sind angemessen, wenn du eine offizielle E-Mail oder Nachricht an deinen Lehrer bezüglich deiner ${nameS.de}-Aufgabe schreibst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `📡 If you want to send a question to your ${nameS.en} teacher, what should you use? 📧`
                            : `When sending an institutional email or message to your teacher about your ${nameS.en} homework (Difficulty +${diff}), what is the appropriate tone and structure?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Un chat informal lleno de emojis" : "a) Un tono informal, sin saludo claro, escribiendo con abreviaturas o jerga como si fuera un chat privado con amigos.",
                            de: isK2 ? "a) Einen informellen Chat voller Emojis" : "a) Ein informeller Ton ohne klare Anrede, mit Abkürzungen oder Umgangssprache wie in einem privaten Chat mit Freunden.",
                            en: isK2 ? "a) An informal chat full of emojis" : "a) An informal tone, without a clear greeting, writing with abbreviations or slang as if it were a private chat with friends.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Un correo electrónico formal respetando las reglas de saludo" : "b) Un tono respetuoso y formal, incluyendo un asunto claro, saludo estructurado con el nombre del profesor, tu grado, la duda bien descrita y despedida.",
                            de: isK2 ? "b) Eine formelle E-Mail mit korrekter Anrede" : "b) Ein respektvoller und formeller Ton mit klarem Betreff, einer strukturierten Anrede mit dem Namen des Lehrers, deiner Klasse, der präzise beschriebenen Frage und einem Gruß am Ende.",
                            en: isK2 ? "b) A formal email respecting greeting rules" : "b) A respectful and formal tone, including a clear subject line, a structured greeting with the teacher's name, your grade, the question clearly described, and a closing.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Gritar a través del micrófono en una reunión sin pedir permiso" : "c) Adjuntar únicamente un meme o imagen graciosa que represente tu duda sin escribir texto explicativo.",
                            de: isK2 ? "c) In einer Besprechung ungefragt ins Mikrofon rufen" : "c) Nur ein Meme oder ein lustiges Bild anhängen, das deine Frage darstellt, ohne einen erklärenden Text zu schreiben.",
                            en: isK2 ? "c) Yell into the microphone in a meeting without permission" : "c) Attach only a meme or funny image representing your question without writing any explanatory text.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La Netiqueta escolar exige comunicarse con respeto en todas las plataformas institucionales (como Teams o el correo). Un correo bien estructurado facilita que tu maestro te entienda y te ayude de forma eficiente.",
                        de: "Die Netiquette an der Schule verlangt eine respektvolle Kommunikation auf allen offiziellen Plattformen (wie Teams oder E-Mail). Eine gut strukturierte E-Mail erleichtert es deinem Lehrer, deine Frage zu verstehen und dir effizient zu helfen.",
                        en: "School Netiquette requires communicating with respect on all institutional platforms (like Teams or email). A well-structured email makes it easier for your teacher to understand your question and help you efficiently."
                    }
                };
            }
            if (qNum === 2) {
                return {
                    label: {
                        es: isK2
                            ? `📡 Para compartir un archivo de ${nameS.es} con un compañero en clase, ¿qué es mejor? 🤝`
                            : `Para compartir una carpeta o archivo colaborativo para ${nameS.es} en la nube (Dificultad +${diff}), ¿cómo debes configurar los permisos de acceso?`,
                        de: isK2
                            ? `📡 Wie teilst du eine ${nameS.de}-Datei am besten mit einem Mitschüler? 🤝`
                            : `Wie solltest du die Zugriffsberechtigungen einrichten (Schwierigkeit +${diff}), wenn du einen gemeinsamen Ordner oder eine Datei für ${nameS.de} in der Cloud teilst?`,
                        en: isK2
                            ? `📡 To share an ${nameS.en} file with a classmate, what is best? 🤝`
                            : `To share a collaborative folder or file for ${nameS.en} in the cloud (Difficulty +${diff}), how should you configure the access permissions?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Escribirlo en un papel y tirárselo" : "a) Permitir el acceso público de edición a cualquier persona en internet de forma abierta sin contraseñas.",
                            de: isK2 ? "a) Auf ein Papier schreiben und rüberwerfen" : "a) Jedem im Internet den öffentlichen Bearbeitungszugriff ohne Einschränkungen oder Passwörter erlauben.",
                            en: isK2 ? "a) Write it on paper and throw it" : "a) Allow open public editing access to anyone on the internet without passwords.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Compartir un enlace privado desde OneDrive con permiso de visualización o edición" : "b) Configurar el enlace restringido a los correos electrónicos institucionales de tu equipo escolar, decidiendo si solo pueden ver o editar.",
                            de: isK2 ? "b) Einen privaten OneDrive-Link mit Lese- oder Schreibberechtigung teilen" : "b) Den Link so einrichten, dass der Zugriff auf die offiziellen E-Mail-Adressen deines Schulteams beschränkt ist, und festlegen, ob sie nur lesen oder auch bearbeiten dürfen.",
                            en: isK2 ? "b) Share a private OneDrive link with viewing or editing permission" : "b) Configure the link restricted to the institutional email addresses of your school team, deciding if they can only view or also edit.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Cambiar la contraseña del computador escolar" : "c) Mantener el archivo completamente oculto y enviar capturas de pantalla de tu avance por chat privado.",
                            de: isK2 ? "c) Das Passwort des Schulcomputers ändern" : "c) Die Datei komplett geheim halten und Screenshots deines Fortschritts über einen privaten Chat senden.",
                            en: isK2 ? "c) Change the password of the school computer" : "c) Keep the file completely hidden and send screenshots of your progress via private chat.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Al trabajar en equipo en Office 365, Canva o Minecraft, debes cuidar la seguridad de tus datos. Dar accesos restringidos y específicos evita que personas ajenas alteren o eliminen tu trabajo académico.",
                        de: "Bei der Teamarbeit in Office 365, Canva oder Minecraft musst du auf die Sicherheit deiner Daten achten. Eingeschränkte und gezielte Freigaben verhindern, dass unbefugte Personen deine Arbeit ändern oder löschen.",
                        en: "When working in teams in Office 365, Canva, or Minecraft, you must care for your data security. Providing restricted and specific access prevents unauthorized people from altering or deleting your academic work."
                    }
                };
            }
            if (qNum === 3) {
                return {
                    label: {
                        es: isK2
                            ? `📡 Si alguien escribe en el foro de ${nameS.es} en mayúsculas sostenidas, ¿qué significa? 🗣️`
                            : `Al participar en los canales digitales y chats de colaboración escolar para ${nameS.es} (Dificultad +${diff}), ¿por qué es importante evitar el uso de mayúsculas sostenidas?`,
                        de: isK2
                            ? `📡 Wenn jemand im ${nameS.de}-Forum nur in Großbuchstaben schreibt, was bedeutet das? 🗣️`
                            : `Warum ist es wichtig, beim Schreiben in digitalen Kanälen und Schul-Chats für ${nameS.de} durchgehende Großbuchstaben zu vermeiden (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `📡 If someone writes in the ${nameS.en} forum in all capital letters, what does it mean? 🗣️`
                            : `When participating in digital channels and school collaboration chats for ${nameS.en} (Difficulty +${diff}), why is it important to avoid using all capital letters?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Que está gritando y es mala educación" : "a) Porque escribir en mayúsculas sostenidas se interpreta en el entorno digital como gritar o hablar de manera agresiva, lo cual rompe el respeto.",
                            de: isK2 ? "a) Dass er schreit und unhöflich ist" : "a) Weil das Schreiben in reinen Großbuchstaben im Internet als Schreien oder aggressiver Ton interpretiert wird, was den respektvollen Umgang stört.",
                            en: isK2 ? "a) That they are shouting and it is impolite" : "a) Because writing in all capital letters is interpreted in the digital environment as shouting or speaking aggressively, which breaks respectful tone.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Que su teclado está dañado y es divertido" : "b) Porque ralentiza la velocidad de procesamiento del servidor del colegio y puede saturar la red.",
                            de: isK2 ? "b) Dass seine Tastatur kaputt ist und es lustig ist" : "b) Weil es die Verarbeitungsgeschwindigkeit des Schulservers verlangsamt und das Netzwerk überlasten kann.",
                            en: isK2 ? "b) That their keyboard is broken and it is funny" : "b) Because it slows down the processing speed of the school server and can saturate the network.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) Que escribe más rápido" : "c) No hay ninguna razón formal, es una regla opcional que solo aplica si el profesor la califica directamente.",
                            de: isK2 ? "c) Dass er schneller schreibt" : "c) Es gibt keinen sachlichen Grund, es ist eine optionale Regel, die nur gilt, wenn der Lehrer sie direkt benotet.",
                            en: isK2 ? "c) That they write faster" : "c) There is no formal reason, it is an optional rule that only applies if the teacher grades it directly.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La Netiqueta es el conjunto de reglas de comportamiento en internet. Conocer convenciones como evitar las mayúsculas continuas previene malentendidos y mantiene un ambiente escolar amigable y profesional en tus clases digitales.",
                        de: "Die Netiquette umfasst die Verhaltensregeln im Internet. Das Vermeiden von dauerhafter Großschreibung beugt Missverständnissen vor und sorgt für ein freundliches und professionelles Schulklima in deinen Online-Klassen.",
                        en: "Netiquette is the set of behavior rules on the internet. Knowing conventions like avoiding continuous uppercase letters prevents misunderstandings and maintains a friendly and professional school environment in your digital classes."
                    }
                };
            }
            if (qNum === 4) {
                return {
                    label: {
                        es: isK2
                            ? `📡 En un documento grupal de ${nameS.es}, ¿cómo trabajamos juntos en línea? 💻`
                            : `Al coeditar en tiempo real un documento digital para tu equipo escolar (Dificultad +${diff}), ¿cuál es la mejor manera de coordinar las aportaciones de todos en la herramienta compartida?`,
                        de: isK2
                            ? `📡 Wie arbeiten wir in einem Gruppendokument für ${nameS.de} online zusammen? 💻`
                            : `Wie lassen sich die Beiträge aller Teammitglieder in einem gemeinsamen digitalen Dokument am besten koordinieren, wenn ihr in Echtzeit zusammenarbeitet (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `📡 In a group document for ${nameS.en}, how do we work online together? 💻`
                            : `When co-editing a digital document in real-time for your school team (Difficulty +${diff}), what is the best way to coordinate everyone's contributions in the shared tool?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Borrar todo lo que el compañero escribe" : "a) Distribuir previamente las secciones a redactar, usar la función de comentarios integrados e interactuar con respeto en los canales de chat del equipo.",
                            de: isK2 ? "a) Alles löschen, was der Mitschüler schreibt" : "a) Die zu bearbeitenden Abschnitte vorab aufteilen, die Kommentarfunktion nutzen und sich in den Chatkanälen des Teams respektvoll austauschen.",
                            en: isK2 ? "a) Delete everything the classmate writes" : "a) Pre-distribute the sections to be drafted, use the built-in comments feature, and interact respectfully in the team's chat channels.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Escribir todos al mismo tiempo en el mismo renglón" : "b) Permitir que un solo estudiante realice todo el trabajo mientras los demás observan pasivamente en la pantalla compartida.",
                            de: isK2 ? "b) Alle gleichzeitig in derselben Zeile schreiben" : "b) Einem einzigen Schüler die gesamte Arbeit überlassen, während die anderen auf dem geteilten Bildschirm nur passiv zuschauen.",
                            en: isK2 ? "b) Write all at the same time on the same line" : "b) Allow only one student to do all the work while the others watch passively on the shared screen.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) Usar un chat de voz para hablar de temas de videojuegos" : "c) Sobreescribir las contribuciones de tus compañeros sin avisarles para acelerar la entrega de la tarea grupal.",
                            de: isK2 ? "c) Einen Sprachchat nutzen, um über Videospiele zu sprechen" : "c) Die Beiträge deiner Mitschüler ohne Rücksprache überschreiben, um die Abgabe der Gruppenarbeit zu beschleunigen.",
                            en: isK2 ? "c) Use a voice chat to talk about video games" : "c) Overwrite your classmates' contributions without letting them know to speed up the submission of the group assignment.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las suites de coedición modernas (Office 365, Canva o plataformas de código) permiten ver quién está editando cada parte. Trabajar de forma coordinada y dialogar por comentarios evita conflictos y duplicación de esfuerzos.",
                        de: "Moderne Co-Working-Tools (Office 365, Canva oder Programmierplattformen) zeigen an, wer gerade welchen Teil bearbeitet. Eine koordinierte Arbeitsaufteilung und der Austausch über Kommentare verhindern Konflikte und Doppelarbeit.",
                        en: "Modern co-editing suites (Office 365, Canva, or coding platforms) allow seeing who is editing each part. Working coordinately and communicating via comments prevents conflicts and duplication of efforts."
                    }
                };
            }
            if (qNum === 5) {
                return {
                    label: {
                        es: isK2
                            ? `📡 Si alguien molesta a un compañero en el chat de la clase, ¿qué haces? 🛡️`
                            : `Si identificas comentarios agresivos o situaciones de acoso virtual (ciberbullying) en el chat de la escuela (Dificultad +${diff}), ¿cuál es el protocolo ético y escolar correcto?`,
                        de: isK2
                            ? `📡 Wenn jemand einen Mitschüler im Klassen-Chat ärgert, was tust du? 🛡️`
                            : `Welches ist das richtige ethische und schulische Vorgehen, wenn du aggressive Kommentare oder Cybermobbing im Schul-Chat bemerkst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `📡 If someone bothers a classmate in the class chat, what do you do? 🛡️`
                            : `If you identify aggressive comments or cyberbullying situations in the school chat (Difficulty +${diff}), what is the correct ethical and school protocol?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Reírse y compartir el mensaje" : "a) Mantenerse al margen e ignorar la situación para no tener malentendidos con tus compañeros de clase.",
                            de: isK2 ? "a) Lachen und die Nachricht weiterleiten" : "a) Sich heraushalten und die Situation ignorieren, um keinen Ärger mit deinen Mitschülern zu bekommen.",
                            en: isK2 ? "a) Laugh and share the message" : "a) Stay out of it and ignore the situation to avoid misunderstandings with your classmates.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Avisarle a un profesor o adulto de confianza inmediatamente" : "b) Registrar capturas de pantalla del incidente como evidencia física, evitar responder a la provocación y reportarlo inmediatamente con tus profesores o directivos.",
                            de: isK2 ? "b) Sofort einem Lehrer oder Erwachsenen Bescheid sagen" : "b) Screenshots des Vorfalls als Beweis sichern, nicht auf Provokationen reagieren und das Ganze sofort deinen Lehrern oder der Schulleitung melden.",
                            en: isK2 ? "b) Inform a teacher or trusted adult immediately" : "b) Record screenshots of the incident as evidence, avoid responding to the provocation, and report it immediately to your teachers or administrators.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Responder con más insultos" : "c) Responder con enojo e insultar al agresor públicamente en el chat escolar para defender al afectado.",
                            de: isK2 ? "c) Mit mehr Beleidigungen antworten" : "c) Wütend reagieren und den Angreifer öffentlich im Schul-Chat beleidigen, um den betroffenen Schüler zu verteidigen.",
                            en: isK2 ? "c) Respond with more insults" : "c) Respond with anger and insult the aggressor publicly in the school chat to defend the affected student.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "El ciberacoso es una conducta grave que daña el ambiente escolar. Guardar capturas de pantalla sin responder al agresor ayuda a los profesores a intervenir rápidamente de acuerdo con el manual de convivencia digital del colegio.",
                        de: "Cybermobbing ist ein ernstes Fehlverhalten, das das Schulklima belastet. Das Sichern von Screenshots ohne auf den Angreifer zu reagieren hilft den Lehrern, schnell gemäß den digitalen Schulregeln einzugreifen.",
                        en: "Cyberbullying is a serious behavior that damages the school climate. Saving screenshots without responding to the aggressor helps teachers intervene quickly according to the school's digital code of conduct."
                    }
                };
            }
            if (qNum === 6) {
                return {
                    label: {
                        es: isK2
                            ? `📡 ¿Quién debe ver los mensajes que envías en el grupo escolar de ${nameS.es}? 👥`
                            : `Al interactuar en foros de debate y espacios escolares de comunicación (Dificultad +${diff}), ¿cómo demuestras una conducta de ciudadanía digital constructiva y responsable?`,
                        de: isK2
                            ? `📡 Wer sollte die Nachrichten sehen, die du in der ${nameS.de}-Schulgruppe sendest? 👥`
                            : `Wie zeigst du bei der Interaktion in Diskussionsforen und schulischen Kommunikationsräumen ein konstruktives und verantwortungsvolles Verhalten im Netz (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `📡 Who should see the messages you send in the school ${nameS.en} group? 👥`
                            : `When interacting in debate forums and school communication spaces (Difficulty +${diff}), how do you demonstrate constructive and responsible digital citizenship?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Solo los miembros autorizados del grupo" : "a) Publicar comentarios de carácter ofensivo o burlesco bajo un perfil falso o anónimo para opinar libremente.",
                            de: isK2 ? "a) Nur die autorisierten Mitglieder der Gruppe" : "a) Beleidigende oder spöttische Kommentare unter einem falschen Namen oder anonym posten, um seine Meinung frei zu äußern.",
                            en: isK2 ? "a) Only authorized group members" : "a) Post offensive or mocking comments under a fake or anonymous profile to express opinions freely.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "b) Todo el internet de forma pública" : "b) Fundamentar tus comentarios en datos y hechos verificados, usar un lenguaje respetuoso, aportar ideas constructivas y firmar con tu nombre real.",
                            de: isK2 ? "b) Das gesamte Internet öffentlich" : "b) Deine Kommentare auf geprüfte Daten und Fakten stützen, eine respektvolle Sprache sprechen, konstruktive Ideen einbringen und mit deinem echten Namen unterschreiben.",
                            en: isK2 ? "b) The entire public internet" : "b) Base your comments on verified facts and data, use respectful language, contribute constructive ideas, and sign with your real name.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Nadie, los borro antes de enviarlos" : "c) Copiar textualmente las respuestas de otros estudiantes y publicarlas como si fueran aportaciones propias en el foro.",
                            de: isK2 ? "c) Niemand, ich lösche sie vor dem Absenden" : "c) Die Antworten anderer Mitschüler eins zu eins kopieren und als eigene Beiträge im Forum veröffentlichen.",
                            en: isK2 ? "c) Nobody, I delete them before sending" : "c) Copy other students' answers verbatim and publish them as your own contributions to the forum.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Ser un ciudadano digital responsable significa aportar positivamente a la comunidad escolar virtual. Usar tu cuenta oficial de alumno, opinar con respeto y respetar las ideas de tus compañeros fortalece el aprendizaje grupal.",
                        de: "Ein verantwortungsvoller Bürger im Netz zu sein bedeutet, einen positiven Beitrag zur virtuellen Schulgemeinschaft zu leisten. Die Nutzung deines offiziellen Kontos, respektvolle Meinungsäußerung und Wertschätzung der Beiträge anderer stärken das gemeinsame Lernen.",
                        en: "Being a responsible digital citizen means contributing positively to the virtual school community. Using your official student account, sharing opinions respectfully, and valuing your classmates' ideas strengthens group learning."
                    }
                };
            }
            break;

        case 3: // Produzieren & Präsentieren (Producción y Presentación)
            if (qNum === 1) {
                return {
                    label: {
                        es: isK2
                            ? `🎨 ¿Qué herramienta usas para escribir un cuento de ${nameS.es}? 📝`
                            : `Para organizar, ordenar alfabéticamente y generar estadísticas cuantitativas en un proyecto escolar (Dificultad +${diff}), ¿qué software es el más adecuado?`,
                        de: isK2
                            ? `🎨 Welches Tool benutzt du, um eine ${nameS.de}-Geschichte zu schreiben? 📝`
                            : `Welche Software ist am besten geeignet, um Daten in einem Schulprojekt zu organisieren, alphabetisch zu sortieren und quantitative Statistiken zu erstellen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🎨 Which tool do you use to write a story in ${nameS.en}? 📝`
                            : `To organize, sort alphabetically, and generate quantitative statistics in a school project (Difficulty +${diff}), which software is most appropriate?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Un editor de texto (Word)" : "a) Una hoja de cálculo (como Excel o Google Sheets) por sus funciones para ordenar filas, usar fórmulas y generar gráficos de barra.",
                            de: isK2 ? "a) Ein Textprogramm (Word)" : "a) Eine Tabellenkalkulation (wie Excel oder Google Sheets) wegen ihrer Funktionen zum Sortieren von Zeilen, zur Nutzung von Formeln und zur Erstellung von Balkendiagrammen.",
                            en: isK2 ? "a) A word processor (Word)" : "a) A spreadsheet (like Excel or Google Sheets) for its functions to sort rows, use formulas, and generate bar charts.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Una libreta rota" : "b) Un procesador de textos básico redactando todo el informe en párrafos largos sin formato estructurado.",
                            de: isK2 ? "b) Ein zerrissenes Heft" : "b) Eine einfache Textverarbeitung, bei der der gesamte Bericht in langen Absätzen ohne Struktur geschrieben wird.",
                            en: isK2 ? "b) A torn notebook" : "b) A basic word processor drafting the entire report in long paragraphs without structured formatting.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) El Paint para dibujar" : "c) Una aplicación de edición de imágenes uniendo capturas de pantalla de los datos escritos a mano.",
                            de: isK2 ? "c) Paint zum Zeichnen" : "c) Eine Bildbearbeitungs-App, bei der Screenshots von handschriftlich notierten Daten zusammengefügt werden.",
                            en: isK2 ? "c) Paint for drawing" : "c) An image editing app joining screenshots of handwritten data.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las hojas de cálculo son herramientas ideales para procesar datos de forma automatizada. Permiten realizar cálculos rápidos de promedios, ordenar listas de la A a la Z y representar números visualmente a través de gráficos informativos.",
                        de: "Tabellenkalkulationen sind die idealen Werkzeuge, um Daten automatisiert zu verarbeiten. Sie ermöglichen schnelle Berechnungen von Durchschnittswerten, das Sortieren von Listen von A bis Z und die visuelle Darstellung von Zahlen durch informative Diagramme.",
                        en: "Spreadsheets are ideal tools for automated data processing. They allow quick calculations of averages, sorting lists from A to Z, and representing numbers visually through informative charts."
                    }
                };
            }
            if (qNum === 2) {
                return {
                    label: {
                        es: isK2
                            ? `🎨 ¿Cómo debe ser el texto en una lámina de presentación de ${nameS.es}? 🖼️`
                            : `Al diseñar una presentación digital (en PowerPoint o Canva) para exponer tus evidencias de ${nameS.es} (Dificultad +${diff}), ¿qué pauta visual de diseño garantiza claridad y legibilidad?`,
                        de: isK2
                            ? `🎨 Wie sollte der Text auf einer Präsentationsfolie für ${nameS.de} sein? 🖼️`
                            : `Welche Gestaltungsregel sorgt für Klarheit und gute Lesbarkeit, wenn du eine digitale Präsentation (in PowerPoint oder Canva) erstellst, um deine Ergebnisse für ${nameS.de} vorzustellen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🎨 How should the text look on a presentation slide for ${nameS.en}? 🖼️`
                            : `When designing a digital presentation (in PowerPoint or Canva) to showcase your ${nameS.en} work (Difficulty +${diff}), which visual design guidelines guarantee clarity and readability?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Llenar toda la hoja de letras chiquitas" : "a) Poner bloques densos y extensos de texto en fuente pequeña para que quepa toda la información en una sola lámina.",
                            de: isK2 ? "a) Die ganze Folie mit kleiner Schrift füllen" : "a) Dichte und lange Textblöcke in kleiner Schriftart einfügen, damit alle Informationen auf eine einzige Folie passen.",
                            en: isK2 ? "a) Filling the slide with tiny letters" : "a) Place dense and long blocks of text in a small font so all the information fits on a single slide.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Escribir las ideas principales con letras grandes y claras" : "b) Usar viñetas breves con ideas clave (regla de máximo 6x6), fuentes legibles y colores con alto contraste frente al fondo de la lámina.",
                            de: isK2 ? "b) Die Hauptideen in großer, klarer Schrift schreiben" : "b) Kurze Stichpunkte mit Kernideen verwenden (Maximal 6x6-Regel), gut lesbare Schriftarten wählen und Farben mit hohem Kontrast zum Hintergrund nutzen.",
                            en: isK2 ? "b) Writing main ideas in big, clear letters" : "b) Use brief bullet points with key ideas (max 6x6 rule), legible fonts, and high-contrast colors against the slide background.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Poner letras amarillas sobre un fondo blanco" : "c) Emplear múltiples fuentes decorativas diferentes y colores fluorescentes llamativos en cada renglón.",
                            de: isK2 ? "c) Gelbe Schrift auf weißem Hintergrund verwenden" : "c) Mehrere verschiedene Zierschriften und auffällige Neonfarben in jeder Zeile verwenden.",
                            en: isK2 ? "c) Placing yellow letters on a white background" : "c) Use multiple different decorative fonts and flashy neon colors on every line.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Una presentación digital de alto impacto visual debe ser equilibrada. La regla del 6x6 (máximo 6 líneas con 6 palabras cada una por diapositiva) evita sobrecargar de texto y ayuda a que tus compañeros e instructores se enfoquen en los puntos más importantes.",
                        de: "Eine Präsentation mit starker visueller Wirkung sollte ausgewogen sein. Die 6x6-Regel (maximal 6 Zeilen mit je 6 Wörtern pro Folie) verhindert eine Textüberladung und hilft deinen Mitschülern und Lehrern, sich auf die wichtigsten Punkte zu konzentrieren.",
                        en: "A presentation with high visual impact must be balanced. The 6x6 rule (maximum 6 lines with 6 words each per slide) avoids text overload and helps your classmates and teachers focus on the most important points."
                    }
                };
            }
            if (qNum === 3) {
                return {
                    label: {
                        es: isK2
                            ? `🎨 Si quieres usar un dibujo de internet para tu trabajo de ${nameS.es}, ¿qué debes hacer? 💻`
                            : `Al integrar imágenes o recursos multimedia en tus presentaciones y proyectos digitales (Dificultad +${diff}), ¿cómo garantizas el cumplimiento de los derechos de autor (copyright)?`,
                        de: isK2
                            ? `🎨 Wenn du ein Bild aus dem Internet für deine ${nameS.de}-Arbeit nutzen willst, was musst du tun? 💻`
                            : `Wie stellst du die Einhaltung des Urheberrechts sicher, wenn du Bilder oder Medien in deine Präsentationen und digitalen Projekte integrierst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🎨 If you want to use an internet picture for your ${nameS.en} work, what must you do? 💻`
                            : `When integrating images or media resources into your digital presentations and projects (Difficulty +${diff}), how do you guarantee compliance with copyright laws?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Copiarla y decir que tú la dibujaste" : "a) Copiar y pegar cualquier imagen que encuentres en buscadores comerciales sin revisar su origen ni sus términos de uso.",
                            de: isK2 ? "a) Es kopieren und behaupten, du hättest es gezeichnet" : "a) Jedes beliebige Bild aus kommerziellen Suchmaschinen kopieren und einfügen, ohne dessen Herkunft oder Nutzungsbedingungen zu prüfen.",
                            en: isK2 ? "a) Copy it and say you drew it" : "a) Copy and paste any image found on commercial search engines without checking its origin or terms of use.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Buscar imágenes libres de autor (Creative Commons) y poner el nombre del creador" : "b) Usar recursos con licencias Creative Commons (CC) o de dominio público, e incluir el crédito correspondiente (atribución) del autor en tu sección de fuentes.",
                            de: isK2 ? "b) Nach urheberrechtsfreien Bildern (Creative Commons) suchen und den Namen des Urhebers nennen" : "b) Ressourcen mit Creative-Commons-Lizenzen (CC) oder gemeinfreie Medien nutzen und die entsprechende Quellenangabe (Attribution) im Literaturverzeichnis aufführen.",
                            en: isK2 ? "b) Search for free images (Creative Commons) and state the creator's name" : "b) Use resources with Creative Commons (CC) licenses or public domain, and include the proper credit (attribution) of the author in your sources section.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Usar fotos de tu familia sin permiso" : "c) Modificar los colores de la imagen digital para asumir que la obra es tuya.",
                            de: isK2 ? "c) Fotos deiner Familie ohne Erlaubnis verwenden" : "c) Die Farben des Bildes verändern, um so zu tun, als wäre es dein eigenes Werk.",
                            en: isK2 ? "c) Use family photos without permission" : "c) Modify the colors of the image to claim the work as your own.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las obras creadas en internet pertenecen a sus autores. El uso respetuoso de la red implica buscar imágenes de bancos libres de derechos de autor o bajo licencias Creative Commons (CC) y darles crédito para actuar con honestidad intelectual.",
                        de: "Im Internet erstellte Werke gehören ihren Autoren. Die respektvolle Nutzung des Netzes bedeutet, nach Bildern aus lizenzfreien Bilddatenbanken oder unter Creative-Commons-Lizenzen (CC) zu suchen und den Urhebern die Ehre zu erweisen.",
                        en: "Works created online belong to their authors. Respectful use of the web implies searching for images from copyright-free image banks or under Creative Commons (CC) licenses and giving them credit to act with intellectual honesty."
                    }
                };
            }
            if (qNum === 4) {
                return {
                    label: {
                        es: isK2
                            ? `🎨 Si quieres grabar tu voz explicando un poema en ${nameS.es}, ¿qué necesitas? 🎙️`
                            : `Para grabar y editar un archivo de audio o video explicativo para tu clase de ${nameS.es} (Dificultad +${diff}), ¿cuál es el proceso técnico correcto?`,
                        de: isK2
                            ? `🎨 Wenn du deine Stimme aufnehmen willst, um ein ${nameS.de}-Gedicht zu erklären, was brauchst du? 🎙️`
                            : `Welches ist der richtige technische Ablauf, um eine Audio- oder Videodatei als Erklärung für deine Klasse in ${nameS.de} aufzunehmen und zu bearbeiten (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🎨 If you want to record your voice explaining a poem in ${nameS.en}, what do you need? 🎙️`
                            : `To record and edit an explanatory audio or video file for your ${nameS.en} class (Difficulty +${diff}), what is the correct technical process?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Un micrófono y una aplicación de grabación de voz" : "a) Elaborar un guion de soporte, grabar en una habitación con bajo eco y usar un editor de audio/video para recortar silencios y ajustar el volumen del sonido.",
                            de: isK2 ? "a) Ein Mikrofon und eine Sprachaufnahme-App" : "a) Ein Skript als Unterstützung schreiben, in einem Raum mit wenig Hall aufnehmen und ein Audio-/Videobearbeitungsprogramm nutzen, um Pausen zu schneiden und die Lautstärke anzupassen.",
                            en: isK2 ? "a) A microphone and a voice recorder app" : "a) Write a supporting script, record in a room with low echo, and use an audio/video editor to trim silences and adjust the sound volume.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Un parlante muy ruidoso" : "b) Grabar de forma espontánea sin guion en el patio escolar durante el recreo, y guardar la pista en bruto sin revisar.",
                            de: isK2 ? "b) Einen sehr lauten Lautsprecher" : "b) Spontan ohne Skript auf dem Schulhof während der Pause aufnehmen und die Rohdatei ungeschnitten speichern.",
                            en: isK2 ? "b) A very loud speaker" : "b) Record spontaneously without a script on the school playground during recess, and save the raw track without reviewing it.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) El control del televisor" : "c) Grabar el sonido directo de tu computadora acercando el celular al parlante mientras reproduces música a volumen alto.",
                            de: isK2 ? "c) Die Fernbedienung des Fernsehers" : "c) Den Sound direkt vom Computer aufnehmen, indem du das Handy an den Lautsprecher hältst, während laute Musik läuft.",
                            en: isK2 ? "c) The TV remote control" : "c) Record the sound directly from your computer by putting your phone close to the speaker while playing loud music.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La producción de materiales de audio y video escolares (como podcasts literarios o presentaciones) requiere planificación. Escribir un guion estructurado y aplicar ediciones de volumen garantiza que tus oyentes comprendan tu mensaje sin ruido molesto de fondo.",
                        de: "Die Erstellung von schulischen Audio- und Videomaterialien (wie Literatur-Podcasts oder Präsentationen) erfordert Planung. Das Schreiben eines Skripts und das Anpassen der Lautstärke stellen sicher, dass deine Zuhörer deine Botschaft gut verstehen.",
                        en: "Producing school audio and video materials (like literary podcasts or presentations) requires planning. Writing a structured script and applying volume edits guarantees that your listeners understand your message without annoying background noise."
                    }
                };
            }
            if (qNum === 5) {
                return {
                    label: {
                        es: isK2
                            ? `🎨 ¿Dónde debes escribir los nombres de los libros que usaste para tu tarea de ${nameS.es}? 📚`
                            : `Al elaborar un reporte o producto de aprendizaje académico (Dificultad +${diff}), ¿por qué es indispensable citar las ideas ajenas e incorporar una lista de fuentes?`,
                        de: isK2
                            ? `🎨 Wo solltest du die Namen der Bücher aufschreiben, die du für deine ${nameS.de}-Aufgabe genutzt hast? 📚`
                            : `Warum ist es beim Erstellen eines Berichts oder Lernprodukts unerlässlich, fremde Ideen zu zitieren und ein Quellenverzeichnis anzufügen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🎨 Where should you write the names of the books you used for your ${nameS.en} homework? 📚`
                            : `When preparing an academic report or learning product (Difficulty +${diff}), why is it indispensable to cite others' ideas and incorporate a list of sources?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) En la portada" : "a) Para evitar incurrir en plagio académico (hacer pasar ideas ajenas como propias) y otorgar validez investigativa a tu presentación.",
                            de: isK2 ? "a) Auf dem Deckblatt" : "a) Um Plagiate zu vermeiden (fremde Ideen als eigene ausgeben) und deiner Präsentation wissenschaftliche Aussagekraft zu verleihen.",
                            en: isK2 ? "a) On the cover page" : "a) To avoid academic plagiarism (passing off others' ideas as your own) and grant research validity to your presentation.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Al final de la hoja de trabajo en una sección de Referencias" : "b) Exclusivamente para ampliar el número de páginas de tu reporte impreso y cumplir un criterio visual del maestro.",
                            de: isK2 ? "b) Am Ende des Arbeitsblatts in einem Abschnitt 'Referenzen'" : "b) Ausschließlich, um die Seitenzahl deines ausgedruckten Berichts zu erhöhen und eine visuelle Vorgabe des Lehrers zu erfüllen.",
                            en: isK2 ? "b) At the end of the worksheet in a References section" : "b) Exclusively to increase the page count of your printed report and satisfy a visual criteria of the teacher.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "c) En ninguna parte, no es necesario" : "c) Para que el buscador web recomiende tu trabajo a otros alumnos de manera automática.",
                            de: isK2 ? "c) Nirgends, das ist nicht nötig" : "c) Damit die Suchmaschine deine Arbeit anderen Schülern automatisch vorschlägt.",
                            en: isK2 ? "c) Nowhere, it is not necessary" : "c) So the web search engine recommends your work to other students automatically.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Copiar textos directamente de internet sin citar al autor original se considera plagio (deshonestidad escolar). Dar crédito a los libros, páginas o videos de donde obtuviste tus datos es una muestra de honestidad y formalidad en tu formación.",
                        de: "Texte ohne Angabe des Originalautors aus dem Internet zu kopieren gilt als Plagiat (schulischer Betrug). Den Büchern, Seiten oder Videos, aus denen du deine Daten hast, Credits zu geben, zeugt von Ehrlichkeit und Gründlichkeit.",
                        en: "Copying texts directly from the internet without citing the original author is considered plagiarism (academic dishonesty). Giving credit to the books, pages, or videos where you got your data demonstrates honesty and formality in your education."
                    }
                };
            }
            if (qNum === 6) {
                return {
                    label: {
                        es: isK2
                            ? `🎨 ¿En qué formato es mejor guardar tu trabajo terminado de ${nameS.es} para que no se desconfigure? 📄`
                            : `Al entregar la versión final de tus trabajos al profesor a través de la plataforma (Dificultad +${diff}), ¿qué formato de exportación es el óptimo para evitar desconfiguraciones visuales?`,
                        de: isK2
                            ? `🎨 In welchem Format speicherst du deine fertige ${nameS.de}-Arbeit am besten, damit sich nichts verschiebt? 📄`
                            : `Welches Exportformat ist optimal, um Formatierungsfehler zu vermeiden, wenn du die endgültige Version deiner Arbeiten über die Plattform abgibst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🎨 In what format is it best to save your finished ${nameS.en} work so it layout does not break? 📄`
                            : `When submitting the final version of your assignments to the teacher via the platform (Difficulty +${diff}), which export format is optimal to avoid layout changes?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Formato de edición Word (.docx)" : "a) Guardar como documento editable (.docx o .pptx) para que cualquier persona que lo abra pueda mover las cajas de texto y el formato.",
                            de: isK2 ? "a) Editierbares Word-Format (.docx)" : "a) Als bearbeitbares Dokument (.docx oder .pptx) speichern, damit jeder, der es öffnet, Textfelder und Formatierungen verschieben kann.",
                            en: isK2 ? "a) Editable Word format (.docx)" : "a) Save as an editable document (.docx or .pptx) so anyone opening it can move text boxes and formatting.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Formato PDF (.pdf)" : "b) Exportar como archivo PDF (.pdf) para congelar el diseño, las imágenes y fuentes, garantizando que el maestro lo visualice idéntico en su pantalla.",
                            de: isK2 ? "b) PDF-Format (.pdf)" : "b) Als PDF-Datei (.pdf) exportieren, um das Layout, die Bilder und Schriftarten zu fixieren, damit der Lehrer es auf seinem Bildschirm genauso sieht.",
                            en: isK2 ? "b) PDF format (.pdf)" : "b) Export as a PDF file (.pdf) to freeze the layout, images, and fonts, ensuring the teacher views it identically on their screen.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Formato de imagen comprimida (.gif)" : "c) Guardarlo en un block de notas de texto plano (.txt) eliminando todas las tipografías y las imágenes agregadas.",
                            de: isK2 ? "c) Komprimiertes Bildformat (.gif)" : "c) In einer einfachen Textdatei (.txt) speichern, wobei alle Schriftarten und hinzugefügten Bilder gelöscht werden.",
                            en: isK2 ? "c) Compressed image format (.gif)" : "c) Save it in a plain text file (.txt) deleting all fonts and added images.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "El formato PDF (Portable Document Format) es un estándar global de entrega. Evita que las letras se muevan, que las fuentes cambien o que las imágenes se desacomoden cuando tu maestro abre tu tarea en un computador o tablet diferente.",
                        de: "Das PDF-Format (Portable Document Format) ist ein globaler Standard für Abgaben. Es verhindert, dass sich Texte verschieben, Schriftarten ändern oder Bilder verrutschen, wenn dein Lehrer deine Arbeit auf einem anderen Computer öffnet.",
                        en: "PDF format (Portable Document Format) is a global standard for submissions. It prevents text shifting, font changes, or images from getting misplaced when your teacher opens your assignment on a different computer or tablet."
                    }
                };
            }
            break;

        case 4: // Schützen & Sicher Agieren (Protección y Seguridad)
            if (qNum === 1) {
                return {
                    label: {
                        es: isK2
                            ? `🛡️ ¿Cuál es una contraseña fuerte y segura para proteger tu cuenta de ${nameS.es}? 🔑`
                            : `Para proteger tus cuentas escolares y evitar que otros accedan a tus tareas (Dificultad +${diff}), ¿qué método de seguridad es el más recomendado?`,
                        de: isK2
                            ? `🛡️ Was ist ein starkes und sicheres Passwort, um dein ${nameS.de}-Konto zu schützen? 🔑`
                            : `Welche Sicherheitsmethode ist am empfehlenswertesten, um deine Schul-Accounts zu schützen und zu verhindern, dass andere auf deine Hausaufgaben zugreifen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🛡️ What is a strong and secure password to protect your ${nameS.en} account? 🔑`
                            : `To protect your school accounts and prevent others from accessing your assignments (Difficulty +${diff}), which security method is most recommended?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) '123456'" : "a) Crear contraseñas muy sencillas y predecibles (como tu fecha de nacimiento o tu mascota) para memorizarlas fácilmente y no perder el acceso.",
                            de: isK2 ? "a) '123456'" : "a) Sehr einfache und vorhersehbare Passwörter (wie dein Geburtsdatum oder dein Haustier) erstellen, um sie sich leicht zu merken.",
                            en: isK2 ? "a) '123456'" : "a) Create very simple and predictable passwords (like your birthdate or pet's name) to easily memorize them.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Tu nombre de mascota" : "b) Diseñar una contraseña alfanumérica robusta (combinando mayúsculas, minúsculas, números y símbolos) y no compartirla con nadie.",
                            de: isK2 ? "b) Der Name deines Haustiers" : "b) Ein robustes alphanumerisches Passwort erstellen (Kombination aus Groß- und Kleinbuchstaben, Zahlen und Symbolen) und es mit niemandem teilen.",
                            en: isK2 ? "b) Your pet's name" : "b) Design a robust alphanumeric password (combining uppercase, lowercase, numbers, and symbols) and do not share it with anyone.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Una combinación secreta de letras, números y símbolos (ej: Myp@ss!98)" : "c) Dejar anotada tu contraseña en la parte exterior de tu tablet o en tu libreta escolar para recordar el acceso rápido.",
                            de: isK2 ? "c) Eine geheime Kombination aus Buchstaben, Zahlen und Symbolen (z. B. Myp@ss!98)" : "c) Dein Passwort außen auf dein Tablet oder in dein Schulheft schreiben, um dich schnell an den Zugang zu erinnern.",
                            en: isK2 ? "c) A secret combination of letters, numbers, and symbols (e.g., Myp@ss!98)" : "c) Leave your password written on the outside of your tablet or in your notebook to remember quick access.",
                            correct: isK2
                        }
                    ],
                    hint: {
                        es: "Una contraseña segura actúa como un escudo en tus herramientas educativas (como Teams, Canva o Minecraft). Mezclar letras, números y signos y no compartirla con compañeros protege tu privacidad y evita robos de identidad en la escuela.",
                        de: "Ein sicheres Passwort wirkt wie ein Schutzschild für deine Lernwerkzeuge (wie Teams, Canva oder Minecraft). Die Mischung aus Buchstaben, Zahlen und Zeichen schützt deine Privatsphäre und verhindert Identitätsdiebstahl.",
                        en: "A secure password acts as a shield on your educational tools (like Teams, Canva, or Minecraft). Mixing letters, numbers, and symbols and not sharing it with classmates protects your privacy and prevents identity theft at school."
                    }
                };
            }
            if (qNum === 2) {
                return {
                    label: {
                        es: isK2
                            ? `🛡️ Si te sale un anuncio que dice 'Ganaste un premio gratis, haz click aquí', ¿qué debes hacer? ⚠️`
                            : `Si mientras haces tu tarea de ${nameS.es} recibes un mensaje o ventana emergente sobre un premio o solicitando datos personales (Dificultad +${diff}), ¿cómo debes reaccionar?`,
                        de: isK2
                            ? `🛡️ Wenn du eine Anzeige siehst: 'Du hast einen Preis gewonnen, klicke hier', was tust du? ⚠️`
                            : `Wie solltest du reagieren, wenn du während deiner ${nameS.de}-Hausaufgaben eine Nachricht oder ein Pop-up-Fenster über einen Gewinn erhältst oder nach persönlichen Daten gefragt wirst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🛡️ If a popup says 'You won a free prize, click here', what should you do? ⚠️`
                            : `If while doing your ${nameS.en} homework you receive a message or pop-up window about a prize or requesting personal data (Difficulty +${diff}), how should you react?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Hacer click de inmediato para reclamar el regalo" : "a) Hacer clic rápidamente en el enlace promocional para verificar la veracidad del premio antes de que expire.",
                            de: isK2 ? "a) Sofort klicken, um das Geschenk einzufordern" : "a) Schnell auf den Werbelink klicken, um die Echtheit des Gewinns zu prüfen, bevor er abläuft.",
                            en: isK2 ? "a) Click immediately to claim the gift" : "a) Click quickly on the promotional link to check if the prize is real before it expires.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Cerrar la ventana y no abrir enlaces desconocidos" : "b) Cerrar la pestaña inmediatamente, desconfiar de ofertas urgentes y reportar el incidente a tu profesor o a tus padres.",
                            de: isK2 ? "b) Das Fenster schließen und keine unbekannten Links öffnen" : "b) Den Tab sofort schließen, bei dringenden Angeboten misstrauisch sein und den Vorfall deinem Lehrer oder deinen Eltern melden.",
                            en: isK2 ? "b) Close the window and do not open unknown links" : "b) Close the tab immediately, distrust urgent offers, and report the incident to your teacher or parents.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Escribir tu dirección y contraseña" : "c) Introducir únicamente el correo electrónico escolar para ver si el sitio envía un mensaje formal de confirmación.",
                            de: isK2 ? "c) Deine Adresse und dein Passwort eingeben" : "c) Nur die schulische E-Mail-Adresse eingeben, um zu sehen, ob die Seite eine Bestätigungsnachricht sendet.",
                            en: isK2 ? "c) Type your address and password" : "c) Enter only the school email address to see if the site sends a formal confirmation message.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las trampas en internet (como anuncios de premios falsos o correos engañosos) buscan capturar tus contraseñas y datos. Mantener la calma, no abrir enlaces extraños y avisar a un profesor es la mejor forma de cuidar los dispositivos de la escuela.",
                        de: "Betrugsversuche im Internet (wie gefälschte Gewinnspielanzeigen oder E-Mails) versuchen, deine Passwörter und Daten zu stehlen. Ruhe zu bewahren, keine fremden Links zu öffnen und einen Lehrer zu informieren ist der beste Schutz für Schulgeräte.",
                        en: "Internet traps (like fake prize ads or deceptive emails) seek to capture your passwords and data. Remaining calm, not opening strange links, and notifying a teacher is the best way to care for school devices."
                    }
                };
            }
            if (qNum === 3) {
                return {
                    label: {
                        es: isK2
                            ? `🛡️ ¿Qué datos tuyos NO debes escribir nunca en internet? 👤`
                            : `Al registrarte en una nueva aplicación educativa o juego de clase para ${nameS.es} (Dificultad +${diff}), ¿qué datos debes evitar publicar para cuidar tu seguridad?`,
                        de: isK2
                            ? `🛡️ Welche Daten darfst du niemals im Internet angeben? 👤`
                            : `Welche Daten solltest du bei der Registrierung für eine neue Lern-App oder ein Klassenspiel für das Fach ${nameS.de} nicht öffentlich angeben, um deine Sicherheit zu schützen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🛡️ What personal data must you never type online? 👤`
                            : `When registering on a new educational application or class game for ${nameS.en} (Difficulty +${diff}), what data should you avoid publishing to protect your security?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Tu nombre completo, dirección, teléfono y contraseñas" : "a) Tu dirección particular, número telefónico, contraseñas de tus cuentas o ubicación exacta.",
                            de: isK2 ? "a) Deinen vollen Namen, deine Adresse, Telefonnummer und Passwörter" : "a) Deine Privatadresse, Telefonnummer, Account-Passwörter oder deinen genauen Standort.",
                            en: isK2 ? "a) Your full name, address, phone number, and passwords" : "a) Your home address, phone number, account passwords, or exact location.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Tu color preferido" : "b) Un nombre de usuario (nickname) divertido que no contenga datos personales reales.",
                            de: isK2 ? "b) Deine Lieblingsfarbe" : "b) Einen lustigen Benutzernamen (Spitznamen), der keine echten persönlichen Daten enthält.",
                            en: isK2 ? "b) Your favorite color" : "b) A funny username (nickname) that doesn't contain real personal data.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) El nombre de tu materia escolar favorita" : "c) El idioma oficial en el que deseas tomar la actividad virtual.",
                            de: isK2 ? "c) Der Name deines Lieblingsfachs in der Schule" : "c) Die offizielle Sprache, in der du die virtuelle Aktivität durchführen möchtest.",
                            en: isK2 ? "c) The name of your favorite school subject" : "c) The official language in which you want to complete the virtual activity.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La protección de datos personales es vital. Las aplicaciones escolares deben configurarse usando nombres de usuario neutrales que no revelen información que permita a extraños identificarte o ubicarte físicamente.",
                        de: "Der Schutz persönlicher Daten ist lebenswichtig. Schul-Apps sollten mit neutralen Benutzernamen eingerichtet werden, die keine Informationen preisgeben, mit denen Fremde dich identifizieren oder finden könnten.",
                        en: "Protecting personal data is vital. School applications must be configured using neutral usernames that do not reveal information allowing strangers to identify or locate you physically."
                    }
                };
            }
            if (qNum === 4) {
                return {
                    label: {
                        es: isK2
                            ? `🛡️ Si subes una foto o dibujo a internet, ¿quién podrá verlo en el futuro? 🌐`
                            : `Con respecto a tu identidad escolar (Dificultad +${diff}), ¿qué implicación ética tiene que subas actividades o comentarios a las redes públicas de internet?`,
                        de: isK2
                            ? `🛡️ Wenn du ein Foto oder eine Zeichnung ins Internet stellst, wer kann sie in Zukunft sehen? 🌐`
                            : `Welche ethischen Auswirkungen hat es auf deine Identität in der Schule, wenn du Aktivitäten oder Kommentare im öffentlichen Internet veröffentlichst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🛡️ If you upload a photo or drawing online, who will be able to see it in the future? 🌐`
                            : `Regarding your school identity (Difficulty +${diff}), what ethical implication does uploading activities or comments to public internet networks have?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Nadie, se borra al apagar el computador" : "a) Pasa a formar parte permanente de tu huella digital, lo que significa que profesores, familiares o futuras escuelas podrán rastrearlo.",
                            de: isK2 ? "a) Niemand, es wird beim Ausschalten des Computers gelöscht" : "a) Es wird zu einem dauerhaften Teil deines digitalen Fußabdrucks, was bedeutet, dass Lehrer, Familienmitglieder oder zukünftige Schulen es zurückverfolgen können.",
                            en: isK2 ? "a) Nobody, it gets deleted when turning off the computer" : "a) It becomes a permanent part of your digital footprint, meaning teachers, family, or future schools will be able to trace it.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Cualquier persona en el mundo, y puede quedarse guardado para siempre" : "b) Ninguna implicación, ya que cualquier dato subido a internet se elimina completamente al borrar el archivo original del computador local.",
                            de: isK2 ? "b) Jeder Mensch auf der Welt, und es kann für immer gespeichert bleiben" : "b) Keine Auswirkungen, da alle ins Internet hochgeladenen Daten vollständig gelöscht werden, wenn die Originaldatei auf dem Computer gelöscht wird.",
                            en: isK2 ? "b) Anyone in the world, and it can stay saved forever" : "b) None, since any data uploaded online is completely deleted when the original file is removed from the local computer.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "c) Solo las personas que viven en tu misma calle" : "c) Te garantiza que la plataforma digital te pague regalías económicas por cada visualización de tu tarea escolar.",
                            de: isK2 ? "c) Nur Menschen, die in deiner Straße wohnen" : "c) Es garantiert, dass die digitale Plattform dir für jeden Aufruf deiner Hausaufgaben Geld bezahlt.",
                            en: isK2 ? "c) Only people living on your same street" : "c) It guarantees that the digital platform pays you economic royalties for every view of your school assignment.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La 'Huella Digital' es el rastro que dejamos en la red. Como los servidores guardan copias de la información, debes actuar de forma ética en foros y chats escolares, asegurando que tus publicaciones sean constructivas y seguras.",
                        de: "Der 'digitale Fußabdruck' ist die Spur, die wir im Netz hinterlassen. Da Server Kopien von Daten speichern, solltest du dich in Schulforen und Chats stets ethisch verhalten und darauf achten, dass deine Beiträge konstruktiv und sicher sind.",
                        en: "The 'Digital Footprint' is the trace we leave on the web. Since servers store copies of information, you must act ethically in school forums and chats, ensuring your posts are constructive and safe."
                    }
                };
            }
            if (qNum === 5) {
                return {
                    label: {
                        es: isK2
                            ? `🛡️ ¿Cómo debes sentarte frente al computador para cuidar tu espalda? 🪑`
                            : `Al pasar periodos de estudio prolongados utilizando la computadora para tus retos de ${nameS.es} (Dificultad +${diff}), ¿qué hábitos de salud física debes priorizar?`,
                        de: isK2
                            ? `🛡️ Wie solltest du vor dem Computer sitzen, um deinen Rücken zu schonen? 🪑`
                            : `Welche körperlichen Gewohnheiten solltest du vorrangig pflegen, wenn du längere Zeit am Computer für deine ${nameS.de}-Aufgaben lernst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🛡️ How should you sit in front of the computer to take care of your back? 🪑`
                            : `When spending long study periods using the computer for your ${nameS.en} challenges (Difficulty +${diff}), what physical health habits should you prioritize?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Acostado en el piso" : "a) Trabajar con el brillo de la pantalla al máximo en una habitación totalmente oscura para ver mejor los detalles.",
                            de: isK2 ? "a) Auf dem Boden liegend" : "a) Mit maximaler Bildschirmhelligkeit in einem völlig dunklen Raum arbeiten, um Details besser zu sehen.",
                            en: isK2 ? "a) Lying on the floor" : "a) Work with screen brightness at maximum in a completely dark room to see details better.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Espalda derecha, pantalla frente a los ojos y hacer pausas" : "b) Sentarte con la espalda erguida, los ojos a la distancia adecuada del monitor (aprox. 50 cm) y realizar pausas cortas para estirarte cada 30 minutos.",
                            de: isK2 ? "b) Rücken gerade, Bildschirm vor den Augen und Pausen machen" : "b) Mit aufrechtem Rücken sitzen, Augen im passenden Abstand zum Monitor (ca. 50 cm) halten und alle 30 Minuten kurze Dehnpausen machen.",
                            en: isK2 ? "b) Back straight, screen in front of your eyes, and taking breaks" : "b) Sit with your back straight, eyes at a proper distance from the monitor (approx. 50 cm), and take short breaks to stretch every 30 minutes.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Escribir con una sola mano inclinando la cabeza hacia un lado" : "c) Mantener una posición encorvada muy cerca de la pantalla para concentrarse intensamente en los bloques de texto.",
                            de: isK2 ? "c) Mit einer Hand schreiben und den Kopf zur Seite neigen" : "c) Eine gebeugte Haltung sehr nah am Bildschirm einnehmen, um sich intensiv auf die Textblöcke zu konzentrieren.",
                            en: isK2 ? "c) Type with one hand leaning your head to the side" : "c) Maintain a slouched position very close to the screen to concentrate intensely on text blocks.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La ergonomía y la salud visual evitan dolores físicos y cansancio extremo. Mantener la pantalla frente a tus ojos y hacer descansos visuales (mirar un punto lejano por 20 segundos) te ayuda a estudiar de manera más eficiente y sana.",
                        de: "Ergonomie und Augengesundheit verhindern körperliche Beschwerden und extreme Müdigkeit. Den Bildschirm auf Augenhöhe zu halten und Sehpausen einzulegen (20 Sekunden in die Ferne schauen) hilft dir, effizienter und gesünder zu lernen.",
                        en: "Ergonomics and visual health prevent physical pain and extreme fatigue. Keeping the screen at eye level and taking visual breaks (looking at a distant point for 20 seconds) helps you study more efficiently and healthily."
                    }
                };
            }
            if (qNum === 6) {
                return {
                    label: {
                        es: isK2
                            ? `🛡️ ¿Es seguro conectar tu tablet a un internet de la calle que no tiene contraseña? 📶`
                            : `Al utilizar tu dispositivo digital en áreas comunes o redes fuera del colegio (Dificultad +${diff}), ¿por qué representa un riesgo conectarse a redes Wi-Fi públicas y abiertas?`,
                        de: isK2
                            ? `🛡️ Ist es sicher, dein Tablet mit einem Straßen-WLAN zu verbinden, das kein Passwort hat? 📶`
                            : `Warum ist die Verbindung mit offenen, öffentlichen WLAN-Netzen ein Risiko, wenn du dein Gerät außerhalb der Schule nutzt (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🛡️ Is it safe to connect your tablet to a street internet that has no password? 📶`
                            : `When using your digital device in common areas or networks outside of school (Difficulty +${diff}), why does connecting to open public Wi-Fi networks represent a risk?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Sí, porque es gratis y rápido" : "a) Porque las redes abiertas no cifran la información, lo que permite que terceros intercepten tus datos personales, contraseñas o archivos.",
                            de: isK2 ? "a) Ja, weil es kostenlos und schnell ist" : "a) Weil offene Netze die Daten nicht verschlüsseln, wodurch Dritte deine persönlichen Daten, Passwörter oder Dateien abfangen können.",
                            en: isK2 ? "a) Yes, because it is free and fast" : "a) Because open networks do not encrypt information, allowing third parties to intercept your personal data, passwords, or files.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) No, hay que mantener apagado el Wi-Fi escolar en todo momento" : "b) Porque la red Wi-Fi pública puede borrar automáticamente el sistema operativo de tu tablet escolar.",
                            de: isK2 ? "b) Nein, man sollte das Schul-WLAN immer ausgeschaltet lassen" : "b) Weil das öffentliche WLAN-Netz automatisch das Betriebssystem deines Schul-Tablets löschen kann.",
                            en: isK2 ? "b) No, we must keep school Wi-Fi off at all times" : "b) Because public Wi-Fi networks can automatically erase the operating system of your school tablet.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) Sí, todas las redes de internet de la calle están vigiladas por la escuela" : "c) No hay riesgos significativos, las advertencias son solo avisos publicitarios de compañías de antivirus.",
                            de: isK2 ? "c) Ja, alle WLAN-Netze auf der Straße werden von der Schule überwacht" : "c) Es gibt keine nennenswerten Risiken, die Warnungen sind nur Werbung von Antiviren-Unternehmen.",
                            en: isK2 ? "c) Yes, all street internet networks are monitored by the school" : "c) There are no significant risks, the warnings are just advertising alerts from antivirus companies.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las redes Wi-Fi públicas y sin clave carecen de cifrado de seguridad. Para realizar tareas en el colegio, siempre debes preferir el Wi-Fi institucional protegido o compartir una conexión móvil segura y conocida.",
                        de: "Öffentliche WLAN-Netze ohne Passwort bieten keine Sicherheitsverschlüsselung. Für schulische Aufgaben solltest du immer das geschützte Schul-WLAN bevorzugen oder eine bekannte, sichere mobile Verbindung nutzen.",
                        en: "Public Wi-Fi networks without a password lack security encryption. For doing schoolwork, you should always prefer the protected institutional Wi-Fi or share a known secure mobile connection."
                    }
                };
            }
            break;

        case 5: // Problemlösen & Handeln (Resolución de Problemas y Modelado)
            if (qNum === 1) {
                return {
                    label: {
                        es: isK2
                            ? `❓ Si el monitor del computador no enciende, ¿qué debes revisar primero? 🖥️`
                            : `Si al encender tu computador en clase de ${nameS.es} notas que la pantalla no emite señal (Dificultad +${diff}), ¿cuál es el paso de revisión inicial?`,
                        de: isK2
                            ? `❓ Wenn der Computermonitor nicht angeht, was solltest du zuerst prüfen? 🖥️`
                            : `Welchen ersten Prüfschritt solltest du machen, wenn du deinen Computer einschaltest und der Bildschirm kein Signal zeigt (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `❓ If the computer screen does not turn on, what should you check first? 🖥️`
                            : `If when turning on your computer you notice that the screen emits no signal (Difficulty +${diff}), what is the initial check step?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Patear la torre del computador" : "a) Llamar al servicio técnico escolar de inmediato para que desensamble el equipo físico y reemplace el monitor.",
                            de: isK2 ? "a) Gegen das Computergehäuse treten" : "a) Sofort den IT-Service rufen, damit er das Gerät auseinanderbaut und den Monitor ersetzt.",
                            en: isK2 ? "a) Kick the computer tower" : "a) Call school technical support immediately to disassemble the equipment and replace the monitor.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Que el cable de energía esté bien conectado a la corriente" : "b) Verificar los cables físicos de energía y el cable de datos (HDMI/DP/VGA) asegurándote de que estén bien conectados a la corriente y al equipo.",
                            de: isK2 ? "b) Ob das Stromkabel richtig in der Steckdose steckt" : "b) Die Strom- und Datenkabel (HDMI/DP/VGA) prüfen und sicherstellen, dass sie richtig in der Steckdose und im Gerät stecken.",
                            en: isK2 ? "b) That the power cable is properly plugged in" : "b) Check the physical power cables and data cable (HDMI/DP/VGA) ensuring they are properly plugged into the power outlet and the device.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Cambiar de puesto sin decir nada" : "c) Limpiar la pantalla con abundante agua y jabón líquido con el monitor conectado a la corriente.",
                            de: isK2 ? "c) Unbemerkt den Platz wechseln" : "c) Den Bildschirm mit viel Wasser und Flüssigseife reinigen, während er an den Strom angeschlossen ist.",
                            en: isK2 ? "c) Switch seats without saying anything" : "c) Clean the screen with plenty of water and liquid soap while the monitor is connected to power.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Muchos problemas técnicos en informática son sencillos y ocurren por cables flojos o mal conectados. Verificar las conexiones físicas antes de solicitar soporte ayuda a mantener el orden en el laboratorio de cómputo.",
                        de: "Viele technische Probleme in der IT sind einfach und liegen an lockeren oder falsch angeschlossenen Kabeln. Das Überprüfen der Kabelverbindungen vor dem Rufen des Supports sorgt für Ordnung im Computerraum.",
                        en: "Many technical problems in IT are simple and occur because of loose or poorly connected cables. Checking physical connections before calling for support helps maintain order in the computer lab."
                    }
                };
            }
            if (qNum === 2) {
                return {
                    label: {
                        es: isK2
                            ? `❓ Si la aplicación de ${nameS.es} se queda congelada y no responde, ¿qué haces? 🛑`
                            : `Cuando la suite de oficina o editor de presentaciones se bloquea (se congela) y no te permite guardar tu avance (Dificultad +${diff}), ¿cuál es la acción lógica a seguir?`,
                        de: isK2
                            ? `❓ Wenn die ${nameS.de}-App einfriert und nicht reagiert, was tust du? 🛑`
                            : `Welche logische Aktion solltest du ausführen, wenn das Office-Programm oder der Präsentations-Editor einfriert und du deine Arbeit nicht speichern kannst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `❓ If the ${nameS.en} app freezes and does not respond, what do you do? 🛑`
                            : `When the office suite or presentation editor freezes and doesn't allow you to save your progress (Difficulty +${diff}), what is the logical action to take?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Esperar eternamente frente a la pantalla" : "a) Apagar la computadora desconectando el enchufe de la corriente sin cerrar los otros programas abiertos.",
                            de: isK2 ? "a) Ewig vor dem Bildschirm warten" : "a) Den Computer ausschalten, indem du den Stecker ziehst, ohne die anderen offenen Programme zu schließen.",
                            en: isK2 ? "a) Wait forever in front of the screen" : "a) Turn off the computer by pulling the plug without closing the other open programs.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Forzar el cierre de la app (Alt+F4 o Administrador de Tareas) y reiniciar la aplicación" : "b) Forzar el cierre del programa congelado usando el Administrador de Tareas (o las teclas Alt + F4) y reiniciar la aplicación para recuperar la copia de autoguardado.",
                            de: isK2 ? "b) Das Schließen der App erzwingen (Alt+F4 oder Task-Manager) und die Anwendung neu starten" : "b) Das Schließen des eingefrorenen Programms über den Task-Manager erzwingen (oder Alt + F4) und die App neu starten, um die automatisch gespeicherte Version zu laden.",
                            en: isK2 ? "b) Force close the app (Alt+F4 or Task Manager) and restart the application" : "b) Force close the frozen program using Task Manager (or Alt + F4 keys) and restart the application to retrieve the autosaved copy.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Desinstalar el sistema operativo del computador" : "c) Borrar la carpeta completa del proyecto de clase y comenzar la tarea escolar de cero.",
                            de: isK2 ? "c) Das Betriebssystem des Computers deinstallieren" : "c) Den gesamten Ordner des Klassenprojekts löschen und die Hausaufgabe komplett von vorne beginnen.",
                            en: isK2 ? "c) Uninstall the operating system of the computer" : "c) Delete the entire folder of the class project and start the school assignment from scratch.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Forzar el cierre de una aplicación colgada a través del Administrador de Tareas cierra únicamente ese proceso sin apagar tu computadora, permitiendo que recuperes tu trabajo de forma segura gracias a la función de autoguardado en Office 365 o Canva.",
                        de: "Das erzwungene Schließen einer blockierten App über den Task-Manager beendet nur diesen Prozess, ohne den Computer auszuschalten. So kannst du deine Arbeit dank der automatischen Speicherung in Office 365 oder Canva sicher wiederherstellen.",
                        en: "Force closing a hung application through Task Manager closes only that process without shutting down your computer, allowing you to retrieve your work safely thanks to the autosave feature in Office 365 or Canva."
                    }
                };
            }
            if (qNum === 3) {
                return {
                    label: {
                        es: isK2
                            ? `❓ En Scratch, ¿qué bloque usas para repetir un dibujo de ${nameS.es} 3 veces? 🔄`
                            : `Al diseñar un algoritmo lógico en programación para realizar una tarea repetitiva o crear un patrón geométrico (Dificultad +${diff}), ¿qué estructura es la más adecuada?`,
                        de: isK2
                            ? `❓ Welchen Block benutzt du in Scratch, um eine ${nameS.de}-Zeichnung dreimal zu wiederholen? 🔄`
                            : `Welche Struktur ist am besten geeignet, wenn du einen Algorithmus für eine sich wiederholende Aufgabe oder ein geometrisches Muster programmierst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `❓ In Scratch, which block do you use to repeat an ${nameS.en} drawing 3 times? 🔄`
                            : `When designing a logical algorithm in programming to perform a repetitive task or create a geometric pattern (Difficulty +${diff}), which structure is most appropriate?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) El bloque 'Wiederhole 3-mal' (Repetir 3 veces)" : "a) Usar una estructura de control iterativa (bucle o ciclo 'repetir' o 'mientras') para evitar la duplicación de código.",
                            de: isK2 ? "a) Der Block 'Wiederhole 3-mal'" : "a) Eine Schleife ('wiederhole' oder 'solange') nutzen, um doppelten Code zu vermeiden.",
                            en: isK2 ? "a) The 'Repeat 3 times' block" : "a) Use an iterative control structure (loop 'repeat' or 'while') to avoid code duplication.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Copiar el mismo bloque 100 veces" : "b) Duplicar las mismas instrucciones de manera secuencial en el código tantas veces como se repita el proceso.",
                            de: isK2 ? "b) Denselben Block 100-mal kopieren" : "b) Dieselben Befehle nacheinander so oft im Code kopieren, wie der Vorgang wiederholt werden soll.",
                            en: isK2 ? "b) Copying the same block 100 times" : "b) Duplicate the same instructions sequentially in the code as many times as the process repeats.",
                            correct: false
                        },
                        {
                            es: isK2 ? "c) El bloque de detener todo" : "c) Escribir múltiples condicionales anidados (If/Else) independientes para cada repetición del personaje.",
                            de: isK2 ? "c) Der Block 'Stoppe alles'" : "c) Viele verschachtelte Bedingungen (If/Else) für jede einzelne Wiederholung der Figur schreiben.",
                            en: isK2 ? "c) The stop all block" : "c) Write multiple independent nested conditionals (If/Else) for each repetition of the character.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Los bucles en programación (como en Scratch o mundos programables de Minecraft) te permiten automatizar procesos repetitivos. Su uso optimiza el rendimiento del código y facilita la depuración de errores lógicos.",
                        de: "Schleifen beim Programmieren (wie in Scratch oder Minecraft-Welten) ermöglichen es dir, wiederkehrende Abläufe zu automatisieren. Ihre Verwendung optimiert den Code und erleichtert die Behebung von Logikfehlern.",
                        en: "Loops in programming (like in Scratch or programmable Minecraft worlds) allow you to automate repetitive processes. Their use optimizes code performance and facilitates debugging logical errors."
                    }
                };
            }
            if (qNum === 4) {
                return {
                    label: {
                        es: isK2
                            ? `❓ Si no sabes cómo cambiar el tipo de letra en tu trabajo escolar de ${nameS.es}, ¿qué debes hacer? 💡`
                            : `Cuando experimentas dudas sobre cómo usar una función técnica en Canva, Office 365 o Scratch (Dificultad +${diff}), ¿qué estrategia autónoma de aprendizaje aplicas?`,
                        de: isK2
                            ? `❓ Wenn du nicht weißt, wie du die Schriftart in deiner ${nameS.de}-Arbeit änderst, was tust du? 💡`
                            : `Welche selbstständige Lernstrategie wendest du an, wenn du Fragen zur Nutzung einer Funktion in Canva, Office 365 oder Scratch hast (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `❓ If you don't know how to change the font in your ${nameS.en} schoolwork, what should you do? 💡`
                            : `When you have doubts about how to use a technical function in Canva, Office 365, or Scratch (Difficulty +${diff}), which autonomous learning strategy do you apply?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Preguntarle a tu profesor cada 2 minutos" : "a) Detener la realización del proyecto escolar y esperar a que el profesor de la materia explique la herramienta de forma presencial.",
                            de: isK2 ? "a) Alle 2 Minuten den Lehrer fragen" : "a) Die Arbeit am Schulprojekt unterbrechen und warten, bis der Lehrer das Tool im Unterricht erklärt.",
                            en: isK2 ? "a) Ask your teacher every 2 minutes" : "a) Stop working on the school project and wait for the teacher to explain the tool in class.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Buscar un video tutorial oficial en internet o consultar la ayuda del programa" : "b) Consultar la documentación interna del software (menú de ayuda), ver tutoriales validados o buscar respuestas en guías de soporte escolar oficiales.",
                            de: isK2 ? "b) Ein offizielles Erklärvideo im Internet ansehen oder die Hilfe des Programms nutzen" : "b) Die Hilfefunktion der Software nutzen, offizielle Tutorials ansehen oder Antworten in Schul-Anleitungen suchen.",
                            en: isK2 ? "b) Search for an official video tutorial online or consult software help" : "b) Consult the internal software documentation (help menu), watch validated tutorials, or search for answers in official school support guides.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Dejar de hacer la tarea" : "c) Hacer clics rápidos de manera aleatoria en todos los botones del menú esperando adivinar la función del programa.",
                            de: isK2 ? "c) Aufhören, die Hausaufgaben zu machen" : "c) Wild auf alle Knöpfe klicken in der Hoffnung, die Funktion des Programms zufällig zu erraten.",
                            en: isK2 ? "c) Stop doing the homework" : "c) Click rapidly and randomly on all menu buttons hoping to guess the program function.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La resolución autónoma de problemas fomenta el autoaprendizaje digital. Los sistemas operativos y aplicaciones educativas (como Canva o Word) poseen manuales, tutoriales en video y menús de ayuda para que el estudiante aprenda a resolver sus dudas de forma independiente.",
                        de: "Das selbstständige Lösen von Problemen fördert das digitale Lernen. Betriebssysteme und Lern-Apps (wie Canva oder Word) bieten Handbücher, Video-Tutorials und Hilfemenüs, damit du deine Fragen eigenständig klären kannst.",
                        en: "Autonomous problem solving fosters digital self-learning. Operating systems and educational applications (like Canva or Word) have manuals, video tutorials, and help menus to let students resolve their doubts independently."
                    }
                };
            }
            if (qNum === 5) {
                return {
                    label: {
                        es: isK2
                            ? `❓ Si tu tarea de ${nameS.es} es hacer una lista de palabras ordenadas, ¿qué app es mejor usar? 📊`
                            : `Al planificar una actividad de aprendizaje escolar en equipo (Dificultad +${diff}), ¿bajo qué criterios lógicos debes seleccionar la herramienta digital a utilizar?`,
                        de: isK2
                            ? `❓ Welches App nutzt du am besten, um eine sortierte Wortliste für ${nameS.de} zu erstellen? 📊`
                            : `Nach welchen logischen Kriterien solltest du die digitale Software für eine Gruppenarbeit auswählen (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `❓ If your ${nameS.en} homework is to make a sorted list of words, which app is best? 📊`
                            : `When planning a collaborative school activity (Difficulty +${diff}), under what logical criteria should you select the digital tool to use?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) El Paint para dibujar las palabras" : "a) Elegir el programa basándote en la popularidad o los juegos divertidos que incluye, sin importar si posee las funciones requeridas.",
                            de: isK2 ? "a) Paint, um die Wörter zu zeichnen" : "a) Das Programm nach seiner Beliebtheit oder den enthaltenen Spielen auswählen, egal ob es die benötigten Funktionen hat.",
                            en: isK2 ? "a) Paint to draw the words" : "a) Choose the program based on popularity or the fun games it includes, regardless of whether it has the required features.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Una hoja de cálculo (Excel) porque permite ordenar alfabéticamente de forma automática" : "b) Seleccionar la herramienta que mejor se adapte al tipo de producto a crear (ej: Excel para datos matemáticos, Canva para afiches, Word para redacción).",
                            de: isK2 ? "b) Eine Excel-Tabelle, da man damit automatisch alphabetisch sortieren kann" : "b) Das Tool wählen, das am besten zum gewünschten Produkt passt (z. B. Excel für Tabellen, Canva für Plakate, Word für Texte).",
                            en: isK2 ? "b) A spreadsheet (Excel) because it allows automatic alphabetical sorting" : "b) Select the tool that best fits the type of product to create (e.g., Excel for mathematical data, Canva for posters, Word for writing).",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) El reproductor de música" : "c) Utilizar exclusivamente la aplicación de presentaciones sin importar que el producto final sea un texto extenso o una base de datos compleja.",
                            de: isK2 ? "c) Der Musikplayer" : "c) Ausschließlich das Präsentationsprogramm nutzen, egal ob das Endprodukt ein langer Text oder eine komplexe Datenbank ist.",
                            en: isK2 ? "c) The music player" : "c) Use exclusively the presentation application regardless of whether the final product is a long text or a complex database.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La selección adecuada del software facilita el trabajo y eleva la calidad del entregable. Conocer las fortalezas de cada herramienta (Canva para diagramación, Excel para tablas, Word para reportes estructurados) es clave para resolver los retos escolares con eficiencia.",
                        de: "Die richtige Softwareauswahl erleichtert die Arbeit und erhöht die Qualität des Ergebnisses. Die Stärken der Tools zu kennen (Canva für Layouts, Excel für Tabellen, Word für Berichte) hilft, schulische Aufgaben effizient zu lösen.",
                        en: "Appropriate software selection facilitates work and raises the quality of the deliverable. Knowing the strengths of each tool (Canva for layout, Excel for tables, Word for structured reports) is key to solving school challenges efficiently."
                    }
                };
            }
            if (qNum === 6) {
                return {
                    label: {
                        es: isK2
                            ? `❓ Si tu programa en Scratch de ${nameS.es} se detiene con un error de código (bug), ¿qué debes hacer? 🐞`
                            : `Al depurar un fallo o error de lógica (bug) en un programa de Scratch o en una configuración digital de clase (Dificultad +${diff}), ¿cuál es el método sistemático más recomendado?`,
                        de: isK2
                            ? `❓ Wenn dein Scratch-Programm für ${nameS.de} wegen eines Fehlers stoppt, was solltest du tun? 🐞`
                            : `Welche systematische Vorgehensweise ist am empfehlenswertesten, um einen Logikfehler (Bug) in einem Scratch-Programm oder einer digitalen Einstellung zu beheben (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `❓ If your Scratch program for ${nameS.en} stops with a bug, what should you do? 🐞`
                            : `When debugging a logic error (bug) in a Scratch program or school digital setup (Difficulty +${diff}), which systematic method is most recommended?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Borrar todo y llorar" : "a) Borrar todos los bloques de código y volver a arrastrarlos desde el inicio con la esperanza de que funcione por azar.",
                            de: isK2 ? "a) Alles löschen und weinen" : "a) Alle Codeblöcke löschen und von vorne anfangen in der Hoffnung, dass es zufällig klappt.",
                            en: isK2 ? "a) Delete everything and cry" : "a) Delete all blocks of code and drag them back from the beginning hoping it will work by chance.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Revisar paso a paso la ejecución y buscar qué bloque está mal colocado" : "b) Ejecutar el código paso a paso (tracing), aislar las variables del error, probar el flujo y comprobar qué bloque lógico contiene una condición errónea.",
                            de: isK2 ? "b) Die Ausführung Schritt für Schritt prüfen und nach dem fehlerhaften Block suchen" : "b) Den Code Schritt für Schritt ausführen (Tracing), die Variablen isolieren, den Ablauf testen und prüfen, welcher Block eine falsche Bedingung enthält.",
                            en: isK2 ? "b) Review the execution step-by-step and search for the misplaced block" : "b) Execute the code step-by-step (tracing), isolate the error variables, test the flow, and check which logical block contains an incorrect condition.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Apagar la computadora a la fuerza" : "c) Modificar el nombre del archivo del proyecto escolar para que la plataforma ignore el fallo interno.",
                            de: isK2 ? "c) Den Computer gewaltsam ausschalten" : "c) Den Dateinamen des Schulprojekts ändern, damit die Plattform den Fehler ignoriert.",
                            en: isK2 ? "c) Force shut down the computer" : "c) Modify the file name of the school project so the platform ignores the internal failure.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La depuración paso a paso (tracing) y el aislamiento de las partes que fallan permiten encontrar el origen exacto del bug. Esta metodología estructurada ahorra tiempo y esfuerzo, tanto al programar como al solucionar fallas de configuración en cualquier software.",
                        de: "Das schrittweise Ausführen (Tracing) und das Isolieren von Fehlern helfen, die genaue Ursache des Bugs zu finden. Diese strukturierte Methode spart Zeit und Mühe beim Programmieren und beim Lösen von Softwareproblemen.",
                        en: "Step-by-step debugging (tracing) and isolating the failing parts allow finding the exact origin of the bug. This structured methodology saves time and effort both when programming and when solving configuration failures in any software."
                    }
                };
            }
            break;

        case 6: // Analysieren & Reflektieren (Análisis, Reflexión y Evaluación de Medios)
            if (qNum === 1) {
                return {
                    label: {
                        es: isK2
                            ? `🧠 Si ves una noticia sobre ${nameS.es} en internet que parece mentira, ¿qué haces? 📰`
                            : `Al analizar un titular de internet o red social relacionado con la materia de ${nameS.es} (Dificultad +${diff}), ¿qué método debes aplicar para identificar si es una noticia falsa (Fake News)?`,
                        de: isK2
                            ? `🧠 Wenn du eine Nachricht über ${nameS.de} im Internet siehst, die unwahr aussieht, was tust du? 📰`
                            : `Welche Methode solltest du anwenden, um zu prüfen, ob es sich bei einer Schlagzeile zum Fach ${nameS.de} im Internet um eine Falschmeldung (Fake News) handelt (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🧠 If you see news about ${nameS.en} online that looks like a lie, what do you do? 📰`
                            : `When analyzing an internet or social network headline related to ${nameS.en} (Difficulty +${diff}), which method should you apply to check for fake news?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Creerla y contarle a todos mis amigos" : "a) Dar por verdadera la noticia de inmediato si el título resulta impactante o fue enviada al chat escolar por un compañero.",
                            de: isK2 ? "a) Sie glauben und all meinen Freunden davon erzählen" : "a) Die Nachricht sofort als wahr ansehen, wenn der Titel reißerisch ist oder von einem Mitschüler gesendet wurde.",
                            en: isK2 ? "a) Believe it and tell all my friends" : "a) Accept the news as true immediately if the headline is striking or it was sent to school chat by a classmate.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Revisar si la noticia está publicada en otros sitios web serios o de noticias reales" : "b) Aplicar la técnica de verificación escolar SIFT: Detenerse, Investigar la fuente original, Buscar cobertura en otros portales reales y Rastrear las citas.",
                            de: isK2 ? "b) Prüfen, ob die Nachricht auch auf anderen seriösen Nachrichtenseiten steht" : "b) Die schulische SIFT-Methode anwenden: Innehalten (Stop), Quelle prüfen (Investigate), andere Berichte suchen (Find) und Zitate zurückverfolgen (Trace).",
                            en: isK2 ? "b) Check if the news is published on other reputable or real news sites" : "b) Apply the school verification technique SIFT: Stop, Investigate the source, Find better coverage on other real portals, and Trace claims.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Enojarse y golpear la pantalla" : "c) Denunciar el sitio web ante las autoridades escolares sin leer el contenido de la publicación digital.",
                            de: isK2 ? "c) Wütend werden und auf den Bildschirm schlagen" : "c) Die Webseite ohne Lesen des Inhalts sofort bei der Schulleitung anzeigen.",
                            en: isK2 ? "c) Get angry and punch the screen" : "c) Report the website to school authorities without reading the content of the digital post.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La desinformación (Fake News) usa títulos exagerados para captar tu atención y generar emociones. Emplear metodologías estructuradas de verificación como SIFT te ayuda a ser un usuario digital inteligente y evitar propagar rumores falsos en el colegio.",
                        de: "Falschmeldungen (Fake News) nutzen übertriebene Titel, um deine Aufmerksamkeit zu erregen. Strukturierte Methoden wie SIFT helfen dir, ein intelligenter Mediennutzer zu sein und keine Gerüchte an der Schule zu verbreiten.",
                        en: "Misinformation (Fake News) uses exaggerated headlines to capture your attention and spark emotions. Using structured verification methodologies like SIFT helps you be a smart digital user and avoid spreading false rumors at school."
                    }
                };
            }
            if (qNum === 2) {
                return {
                    label: {
                        es: isK2
                            ? `🧠 ¿Por qué las redes sociales te muestran videos que siempre te gustan? 📱`
                            : `Con respecto a los algoritmos de recomendación de contenidos que utilizan las plataformas y redes en internet (Dificultad +${diff}), ¿qué es una 'burbuja de filtro' y qué implicación tiene?`,
                        de: isK2
                            ? `🧠 Warum zeigen dir soziale Netzwerke immer Videos, die dir gefallen? 📱`
                            : `Was versteht man unter einer 'Filterblase' bei Empfehlungsalgorithmen auf Internetplattformen und welche Auswirkungen hat sie (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🧠 Why do social networks show you videos that you always like? 📱`
                            : `Regarding the content recommendation algorithms used by internet platforms and networks (Difficulty +${diff}), what is a 'filter bubble' and what implication does it have?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Porque la aplicación sabe magia" : "a) Un fenómeno en el cual los algoritmos te muestran únicamente contenidos alineados con tus preferencias e historial de clics, aislándote de visiones y opiniones diferentes.",
                            de: isK2 ? "a) Weil die App zaubern kann" : "a) Ein Phänomen, bei dem Algorithmen dir nur Inhalte zeigen, die deinen Vorlieben und Klicks entsprechen, wodurch du von anderen Sichtweisen isoliert wirst.",
                            en: isK2 ? "a) Because the app knows magic" : "a) A phenomenon in which algorithms show you only content aligned with your preferences and click history, isolating you from differing views.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Porque tiene un algoritmo que estudia tus gustos" : "b) Un tipo de malware o virus informático escolar que bloquea los resultados de búsqueda de tareas.",
                            de: isK2 ? "b) Weil sie einen Algorithmus hat, der deine Vorlieben lernt" : "b) Eine Art von Schadsoftware (Virus), die die Ergebnisse bei der Hausaufgabenrecherche blockiert.",
                            en: isK2 ? "b) Because it has an algorithm that studies your preferences" : "b) A type of malware or school computer virus that blocks search results for homework.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "c) Porque todas las personas en el mundo ven lo mismo" : "c) Una configuración de privacidad en la cuenta que bloquea de forma automática los anuncios comerciales del colegio.",
                            de: isK2 ? "c) Weil alle Menschen auf der Welt dasselbe sehen" : "c) Eine Datenschutzeinstellung im Konto, die automatisch Werbung blockiert.",
                            en: isK2 ? "c) Because everyone in the world sees the same things" : "c) A privacy setting in the account that automatically blocks commercial ads.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Las plataformas en internet buscan mantenerte conectado recomendándote solo lo que te gusta. Esto crea burbujas informativas que limitan tu acceso a opiniones diferentes. Buscar información de manera activa y crítica es clave para tu formación.",
                        de: "Internetplattformen wollen dich online halten, indem sie dir nur zeigen, was dir gefällt. Dadurch entstehen Filterblasen, die deine Sichtweise einschränken. Die aktive und kritische Informationssuche ist wichtig für deine Bildung.",
                        en: "Internet platforms seek to keep you connected by recommending only what you like. This creates information bubbles that limit your access to differing opinions. Searching for information actively and critically is key to your education."
                    }
                };
            }
            if (qNum === 3) {
                return {
                    label: {
                        es: isK2
                            ? `🧠 Si un programa de Inteligencia Artificial escribe un texto de ${nameS.es} por ti, ¿eso es: 🤖`
                            : `Al utilizar herramientas de Inteligencia Artificial generativa (como ChatGPT) en tus deberes escolares de ${nameS.es} (Dificultad +${diff}), ¿cuál es el uso ético y productivo que debes darles?`,
                        de: isK2
                            ? `🧠 Wenn ein KI-Programm einen ${nameS.de}-Text für dich schreibt, ist das: 🤖`
                            : `Welches ist der ethische und produktive Umgang mit generativer Künstlicher Intelligenz (wie ChatGPT) bei deinen ${nameS.de}-Hausaufgaben (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🧠 If an Artificial Intelligence program writes a text in ${nameS.en} for you, is that: 🤖`
                            : `When using generative Artificial Intelligence tools (like ChatGPT) in your ${nameS.en} schoolwork (Difficulty +${diff}), what is the ethical and productive use you should give them?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Trampa (plagio), porque no lo pensaste tú" : "a) Copiar textualmente el texto que genera la IA y entregarlo al docente como una producción propia sin declararlo.",
                            de: isK2 ? "a) Mogeln (Plagiat), weil du es nicht selbst geschrieben hast" : "a) Den von der KI generierten Text eins zu eins kopieren und als eigene Leistung abgeben, ohne dies anzugeben.",
                            en: isK2 ? "a) Cheating (plagiarism) because you didn't think of it yourself" : "a) Copy verbatim the text generated by the AI and submit it to the teacher as your own work without stating it.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "b) Tu propio esfuerzo intelectual" : "b) Usarla como asistente para estructurar ideas o corregir ortografía, verificar la veracidad de los datos y declarar al profesor que se empleó apoyo de IA.",
                            de: isK2 ? "b) Deine eigene intellektuelle Leistung" : "b) Sie als Assistent zur Strukturierung von Ideen oder zur Rechtschreibkorrektur nutzen, die Richtigkeit der Daten prüfen und dem Lehrer die Nutzung offenlegen.",
                            en: isK2 ? "b) Your own intellectual effort" : "b) Use it as an assistant to structure ideas or check spelling, verify the accuracy of the data, and declare to the teacher that AI assistance was used.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Una idea genial para no estudiar más" : "c) Ignorar por completo la tecnología de IA por considerarla una herramienta peligrosa y prohibida en todo el ámbito escolar.",
                            de: isK2 ? "c) Eine tolle Idee, um nicht mehr lernen zu müssen" : "c) Die KI-Technologie komplett ignorieren, da sie im gesamten schulischen Bereich verboten und gefährlich ist.",
                            en: isK2 ? "c) A great idea to avoid studying ever again" : "c) Completely ignore AI technology, considering it a dangerous and banned tool in the school environment.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La IA generativa es una herramienta de apoyo, no un reemplazo de tu mente. Dado que la IA puede cometer errores (alucinaciones), siempre debes comprobar los datos críticamente y asumir la responsabilidad intelectual de tu trabajo.",
                        de: "Generative KI ist ein Hilfsmittel, kein Ersatz für dein eigenes Denken. Da KI Fehler machen kann (Halluzinationen), solltest du Daten immer kritisch prüfen und die Verantwortung für deine Arbeit übernehmen.",
                        en: "Generative AI is a supporting tool, not a replacement for your mind. Since AI can make mistakes (hallucinations), you must always check the data critically and take intellectual responsibility for your work."
                    }
                };
            }
            if (qNum === 4) {
                return {
                    label: {
                        es: isK2
                            ? `🧠 ¿Cuánto tiempo es bueno usar la tablet al día para no dañar tu salud? ⏰`
                            : `Al gestionar tus actividades y tareas virtuales escolares (Dificultad +${diff}), ¿por qué es importante autorregular tus tiempos de conexión y uso de pantallas?`,
                        de: isK2
                            ? `🧠 Wie lange sollte man das Tablet täglich nutzen, um der Gesundheit nicht zu schaden? ⏰`
                            : `Warum ist es wichtig, die eigene Online-Zeit und Bildschirmnutzung bei der Erledigung digitaler Aufgaben selbst zu regulieren (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🧠 How long is it good to use the tablet per day so you do not harm your health? ⏰`
                            : `When managing your virtual school activities and tasks (Difficulty +${diff}), why is it important to self-regulate your connection times and screen usage?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Todo el día y toda la noche" : "a) Para evitar problemas de fatiga visual, dolores físicos, insomnio y la dispersión mental durante tu tiempo de estudio escolar.",
                            de: isK2 ? "a) Den ganzen Tag und die ganze Nacht" : "a) Um Augenmüdigkeit, körperliche Beschwerden, Schlafstörungen und Konzentrationsschwäche beim Lernen zu vermeiden.",
                            en: isK2 ? "a) All day and all night" : "a) To avoid eye strain, physical pain, insomnia, and mental distraction during your school study time.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Solo el tiempo necesario fijado con los padres o maestros" : "b) No se requiere ninguna autorregulación en absoluto si todo el contenido visual tiene una justificación educativa.",
                            de: isK2 ? "b) Nur die nötige Zeit, die mit Eltern oder Lehrern abgesprochen ist" : "b) Es ist überhaupt keine Selbstregulierung nötig, wenn alle gezeigten Inhalte einen pädagogischen Nutzen haben.",
                            en: isK2 ? "b) Only the necessary time agreed with parents or teachers" : "b) No self-regulation is required at all if all visual content has an educational justification.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "c) Nada, hay que tirar la tablet a la basura" : "c) Únicamente para evitar que la batería de la computadora escolar se desgaste más rápido de lo esperado.",
                            de: isK2 ? "c) Gar nicht, man sollte das Tablet wegwerfen" : "c) Nur um zu verhindern, dass sich der Akku des Schulcomputers schneller als erwartet abnutzt.",
                            en: isK2 ? "c) Nothing, we must throw the tablet away" : "c) Only to prevent the school computer battery from draining faster than expected.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La desconexión y las pausas digitales planificadas mejoran tu salud física y aumentan la retención de conocimientos. Establecer límites de tiempo frente a la tablet o computadora te permite enfocar la atención y rendir mejor.",
                        de: "Geplante digitale Pausen und Offline-Zeiten verbessern deine Gesundheit und steigern deine Lernerfolge. Zeitgrenzen vor dem Tablet oder Computer helfen dir, dich besser zu konzentrieren.",
                        en: "Planned digital downtime and breaks improve your physical health and increase knowledge retention. Setting time limits in front of the tablet or computer helps you focus attention and perform better."
                    }
                };
            }
            if (qNum === 5) {
                return {
                    label: {
                        es: isK2
                            ? `🧠 ¿Qué busca un anuncio de internet de juguetes al mostrarte niños felices? 🧸`
                            : `Al investigar contenidos para tus asignaturas en portales de internet (Dificultad +${diff}), ¿cómo identificas si el sitio posee un sesgo comercial o publicitario oculto?`,
                        de: isK2
                            ? `🧠 Was will eine Spielzeugwerbung im Internet erreichen, wenn sie glückliche Kinder zeigt? 🧸`
                            : `Wie erkennst du eine versteckte kommerzielle Absicht oder Werbung, wenn du auf Webportalen nach Inhalten für deine Fächer suchst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🧠 What does a toy ad online want to achieve by showing happy children? 🧸`
                            : `When researching content for your subjects on internet portals (Difficulty +${diff}), how do you identify if the site has a hidden commercial or advertising bias?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Solo mostrar que son amigables" : "a) Observando la presencia constante de banners promocionales invasivos, enlaces afiliados de venta y redacción que promueve una marca sin basarse en datos científicos.",
                            de: isK2 ? "a) Nur zeigen, dass sie freundlich sind" : "a) Durch störende Werbebanner, Kauf-Links und Texte, die eine bestimmte Marke ohne wissenschaftliche Belege anpreisen.",
                            en: isK2 ? "a) Just show that they are friendly" : "a) By noting the constant presence of invasive promotional banners, affiliate sales links, and writing promoting a brand without scientific data.",
                            correct: true
                        },
                        {
                            es: isK2 ? "b) Convencerte de comprar el juguete" : "b) Todas las páginas informativas en la web son neutras y buscan educar de manera altruista sin fines de lucro.",
                            de: isK2 ? "b) Dich überzeugen, das Spielzeug zu kaufen" : "b) Alle Informationsseiten im Web sind neutral und wollen rein gemeinnützig ohne finanzielle Absichten informieren.",
                            en: isK2 ? "b) Convince you to buy the toy" : "b) All informational pages on the web are neutral and seek to educate altruistically without profit motive.",
                            correct: isK2
                        },
                        {
                            es: isK2 ? "c) Ayudarte a hacer la tarea escolar" : "c) Asumiendo que si la página tarda mucho tiempo en cargar, se trata obligatoriamente de un portal publicitario.",
                            de: isK2 ? "c) Dir bei den Schulaufgaben helfen" : "c) Davon ausgehen, dass eine langsam ladende Seite automatisch ein Werbeportal ist.",
                            en: isK2 ? "c) Help you do your school homework" : "c) Assuming that if the page takes a long time to load, it is strictly an advertising portal.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "La publicidad digital a veces se disfraza de artículos de noticias o datos de estudio. Analizar críticamente el portal, fijarse en si intentan vender algo y elegir recursos sin anuncios te ayuda a obtener información escolar verídica y neutra.",
                        de: "Online-Werbung tarnt sich manchmal als Nachrichtenartikel oder Lernmaterial. Das kritische Prüfen der Seite, das Erkennen von Verkaufsabsichten und das Nutzen werbefreier Quellen helfen dir, neutrale Schulinfos zu finden.",
                        en: "Digital advertising is sometimes disguised as news articles or study data. Critically analyzing the portal, noting if they try to sell something, and choosing ad-free resources helps you obtain true and neutral school information."
                    }
                };
            }
            if (qNum === 6) {
                return {
                    label: {
                        es: isK2
                            ? `🧠 Si publicas un dibujo de ${nameS.es} en internet, ¿quién podrá verlo en el futuro? 🌐`
                            : `Con respecto a tu ciudadanía e identidad digital (Dificultad +${diff}), ¿qué impacto ético y escolar tiene subir material académico de tu autoría a la red pública?`,
                        de: isK2
                            ? `🧠 Wenn du eine Zeichnung für ${nameS.de} ins Internet stellst, wer kann sie in Zukunft sehen? 🌐`
                            : `Welche Auswirkungen hat es auf deine digitale Identität, wenn du eigene Schulmaterialien im öffentlichen Netz veröffentlichst (Schwierigkeit +${diff})?`,
                        en: isK2
                            ? `🧠 If you post a drawing of ${nameS.en} online, who will be able to see it in the future? 🌐`
                            : `Regarding your digital citizenship and identity (Difficulty +${diff}), what ethical and academic impact does uploading academic work of your authorship to the public web have?`
                    },
                    options: [
                        {
                            es: isK2 ? "a) Nadie, se borra al apagar el computador" : "a) No tiene consecuencias, ya que el material educativo es público por defecto y carece de vinculación a tu perfil personal en el futuro.",
                            de: isK2 ? "a) Niemand, es wird beim Ausschalten des Computers gelöscht" : "a) Es hat keine Folgen, da Lernmaterialien standardmäßig öffentlich sind und später nicht mit deinem persönlichen Profil verknüpft werden.",
                            en: isK2 ? "a) Nobody, it gets deleted when turning off the computer" : "a) It has no consequences, as educational material is public by default and has no link to your personal profile in the future.",
                            correct: false
                        },
                        {
                            es: isK2 ? "b) Cualquier persona en el mundo, y puede quedarse guardado para siempre" : "b) Se integra a tu registro de reputación académica en internet. Publicar con respeto y formalidad previene malentendidos y modela una identidad digital positiva.",
                            de: isK2 ? "b) Jeder Mensch auf der Welt, und es kann für immer gespeichert bleiben" : "b) Es fließt in deine digitale Reputation ein. Ein respektvolles und ordentliches Veröffentlichen beugt Missverständnissen vor und prägt ein positives digitales Bild von dir.",
                            en: isK2 ? "b) Anyone in the world, and it can stay saved forever" : "b) It integrates into your academic reputation record online. Publishing with respect and formality prevents misunderstandings and models a positive digital identity.",
                            correct: true
                        },
                        {
                            es: isK2 ? "c) Solo las personas que viven en tu misma calle" : "c) Provoca de forma automática la pérdida de los derechos de autor de tu trabajo, haciéndote perder la propiedad de tus ideas escolares.",
                            de: isK2 ? "c) Nur Menschen, die in deiner Straße wohnen" : "c) Es führt zum automatischen Verlust deines Urheberrechts, sodass du die Rechte an deinen schulischen Ideen verlierst.",
                            en: isK2 ? "c) Only people living on your same street" : "c) It automatically causes the loss of the copyright of your work, making you lose ownership of your school ideas.",
                            correct: false
                        }
                    ],
                    hint: {
                        es: "Todo lo que subimos a internet construye nuestra reputación digital. Compartir materiales educativos con orden, respetar las opiniones de tus compañeros y utilizar cuentas seguras proyecta una imagen estudiantil responsable.",
                        de: "Alles, was wir ins Internet hochladen, prägt unseren Ruf im Netz. Das ordentliche Teilen von Lernmaterialien, respektvoller Umgang mit Beiträgen anderer und sichere Logins zeigen ein verantwortungsvolles Verhalten.",
                        en: "Everything we upload to the internet builds our digital reputation. Sharing educational materials orderly, respecting your classmates' opinions, and using secure accounts projects a responsible student image."
                    }
                };
            }
            break;
    }
}

// Main function that constructs the evidence array for a given reto, subject and grade
function generateEvidenceForReto(retoNum, subject, grade) {
    const evidence = [];
    const isK2 = grade === 2;

    for (let q = 1; q <= 6; q++) {
        const qData = getBaseTemplates(retoNum, q, subject, grade);
        if (!qData) continue;

        // Construct unique ID containing reto, subject, grade, question number
        const mainId = `r${retoNum}_${subject}_k${grade}_q${q}`;

        // Create the multiple choice question item
        const mcItem = {
            id: mainId,
            label: qData.label,
            type: "radio_group",
            options: qData.options.map((opt, idx) => {
                return {
                    de: opt.de,
                    en: opt.en,
                    es: opt.es,
                    correct: opt.correct,
                    val: idx
                };
            })
        };

        // If not K2, add the hint property
        if (!isK2 && qData.hint) {
            mcItem.hint = qData.hint;
        }

        evidence.push(mcItem);

        // For K3 to K12, interleave the justification textarea right after each multiple choice
        if (!isK2) {
            evidence.push({
                id: `${mainId}_explain`,
                label: {
                    de: "Kannst du erklären, warum du diese Antwort gewählt hast?",
                    en: "Can you explain why you selected that answer?",
                    es: "¿Puedes explicar por qué seleccionaste esa respuesta?"
                },
                type: "textarea"
            });
        }
    }

    return evidence;
}

module.exports = { generateEvidenceForReto };
