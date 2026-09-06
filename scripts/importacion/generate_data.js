const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.js');
let code = fs.readFileSync(dataFile, 'utf8');

const questionsByGrade = {
    "2": [ // Básico
        {
            type: "text",
            l: {
                es: "1. Búsqueda: ¿Qué buscaste hoy en la computadora?",
                de: "1. Suche: Was hast du heute am Computer gesucht?",
                en: "1. Search: What did you search for on the computer today?"
            },
            h: {
                es: "Escribe o dibuja el tema que buscaste hoy con ayuda del profesor.",
                de: "Schreibe auf oder zeichne, welches Thema du heute mit Hilfe des Lehrers gesucht hast.",
                en: "Write or draw the topic you searched for today with the teacher's help."
            }
        },
        {
            type: "text",
            l: {
                es: "2. Comunicación: ¿Quién te ayudó hoy en la computadora?",
                de: "2. Kommunikation: Wer hat dir am Computer geholfen?",
                en: "2. Communication: Who helped you on the computer today?"
            },
            h: {
                es: "Escribe si trabajaste con un compañero o si recibiste ayuda del profesor.",
                de: "Schreibe auf, ob du mit einem Partner gearbeitet hast oder Hilfe vom Lehrer bekommen hast.",
                en: "Write if you worked with a classmate or got help from the teacher."
            }
        },
        {
            type: "text",
            l: {
                es: "3. Producción: ¿Qué dibujo hiciste hoy en la computadora?",
                de: "3. Produktion: Was hast du heute am Computer gezeichnet?",
                en: "3. Production: What did you draw on the computer today?"
            },
            h: {
                es: "Escribe qué dibujaste hoy en Paint u otro programa.",
                de: "Schreibe auf, was du heute in Paint oder einem anderen Programm gezeichnet hast.",
                en: "Write what you drew today in Paint or another program."
            }
        },
        {
            type: "text",
            l: {
                es: "4. Protección: ¿Cómo te sentaste para cuidar tu espalda?",
                de: "4. Schutz: Wie hast du auf deinen Rücken geachtet?",
                en: "4. Protection: How did you sit to take care of your back?"
            },
            h: {
                es: "Escribe si mantuviste una buena postura (espalda derecha) frente a la pantalla.",
                de: "Schreibe auf, ob du eine gute Haltung (gerader Rücken) vor dem Bildschirm hattest.",
                en: "Write if you maintained a good posture (straight back) in front of the screen."
            }
        },
        {
            type: "text",
            l: {
                es: "5. Resolución de Problemas: Si algo falló, ¿cómo te ayudó el profesor?",
                de: "5. Problemlösung: Wenn etwas nicht klappte, wie hat dir der Lehrer geholfen?",
                en: "5. Problem Solving: If something went wrong, how did the teacher help?"
            },
            h: {
                es: "Cuéntanos cómo te ayudó el profesor cuando algo no funcionó en la computadora.",
                de: "Erzähle uns, wie dir der Lehrer geholfen hat, als etwas am Computer nicht funktionierte.",
                en: "Tell us how the teacher helped you when something didn't work on the computer."
            }
        },
        {
            type: "text",
            l: {
                es: "6. Análisis: ¿Tu dibujo es real o de fantasía?",
                de: "6. Analyse: Ist deine Zeichnung echt oder ausgedacht?",
                en: "6. Analysis: Is your drawing real or fantasy?"
            },
            h: {
                es: "Dinos si tu dibujo representa algo de la vida real o de tu imaginación.",
                de: "Sag uns, ob deine Zeichnung etwas Reales oder etwas aus deiner Fantasie zeigt.",
                en: "Tell us if your drawing represents something from real life or from your imagination."
            }
        }
    ],
    "3": [ // Básico + 1
        {
            type: "text",
            l: {
                es: "1. Búsqueda: ¿Qué tema buscaste hoy en internet y cómo se llama la página web que usaste?",
                de: "1. Suche: Welches Thema hast du heute im Internet gesucht und wie heißt die Webseite?",
                en: "1. Search: What topic did you search for on the internet today and what is the website called?"
            },
            h: {
                es: "Escribe el tema buscado y copia el nombre de la página web (ej. Wikipedia o Kids-Search).",
                de: "Schreibe das gesuchte Thema und kopiere den Namen der Webseite (z.B. Wikipedia oder Kids-Search).",
                en: "Write the topic you searched for and copy the website name (e.g. Wikipedia or Kids-Search)."
            }
        },
        {
            type: "text",
            l: {
                es: "2. Comunicación: ¿Qué herramienta usaron para escribirse o hablar en el equipo?",
                de: "2. Kommunikation: Welches Tool habt ihr benutzt, um im Team zu schreiben oder zu sprechen?",
                en: "2. Communication: What tool did you use to write or talk in your team?"
            },
            h: {
                es: "Menciona si usaron el chat de Teams, el correo electrónico o trabajaron juntos compartiendo la pantalla.",
                de: "Nenne, ob ihr den Teams-Chat, E-Mail genutzt oder gemeinsam den Bildschirm geteilt habt.",
                en: "Mention if you used Teams chat, email, or worked together by sharing the screen."
            }
        },
        {
            type: "text",
            l: {
                es: "3. Producción: ¿Qué programa usaste hoy para crear tu trabajo y qué parte de tu diseño te gusta más?",
                de: "3. Produktion: Welches Programm hast du heute für deine Arbeit benutzt und welcher Teil gefällt dir am besten?",
                en: "3. Production: What program did you use today to create your work and which part of your design do you like best?"
            },
            h: {
                es: "Escribe el nombre del programa (ej. Word, PowerPoint) y dinos qué fue lo que más bonito te quedó.",
                de: "Schreibe den Namen des Programms (z.B. Word, PowerPoint) und erzähle, was dir am besten gelungen ist.",
                en: "Write the name of the program (e.g. Word, PowerPoint) and tell us what turned out best."
            }
        },
        {
            type: "textarea",
            l: {
                es: "4. Protección: Escribe una regla importante para cuidar tus datos personales en internet.",
                de: "4. Schutz: Schreibe eine wichtige Regel zum Schutz deiner persönlichen Daten im Internet auf.",
                en: "4. Protection: Write down an important rule to protect your personal data on the internet."
            },
            h: {
                es: "Explica por qué nunca debes decir tu dirección, teléfono o contraseñas a desconocidos en internet.",
                de: "Erkläre, warum du Fremden im Internet niemals deine Adresse, Telefonnummer oder Passwörter verraten solltest.",
                en: "Explain why you should never tell your address, phone number, or passwords to strangers online."
            }
        },
        {
            type: "textarea",
            l: {
                es: "5. Resolución de Problemas: Si el internet se desconecta en clase, ¿qué pasos debes seguir?",
                de: "5. Problemlösung: Wenn das Internet im Unterricht ausfällt, welche Schritte solltest du befolgen?",
                en: "5. Problem Solving: If the internet disconnects in class, what steps should you follow?"
            },
            h: {
                es: "Escribe a quién le avisas o qué otra actividad puedes hacer en la computadora mientras regresa la red.",
                de: "Schreibe auf, wem du Bescheid gibst oder welche andere Aufgabe du am Computer machen kannst, bis das Netz wieder da ist.",
                en: "Write down who you tell or what other activity you can do on the computer while the network returns."
            }
        },
        {
            type: "textarea",
            l: {
                es: "6. Análisis: ¿Cuánto tiempo pasas al día frente a las pantallas y cómo te sientes después?",
                de: "6. Analyse: Wie viel Zeit verbringst du täglich vor dem Bildschirm und wie fühlst du dich danach?",
                en: "6. Analysis: How much time do you spend in front of screens daily and how do you feel afterwards?"
            },
            h: {
                es: "Reflexiona si usas mucho tiempo la tablet o TV y si te cansas, te duele la cabeza o te da sueño.",
                de: "Überlege, ob du Tablet oder TV zu lange nutzt und ob du müde wirst, Kopfschmerzen bekommst oder schläfrig wirst.",
                en: "Reflect on whether you use the tablet or TV too much and if you get tired, get a headache, or feel sleepy."
            }
        }
    ],
    "4": [ // Intermedio
        {
            type: "text",
            l: {
                es: "1. Búsqueda: ¿Qué palabras clave escribiste en el buscador y cómo supiste que la página era útil?",
                de: "1. Suche: Welche Suchbegriffe hast du eingegeben und woher wusstest du, dass die Seite nützlich war?",
                en: "1. Search: What keywords did you type in the search engine and how did you know the page was useful?"
            },
            h: {
                es: "Escribe las palabras exactas que usaste en Google y por qué la información respondía a tu tarea.",
                de: "Schreibe die genauen Wörter auf, die du bei Google eingegeben hast, und warum die Informationen zu deiner Aufgabe passten.",
                en: "Write the exact words you used in Google and why the information answered your task."
            }
        },
        {
            type: "text",
            l: {
                es: "2. Comunicación: ¿Cómo se dividieron el trabajo en el equipo y qué parte realizaste tú?",
                de: "2. Kommunikation: Wie habt ihr die Arbeit im Team aufgeteilt und welchen Teil hast du übernommen?",
                en: "2. Communication: How did you divide the work in the team and which part did you do?"
            },
            h: {
                es: "Describe qué tarea le tocó a cada integrante del grupo y cuál fue tu aporte específico.",
                de: "Beschreibe, welche Aufgabe jedes Gruppenmitglied hatte und was dein konkreter Beitrag war.",
                en: "Describe which task each group member had and what your specific contribution was."
            }
        },
        {
            type: "text",
            l: {
                es: "3. Producción: ¿Qué tipo de contenido digital creaste y cómo lo acomodaste para que se vea claro y bonito?",
                de: "3. Produktion: Welche Art von digitalem Inhalt hast du erstellt und wie hast du ihn gestaltet, damit er klar und ansprechend aussieht?",
                en: "3. Production: What kind of digital content did you create and how did you arrange it to look clear and nice?"
            },
            h: {
                es: "Explica si usaste diapositivas, textos o dibujos, y cómo organizaste las letras, colores o imágenes.",
                de: "Erkläre, ob du Folien, Texte oder Bilder verwendet hast und wie du Schrift, Farben oder Bilder angeordnet hast.",
                en: "Explain if you used slides, text, or images, and how you organized the fonts, colors, or pictures."
            }
        },
        {
            type: "textarea",
            l: {
                es: "4. Protección: ¿Qué debes hacer si te llega un mensaje extraño o ves un enlace sospechoso?",
                de: "4. Schutz: Was solltest du tun, wenn du eine seltsame Nachricht erhältst oder einen verdächtigen Link siehst?",
                en: "4. Protection: What should you do if you receive a strange message or see a suspicious link?"
            },
            h: {
                es: "Escribe qué medidas de seguridad tomas y a qué adulto de confianza le avisarías de inmediato.",
                de: "Schreibe auf, welche Sicherheitsmaßnahmen du ergreifst und welchen vertrauenswürdigen Erwachsenen du sofort informieren würdest.",
                en: "Write down what security measures you take and which trusted adult you would inform immediately."
            }
        },
        {
            type: "textarea",
            l: {
                es: "5. Resolución de Problemas: Describe un problema técnico que tuviste hoy en la computadora y cómo lo resolviste.",
                de: "5. Problemlösung: Beschreibe ein technisches Problem, das du heute am Computer hattest, und wie du es gelöst hast.",
                en: "5. Problem Solving: Describe a technical problem you had on the computer today and how you solved it."
            },
            h: {
                es: "Piensa si se cerró un programa, si no podías guardar tu archivo o si no encontrabas una herramienta, y qué hiciste.",
                de: "Überlege, ob ein Programm abgestürzt ist, du deine Datei nicht speichern konntest oder ein Tool nicht gefunden hast, und was du getan hast.",
                en: "Think about if a program crashed, you couldn't save your file, or couldn't find a tool, and what you did."
            }
        },
        {
            type: "textarea",
            l: {
                es: "6. Análisis: ¿Qué reglas de uso de computadoras tenemos en el salón y por qué son importantes?",
                de: "6. Analyse: Welche Regeln für die Computernutzung haben wir im Klassenzimmer und warum sind sie wichtig?",
                en: "6. Analysis: What computer usage rules do we have in the classroom and why are they important?"
            },
            h: {
                es: "Explica qué cosas están permitidas hacer con los computadores de la escuela y cuáles no (como jugar sin permiso).",
                de: "Erkläre, was mit den Schulcomputern erlaubt ist und was nicht (wie z. B. Spielen ohne Erlaubnis).",
                en: "Explain what is allowed to be done with school computers and what is not (such as playing games without permission)."
            }
        }
    ],
    "5": [ // Intermedio + 1
        {
            type: "text",
            l: {
                es: "1. Búsqueda: ¿Qué motor de búsqueda usaste, qué palabras clave aplicaste y cómo organizaste la información?",
                de: "1. Suche: Welche Suchmaschine hast du benutzt, welche Suchbegriffe angewendet und wie hast du die Informationen organisiert?",
                en: "1. Search: What search engine did you use, what keywords did you apply, and how did you organize the information?"
            },
            h: {
                es: "Menciona el buscador (ej. Google, Bing), las palabras que ingresaste y dónde guardaste las notas o el enlace.",
                de: "Nenne die Suchmaschine (z.B. Google, Bing), die eingegebenen Wörter und wo du die Notizen oder den Link gespeichert hast.",
                en: "Mention the search engine (e.g. Google, Bing), the words you entered, and where you saved the notes or the link."
            }
        },
        {
            type: "text",
            l: {
                es: "2. Comunicación: ¿Qué herramientas de colaboración compartida usaron y cómo aplicaron las normas de netiqueta?",
                de: "2. Kommunikation: Welche kollaborativen Tools habt ihr genutzt und wie habt ihr die Netiquette-Regeln angewendet?",
                en: "2. Communication: What shared collaboration tools did you use and how did you apply netiquette rules?"
            },
            h: {
                es: "Detalla si compartieron un archivo en Teams o OneDrive, y cómo se hablaron con respeto al editar juntos.",
                de: "Beschreibe, ob ihr eine Datei in Teams oder OneDrive geteilt habt und wie ihr beim gemeinsamen Bearbeiten respektvoll miteinander gesprochen habt.",
                en: "Detail if you shared a file on Teams or OneDrive, and how you spoke with respect when editing together."
            }
        },
        {
            type: "text",
            l: {
                es: "3. Producción: ¿Qué pasos seguiste para diseñar y editar tu contenido digital, y qué herramientas del programa usaste?",
                de: "3. Produktion: Welche Schritte hast du beim Entwerfen und Bearbeiten deines digitalen Inhalts befolgt und welche Werkzeuge des Programms hast du benutzt?",
                en: "3. Production: What steps did you follow to design and edit your digital content, and what program tools did you use?"
            },
            h: {
                es: "Explica el proceso paso a paso (ej. buscar fotos, recortar, alinear texto, aplicar colores) y qué botones o menús usaste.",
                de: "Erkläre den Prozess Schritt für Schritt (z.B. Bilder suchen, zuschneiden, Text ausrichten, Farben anwenden) und welche Buttons oder Menüs du benutzt hast.",
                en: "Explain the process step-by-step (e.g. search photos, crop, align text, apply colors) and which buttons or menus you used."
            }
        },
        {
            type: "textarea",
            l: {
                es: "4. Protección: ¿Qué es la 'Huella Digital' y qué medidas tomas para proteger tu privacidad al usar la red escolar?",
                de: "4. Schutz: Was ist der 'digitale Fußabdruck' und welche Maßnahmen ergreifst du, um deine Privatsphäre im Schulnetzwerk zu schützen?",
                en: "4. Protection: What is the 'Digital Footprint' and what measures do you take to protect your privacy when using the school network?"
            },
            h: {
                es: "Explica los rastros que dejas al navegar en internet y cómo proteges tu cuenta cerrando sesión y cuidando tus datos.",
                de: "Erkläre die Spuren, die du beim Surfen im Internet hinterlässt, und wie du dein Konto schützt, indem du dich abmeldest und auf deine Daten achtest.",
                en: "Explain the traces you leave when browsing the internet and how you protect your account by logging out and taking care of your data."
            }
        },
        {
            type: "textarea",
            l: {
                es: "5. Resolución de Problemas: ¿Qué herramienta digital elegiste hoy para tu tarea y por qué era la más adecuada?",
                de: "5. Problemlösung: Welches digitale Werkzeug hast du heute für deine Aufgabe gewählt und warum war es das am besten geeignete?",
                en: "5. Problem Solving: What digital tool did you choose today for your task and why was it the most appropriate?"
            },
            h: {
                es: "Justifica tu elección de software (ej. Canva, Word o PowerPoint) explicando qué facilidades te dio para realizar la actividad.",
                de: "Begründe deine Softwareauswahl (z.B. Canva, Word oder PowerPoint) und erkläre, welche Erleichterungen sie dir bei der Durchführung der Aktivität bot.",
                en: "Justify your choice of software (e.g. Canva, Word or PowerPoint) explaining what conveniences it gave you to perform the activity."
            }
        },
        {
            type: "textarea",
            l: {
                es: "6. Análisis: ¿De qué manera influye la publicidad o el contenido de los creadores (influencers) en lo que nos gusta en internet?",
                de: "6. Analyse: Wie beeinflussen Werbung oder Inhalte von Erstellern (Influencern) das, was uns im Internet gefällt?",
                en: "6. Analysis: How do advertising or content from creators (influencers) influence what we like on the internet?"
            },
            h: {
                es: "Reflexiona sobre los anuncios de las páginas o videos, y cómo nos convencen de comprar cosas o cambiar de opinión.",
                de: "Reflektiere über Anzeigen auf Seiten oder in Videos und wie sie uns überzeugen, Dinge zu kaufen oder unsere Meinung zu ändern.",
                en: "Reflect on ads on pages or videos, and how they convince us to buy things or change our minds."
            }
        }
    ],
    "6": [ // Avanzado
        {
            type: "text",
            l: {
                es: "1. Búsqueda: ¿Cómo evaluaste la confiabilidad de la fuente consultada y qué método usaste para archivar la información?",
                de: "1. Suche: Wie hast du die Zuverlässigkeit der konsultierten Quelle bewertet und welche Methode hast du zur Archivierung der Informationen genutzt?",
                en: "1. Search: How did you evaluate the reliability of the source consulted and what method did you use to archive the information?"
            },
            h: {
                es: "Menciona el autor o institución del sitio web, cómo confirmaste que es confiable y cómo organizaste tu carpeta digital.",
                de: "Nenne den Autor oder die Institution der Webseite, wie du deren Zuverlässigkeit überprüft hast und wie du deinen digitalen Ordner organisiert hast.",
                en: "Mention the author or institution of the website, how you confirmed it is reliable, and how you organized your digital folder."
            }
        },
        {
            type: "text",
            l: {
                es: "2. Comunicación: Explica cómo organizaron el trabajo colaborativo en línea y cómo resolvieron diferencias de opinión.",
                de: "2. Kommunikation: Erkläre, wie ihr die kollaborative Online-Arbeit organisiert habt und wie ihr Meinungsverschiedenheiten gelöst habt.",
                en: "2. Communication: Explain how you organized the collaborative online work and how you resolved differences of opinion."
            },
            h: {
                es: "Describe el uso del chat o comentarios compartidos para ponerse de acuerdo y dar sugerencias de forma constructiva.",
                de: "Beschreibe die Nutzung des Chats oder geteilter Kommentare, um sich zu einigen und konstruktive Vorschläge zu machen.",
                en: "Describe the use of chat or shared comments to agree and give suggestions constructively."
            }
        },
        {
            type: "text",
            l: {
                es: "3. Producción: ¿Cómo integraste diferentes medios en tu producción y cómo respetaste los derechos de autor (copyright)?",
                de: "3. Produktion: Wie hast du verschiedene Medien in deine Produktion integriert und wie hast du das Urheberrecht (Copyright) respektiert?",
                en: "3. Production: How did you integrate different media into your production and how did you respect copyright?"
            },
            h: {
                es: "Explica si usaste imágenes o audios de internet y si colocaste las fuentes y créditos o usaste bancos de imágenes libres.",
                de: "Erkläre, ob du Bilder oder Audio aus dem Internet verwendet hast und ob du die Quellen und Credits angegeben oder freie Bilddatenbanken genutzt hast.",
                en: "Explain if you used images or audio from the internet and if you put the sources and credits or used free image banks."
            }
        },
        {
            type: "textarea",
            l: {
                es: "4. Protección: ¿Cuáles son los riesgos de seguridad más comunes al navegar y cómo configuras tus cuentas o contraseñas seguras?",
                de: "4. Schutz: Was sind die häufigsten Sicherheitsrisiken beim Surfen und wie konfigurierst du deine Konten oder sicheren Passwörter?",
                en: "4. Protection: What are the most common security risks when browsing and how do you configure your accounts or secure passwords?"
            },
            h: {
                es: "Analiza riesgos como virus o estafas y describe qué elementos debe tener una contraseña para ser fuerte y segura.",
                de: "Analysiere Risiken wie Viren oder Betrug und beschreibe, welche Elemente ein Passwort haben muss, um stark und sicher zu sein.",
                en: "Analyze risks like viruses or scams and describe what elements a password must have to be strong and secure."
            }
        },
        {
            type: "textarea",
            l: {
                es: "5. Resolución de Problemas: Explica cómo solucionas problemas de formato o compatibilidad y cómo ayudas a compañeros con soporte técnico.",
                de: "5. Problemlösung: Erkläre, wie du Format- oder Kompatibilitätsprobleme löst und wie du Klassenkameraden mit technischem Support hilfst.",
                en: "5. Problem Solving: Explain how you solve format or compatibility problems and how you help classmates with technical support."
            },
            h: {
                es: "Describe qué haces si un archivo no abre o cambia de estilo (ej. PDF vs Word) y cómo guías a otros de manera clara.",
                de: "Beschreibe, was du tust, wenn eine Datei sich nicht öffnen lässt oder das Layout verändert (z.B. PDF vs. Word) und wie du andere klar anleitest.",
                en: "Describe what you do if a file doesn't open or changes style (e.g. PDF vs Word) and how you guide others clearly."
            }
        },
        {
            type: "textarea",
            l: {
                es: "6. Análisis: Analiza las ventajas y desventajas de la tecnología en el aula: ¿cómo afecta la concentración y el aprendizaje?",
                de: "6. Analyse: Analysiere die Vor- und Nachteile der Technologie im Klassenzimmer: Wie beeinflusst sie Konzentration und Lernen?",
                en: "6. Analysis: Analyze the advantages and disadvantages of technology in the classroom: how does it affect concentration and learning?"
            },
            h: {
                es: "Reflexiona sobre el beneficio de buscar información rápido frente a la distracción con juegos o chats en horas de clase.",
                de: "Reflektiere über den Nutzen, Informationen schnell zu finden, im Vergleich zur Ablenkung durch Spiele oder Chats während des Unterrichts.",
                en: "Reflect on the benefit of finding information quickly versus distraction with games or chats during class hours."
            }
        }
    ],
    "7": [ // Avanzado + 1
        {
            type: "textarea",
            l: {
                es: "1. Búsqueda: Realiza un análisis crítico de las fuentes: ¿cómo contrastaste la información y qué metadatos validaste?",
                de: "1. Suche: Führe eine kritische Analyse der Quellen durch: Wie hast du die Informationen kontrastiert und welche Metadaten validiert?",
                en: "1. Search: Perform a critical analysis of the sources: how did you contrast the information and what metadata did you validate?"
            },
            h: {
                es: "Explica cómo comparaste dos páginas web diferentes sobre el mismo tema y cómo verificaste la fecha de actualización y el autor.",
                de: "Erkläre, wie du zwei verschiedene Webseiten zum gleichen Thema verglichen hast und wie du das Aktualisierungsdatum und den Autor überprüft hast.",
                en: "Explain how you compared two different web pages on the same topic and how you verified the update date and the author."
            }
        },
        {
            type: "textarea",
            l: {
                es: "2. Comunicación: Evalúa la eficiencia del trabajo colaborativo digital: ¿cómo influyó el uso de canales virtuales en el resultado?",
                de: "2. Kommunikation: Bewerte die Effizienz der digitalen Zusammenarbeit: Wie hat die Nutzung virtueller Kanäle das Ergebnis beeinflusst?",
                en: "2. Communication: Evaluate the efficiency of digital collaborative work: how did the use of virtual channels influence the result?"
            },
            h: {
                es: "Analiza los beneficios de coeditar en tiempo real y los desafíos de comunicación que tuvieron y cómo los resolvieron.",
                de: "Analysiere die Vorteile der gemeinsamen Bearbeitung in Echtzeit und die Kommunikationsherausforderungen, die ihr hattet, sowie deren Lösung.",
                en: "Analyze the benefits of co-editing in real time and the communication challenges you faced and how you solved them."
            }
        },
        {
            type: "textarea",
            l: {
                es: "3. Producción: Detalla el proceso de planeación y publicación de tu producto digital, y el tipo de licencias Creative Commons usadas.",
                de: "3. Produktion: Detailliere den Planungs- und Veröffentlichungsprozess deines digitalen Produkts und die Art der verwendeten Creative Commons-Lizenzen.",
                en: "3. Production: Detail the planning and publishing process of your digital product, and the type of Creative Commons licenses used."
            },
            h: {
                es: "Explica la planificación desde el boceto a la versión final, y qué tipo de licencia libre elegiste para compartir tu creación.",
                de: "Erkläre die Planung von der Skizze bis zur Endversion und welche freie Lizenz du gewählt hast, um deine Kreation zu teilen.",
                en: "Explain the planning from the sketch to the final version, and what type of free license you chose to share your creation."
            }
        },
        {
            type: "textarea",
            l: {
                es: "4. Protección: Evalúa el impacto ambiental de la tecnología y describe una estrategia de ergonomía y salud digital.",
                de: "4. Schutz: Bewerte die Umweltauswirkungen der Technologie und beschreibe eine Strategie für Ergonomie und digitale Gesundheit.",
                en: "4. Protection: Evaluate the environmental impact of technology and describe a strategy for ergonomics and digital health."
            },
            h: {
                es: "Reflexiona sobre el consumo de energía en internet (servidores), el reciclaje electrónico y el autocuidado físico frente a pantallas.",
                de: "Reflektiere über den Energieverbrauch im Internet (Server), Elektronik-Recycling und die physische Selbstfürsorge vor Bildschirmen.",
                en: "Reflect on energy consumption on the internet (servers), electronic recycling, and physical self-care in front of screens."
            }
        },
        {
            type: "textarea",
            l: {
                es: "5. Resolución de Problemas: Describe la lógica o el algoritmo (pasos estructurados) que diseñaste para resolver un problema técnico complejo.",
                de: "5. Problemlösung: Beschreibe die Logik oder den Algorithmus (strukturierte Schritte), den du zur Lösung eines komplexen technischen Problems entworfen hast.",
                en: "5. Problem Solving: Describe the logic or algorithm (structured steps) you designed to solve a complex technical problem."
            },
            h: {
                es: "Escribe en orden lógico los pasos (como una receta o pseudocódigo) que programaste o configuraste para completar tu trabajo hoy.",
                de: "Schreibe in logischer Reihenfolge die Schritte auf (wie ein Rezept oder Pseudocode), die du heute programmiert oder konfiguriert hast, um deine Arbeit fertigzustellen.",
                en: "Write in logical order the steps (like a recipe or pseudocode) that you programmed or configured to complete your work today."
            }
        },
        {
            type: "textarea",
            l: {
                es: "6. Análisis: Realiza un análisis crítico sobre la desinformación (Fake News) y el rol de los algoritmos de recomendación en redes.",
                de: "6. Analyse: Führe eine kritische Analyse über Desinformation (Fake News) und die Rolle von Empfehlungsalgorithmen in Netzwerken durch.",
                en: "6. Analysis: Perform a critical analysis of misinformation (Fake News) and the role of recommendation algorithms in networks."
            },
            h: {
                es: "Explica cómo las redes sociales nos recomiendan contenido para capturar nuestra atención y cómo verificar si un artículo viral es verídico.",
                de: "Erkläre, wie soziale Netzwerke uns Inhalte empfehlen, um unsere Aufmerksamkeit zu fesseln, und wie man überprüft, ob ein viraler Artikel wahr ist.",
                en: "Explain how social networks recommend content to capture our attention and how to verify if a viral article is true."
            }
        }
    ]
};

