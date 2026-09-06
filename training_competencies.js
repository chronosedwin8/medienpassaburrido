const part2Competencies = [
    {
        num: 0,
        color: '#a21caf',
        grad: '#d946ef',
        emoji: '👤',
        badge: { de: "Kompetenz 0: Das bin ich", en: "Competency 0: This is me", es: "Competencia 0: Este soy yo" },
        title: { de: "Das bin ich - Profilerstellung und Diagnosetest", en: "This is me - Profile Creation and Diagnostic Test", es: "Este soy yo - Creación de Perfil y Evaluación Diagnóstica" },
        objTitle: { de: "🎯 Ziel der Kompetenz", en: "🎯 Objective of the Competency", es: "🎯 Objetivo de la Competencia" },
        objText: { 
            de: "Die Schüler richten ihr persönliches MedienPass-Profil ein, machen sich mit den 6 KMK-Bereichen vertraut und führen eine erste digitale Selbsteinschätzung durch.", 
            en: "Students set up their personal MedienPass profile, familiarize themselves with the 6 KMK competency areas, and complete an initial digital self-assessment.", 
            es: "Los estudiantes configuran su perfil personal de MedienPass, se familiarizan con las 6 áreas de competencias KMK y realizan una autoevaluación digital inicial." 
        },
        devTitle: { de: "🌱 Einführung in die KMK-Kompetenzen (Wie Schüler starten)", en: "🌱 Introduction to KMK Competencies (How students start)", es: "🌱 Introducción a las Competencias KMK (Cómo inician)" },
        devIntro: { 
            de: "Die erste Stufe bereitet die Schüler auf den systematischen Einsatz digitaler Werkzeuge im Unterricht vor:", 
            en: "This initial stage prepares students for the use of digital tools in their coursework:", 
            es: "Esta etapa inicial prepara a los estudiantes para el uso de herramientas digitales en sus clases:" 
        },
        devList: [
            {
                title: { de: "1. Profilerstellung", en: "1. Profile Setup", es: "1. Configuración de Perfil" },
                text: { 
                    de: "Schüler wählen ihren Avatar und konfigurieren ihre grundlegenden Profildaten im MedienPass-System.", 
                    en: "Students select their avatar and configure their basic profile information in the MedienPass system.", 
                    es: "Los estudiantes eligen su avatar y configuran su información básica de perfil en el sistema MedienPass." 
                }
            },
            {
                title: { de: "2. Diagnosetest (Klett)", en: "2. Diagnostic Evaluation (Klett)", es: "2. Evaluación Diagnóstica (Klett)" },
                text: { 
                    de: "Durchführung der Klett-Anfangsbewertung zur Messung des digitalen Ausgangsniveaus.", 
                    en: "Completion of the initial Klett evaluation to measure their baseline digital skills.", 
                    es: "Realización de la evaluación inicial de Klett para medir el nivel de partida de sus habilidades digitales." 
                }
            }
        ],
        hintTitle: { de: "💡 Erwartete Aufgaben in diesem Level (Was Schüler tun)", en: "💡 Expected Tasks in this Level (What students do)", es: "💡 Tareas Esperadas en este Nivel (Qué hace el estudiante)" },
        hintIntro: {
            de: "In diesem Einführungslevel müssen Schüler die Registrierung abschließen und die erste Selbsteinschätzung ausfüllen:",
            en: "In this introductory level, students must complete registration and submit their initial self-assessment:",
            es: "En este nivel introductorio, los estudiantes deben completar el registro y enviar su autoevaluación inicial:"
        },
        hintsList: [
            {
                title: { de: "Einreichung", en: "Submission", es: "Entrega" },
                text: { 
                    de: "Vollständige Profilerstellung und erfolgreicher Abschluss des Diagnosetests auf der Plattform.", 
                    en: "Complete profile creation and successful completion of the diagnostic test on the platform.", 
                    es: "Creación completa del perfil y finalización exitosa de la prueba de diagnóstico en la plataforma." 
                }
            }
        ],
        evalTitle: { de: "⭐ Kriterien für Lehrkräfte", en: "⭐ Teacher Criteria", es: "⭐ Criterios para Docentes" },
        evalText: { 
            de: "Prüfen Sie, ob der Schüler sein Profil korrekt eingerichtet und den Diagnosetest abgeschlossen hat. Vergeben Sie den ersten Stern zur Freischaltung der weiteren Kompetenzen.", 
            en: "Verify that the student has set up their profile and completed the diagnostic. Award the first star to unlock subsequent competencies.", 
            es: "Verifique que el estudiante haya configurado su perfil y completado el diagnóstico. Otorgue la primera estrella para desbloquear las siguientes competencias." 
        }
    },
    {
        num: 1,
        color: "#3b82f6", grad: "#60a5fa", emoji: "🔍",
        badge: { de: "Kompetenz 1: Suchen & Verarbeiten", en: "Competency 1: Search & Process", es: "Competencia 1: Buscar y Procesar" },
        title: { de: "🔍 Suchen, Auswerten und Verwalten von Informationen", en: "🔍 Searching, Evaluating, and Managing Information", es: "🔍 Buscar, Evaluar y Gestionar Información" },
        objTitle: { de: "🎯 Ziel des Retos", en: "🎯 Objective of the Challenge", es: "🎯 Objetivo del Reto" },
        objText: { 
            de: "Die Schüler lernen, gezielte Suchanfragen durchzuführen, die Glaubwürdigkeit von Quellen kritisch zu bewerten und digitale Informationen strukturiert zu speichern.", 
            en: "Students learn to conduct targeted search queries, critically evaluate the credibility of sources, and store digital information in a structured manner.", 
            es: "Los estudiantes aprenden a realizar búsquedas avanzadas, evaluar críticamente la veracidad y credibilidad de las fuentes, y organizar la información digital de forma estructurada." 
        },
        devTitle: { de: "🌱 Kompetenzentwicklung in den Schulfächern (Wie Schüler diese Fähigkeit aktiv aufbauen)", en: "🌱 Competency Development Across Subjects (How students actively build this skill)", es: "🌱 Desarrollo de la Competencia en las Asignaturas (Cómo la van desarrollando activamente)" },
        devIntro: { 
            de: "Die Medienkompetenz entsteht nicht isoliert, sondern durch die kontinuierliche, fachspezifische Anwendung. Hier wird gezeigt, wie dieser Prozess im Deutschunterricht und anderen Fächern abläuft:", 
            en: "Media literacy is not developed in isolation, but through continuous, subject-specific application. Here is how this process unfolds in German class and other curriculum subjects:", 
            es: "La competencia mediática no se desarrolla de forma aislada, sino a través de su aplicación continua en las materias curriculares. A continuación se desglosa cómo se construye este aprendizaje en la materia de Alemán y otras áreas:" 
        },
        devList: [
            {
                title: { de: "1. Enfoque en el Aprendizaje des Deutschen (DaF/DaZ)", en: "1. Focus on Learning German (DaF/DaZ)", es: "1. Enfoque en el Aprendizaje del Alemán (DaF/DaZ)" },
                text: {
                    de: "Schüler nutzen digitale Wörterbücher (z. B. Duden, LEO) und authentische deutsche Nachrichtenportale (z. B. Logo!, DW), um unbekannten Wortschatz im Kontext zu recherchieren. Dabei lernen sie, Synonyme zu vergleichen, grammatikalische Strukturen in Online-Nachschlagewerken zu überprüfen und verlässliche landeskundliche Quellen für Referate auszuwählen.",
                    en: "Students use digital dictionaries (e.g., Duden, LEO) and authentic German news portals (e.g., Logo!, Deutsche Welle) to research unfamiliar vocabulary in context. They learn to compare synonyms, verify grammatical structures in online reference tools, and select reliable cultural sources for presentations.",
                    es: "Los estudiantes emplean diccionarios digitales (ej. Duden, LEO) y portales de noticias auténticos en alemán (ej. Logo!, Deutsche Welle) para investigar vocabulario desconocido en contexto. Aprenden a comparar sinónimos, verificar estructuras gramaticales en herramientas de consulta online y seleccionar fuentes culturales confiables para sus exposiciones."
                }
            },
            {
                title: { de: "2. Entwicklung in anderen Fächern (Naturwissenschaften, Geschichte)", en: "2. Development in Other Subjects (Science, History)", es: "2. Desarrollo en Otras Asignaturas (Ciencias, Historia)" },
                text: {
                    de: "In den Naturwissenschaften recherchieren die Schüler aktuelle Forschungsdaten zu Umweltthemen; in Geschichte vergleichen sie digitale Primärquellen und Archivmaterialien. Sie entwickeln die Fähigkeit, Suchergebnisse nach Relevanz zu filtern und Fakten von Meinungen zu trennen.",
                    en: "In Science, students research current scientific data on environmental topics; in History, they compare digital primary sources and archival materials. They develop the ability to filter search results by relevance and distinguish facts from opinions.",
                    es: "En Ciencias Naturales, los estudiantes investigan datos científicos actualizados sobre temas ambientales; en Historia, comparan fuentes primarias digitales y archivos históricos. Desarrollan la capacidad de filtrar resultados por relevancia y separar hechos comprobados de opiniones."
                }
            },
            {
                title: { de: "3. Kontinuierlicher Entwicklungsprozess (Von der Anleitung zur Autonomie)", en: "3. Continuous Development Process (From Guidance to Autonomy)", es: "3. Proceso de Desarrollo Continuo (De la Guía a la Autonomía)" },
                text: {
                    de: "Der Prozess beginnt in Klasse 5/6 mit vorgegebenen, sicheren Suchmaschinen (z. B. Blinde Kuh, FragFINN) und entwickelt sich in den höheren Klassen zu eigenständigen, komplexen Booleschen Suchanfragen (AND, OR, NOT) in wissenschaftlichen Datenbanken und Online-Bibliotheken.",
                    en: "The process begins in grades 5/6 with pre-selected, child-friendly search engines (e.g., Blinde Kuh, FragFINN) and evolves in higher grades into independent, complex Boolean searches (AND, OR, NOT) across academic databases and online libraries.",
                    es: "El proceso inicia en los grados 5/6 con buscadores seguros y preseleccionados (ej. Blinde Kuh, FragFINN), y evoluciona en los grados superiores hacia búsquedas booleanas complejas (AND, OR, NOT) de forma autónoma en bases de datos académicas y bibliotecas virtuales."
                }
            }
        ],
        hintTitle: { de: "💡 Umfassende Hinweise für Schülerantworten (Was Schüler einreichen sollten)", en: "💡 Extensive Hints for Student Responses (What students should submit)", es: "💡 Pistas Bastante Extensas sobre qué debería responder el estudiante" },
        hintIntro: {
            de: "In diesem Reto müssen die Schüler konkrete Nachweise erbringen, wie sie Informationen für ihre regulären Schulfächer recherchieren und bewerten. Hier sind detaillierte Erwartungen und Beispiele:",
            en: "In this challenge, students must provide concrete evidence of how they research and evaluate information for their regular school subjects. Here are detailed expectations and examples:",
            es: "En este reto, los estudiantes deben presentar evidencias concretas sobre cómo investigan y evalúan información para sus materias regulares. A continuación se detallan las expectativas y ejemplos:"
        },
        hintsList: [
            {
                title: { de: "Erwartete Struktur der Antwort", en: "Expected Response Structure", es: "Estructura de la Respuesta Esperada" },
                text: {
                    de: "Die Schüler sollten konkrete Links zu den von ihnen genutzten Online-Wörterbüchern (z. B. Duden, LEO, Pons), Rechercheportalen oder digitalen Archiven bereitstellen. Sie müssen in 3-5 Sätzen erklären, mit welchen Suchbegriffen (Keywords) sie gearbeitet haben und woran sie erkannt haben, dass die gefundene Quelle verlässlich ist (z. B. Impressum, Autor, Aktualität).",
                    en: "Students should provide specific links to the online dictionaries (e.g., LEO, Pons, Merriam-Webster), research portals, or digital archives they used. They must explain in 3-5 sentences which keywords they used and how they determined that the source was reliable (e.g., checking the author, publication date, domain reputation).",
                    es: "El estudiante debe proporcionar enlaces directos a los diccionarios online (ej. Duden, LEO, RAE), portales académicos o artículos de investigación que utilizó. Debe redactar un párrafo (3-5 oraciones) explicando qué palabras clave empleó en su búsqueda y qué criterios usó para asegurarse de que la fuente no era información falsa o sesgada (ej. verificando el autor, fecha de publicación, reputación del sitio web)."
                }
            },
            {
                title: { de: "Beispiel für den Deutschunterricht", en: "German Subject Example", es: "Ejemplo para la materia de Alemán" },
                text: {
                    de: "Einreichung einer Linkliste und einer kurzen Zusammenfassung über die Recherche zu einem Buchreferat oder einer Charakteranalyse, inklusive Begründung der Quellenauswahl (warum offizielle Seiten statt Wikipedia genutzt wurden).",
                    en: "Submitting a curated link list and a brief summary of research for a book presentation or character analysis, including justification of the chosen sources (why official sites were used instead of Wikipedia).",
                    es: "Presentar una lista de referencias bibliográficas digitales utilizadas para un ensayo o presentación de un libro en alemán, explicando por qué eligió esos sitios web oficiales en lugar de fuentes informales como Wikipedia."
                }
            },
            {
                title: { de: "Beispiel für den Englisch- und Spanischunterricht", en: "English and Spanish Subject Example", es: "Ejemplo para las materias de Inglés y Español" },
                text: {
                    de: "Nutzung verifizierter Quellen für ein Landeskunde-Projekt (z. B. Geschichte oder Kultur) und Speicherung der Dokumente in einer geordneten Cloud-Ordnerstruktur (Screenshot der Ordnerstruktur in OneDrive/Google Drive).",
                    en: "Using verified academic or cultural sources for a geography/history project and organizing the downloaded reference files into a logical cloud folder structure (screenshot of folder hierarchy in OneDrive/Google Drive).",
                    es: "Captura de pantalla o enlace a una carpeta en la nube (OneDrive/Google Drive) donde organizó los archivos PDF y documentos de consulta para su proyecto de historia o cultura, demostrando orden y nomenclatura clara."
                }
            }
        ],
        evalTitle: { de: "⭐ Bewertungskriterien für Lehrkräfte", en: "⭐ Teacher Evaluation Criteria", es: "⭐ Criterios de Evaluación Docente" },
        evalText: {
            de: "Prüfen Sie, ob die Quellen seriös sind und ob der Schüler den Unterschied zwischen einer einfachen Google-Suche und einer qualifizierten Recherche versteht. Vergeben Sie 3 Sterne für eine vollständige, reflektierte Quellenangabe mit Begründung.",
            en: "Check whether the submitted sources are reputable and if the student demonstrates an understanding of evaluating web credibility. Award 3 stars for complete, well-reasoned source documentation.",
            es: "Verifica que los enlaces funcionen, que las fuentes sean confiables y que la justificación del estudiante demuestre pensamiento crítico. Otorga 3 estrellas si la evidencia incluye enlaces válidos y una reflexión sólida sobre la veracidad de la información."
        }
    },
    {
        num: 2,
        color: "#0284c7", grad: "#38bdf8", emoji: "💬",
        badge: { de: "Kompetenz 2: Kommunizieren", en: "Competency 2: Communicate", es: "Competencia 2: Comunicar y Cooperar" },
        title: { de: "💬 Digitale Kommunikation und Zusammenarbeit", en: "💬 Digital Communication and Collaboration", es: "💬 Comunicación Digital y Colaboración" },
        objTitle: { de: "🎯 Ziel des Retos", en: "🎯 Objective of the Challenge", es: "🎯 Objetivo del Reto" },
        objText: { 
            de: "Die Schüler nutzen digitale Kommunikationswerkzeuge verantwortungsvoll, halten die Regeln der Netiquette ein und arbeiten virtuell in Teams zusammen.", 
            en: "Students use digital communication tools responsibly, adhere to netiquette guidelines, and collaborate effectively in virtual teams.", 
            es: "Los estudiantes utilizan herramientas de mensajería y colaboración en la nube de forma ética, respetando la netiqueta y trabajando en equipo de manera asincrónica y sincrónica." 
        },
        devTitle: { de: "🌱 Kompetenzentwicklung in den Schulfächern (Wie Schüler diese Fähigkeit aktiv aufbauen)", en: "🌱 Competency Development Across Subjects (How students actively build this skill)", es: "🌱 Desarrollo de la Competencia en las Asignaturas (Cómo la van desarrollando activamente)" },
        devIntro: { 
            de: "Die Medienkompetenz entsteht nicht isoliert, sondern durch die kontinuierliche, fachspezifische Anwendung. Hier wird gezeigt, wie dieser Prozess im Deutschunterricht und anderen Fächern abläuft:", 
            en: "Media literacy is not developed in isolation, but through continuous, subject-specific application. Here is how this process unfolds in German class and other curriculum subjects:", 
            es: "La competencia mediática no se desarrolla de forma aislada, sino a través de su aplicación continua en las materias curriculares. A continuación se desglosa cómo se construye este aprendizaje en la materia de Alemán y otras áreas:" 
        },
        devList: [
            {
                title: { de: "1. Enfoque en el Aprendizaje des Deutschen (DaF/DaZ)", en: "1. Focus on Learning German (DaF/DaZ)", es: "1. Enfoque en el Aprendizaje del Alemán (DaF/DaZ)" },
                text: {
                    de: "Die Schüler nehmen an asynchronen Forendiskussionen und synchronen Chats auf Deutsch teil (z. B. in MS Teams oder Moodle). Sie üben den formellen und informellen Sprachgebrauch (Sie vs. du), verfassen E-Mails an Lehrkräfte unter Einhaltung deutscher Briefkonventionen und geben ihren Mitschülern konstruktives Peer-Feedback zu Textentwürfen.",
                    en: "Students participate in asynchronous forum discussions and synchronous chats in German (e.g., via MS Teams or Moodle). They practice formal vs. informal register (Sie vs. du), draft emails to teachers following German epistolary conventions, and provide constructive peer feedback on writing drafts.",
                    es: "Los estudiantes participan en foros de discusión asincrónicos y chats sincrónicos en alemán (ej. en MS Teams o Moodle). Practican el registro formal e informal (Sie vs. du), redactan correos a los docentes respetando las convenciones epistolares alemanas y brindan retroalimentación constructiva (peer feedback) a los borradores de sus compañeros."
                }
            },
            {
                title: { de: "2. Entwicklung in anderen Fächern (Mathematik, Kunst)", en: "2. Development in Other Subjects (Mathematics, Art)", es: "2. Desarrollo en Otras Asignaturas (Matemáticas, Arte)" },
                text: {
                    de: "Bei Gruppenprojekten in Mathematik oder Kunst nutzen die Schüler digitale Whiteboards (z. B. Miro, Padlet) und geteilte Cloud-Dokumente, um Lösungswege gemeinsam zu erarbeiten. Sie lernen, Aufgaben digital zu delegieren, Termine abzustimmen und Arbeitsergebnisse transparent zu dokumentieren.",
                    en: "In group projects for Mathematics or Art, students use digital whiteboards (e.g., Miro, Padlet) and shared cloud documents to collaboratively develop solutions. They learn to delegate tasks digitally, coordinate deadlines, and transparently document their workflow.",
                    es: "En proyectos grupales de Matemáticas o Arte, los alumnos emplean pizarras digitales (ej. Miro, Padlet) y documentos compartidos en la nube para trazar soluciones conjuntas. Aprenden a delegar tareas digitalmente, coordinar fechas de entrega y documentar sus acuerdos de forma transparente."
                }
            },
            {
                title: { de: "3. Kontinuierlicher Entwicklungsprozess (Von der Anleitung zur Autonomie)", en: "3. Continuous Development Process (From Guidance to Autonomy)", es: "3. Proceso de Desarrollo Continuo (De la Guía a la Autonomía)" },
                text: {
                    de: "Anfangs lernen die Schüler grundlegende Chat-Regeln und Netiquette im Klassenverband. Mit zunehmender Reife organisieren sie eigenständig virtuelle Arbeitsgruppen, moderieren Online-Meetings und lösen Konflikte innerhalb der digitalen Zusammenarbeit respektvoll und zielorientiert.",
                    en: "Initially, students learn basic chat rules and netiquette in a teacher-moderated setting. As they mature, they independently organize virtual study groups, moderate online meetings, and resolve collaborative conflicts respectfully and productively.",
                    es: "Al inicio, los alumnos asimilan las normas básicas de netiqueta en un entorno moderado por el docente. Con mayor madurez, organizan de forma autónoma grupos de estudio virtuales, moderan reuniones online y resuelven desacuerdos de trabajo con respeto y asertividad."
                }
            }
        ],
        hintTitle: { de: "💡 Umfassende Hinweise für Schülerantworten (Was Schüler einreichen sollten)", en: "💡 Extensive Hints for Student Responses (What students should submit)", es: "💡 Pistas Bastante Extensas sobre qué debería responder el estudiante" },
        hintIntro: {
            de: "Die Schüler sollen demonstrieren, wie sie digitale Tools nutzen, um gemeinsam an Projekten zu arbeiten. Wichtige Elemente der Einreichung sind:",
            en: "Students should demonstrate how they use digital tools to work together on projects. Key elements of the submission include:",
            es: "Los estudiantes deben demostrar cómo utilizan herramientas digitales para trabajar juntos en proyectos. Los elementos clave de la entrega incluyen:"
        },
        hintsList: [
            {
                title: { de: "Erwartete Nachweise", en: "Expected Evidence", es: "Evidencias Esperadas" },
                text: {
                    de: "Die Schüler reichen Screenshots, Chat-Protokolle (anonymisiert) oder Links zu kollaborativen Dokumenten (z. B. geteilte Word-/PowerPoint-Dateien, Padlet, Miro) ein. Sie müssen beschreiben, wie sie die Aufgaben im Team aufgeteilt haben und welche Kommunikationsregeln (Netiquette, höflicher Umgangston, konstruktives Feedback) sie beachtet haben.",
                    en: "Students submit screenshots, anonymized chat summaries, or links to collaborative platforms (e.g., shared Word/PowerPoint docs, Padlet, Miro boards). They must describe how they divided tasks among team members and what communication rules (netiquette, respectful tone, constructive peer feedback) they followed during the project.",
                    es: "El estudiante debe compartir el enlace de un documento colaborativo (Google Docs, Word Online, Padlet, Canva en equipo) o capturas de pantalla de un espacio de trabajo grupal (MS Teams). Debe escribir una reflexión explicando cómo se organizaron, cómo resolvieron desacuerdos de forma respetuosa y qué normas de netiqueta aplicaron."
                }
            },
            {
                title: { de: "Beispiel für den Deutschunterricht", en: "German Subject Example", es: "Ejemplo para la materia de Alemán" },
                text: {
                    de: "Einreichung eines gemeinsam erstellten Dialogs, einer Debattenvorbereitung oder einer Gruppenpräsentation, bei der die Schüler über MS Teams oder geteilte Dokumente asynchron zusammengearbeitet haben (inklusive Versionsverlauf oder gegenseitigen Kommentaren).",
                    en: "Submitting a co-authored dialogue, debate preparation script, or group presentation where students collaborated asynchronously via MS Teams or shared cloud documents (including version history or peer comments).",
                    es: "Entregar un guion de debate o una presentación grupal donde se evidencie el historial de versiones o los comentarios constructivos realizados entre compañeros para mejorar el texto en Alemán, Inglés o Español."
                }
            }
        ],
        evalTitle: { de: "⭐ Bewertungskriterien für Lehrkräfte", en: "⭐ Teacher Evaluation Criteria", es: "⭐ Criterios de Evaluación Docente" },
        evalText: {
            de: "Achten Sie auf den Nachweis echter Teamarbeit und den respektvollen Umgangston in der digitalen Kommunikation. Vergeben Sie 3 Sterne bei klarer, gut koordinierter Zusammenarbeit und reflektierter Netiquette.",
            en: "Look for evidence of active teamwork and a respectful digital tone. Award 3 stars for clear, well-coordinated group work and a strong understanding of professional digital communication.",
            es: "Evalúa la participación activa en el documento compartido y el tono respetuoso en la comunicación. Otorga 3 estrellas si se evidencia un verdadero trabajo colaborativo y una aplicación consciente de las normas de convivencia digital."
        }
    },
    {
        num: 3,
        color: "#9333ea", grad: "#c084fc", emoji: "🎨",
        badge: { de: "Kompetenz 3: Produzieren", en: "Competency 3: Produce", es: "Competencia 3: Producir y Presentar" },
        title: { de: "🎨 Digitale Inhalte erstellen und präsentieren", en: "🎨 Creating and Presenting Digital Content", es: "🎨 Producir y Presentar Contenidos Digitales" },
        objTitle: { de: "🎯 Ziel des Retos", en: "🎯 Objective of the Challenge", es: "🎯 Objetivo del Reto" },
        objText: { 
            de: "Die Schüler erstellen kreative digitale Medien (Texte, Präsentationen, Audio, Video) und berücksichtigen dabei rechtliche und gestalterische Vorgaben (Urheberrecht, CC-Lizenzen).", 
            en: "Students create creative digital media (texts, presentations, audio, video) while adhering to legal and design standards (copyright, Creative Commons licenses).", 
            es: "Los estudiantes diseñan, editan y publican contenidos multimedia atractivos (videos, podcasts, infografías, presentaciones), aplicando principios de diseño y respetando estrictamente los derechos de autor." 
        },
        devTitle: { de: "🌱 Kompetenzentwicklung in den Schulfächern (Wie Schüler diese Fähigkeit aktiv aufbauen)", en: "🌱 Competency Development Across Subjects (How students actively build this skill)", es: "🌱 Desarrollo de la Competencia en las Asignaturas (Cómo la van desarrollando activamente)" },
        devIntro: { 
            de: "Die Medienkompetenz entsteht nicht isoliert, sondern durch die kontinuierliche, fachspezifische Anwendung. Hier wird gezeigt, wie dieser Prozess im Deutschunterricht und anderen Fächern abläuft:", 
            en: "Media literacy is not developed in isolation, but through continuous, subject-specific application. Here is how this process unfolds in German class and other curriculum subjects:", 
            es: "La competencia mediática no se desarrolla de forma aislada, sino a través de su aplicación continua en las materias curriculares. A continuación se desglosa cómo se construye este aprendizaje en la materia de Alemán y otras áreas:" 
        },
        devList: [
            {
                title: { de: "1. Enfoque en el Aprendizaje des Deutschen (DaF/DaZ)", en: "1. Focus on Learning German (DaF/DaZ)", es: "1. Enfoque en el Aprendizaje del Alemán (DaF/DaZ)" },
                text: {
                    de: "Schüler produzieren deutschsprachige Podcasts, Erklärvideos und digitale Portfolios (z. B. mit Book Creator oder Canva). Durch das Schreiben von Drehbüchern, das Einsprechen von Texten und das anschließende Schneiden verbessern sie gezielt ihre Aussprache, Intonation und schriftliche Ausdrucksweise im Deutschen.",
                    en: "Students produce German-language podcasts, explainer videos, and digital portfolios (e.g., using Book Creator or Canva). By writing scripts, recording audio voiceovers, and editing media, they specifically improve their German pronunciation, intonation, and written expression.",
                    es: "Los estudiantes producen podcasts, videos explicativos y portafolios digitales en alemán (ej. con Book Creator o Canva). Al redactar guiones, grabar locuciones de audio y editar el material multimedia, perfeccionan activamente su pronunciación, entonación y fluidez escrita en el idioma alemán."
                }
            },
            {
                title: { de: "2. Entwicklung in anderen Fächern (Musik, Geografie)", en: "2. Development in Other Subjects (Music, Geography)", es: "2. Desarrollo en Otras Asignaturas (Música, Geografía)" },
                text: {
                    de: "In Musik komponieren sie digitale Jingles; in Geografie gestalten sie interaktive Karten und Infografiken zur Bevölkerungsentwicklung. Sie lernen, komplexe Sachverhalte zielgruppengerecht zu visualisieren und multimodale Präsentationstechniken einzusetzen.",
                    en: "In Music, they compose digital jingles; in Geography, they design interactive maps and infographics on population dynamics. They learn to visualize complex topics for specific target audiences and utilize multimodal presentation techniques.",
                    es: "En Música, componen pistas y jingles digitales; en Geografía, diseñan mapas interactivos e infografías sobre dinámicas poblacionales. Aprenden a sintetizar temas complejos visualmente para audiencias específicas utilizando técnicas de presentación multimodal."
                }
            },
            {
                title: { de: "3. Kontinuierlicher Entwicklungsprozess (Von der Anleitung zur Autonomie)", en: "3. Continuous Development Process (From Guidance to Autonomy)", es: "3. Proceso de Desarrollo Continuo (De la Guía a la Autonomía)" },
                text: {
                    de: "Die Entwicklung startet mit dem einfachen Formatieren von Texten und Einfügen von Bildern in Klasse 5. Später beherrschen die Schüler den gesamten Produktionszyklus: von der Konzeption über das Storyboarding und die Beachtung von Creative-Commons-Lizenzen bis hin zur Veröffentlichung vor einem realen Publikum.",
                    en: "Development starts with basic text formatting and inserting images in grade 5. Later, students master the entire production lifecycle: from ideation and storyboarding to ensuring Creative Commons compliance and publishing to a real-world audience.",
                    es: "El desarrollo comienza con el formateo básico de textos e inserción de imágenes en 5° grado. Posteriormente, dominan el ciclo de producción completo: desde la ideación y el guion gráfico (storyboarding), asegurando el cumplimiento de licencias Creative Commons, hasta la publicación final ante una audiencia real."
                }
            }
        ],
        hintTitle: { de: "💡 Umfassende Hinweise für Schülerantworten (Was Schüler einreichen sollten)", en: "💡 Extensive Hints for Student Responses (What students should submit)", es: "💡 Pistas Bastante Extensas sobre qué debería responder el estudiante" },
        hintIntro: {
            de: "Hier steht die kreative und rechtlich saubere Medienproduktion im Vordergrund. Die Schüler sollten folgende Aspekte abdecken:",
            en: "This challenge focuses on creative and legally compliant media production. Students should cover the following aspects:",
            es: "Este reto se enfoca en la producción multimedia creativa y legalmente impecable. Los estudiantes deben cubrir los siguientes aspectos:"
        },
        hintsList: [
            {
                title: { de: "Erwartetes Produkt und Erklärung", en: "Expected Product and Explanation", es: "Producto Esperado y Explicación" },
                text: {
                    de: "Einreichung eines Links oder einer Datei zu einem fertigen digitalen Produkt (z. B. ein Podcast, ein Erklärvideo, ein interaktives Poster in Canva, eine formatierte Präsentation). Die Schüler müssen erklären, welche Software sie genutzt haben, warum sie dieses Format gewählt haben und wie sie sichergestellt haben, dass alle verwendeten Bilder/Musikstücke lizenzfrei (Creative Commons) sind.",
                    en: "Submitting a link or file to a completed digital product (e.g., a podcast episode, an explainer video, an interactive Canva poster, a well-formatted slide deck). Students must explain which software they used, why they chose that specific format, and how they ensured that all images, icons, or music used are royalty-free or properly licensed under Creative Commons.",
                    es: "El estudiante debe proporcionar la URL pública o el archivo de su creación digital (video de YouTube/Flipgrid, podcast, infografía en Canva/Genially o presentación avanzada). En el texto explicativo, debe detallar qué herramientas empleó, sus decisiones de diseño (paleta, tipografía) y presentar una tabla declarando el origen y licencia (Creative Commons/Dominio Público) de cada imagen o pista musical utilizada."
                }
            },
            {
                title: { de: "Beispiele aus dem Unterricht", en: "Classroom Examples", es: "Ejemplos de Clase" },
                text: {
                    de: "Ein Video-Booktrailer im Deutschunterricht, ein Erklär-Podcast über historische Ereignisse auf Englisch oder eine digitale Schülerzeitung auf Spanisch, jeweils ohne urheberrechtlich geschützte Fremdmaterialien.",
                    en: "A video book trailer in German class, an explainer podcast about historical events in English, or a digital student newspaper in Spanish, all free of uncredited copyrighted material.",
                    es: "Un reportaje en video sobre un tema histórico o cultural en Alemán/Inglés, o un boletín digital escolar en Español, donde no se utilicen imágenes protegidas con marca de agua."
                }
            }
        ],
        evalTitle: { de: "⭐ Bewertungskriterien für Lehrkräfte", en: "⭐ Teacher Evaluation Criteria", es: "⭐ Criterios de Evaluación Docente" },
        evalText: {
            de: "Beurteilen Sie die Qualität der Gestaltung, die technische Umsetzung und vor allem die korrekte Angabe von Bild- und Tonrechten. Vergeben Sie 3 Sterne für ein visuell ansprechendes Produkt mit einwandfreiem Urheberrechtsnachweis.",
            en: "Assess the design quality, technical execution, and strict adherence to copyright laws. Award 3 stars for a visually polished product with impeccable licensing attribution.",
            es: "Revisa la creatividad, el esfuerzo técnico en la edición y la rigurosidad en el respeto al derecho de autor. Otorga 3 estrellas si el producto es de alta calidad y cuenta con una atribución de licencias perfecta y transparente."
        }
    },
    {
        num: 4,
        color: "#d97706", grad: "#fbbf24", emoji: "🛡️",
        badge: { de: "Kompetenz 4: Schützen", en: "Competency 4: Protect", es: "Competencia 4: Proteger y Seguro" },
        title: { de: "🛡️ Schutz von Daten, Privatsphäre und Gesundheit", en: "🛡️ Protecting Data, Privacy, and Health", es: "🛡️ Protección de Datos, Privacidad y Bienestar" },
        objTitle: { de: "🎯 Ziel des Retos", en: "🎯 Objective of the Challenge", es: "🎯 Objetivo del Reto" },
        objText: { 
            de: "Die Schüler verstehen die Bedeutung starken Passwörter, Datenschutzeinstellungen, der Vermeidung von Cybermobbing und der Wahrung einer gesunden Bildschirmzeit (Ergonomie und digitale Balance).", 
            en: "Students understand the importance of strong passwords, privacy settings, preventing cyberbullying, and maintaining a healthy balance regarding screen time and ergonomics.", 
            es: "Los estudiantes implementan estrategias prácticas para proteger su identidad digital, configurar la privacidad de sus redes, prevenir riesgos como el phishing o ciberacoso, y mantener un equilibrio saludable frente a las pantallas." 
        },
        devTitle: { de: "🌱 Kompetenzentwicklung in den Schulfächern (Wie Schüler diese Fähigkeit aktiv aufbauen)", en: "🌱 Competency Development Across Subjects (How students actively build this skill)", es: "🌱 Desarrollo de la Competencia en las Asignaturas (Cómo la van desarrollando activamente)" },
        devIntro: { 
            de: "Die Medienkompetenz entsteht nicht isoliert, sondern durch die kontinuierliche, fachspezifische Anwendung. Hier wird gezeigt, wie dieser Prozess im Deutschunterricht und anderen Fächern abläuft:", 
            en: "Media literacy is not developed in isolation, but through continuous, subject-specific application. Here is how this process unfolds in German class and other curriculum subjects:", 
            es: "La competencia mediática no se desarrolla de forma aislada, sino a través de su aplicación continua en las materias curriculares. A continuación se desglosa cómo se construye este aprendizaje en la materia de Alemán y otras áreas:" 
        },
        devList: [
            {
                title: { de: "1. Enfoque en el Aprendizaje des Deutschen (DaF/DaZ)", en: "1. Focus on Learning German (DaF/DaZ)", es: "1. Enfoque en el Aprendizaje del Alemán (DaF/DaZ)" },
                text: {
                    de: "Im Deutschunterricht analysieren die Schüler Fallbeispiele und Lektüren zum Thema Cybermobbing und Datenschutz (z. B. in Jugendromanen). Sie formulieren auf Deutsch Verhaltensregeln für soziale Netzwerke, debattieren über das Recht auf das eigene Bild und lernen das entsprechende deutsche Fachvokabular (z. B. Urheberrecht, Privatsphäre, Verschlüsselung).",
                    en: "In German class, students analyze case studies and literature regarding cyberbullying and data privacy (e.g., in youth novels). They articulate behavioral guidelines for social networks in German, debate the right to personal image, and acquire relevant German terminology (e.g., Urheberrecht, Privatsphäre, Verschlüsselung).",
                    es: "En la clase de Alemán, los alumnos analizan estudios de caso y lecturas juveniles sobre ciberacoso y privacidad de datos. Redactan en alemán normas de convivencia para redes sociales, debaten sobre el derecho a la propia imagen y adquieren vocabulario técnico clave (ej. Urheberrecht, Privatsphäre, Verschlüsselung)."
                }
            },
            {
                title: { de: "2. Entwicklung in anderen Fächern (Biologie, Ethik)", en: "2. Development in Other Subjects (Biology, Ethics)", es: "2. Desarrollo en Otras Asignaturas (Biología, Ética)" },
                text: {
                    de: "In Biologie und Sport untersuchen sie die Auswirkungen von blauem Licht und Bewegungsmangel auf den Körper und erarbeiten ergonomische Richtlinien für den Arbeitsplatz. In Ethik diskutieren sie über den gläsernen Menschen und die ethischen Grenzen der Datensammlung durch Großkonzerne.",
                    en: "In Biology and Physical Education, they study the physical impacts of blue light and sedentary habits, establishing ergonomic guidelines for digital workstations. In Ethics, they discuss digital surveillance and the ethical boundaries of corporate data harvesting.",
                    es: "En Biología y Educación Física, investigan el impacto de la luz azul y el sedentarismo en el cuerpo, elaborando pautas ergonómicas para el uso de pantallas. En Ética, reflexionan sobre la vigilancia digital y los límites éticos de la recolección de datos por parte de las grandes corporaciones."
                }
            },
            {
                title: { de: "3. Kontinuierlicher Entwicklungsprozess (Von der Anleitung zur Autonomie)", en: "3. Continuous Development Process (From Guidance to Autonomy)", es: "3. Proceso de Desarrollo Continuo (De la Guía a la Autonomía)" },
                text: {
                    de: "Zunächst übernehmen die Lehrkräfte die Kontoeinrichtung und Sicherheitsvorgaben. Schrittweise lernen die Schüler, ihre Passwörter selbstständig zu verwalten (z. B. 2FA), Phishing-Versuche im Schulalltag zu erkennen und ihre Bildschirmzeit aktiv und gesund zu regulieren.",
                    en: "Initially, teachers manage account setup and security parameters. Step-by-step, students learn to independently manage their passwords (e.g., 2FA), recognize phishing attempts in daily school life, and actively regulate their screen time for optimal digital wellness.",
                    es: "Al principio, los docentes gestionan la configuración de cuentas y parámetros de seguridad. De forma progresiva, los estudiantes aprenden a administrar sus contraseñas autónomamente (ej. 2FA), identificar intentos de phishing en el entorno escolar y autorregular su tiempo de pantalla para un bienestar digital óptimo."
                }
            }
        ],
        hintTitle: { de: "💡 Umfassende Hinweise für Schülerantworten (Was Schüler einreichen sollten)", en: "💡 Extensive Hints for Student Responses (What students should submit)", es: "💡 Pistas Bastante Extensas sobre qué debería responder el estudiante" },
        hintIntro: {
            de: "Sicherheit und Wohlbefinden sind zentrale Kompetenzen. Die Einreichung sollte konkrete Schutzmaßnahmen und Selbstreflexion enthalten:",
            en: "Security and wellness are core competencies. The submission should contain concrete protective measures and self-reflection:",
            es: "La seguridad y el bienestar son competencias centrales. La entrega debe contener medidas de protección concretas y autorreflexión:"
        },
        hintsList: [
            {
                title: { de: "Sicherheits- und Ergonomiebericht", en: "Security and Ergonomics Report", es: "Informe de Seguridad y Ergonomía" },
                text: {
                    de: "Die Schüler reichen eine Reflexion oder einen Aktionsplan ein. Sie beschreiben konkrete Maßnahmen, die sie ergriffen haben, um ihre Konten zu sichern (z. B. Aktivierung der 2-Faktor-Authentifizierung, Erstellung sicherer Passwörter mit Eselsbrücken, Überprüfung der Datenschutzeinstellungen in sozialen Medien). Zudem sollen sie ihre tägliche Bildschirmzeit analysieren und 3 persönliche Regeln für eine gesunde digitale Balance formulieren.",
                    en: "Students submit a reflection paper or a personal action plan. They must describe specific steps they took to secure their digital accounts (e.g., enabling two-factor authentication, creating strong passphrases, auditing privacy settings on social media). Furthermore, they should analyze their daily screen time and establish 3 personal rules for maintaining healthy digital habits and posture.",
                    es: "El estudiante debe redactar un informe de autoevaluación. Debe explicar qué métodos utiliza para gestionar sus contraseñas (gestores, 2FA), cómo tiene configurada la privacidad en sus perfiles sociales y presentar un análisis de su tiempo de pantalla semanal acompañado de un compromiso personal de 3 reglas para evitar la fatiga visual (ej. regla 20-20-20, desconexión antes de dormir)."
                }
            },
            {
                title: { de: "Praxisbeispiel", en: "Practical Example", es: "Ejemplo Práctico" },
                text: {
                    de: "Ein kurzer Ratgeber oder ein Plakat auf Deutsch oder Spanisch über die Gefahren von Phishing und Tipps zum Schutz persönlicher Daten im Schulnetzwerk.",
                    en: "A brief guide or poster in German or Spanish identifying common phishing scams and providing peer advice on safeguarding personal data within the school network.",
                    es: "Un decálogo o manual de ciberseguridad y ergonomía elaborado para sus compañeros de clase en Alemán, Inglés o Español."
                }
            }
        ],
        evalTitle: { de: "⭐ Bewertungskriterien für Lehrkräfte", en: "⭐ Teacher Evaluation Criteria", es: "⭐ Criterios de Evaluación Docente" },
        evalText: {
            de: "Überprüfen Sie das Bewusstsein des Schülers für IT-Sicherheit und digitale Gesundheit. Vergeben Sie 3 Sterne für fundierte, praxisnahe Sicherheitsmaßnahmen und eine ehrliche Selbstreflexion zur Bildschirmzeit.",
            en: "Evaluate the student's awareness of cybersecurity risks and digital wellness. Award 3 stars for highly practical, detailed security protocols and a mature reflection on screen habits.",
            es: "Valora la profundidad del análisis de seguridad y la viabilidad de sus metas de bienestar. Otorga 3 estrellas si el estudiante demuestra acciones concretas de protección de datos y una clara conciencia sobre su salud física y mental."
        }
    },
    {
        num: 5,
        color: "#dc2626", grad: "#f87171", emoji: "⚙️",
        badge: { de: "Kompetenz 5: Problemlösen", en: "Competency 5: Problem Solving", es: "Competencia 5: Resolver Problemas" },
        title: { de: "⚙️ Technische Probleme lösen und Algorithmen verstehen", en: "⚙️ Solving Technical Problems and Understanding Algorithms", es: "⚙️ Resolución de Problemas Técnicos y Algoritmos" },
        objTitle: { de: "🎯 Ziel des Retos", en: "🎯 Objective of the Challenge", es: "🎯 Objetivo del Reto" },
        objText: { 
            de: "Die Schüler identifizieren technische Probleme bei Geräten oder Software, finden selbstständig Lösungsstrategien und verstehen grundlegende Funktionsweisen von Algorithmen und digitalen Systemen.", 
            en: "Students identify technical issues with devices or software, independently research troubleshooting strategies, and understand the basic principles of algorithms and digital systems.", 
            es: "Los estudiantes desarrollan autonomía para identificar y solucionar fallos técnicos en hardware y software, además de aplicar el pensamiento lógico-computacional para diseñar algoritmos y automatizar procesos." 
        },
        devTitle: { de: "🌱 Kompetenzentwicklung in den Schulfächern (Wie Schüler diese Fähigkeit aktiv aufbauen)", en: "🌱 Competency Development Across Subjects (How students actively build this skill)", es: "🌱 Desarrollo de la Competencia en las Asignaturas (Cómo la van desarrollando activamente)" },
        devIntro: { 
            de: "Die Medienkompetenz entsteht nicht isoliert, sondern durch die kontinuierliche, fachspezifische Anwendung. Hier wird gezeigt, wie dieser Prozess im Deutschunterricht und anderen Fächern abläuft:", 
            en: "Media literacy is not developed in isolation, but through continuous, subject-specific application. Here is how this process unfolds in German class and other curriculum subjects:", 
            es: "La competencia mediática no se desarrolla de forma aislada, sino a través de su aplicación continua en las materias curriculares. A continuación se desglosa cómo se construye este aprendizaje en la materia de Alemán y otras áreas:" 
        },
        devList: [
            {
                title: { de: "1. Enfoque en el Aprendizaje des Deutschen (DaF/DaZ)", en: "1. Focus on Learning German (DaF/DaZ)", es: "1. Enfoque en el Aprendizaje del Alemán (DaF/DaZ)" },
                text: {
                    de: "Wenn technische Probleme in Lernplattformen (z. B. Antolin, Moodle) auftreten, lernen die Schüler, Fehlermeldungen auf Deutsch genau zu lesen und zu verstehen. Sie verfassen präzise, deutschsprachige Support-Anfragen oder Fehlerbeschreibungen für die Schul-IT und nutzen deutschsprachige Hilfe-Foren, um Lösungen für Softwareprobleme zu finden.",
                    en: "When technical issues arise in learning platforms (e.g., Antolin, Moodle), students learn to read and understand German error messages accurately. They write precise support requests or bug descriptions in German for the school IT department and consult German-language help forums to find software solutions.",
                    es: "Cuando surgen inconvenientes técnicos en plataformas de aprendizaje (ej. Antolin, Moodle), los alumnos aprenden a interpretar correctamente los mensajes de error en alemán. Redactan solicitudes de soporte o descripciones de fallos precisas en alemán para el departamento de TI escolar y consultan foros de ayuda en alemán para encontrar soluciones."
                }
            },
            {
                title: { de: "2. Entwicklung in anderen Fächern (Informatik, Mathematick)", en: "2. Development in Other Subjects (Computer Science, Mathematics)", es: "2. Desarrollo en Otras Asignaturas (Informática, Matemáticas)" },
                text: {
                    de: "In Mathematik und Informatik zerlegen die Schüler komplexe Problemstellungen in kleinere, logische Teilschritte (Computational Thinking). Sie programmieren Algorithmen (z. B. in Scratch oder Python), um mathematische Formeln zu veranschaulichen oder naturwissenschaftliche Messreihen automatisiert auszuwerten.",
                    en: "In Mathematics and Computer Science, students break down complex problem sets into smaller, logical sub-steps (Computational Thinking). They program algorithms (e.g., in Scratch or Python) to visualize mathematical formulas or automate the analysis of scientific data series.",
                    es: "En Matemáticas e Informática, los alumnos descomponen problemas complejos en pasos lógicos más pequeños (Pensamiento Computacional). Programan algoritmos (ej. en Scratch o Python) para ilustrar fórmulas matemáticas o automatizar el análisis de series de datos científicos."
                }
            },
            {
                title: { de: "3. Kontinuierlicher Entwicklungsprozess (Von der Anleitung zur Autonomie)", en: "3. Continuous Development Process (From Guidance to Autonomy)", es: "3. Proceso de Desarrollo Continuo (De la Guía a la Autonomía)" },
                text: {
                    de: "In den unteren Klassen rufen die Schüler bei jedem Fehler nach der Lehrkraft. Durch gezieltes Training entwickeln sie eine systematische Troubleshooting-Routine (z. B. Kabel prüfen, Neustart, Cache leeren) und erlangen die Frustrationstoleranz, um Programmierfehler (Bugs) selbstständig zu beheben.",
                    en: "In lower grades, students immediately call for the teacher when an error occurs. Through targeted training, they develop a systematic troubleshooting routine (e.g., checking cables, restarting, clearing cache) and build the resilience required to debug coding errors independently.",
                    es: "En los grados inferiores, los alumnos acuden al docente ante cualquier fallo. Mediante un entrenamiento guiado, desarrollan una rutina sistemática de resolución de problemas (ej. verificar conexiones, reiniciar, limpiar caché) y adquieren la tolerancia a la frustración necesaria para depurar errores de código (bugs) por sí mismos."
                }
            }
        ],
        hintTitle: { de: "💡 Umfassende Hinweise für Schülerantworten (Was Schüler einreichen sollten)", en: "💡 Extensive Hints for Student Responses (What students should submit)", es: "💡 Pistas Bastante Extensas sobre qué debería responder el estudiante" },
        hintIntro: {
            de: "Dieser Reto verbindet technisches Troubleshooting mit logischem Denken. Die Schüler können aus zwei Schwerpunkten wählen:",
            en: "This challenge combines technical troubleshooting with logical thinking. Students can choose between two main focus areas:",
            es: "Este reto combina el soporte técnico con el pensamiento lógico. Los estudiantes pueden elegir entre dos enfoques principales:"
        },
        hintsList: [
            {
                title: { de: "Option A: Troubleshooting-Logbuch", en: "Option A: Troubleshooting Log", es: "Opción A: Bitácora de Soporte Técnico" },
                text: {
                    de: "Die Schüler reichen einen Problemlösungsbericht ein. Sie beschreiben ein konkretes technisches Problem, das während eines Schulprojekts auftrat (z. B. Mikrofon funktioniert nicht, Datei lässt sich nicht exportieren, Formatierungsfehler), und erklären Schritt für Schritt, wie sie die Ursache analysiert und das Problem gelöst haben (z. B. durch Nutzung von Hilfeforen, Neustart, Treiberprüfung).",
                    en: "Students submit a troubleshooting log. They describe a specific technical obstacle encountered during a school assignment (e.g., audio interface failure, file export corruption, formatting inconsistencies) and explain step-by-step how they diagnosed and resolved the issue (e.g., consulting documentation, checking system settings, debugging).",
                    es: "Una bitácora donde narre un problema real que enfrentó al usar su dispositivo en el colegio (ej. pérdida de Wi-Fi, error al sincronizar en la nube, incompatibilidad de archivos) y detalle los pasos lógicos que siguió para investigarlo y solucionarlo sin ayuda de un adulto."
                }
            },
            {
                title: { de: "Option B: Programmier- oder Algorithmusprojekt", en: "Option B: Coding or Algorithm Project", es: "Opción B: Proyecto de Programación o Algoritmos" },
                text: {
                    de: "Einreichung eines kleinen Programmierprojekts (z. B. Scratch, Calliope, Python) oder eines Flussdiagramms. Die Schüler erklären die Logik hinter ihrem Code, welche Variablen genutzt wurden und wie sie Fehler (Bugs) behoben haben.",
                    en: "Submitting a small coding project (e.g., Scratch, Calliope, Python) or a logical flowchart. Students explain the logic behind their code, the variables used, and how they debugged errors.",
                    es: "Un proyecto de programación o diagrama de flujo (en Scratch, Python o diagramas lógicos) explicando el objetivo del algoritmo, las variables utilizadas y cómo depuró los errores (bugs) encontrados."
                }
            }
        ],
        evalTitle: { de: "⭐ Bewertungskriterien für Lehrkräfte", en: "⭐ Teacher Evaluation Criteria", es: "⭐ Criterios de Evaluación Docente" },
        evalText: {
            de: "Achten Sie auf die Systematik bei der Fehlersuche und das logische Denkvermögen. Vergeben Sie 3 Sterne für eine präzise, eigenständige Problemanalyse und eine erfolgreiche, dokumentierte Lösung.",
            en: "Evaluate the student's systematic approach to debugging and logical problem-solving skills. Award 3 stars for a clear, independent diagnostic process and a well-documented technical solution.",
            es: "Revisa la resiliencia frente a los fallos técnicos y la claridad en la explicación del proceso de solución. Otorga 3 estrellas si el estudiante demuestra un razonamiento lógico estructurado y una solución efectiva y documentada."
        }
    },
    {
        num: 6,
        color: "#059669", grad: "#34d399", emoji: "🧠",
        badge: { de: "Kompetenz 6: Analysieren", en: "Competency 6: Analyze", es: "Kompetencia 6: Analizar y Reflexionar" },
        title: { de: "🧠 Medienanalyse und kritische Reflexion", en: "🧠 Media Analysis and Critical Reflection", es: "🧠 Análisis de Medios y Reflexión Crítica" },
        objTitle: { de: "🎯 Ziel des Retos", en: "🎯 Objective of the Challenge", es: "🎯 Objetivo del Reto" },
        objText: { 
            de: "Die Schüler analysieren die Wirkung von Medien, erkennen Mechanismen von Algorithmen (Filterblasen, Fake News, KI-generierte Inhalte) und reflektieren den Einfluss der Digitalisierung auf die Gesellschaft und die eigene Identität.", 
            en: "Students analyze the impact of media, recognize algorithmic mechanisms (filter bubbles, echo chambers, fake news, AI-generated content), and reflect on how digitalization influences society and personal identity.", 
            es: "Los estudiantes evalúan críticamente la influencia de los medios y redes sociales, comprenden el funcionamiento de los algoritmos (burbujas de filtro, cámaras de eco, IA, fake news) y reflexionan sobre el activismo y el impacto ético de la tecnología." 
        },
        devTitle: { de: "🌱 Kompetenzentwicklung in den Schulfächern (Wie Schüler diese Fähigkeit aktiv aufbauen)", en: "🌱 Competency Development Across Subjects (How students actively build this skill)", es: "🌱 Desarrollo de la Competencia en las Asignaturas (Cómo la van desarrollando activamente)" },
        devIntro: { 
            de: "Die Medienkompetenz entsteht nicht isoliert, sondern durch die kontinuierliche, fachspezifische Anwendung. Hier wird gezeigt, wie dieser Prozess im Deutschunterricht und anderen Fächern abläuft:", 
            en: "Media literacy is not developed in isolation, but through continuous, subject-specific application. Here is how this process unfolds in German class and other curriculum subjects:", 
            es: "La competencia mediática no se desarrolla de forma aislada, sino a través de su aplicación continua en las materias curriculares. A continuación se desglosa cómo se construye este aprendizaje en la materia de Alemán y otras áreas:" 
        },
        devList: [
            {
                title: { de: "1. Enfoque en el Aprendizaje des Deutschen (DaF/DaZ)", en: "1. Focus on Learning German (DaF/DaZ)", es: "1. Enfoque en el Aprendizaje del Alemán (DaF/DaZ)" },
                text: {
                    de: "Im fortgeschrittenen Deutschunterricht untersuchen die Schüler die Sprache der Medien: Sie analysieren Framing, manipulative Rhetorik und Clickbaiting in deutschen Online-Artikeln und Social-Media-Beiträgen. Sie verfassen argumentative Essays auf Deutsch über den Einfluss von Algorithmen und Künstlicher Intelligenz auf die Meinungsbildung.",
                    en: "In advanced German classes, students examine the language of media: they analyze framing, manipulative rhetoric, and clickbait in German online articles and social media posts. They write argumentative essays in German examining the influence of algorithms and Artificial Intelligence on public opinion.",
                    es: "En las clases avanzadas de Alemán, los estudiantes examinan el lenguaje de los medios: analizan el encuadre (framing), la retórica manipuladora y el clickbait en artículos online y publicaciones de redes sociales en alemán. Redactan ensayos argumentativos en alemán sobre la influencia de los algoritmos y la Inteligencia Artificial en la opinión pública."
                }
            },
            {
                title: { de: "2. Entwicklung in anderen Fächern (Geschichte, Politik)", en: "2. Development in Other Subjects (History, Politics)", es: "2. Desarrollo en Otras Asignaturas (Historia, Política)" },
                text: {
                    de: "In Geschichte und Politik analysieren sie historische und moderne Propaganda, vergleichen die Berichterstattung internationaler Medien zu geopolitischen Konflikten und dekonstruieren Fake News sowie Deepfakes mithilfe digitaler Verifikationstools (z. B. Bild-Rückwärtssuche).",
                    en: "In History and Politics, they analyze historical and modern propaganda, compare international media coverage of geopolitics conflicts, and deconstruct fake news and deepfakes using digital verification tools (e.g., reverse image search).",
                    es: "En Historia y Política, analizan la propaganda histórica y contemporánea, comparan la cobertura de medios internacionales sobre conflictos geopolíticos y deconstruyen fake news y deepfakes utilizando herramientas digitales de verificación (ej. búsqueda inversa de imágenes)."
                }
            },
            {
                title: { de: "3. Kontinuierlicher Entwicklungsprozess (Von der Anleitung zur Autonomie)", en: "3. Continuous Development Process (From Guidance to Autonomy)", es: "3. Proceso de Desarrollo Continuo (De la Guía a la Autonomía)" },
                text: {
                    de: "Die Schüler wechseln von einer unreflektierten, passiven Medienkonsumhaltung in der Erprobungsstufe zu einer hochgradig kritischen, analytischen Perspektive in der Oberstufe. Sie verstehen die ökonomischen und technischen Mechanismen hinter digitalen Plattformen und können ihr eigenes Mediennutzungsverhalten ethisch fundiert reflektieren.",
                    en: "Students transition from unreflective, passive media consumption in middle school to a highly critical, analytical perspective in high school. They understand the economic and mechanisms behind digital platforms and can reflect on their personal media habits from a mature ethical standpoint.",
                    es: "Los alumnos transitan de un consumo mediático pasivo e irreflexivo en la escuela media hacia una perspectiva altamente crítica y analítica en la secundaria superior. Comprenden los mecanismos económicos y técnicos detrás de las plataformas digitales y reflexionan sobre sus propios hábitos de consumo desde una postura ética madura."
                }
            }
        ],
        hintTitle: { de: "💡 Umfassende Hinweise für Schülerantworten (Was Schüler einreichen sollten)", en: "💡 Extensive Hints for Student Responses (What students should submit)", es: "💡 Pistas Bastante Extensas sobre qué debería responder el estudiante" },
        hintIntro: {
            de: "Die höchste Stufe der Medienkompetenz erfordert tiefgründiges, kritisches Denken. Die Einreichung sollte eine fundierte Analyse demonstrieren:",
            en: "The highest level of media literacy requires deep, critical thinking. The submission should demonstrate a well-researched analysis:",
            es: "El nivel más alto de competencia mediática requiere un pensamiento crítico profundo. La entrega debe demostrar un análisis bien fundamentado:"
        },
        hintsList: [
            {
                title: { de: "Kritischer Essay oder Fallstudie", en: "Critical Essay or Case Study", es: "Ensayo Crítico o Estudio de Caso" },
                text: {
                    de: "Einreichung eines kritischen Essays, einer vergleichenden Medienanalyse oder einer Präsentation über aktuelle digitale Phänomene (z. B. Funktionsweise von TikTok-Algorithmen, Erkennung von Deepfakes, Einfluss von Künstlicher Intelligenz). Die Schüler müssen anhand konkreter Beispiele erklären, wie Algorithmen die eigene Wahrnehmung beeinflussen und welche ethischen Fragen damit verbunden sind.",
                    en: "Submitting a critical essay, a comparative media analysis report, or a presentation on contemporary digital phenomena (e.g., TikTok recommendation algorithms, detecting deepfakes, ethical implications of AI). Students must use specific case studies to explain how algorithms shape perception and discuss associated ethical questions.",
                    es: "Redactar un ensayo crítico o presentación (500-800 palabras o 5-7 diapositivas) desglosando un fenómeno digital contemporáneo (ej. cómo el algoritmo de TikTok moldea gustos, identificación de Deepfakes/ChatGPT en el ámbito académico, o el impacto de la basura electrónica). Debe incluir al menos dos ejemplos reales y proponer pautas éticas."
                }
            },
            {
                title: { de: "Beispiel für den Unterricht", en: "Classroom Example", es: "Ejemplo de Clase" },
                text: {
                    de: "Eine vergleichende Analyse von zwei Nachrichtenartikeln (oder Social-Media-Posts) zum selben Thema aus unterschiedlichen Quellen, in der Voreingenommenheit (Bias) und manipulative Sprache untersucht werden.",
                    en: "A comparative study of two news reports or social media campaigns covering the same event from differing perspectives, highlighting media bias, sensationalism, and manipulative language.",
                    es: "Un debate grabado o un ensayo comparativo en Alemán, Inglés o Español analizando el tratamiento de una misma noticia en distintos portales digitales para detectar sesgos cognitivos y manipulación mediática."
                }
            }
        ],
        evalTitle: { de: "⭐ Bewertungskriterien für Lehrkräfte", en: "⭐ Teacher Evaluation Criteria", es: "⭐ Criterios de Evaluación Docente" },
        evalText: {
            de: "Beurteilen Sie die Tiefe der kritischen Reflexion und die Fähigkeit, komplexe mediale Zusammenhänge zu hinterfragen. Vergeben Sie 3 Sterne für eine differenzierte, tiefgründige und mit Beispielen belegte Analyse.",
            en: "Evaluate the depth of critical thinking and the student's ability to deconstruct media messages. Award 3 stars for a nuanced, highly insightful analysis supported by concrete evidence and mature ethical reflection.",
            es: "Revisa la madurez intelectual de la reflexión, la calidad de los argumentos y la capacidad de cuestionar el entorno sociodigital. Otorga 3 estrellas si el estudiante presenta un análisis profundo, bien estructurado y con un sólido sentido ético y crítico."
        }
    }
];

module.exports = { part2Competencies };