const kmkTitles = {
    "1": { de: "Suchen, Verarbeiten & Aufbewahren", en: "Search, Process & Store", es: "Buscar, Procesar & Archivar" },
    "2": { de: "Kommunizieren & Kooperieren", en: "Communicate & Cooperate", es: "Comunicar y Cooperar" },
    "3": { de: "Produzieren & Präsentieren", en: "Produce & Present", es: "Producir y Presentar" },
    "4": { de: "Schützen & Sicher Agieren", en: "Protect & Act Safely", es: "Protegerse y Actuar con Seguridad" },
    "5": { de: "Problemlösen & Handeln", en: "Solve Problems & Act", es: "Solucionar Problemas y Actuar" },
    "6": { de: "Analysieren & Reflektieren", en: "Analyze & Reflect", es: "Analizar y Reflexionar" }
};

const activeSubjects = [
    { id: "aleman", icon: "🇩🇪", color: "#dc2626", name: { de: "Deutsch", en: "German", es: "Alemán" } },
    { id: "ingles", icon: "🇬🇧", color: "#0ea5e9", name: { de: "Englisch", en: "English", es: "Inglés" } },
    { id: "espanol", icon: "🇪🇸", color: "#ea580c", name: { de: "Spanisch", en: "Spanish", es: "Español" } }
];

let newAllActivities = "const allActivities = {\n";

for (let reto = 1; reto <= 6; reto++) {
    newAllActivities += `    "${reto}": [\n`;
    activeSubjects.forEach((sub, sIdx) => {
        const title = kmkTitles[reto];

        // Compile evidence_kX properties for grades 2 to 7
        const evidenceByGradeStrings = {};
        for (let grade = 2; grade <= 7; grade++) {
            evidenceByGradeStrings[`evidence_k${grade}`] = questionsByGrade[String(grade)].map((q, qIdx) => {
                const escapedLabelEs = q.l.es.replace(/"/g, '\\"');
                const escapedLabelDe = q.l.de.replace(/"/g, '\\"');
                const escapedLabelEn = q.l.en.replace(/"/g, '\\"');
                const escapedHintEs = q.h.es.replace(/"/g, '\\"');
                const escapedHintDe = q.h.de.replace(/"/g, '\\"');
                const escapedHintEn = q.h.en.replace(/"/g, '\\"');
                return `            { id: "r${reto}_${sub.id}_q${qIdx + 1}", label: { de: "${escapedLabelDe}", en: "${escapedLabelEn}", es: "${escapedLabelEs}" }, hint: { de: "${escapedHintDe}", en: "${escapedHintEn}", es: "${escapedHintEs}" }, type: "${q.type}" }`;
            }).join(",\n");
        }

        newAllActivities += `        {
            id: "reto${reto}_${sub.id}", level: "${reto}", subject: "${sub.id}",
            title: { de: "Reto ${reto} - ${sub.name.de}", en: "Challenge ${reto} - ${sub.name.en}", es: "Reto ${reto} - ${sub.name.es}" },
            subtitle: { de: "${title.de}", en: "${title.en}", es: "${title.es}" },
            icon: "${sub.icon}", color: "${sub.color}",
            competencies: [],
            evidence_k2: [
${evidenceByGradeStrings.evidence_k2}
            ],
            evidence_k3: [
${evidenceByGradeStrings.evidence_k3}
            ],
            evidence_k4: [
${evidenceByGradeStrings.evidence_k4}
            ],
            evidence_k5: [
${evidenceByGradeStrings.evidence_k5}
            ],
            evidence_k6: [
${evidenceByGradeStrings.evidence_k6}
            ],
            evidence_k7: [
${evidenceByGradeStrings.evidence_k7}
            ],
            evidence: [
${evidenceByGradeStrings.evidence_k5} // default/fallback to k5
            ],
            achievement: { de: "Sterne gesammelt", en: "Stars collected", es: "Estrellas recolectadas" }, stars: 10
        }`;
        if (sIdx < activeSubjects.length - 1) newAllActivities += ",\n";
    });
    newAllActivities += `\n    ]${reto < 6 ? "," : ""}\n`;
}
newAllActivities += "};\n";

// Ensure the replacement string ends seamlessly so it fits into data.js
const regex = /const allActivities = \{[\s\S]*?^\};\n?/m;

let newCode = code.replace(regex, newAllActivities + "\n");
fs.writeFileSync(dataFile, newCode, 'utf8');

console.log("Successfully replaced allActivities in data.js with K2-K7 evidence lists");
