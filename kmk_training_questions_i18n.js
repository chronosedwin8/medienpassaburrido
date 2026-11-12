/**
 * kmk_training_questions_i18n.js
 * Traducciones (alemán e inglés) del banco de preguntas de Capacitación KMK.
 * El texto original en español sigue en kmk_training_questions.js; getKmkQuestions(lang)
 * devuelve el banco en el idioma pedido (lo que falte queda en español).
 * Borrador de traducción: conviene que el área de alemán lo revise.
 */

const { kmkTrainingQuestions } = require('./kmk_training_questions');

const categoryLabels = {
    de: { fundamentos: '📚 KMK-Grundlagen', busqueda: '🔍 Informationen suchen und analysieren', seguridad: '🛡️ Digitale Sicherheit und Privatsphäre', produccion: '🎨 Digitale Inhalte erstellen', comunicacion: '🤝 Digitale Kommunikation und Zusammenarbeit' },
    en: { fundamentos: '📚 KMK fundamentals', busqueda: '🔍 Searching and analyzing information', seguridad: '🛡️ Digital safety and privacy', produccion: '🎨 Creating digital content', comunicacion: '🤝 Digital communication and collaboration' }
};

const difficultyLabels = {
    de: { basico: 'Grundlegend', intermedio: 'Mittel', avanzado: 'Fortgeschritten' },
    en: { basico: 'Basic', intermedio: 'Intermediate', avanzado: 'Advanced' },
    es: { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }
};

const translations = {
    de: {
        kmk_01: {
            question: 'Wofür steht die Abkürzung KMK im Kontext der deutschen digitalen Bildung?',
            options: [
                'Kultusministerkonferenz — Ständige Konferenz der Kultusminister der Länder',
                'Kompetenzen Medialer Kultur',
                'Kreativität, Medien und Kommunikation',
                'Keine Medien Kontrolle'
            ],
            explanation: 'KMK ist die Kultusministerkonferenz, die den Kompetenzrahmen für die digitale Bildung in Deutschland festgelegt hat („Bildung in der digitalen Welt“, 2016). Er definiert 6 Kompetenzbereiche für den verantwortungsvollen Umgang mit digitalen Medien.'
        },
        kmk_02: {
            question: 'Wie viele Hauptkompetenzen umfasst der KMK-Rahmen für digitale Bildung?',
            options: [
                '3 Kompetenzen: Suchen, Kommunizieren und Produzieren',
                '6 Kompetenzen: Suchen/Verarbeiten, Kommunizieren/Kooperieren, Produzieren, Schützen/Sicher agieren, Problemlösen, Analysieren/Reflektieren',
                '4 Kompetenzen: digital, medial, kritisch und informationsbezogen',
                '8 Kompetenzen nach dem europäischen DigComp-Rahmen'
            ],
            explanation: 'Der KMK-Rahmen definiert 6 Bereiche: 1) Suchen, Verarbeiten und Aufbewahren; 2) Kommunizieren und Kooperieren; 3) Produzieren und Präsentieren; 4) Schützen und sicher Agieren; 5) Problemlösen und Handeln; 6) Analysieren und Reflektieren.'
        },
        kmk_03: {
            question: 'Was ist das Hauptziel des MEDIENPASS an der Deutschen Schule?',
            options: [
                'Bescheinigen, dass die Schüler*innen soziale Netzwerke unterhaltsam nutzen können',
                'Die Medienkompetenzen der Schüler*innen während der gesamten Schulzeit dokumentieren und schrittweise entwickeln',
                'Schulbücher in allen Fächern durch Tablets ersetzen',
                'Die digitale Leistung jeder*jedes Schüler*in mit Zahlen benoten'
            ],
            explanation: 'Der MedienPass ist ein Instrument zur Dokumentation und schrittweisen Entwicklung. Die Schüler*innen halten ihre Fortschritte in den digitalen Kompetenzen nach dem KMK-Rahmen fest; er dient als Portfolio mit Nachweisen über die ganze Schulzeit.'
        },
        kmk_04: {
            question: 'Was ist im MedienPass eine „Herausforderung“ (Reto)?',
            options: [
                'Eine Prüfung, die entscheidet, ob die*der Schüler*in in die nächste Stufe aufsteigen darf',
                'Eine situierte Lernaktivität, die eine oder mehrere KMK-Kompetenzen in einem bestimmten Fach entwickelt',
                'Ein Klassenprojekt, das das ganze Schuljahr dauert',
                'Ein landesweit standardisierter Test über digitales Wissen'
            ],
            explanation: 'Eine Herausforderung im MedienPass ist eine authentische, in ein Fach eingebettete Lernaktivität, mit der die Schüler*innen bestimmte KMK-Kompetenzen entwickeln und nachweisen. Sie ist keine summative, sondern eine formative Bewertung.'
        },
        kmk_05: {
            question: 'Eine Lehrkraft setzt den MedienPass richtig ein, wenn sie:',
            options: [
                'die Schüler*innen Informationen bei Google suchen und in ein Word-Dokument kopieren lässt',
                'Aktivitäten gestaltet, die Lehrplaninhalte mit der gezielten Entwicklung von KMK-Medienkompetenzen verbinden und Nachweise im ClassNotebook erzeugen',
                'YouTube-Videos als Zusatzaufgabe ohne anschließende Reflexion aufgibt',
                'den Beamer nur nutzt, um selbst erstellte Präsentationen zu zeigen'
            ],
            explanation: 'Richtiger Einsatz bedeutet, Lehrplan und KMK-Kompetenzen zu verbinden: Die Schüler*innen erstellen aktiv digitale Nachweise, die in Werkzeugen wie ClassNotebook innerhalb von Microsoft 365 dokumentiert werden.'
        },
        kmk_06: {
            question: 'Was ist der Unterschied zwischen einer Primär- und einer Sekundärquelle bei der digitalen Recherche?',
            options: [
                'Primärquellen sind kostenlos, Sekundärquellen kostenpflichtig',
                'Primärquellen stammen direkt vom Autor oder vom ursprünglichen Ereignis; Sekundärquellen sind Deutungen oder Zusammenfassungen davon',
                'Primärquellen gibt es nur auf Papier, Sekundärquellen nur digital',
                'Für den Unterricht gibt es keinen wichtigen Unterschied'
            ],
            explanation: 'Eine Primärquelle ist das Originaldokument (wissenschaftlicher Artikel, Rede, Kunstwerk). Eine Sekundärquelle analysiert oder deutet sie (Meinungsartikel, Lexikon, Zusammenfassung). In der digitalen Bildung ist es wichtig, beide Arten erkennen und richtig zitieren zu lernen.'
        },
        kmk_07: {
            question: 'Eine*ein Schüler*in findet in sozialen Netzwerken einen viralen Artikel zu einem wissenschaftlichen Thema. Wie prüft man am besten, ob er zuverlässig ist?',
            options: [
                'Wenn er viele „Likes“ und Teilungen hat, ist er zuverlässig',
                'Autor, Veröffentlichungsdatum und zitierte Quellen prüfen und mit mindestens 2 weiteren Quellen anerkannter Institutionen vergleichen',
                'Den Link in WhatsApp teilen und die Mitschüler*innen fragen, ob sie ihn kennen',
                'Dem Artikel vertrauen, wenn er unter den ersten Google-Ergebnissen erscheint'
            ],
            explanation: 'Für die Überprüfung eignet sich SIFT: Stop (vor dem Teilen innehalten), Investigate the source (Quelle prüfen), Find better coverage (weitere Berichte suchen), Trace claims (Aussagen bis zum Ursprung verfolgen). Die Anzahl der Likes sagt nichts über die Verlässlichkeit.'
        },
        kmk_08: {
            question: 'Mit welcher erweiterten Google-Suchtechnik findet man Ergebnisse NUR innerhalb einer bestimmten Website?',
            options: [
                'Das Wort in Anführungszeichen setzen: "Seite"',
                'Den Operator site: mit der Domain verwenden — Beispiel: site:bbc.com Klimawandel',
                'Den Namen der Website vor dem Suchbegriff in Großbuchstaben schreiben',
                'Die SafeSearch in den Google-Einstellungen aktivieren'
            ],
            explanation: 'Der Operator site: ist einer der nützlichsten bei Google. Beispiele: site:edu.co Coronavirus (nur kolumbianische Bildungsseiten), site:gov.de (nur deutsche Behördenseiten). Operatoren lassen sich kombinieren: site:scielo.org "künstliche Intelligenz" filetype:pdf'
        },
        kmk_09: {
            question: 'Was ist der „Bestätigungsfehler“ und wie beeinflusst er die digitale Informationssuche?',
            options: [
                'Ein technischer Fehler der Suchmaschinen, der doppelte Ergebnisse zeigt',
                'Die Neigung, nur Informationen zu suchen, zu deuten und zu behalten, die die eigenen Überzeugungen bestätigen, und Gegenbeweise zu ignorieren',
                'Wenn der Google-Algorithmus die Ergebnisse nach dem Verlauf personalisiert',
                'Ein Computervirus, der Suchergebnisse verändert'
            ],
            explanation: 'Der Bestätigungsfehler führt dazu, dass Schüler*innen (und Erwachsene) nur finden, was sie finden wollen. Lehrkräfte sollten Aktivitäten gestalten, bei denen mehrere Perspektiven gesucht und analysiert werden, auch Quellen, die die Ausgangsannahme infrage stellen.'
        },
        kmk_10: {
            question: 'Welche Quelle eignet sich für eine Recherche im Unterricht am besten, um begutachtete wissenschaftliche Artikel zu finden?',
            options: [
                'Wikipedia, weil jede*r sie bearbeiten und Quellen ergänzen kann',
                'Google Scholar, JSTOR, SciELO oder die akademischen Datenbanken der Institution',
                'YouTube Educational, weil Videos leichter zu verstehen sind',
                'Die ersten 5 Ergebnisse einer normalen Google-Suche'
            ],
            explanation: 'Google Scholar, JSTOR, SciELO, ERIC (Bildung) und PubMed (Gesundheit) bieten begutachtete Inhalte (peer-reviewed). Es lohnt sich, schon in der Grundschule zu lernen, solche Quellen zu erkennen, angepasst an das Niveau der Schüler*innen.'
        },
        kmk_11: {
            question: 'Was ist „Phishing“ und wie kann es Schüler*innen betreffen?',
            options: [
                'Eine Programmiertechnik zum Erstellen gefälschter Webseiten',
                'Ein Betrugsversuch, bei dem sich jemand als vertrauenswürdige Stelle ausgibt, um persönliche Daten wie Passwörter oder Bankdaten zu stehlen',
                'Ein Onlinespiel, das für Schüler*innen süchtig machen kann',
                'Der Fachbegriff für Softwarepiraterie in Lateinamerika'
            ],
            explanation: 'Phishing kommt meist per E-Mail, SMS oder über soziale Netzwerke. Schüler*innen sind anfällig, weil sie Nachrichten eher vertrauen. Warnzeichen: extreme Dringlichkeit, Rechtschreibfehler, verdächtiger Absender, Frage nach Passwörtern.'
        },
        kmk_12: {
            question: 'Eine*ein Schüler*in der 4. Klasse möchte ein Konto in einem sozialen Netzwerk anlegen. Wie reagiert die Lehrkraft am besten?',
            options: [
                'Sie*ihn unterstützen, weil soziale Netzwerke wichtige Kommunikationsfähigkeiten fördern',
                'Erklären, dass die meisten sozialen Netzwerke ein Mindestalter von 13–16 Jahren haben, über die konkreten Risiken sprechen und auf sichere Lernplattformen verweisen',
                'Die Internetnutzung außerhalb der Schule strikt verbieten',
                'Das Thema ignorieren, weil es allein Sache der Eltern ist'
            ],
            explanation: 'Das Mindestalter bei Facebook, Instagram und TikTok liegt bei 13 Jahren (COPPA in den USA, DSGVO in Europa, Gesetz 1581 in Kolumbien). Die Lehrkraft hat eine beratende Rolle: über Risiken informieren (digitaler Fußabdruck, Täter*innen, Cybermobbing) und sichere Alternativen anbieten.'
        },
        kmk_13: {
            question: 'Welche Datenschutzregeln sind wesentlich, wenn Fotos von Schüler*innen im Schulblog veröffentlicht werden?',
            options: [
                'Eine Erlaubnis ist nur bei Schüler*innen unter 10 Jahren nötig',
                'Schriftliche Einwilligung der Eltern/Erziehungsberechtigten einholen, identifizierende Daten (Namen, Ort) vermeiden und das Datenschutzgesetz einhalten (Gesetz 1581 in Kolumbien)',
                'Es reicht, den Blog auf privat zu stellen',
                'Für Fotos, die in der Schule aufgenommen wurden, ist keine Erlaubnis nötig'
            ],
            explanation: 'In Kolumbien verlangt das Gesetz 1581/2012 (Datenschutz) eine Einwilligung zur Verarbeitung von Daten Minderjähriger. Die DSB sollte Einwilligungsformulare haben. Für europäische Staatsangehörige gilt zusätzlich die DSGVO. Faustregel: nie Name + Foto + Ort zusammen veröffentlichen.'
        },
        kmk_14: {
            question: 'Welche Praxis schützt das Microsoft-365-Konto einer*eines Schüler*in am besten?',
            options: [
                'Überall dasselbe Passwort verwenden, um es nicht zu vergessen',
                'Ein langes, einzigartiges Passwort (12+ Zeichen, verschiedene Zeichenarten), Zwei-Faktor-Authentifizierung aktivieren und es niemals teilen, auch nicht mit Freund*innen',
                'Das Passwort auf einem Post-it im Heft aufbewahren, damit es nicht verloren geht',
                'Das Passwort jedes Jahr ändern, auch wenn nichts passiert ist'
            ],
            explanation: 'Die Mehrfaktor-Authentifizierung (MFA) senkt das Risiko eines unbefugten Zugriffs um 99,9 % (Microsoft). Ein starkes Passwort nutzt Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen, z. B. „M3dien!Pass#2526“, oder besser einen Satz: „Ich-Lerne-Viel-In-Klasse-4!“'
        },
        kmk_15: {
            question: 'Was ist Cybermobbing und wie sollte die Schule vorgehen, wenn ein Fall erkannt wird?',
            options: [
                'Wenn Schüler*innen zu viele Videospiele spielen; die Lösung ist, ihnen die Geräte wegzunehmen',
                'Wiederholte, absichtliche digitale Belästigung. Das Vorgehen umfasst: Beweise dokumentieren, die Koordination informieren, die betroffene Person psychologisch begleiten, ein pädagogisches Gespräch mit der verursachenden Person führen und die Familien informieren',
                'Es sollte nur zwischen den beteiligten Schüler*innen geklärt werden, damit sie Konflikte lösen lernen',
                'Es ist allein Aufgabe der Schulpsychologie; die Lehrkraft sollte sich nicht einmischen'
            ],
            explanation: 'Cybermobbing (in Kolumbien Gesetz 1620/2013 zum schulischen Zusammenleben) erfordert ein Eingreifen der Institution. Das Protokoll der DSB sollte umfassen: Beweise sichern (Bildschirmfotos), nichts löschen, den Ausschuss für Zusammenleben einschalten und die Sicherheit der betroffenen Person gewährleisten.'
        },
        kmk_16: {
            question: 'Welche Lizenz erlaubt es, ein Werk frei zu nutzen, zu verändern und zu verbreiten, verlangt aber die Nennung der Urheberin oder des Urhebers?',
            options: [
                'Vollständiges Copyright — alle Rechte vorbehalten',
                'Creative Commons Namensnennung (CC BY) — erlaubt Nutzung, Verbreitung und Veränderung mit Nennung der Urheberin oder des Urhebers',
                'Gemeinfreiheit — jedes Werk ohne registriertes Entstehungsdatum',
                'Freie Softwarelizenz GNU GPL, angepasst an Bildungsinhalte'
            ],
            explanation: 'Creative Commons CC BY ist die freizügigste Variante. Es gibt Varianten: CC BY-SA (Weitergabe unter gleichen Bedingungen), CC BY-NC (nicht kommerziell), CC BY-ND (keine Bearbeitung). Für den Unterricht eignen sich Pixabay, Unsplash (CC0), Freesound und Wikimedia Commons; die Schüler*innen sollten richtiges Zitieren lernen.'
        },
        kmk_17: {
            question: 'Welchen Vorteil hat im ClassNotebook die „Inhaltsbibliothek“ (Content Library) gegenüber dem „Bereich für Zusammenarbeit“?',
            options: [
                'In der Inhaltsbibliothek können Schüler*innen die Materialien der Lehrkraft direkt bearbeiten',
                'Die Inhaltsbibliothek ist für Schüler*innen schreibgeschützt (die Lehrkraft stellt Material bereit); im Bereich für Zusammenarbeit können Gruppen gleichzeitig bearbeiten',
                'Es gibt keinen Unterschied, beide Bereiche funktionieren gleich',
                'Die Inhaltsbibliothek ist nur für PDF-Dateien, die Notizbücher nur für Bilder'
            ],
            explanation: 'Dieser Unterschied ist im ClassNotebook entscheidend: Content Library = Materialsammlung der Lehrkraft (für Schüler*innen schreibgeschützt). Collaboration Space = gemeinsam in Echtzeit bearbeitbarer Bereich. Jede*r Schüler*in hat außerdem ein persönliches Notizbuch, das die Lehrkraft sehen, aber nicht bearbeiten kann.'
        },
        kmk_18: {
            question: 'Welche Mindestelemente sollte eine gute digitale Präsentation ab Klasse 4 enthalten?',
            options: [
                'Nur Text – je mehr, desto besser, um zu zeigen, dass recherchiert wurde',
                'Klarer Titel, visuelle Hierarchie (max. 5 Punkte pro Folie), lizenzierte Bilder, zitierte Quellen, gut lesbarer Kontrast und ein Fazit oder Handlungsaufruf',
                'Auffällige Animationen und möglichst viele Farben, um die Aufmerksamkeit zu halten',
                'Die*der Schüler*in sollte den Text der Quellen wörtlich übernehmen, damit er genau ist'
            ],
            explanation: 'Die 5-5-5-Regel: höchstens 5 Wörter pro Zeile, 5 Zeilen pro Folie, 5 Folien mit dichter Aussage. WCAG-Kontrastregel: mindestens 4,5:1 zwischen Text und Hintergrund. Bilder müssen eine CC-Lizenz haben oder selbst erstellt sein. Quellen immer angeben.'
        },
        kmk_19: {
            question: 'Eine*ein Schüler*in dreht ein kurzes Video für den MedienPass. Welche technischen und pädagogischen Aspekte sind am wichtigsten?',
            options: [
                'Es sollte möglichst lang sein, mindestens 10 Minuten, um Einsatz zu zeigen',
                'Drehbuch planen, gute Beleuchtung, klarer Ton, eine zum Ziel passende Länge (1–3 Min. in der Grundschule), eine klare Botschaft und Achtung der Bildrechte der gezeigten Personen',
                'Es sollte alle Effekte und Filter der App verwenden',
                'Länge und technische Qualität sind egal, wenn der Inhalt interessant ist'
            ],
            explanation: 'In der Grundschule (Klasse 2–6) wirken Videos von 1–3 Minuten am besten. Vorproduktion: Drehbuch und Storyboard. Produktion: Drittel-Regel, wenn möglich externes Mikrofon, ruhiger Hintergrund. Nachbearbeitung: einfacher Schnitt, barrierefreie Untertitel. Einwilligung: Wenn Mitschüler*innen zu sehen sind, um Erlaubnis bitten.'
        },
        kmk_20: {
            question: 'Welches Werkzeug aus Microsoft 365 eignet sich am besten, damit Schüler*innen gemeinsam Infografiken oder visuelle Designs erstellen?',
            options: [
                'Microsoft Word, weil alle es kennen',
                'Microsoft Sway oder Canva for Education, die visuelle Vorlagen und Zusammenarbeit in Echtzeit bieten und sich im ClassNotebook veröffentlichen lassen',
                'Microsoft Excel, weil man Diagramme und Datentabellen einfügen kann',
                'Microsoft Outlook, weil es die Zusammenarbeit per E-Mail erleichtert'
            ],
            explanation: 'Microsoft Sway erstellt responsive Web-Präsentationen und Infografiken. Canva for Education (für Schulen kostenlos) ermöglicht Zusammenarbeit in Echtzeit und bietet Millionen lizenzierter Elemente. Beide erzeugen Links, die sich direkt in ClassNotebook-Seiten einbetten lassen.'
        },
        kmk_21: {
            question: 'Was ist der Unterschied zwischen SYNCHRONER und ASYNCHRONER Kommunikation in digitalen Umgebungen?',
            options: [
                'Synchron nutzt das Internet, asynchron funktioniert offline',
                'Synchron geschieht in Echtzeit (Teams-Besprechung, Videokonferenz, Live-Chat); asynchron zeitversetzt (E-Mail, ClassNotebook, Foren, Aufgaben)',
                'Synchron ist immer wirksamer; asynchron dient nur als Ersatz',
                'Pädagogisch gibt es keinen Unterschied zwischen beiden Formen'
            ],
            explanation: 'In der digitalen Bildung haben beide ihren Wert. Synchron: Diskussionen in Echtzeit, Gruppendynamik, sofortige Rückmeldung. Asynchron: ermöglicht Reflexion, kommt unterschiedlichen Lerntempi entgegen, erzeugt schriftliche Nachweise. ClassNotebook verbindet beide Formen wirksam.'
        },
        kmk_22: {
            question: 'Was ist „Netiquette“ und warum sollte man sie im digitalen Unterricht vermitteln?',
            options: [
                'Eine App zur Verwaltung der Schülerpasswörter im Schulnetz',
                'Die Regeln für Verhalten und ethische Kommunikation in digitalen Umgebungen: Respekt, Klarheit, Verantwortung für das, was man veröffentlicht, und für den Umgang mit anderen',
                'Das technische Handbuch zur Einrichtung des Schul-WLANs',
                'Sie ist nur für Erwachsene in beruflichen Netzwerken wie LinkedIn relevant'
            ],
            explanation: 'Zur Netiquette gehört: nicht in GROSSBUCHSTABEN schreiben (wirkt wie Schreien), in angemessener Zeit antworten, formelle (Microsoft Teams) von informellen Kanälen (WhatsApp) unterscheiden, andere Meinungen respektieren, nichts Ungeprüftes teilen. Sie ist eine KMK-Kompetenz im Bereich Kommunizieren und Kooperieren.'
        },
        kmk_23: {
            question: 'Welche gute pädagogische Praxis empfiehlt der KMK-Rahmen, wenn man in Microsoft Teams einer Gruppe eine gemeinsame Arbeit aufgibt?',
            options: [
                'Immer dieselbe Person als Gruppenleitung bestimmen, um die Qualität zu sichern',
                'Klare Rollen festlegen (Recherche, Schreiben, Präsentieren, Prüfen), Regeln für die Zusammenarbeit vereinbaren, die gemeinsame Bearbeitung in Echtzeit nutzen und sicherstellen, dass alle nachvollziehbar beitragen',
                'Die Schüler*innen sich ohne jede Struktur selbst organisieren lassen',
                'Teams nur zur Kommunikation nutzen, nicht für die gemeinsame Arbeit an Dokumenten'
            ],
            explanation: 'Wirksame digitale Zusammenarbeit braucht Struktur. In Teams: Kanäle pro Projekt anlegen, @-Erwähnungen für gezielte Hinweise nutzen, die gemeinsame Bearbeitung in Word/PowerPoint online einsetzen, Zwischentermine festlegen. ClassNotebook zeigt der Lehrkraft den Prozess, nicht nur das Endprodukt.'
        },
        kmk_24: {
            question: 'Wie kann eine Lehrkraft das ClassNotebook nutzen, um jeder*jedem Schüler*in persönliches, formatives Feedback zu geben?',
            options: [
                'Feedback ist nur für die ganze Gruppe über allgemeine Ankündigungen in Teams möglich',
                'Indem sie das persönliche Notizbuch jeder*jedes Schüler*in öffnet und auf der eigenen Seite Kommentare, Audio, Freihandnotizen oder Antworten einfügt, ohne die Arbeit der anderen zu beeinflussen',
                'Indem sie nach jeder Stunde einzelne E-Mails mit Anhängen verschickt',
                'ClassNotebook erlaubt kein individuelles, nur Gruppen-Feedback'
            ],
            explanation: 'ClassNotebook ist ein starkes Feedback-Werkzeug: Die Lehrkraft kann den privaten Bereich jeder*jedes Schüler*in öffnen, Textkommentare und kurze Sprachaufnahmen einfügen, mit dem digitalen Stift Notizen machen und Sticker/Abzeichen vergeben. Jede*r Schüler*in sieht nur das eigene Notizbuch.'
        },
        kmk_25: {
            question: 'Welche Strategie fördert im KMK-Rahmen am besten eine aktive und verantwortungsvolle digitale Bürgerschaft?',
            options: [
                'Geräte in der Pause ganz verbieten, um Konflikte zu vermeiden',
                'Projekte gestalten, in denen die Schüler*innen digitale Inhalte mit echtem Nutzen erstellen (für die Gemeinschaft, Eltern, andere Klassen), die Wirkung ihrer Veröffentlichungen kritisch reflektieren und Informationen verantwortungsvoll kuratieren',
                'Das Internet auf die Suche nach bestimmten Aufgaben beschränken, ohne freies Surfen',
                'Nur Plattformen ohne Internetzugang nutzen, um die Sicherheit der Schüler*innen zu garantieren'
            ],
            explanation: 'Digitale Bürgerschaft nach KMK ist aktiv, nicht einschränkend. Die Schüler*innen sollen Inhalte erstellen, kuratieren und kritisch hinterfragen. Projekte wie Schulblogs, Podcasts für die Gemeinschaft, Anleitungen für Eltern oder Präsentationen bei echten Veranstaltungen fördern echte digitale Verantwortung.'
        }
    },
    en: {
        kmk_01: {
            question: 'What does the acronym KMK stand for in the context of German digital education?',
            options: [
                'Kultusministerkonferenz — Standing Conference of the Ministers of Education and Cultural Affairs of the German states',
                'Kompetenzen Medialer Kultur — Media culture competencies',
                'Kreativität, Medien und Kommunikation — Creativity, media and communication',
                'Keine Medien Kontrolle — No media control'
            ],
            explanation: 'KMK is the Kultusministerkonferenz, the body that set the digital competency framework for German education ("Bildung in der digitalen Welt", 2016). It defines 6 competency areas for the responsible use of digital media.'
        },
        kmk_02: {
            question: 'How many main competencies does the KMK digital education framework include?',
            options: [
                '3 competencies: search, communicate and produce',
                '6 competencies: search/process, communicate/collaborate, produce, protect/act safely, solve problems, analyze/reflect',
                '4 competencies: digital, media, critical and information literacy',
                '8 competencies according to the European DigComp framework'
            ],
            explanation: 'The KMK framework defines 6 areas: 1) Search, process and store; 2) Communicate and cooperate; 3) Produce and present; 4) Protect and act safely; 5) Solve problems and act; 6) Analyze and reflect.'
        },
        kmk_03: {
            question: 'What is the main goal of the MEDIENPASS at the German School?',
            options: [
                'To certify that students can use social networks in an entertaining way',
                'To document and progressively develop students\' media competencies throughout their schooling',
                'To replace textbooks with tablets in every subject',
                'To give each student a numerical grade for digital performance'
            ],
            explanation: 'The MedienPass is a tool for documentation and progressive development. Students record their progress in digital competencies according to the KMK framework, and it serves as an evidence portfolio throughout their schooling.'
        },
        kmk_04: {
            question: 'In the MedienPass, what is a "Challenge" (Reto / Herausforderung)?',
            options: [
                'An exam that decides whether the student can move up a level',
                'A situated learning activity that develops one or more KMK competencies within a specific subject',
                'A class project that lasts the whole school year',
                'A national standardized test of digital knowledge'
            ],
            explanation: 'A MedienPass challenge is an authentic learning activity set within a subject, through which students develop and demonstrate specific KMK competencies. It is formative, not summative, assessment.'
        },
        kmk_05: {
            question: 'A teacher integrates the MedienPass correctly when they:',
            options: [
                'Ask students to find information on Google and copy it into a Word document',
                'Design activities that connect curriculum content with the explicit development of KMK media competencies, producing evidence in ClassNotebook',
                'Assign YouTube videos as extra homework without any reflection afterwards',
                'Use the classroom projector only to show presentations made by the teacher'
            ],
            explanation: 'Correct integration links the curriculum with KMK competencies: students actively produce digital evidence, which is documented in tools such as ClassNotebook within Microsoft 365.'
        },
        kmk_06: {
            question: 'What is the difference between a primary and a secondary source in digital research?',
            options: [
                'Primary sources are free; secondary sources are paid',
                'Primary sources come directly from the author or the original event; secondary sources interpret or summarize them',
                'Primary sources exist only on paper; secondary sources only in digital form',
                'There is no relevant difference for classroom work'
            ],
            explanation: 'A primary source is the original document (scientific article, speech, artwork). A secondary source analyzes or interprets it (opinion piece, encyclopedia, summary). In digital education it is key to teach students to identify and correctly cite each type.'
        },
        kmk_07: {
            question: 'A student finds a viral article on social media about a scientific topic. What is the best strategy to judge its reliability?',
            options: [
                'If it has many likes and shares, it is reliable',
                'Check the author, publication date and cited sources, and compare it with at least 2 more sources from recognized institutions',
                'Paste the link in WhatsApp and ask classmates whether they know it',
                'Trust the article if it appears among the first Google results'
            ],
            explanation: 'Verification calls for SIFT: Stop (pause before sharing), Investigate the source, Find better coverage, Trace claims back to their origin. The number of likes says nothing about reliability.'
        },
        kmk_08: {
            question: 'Which advanced Google search technique finds results ONLY within a specific website?',
            options: [
                'Put quotation marks around the word: "site"',
                'Use the site: operator followed by the domain — example: site:bbc.com climate change',
                'Type the site\'s name in capital letters before the search term',
                'Turn on SafeSearch in the Google settings'
            ],
            explanation: 'The site: operator is one of the most useful in Google. Examples: site:edu.co coronavirus (Colombian education sites only), site:gov.de (German government sites only). Operators can be combined: site:scielo.org "artificial intelligence" filetype:pdf'
        },
        kmk_09: {
            question: 'What is "confirmation bias" and how does it affect digital information searches?',
            options: [
                'A technical search-engine error that shows repeated results',
                'The tendency to search for, interpret and remember only information that confirms our prior beliefs, ignoring contrary evidence',
                'When the Google algorithm personalizes results based on the user\'s history',
                'A computer virus that alters search results'
            ],
            explanation: 'Confirmation bias leads students (and adults) to find only what they want to find. Teachers should design activities that require searching for and analyzing several perspectives, including sources that question the initial hypothesis.'
        },
        kmk_10: {
            question: 'For a classroom research activity, which resource is best for finding peer-reviewed scientific articles?',
            options: [
                'Wikipedia, because anyone can edit it and add sources',
                'Google Scholar, JSTOR, SciELO or the institution\'s academic databases',
                'YouTube Educational, because videos are easier to understand',
                'The first 5 results of a normal Google search'
            ],
            explanation: 'Google Scholar, JSTOR, SciELO, ERIC (education) and PubMed (health) offer peer-reviewed content. It is worth teaching students to recognize these sources from primary school on, adapting the complexity to their level.'
        },
        kmk_11: {
            question: 'What is "phishing" and how can it affect students?',
            options: [
                'A programming technique for building fake web pages',
                'A fraud attempt in which someone pretends to be a trusted organization to steal personal data such as passwords or bank details',
                'An online game that can become addictive for students',
                'The technical term for software piracy in Latin America'
            ],
            explanation: 'Phishing usually arrives by email, text message or social media. Students are vulnerable because they trust messages more easily. Warning signs: extreme urgency, spelling mistakes, a suspicious sender, requests for passwords.'
        },
        kmk_12: {
            question: 'A 4th-grade student wants to create a social media account. What is the most appropriate response from the teacher?',
            options: [
                'Support them, because social networks develop important communication skills',
                'Explain that most social networks have a minimum age of 13–16, talk about the specific risks and point them to safe educational platforms',
                'Strictly forbid them from using the internet outside school',
                'Ignore the topic because it is solely the parents\' responsibility'
            ],
            explanation: 'The minimum age on Facebook, Instagram and TikTok is 13 (COPPA in the US, GDPR in Europe, Law 1581 in Colombia). The teacher has a guiding role: explain the risks (digital footprint, predators, cyberbullying) and offer safe alternatives.'
        },
        kmk_13: {
            question: 'When publishing photos of students on a school blog, which privacy considerations are essential?',
            options: [
                'Permission is only needed if the students are under 10',
                'Get written informed consent from parents/guardians, avoid identifying data (names, location) and comply with data protection law (Law 1581 in Colombia)',
                'Setting the blog to private is enough',
                'No permission is needed if the photos were taken at school'
            ],
            explanation: 'In Colombia, Law 1581/2012 (data protection) requires consent to process minors\' data. The DSB should have authorization forms. The GDPR also applies to European citizens. Rule of thumb: never publish name + photo + location together.'
        },
        kmk_14: {
            question: 'Which practice best protects a student\'s Microsoft 365 account?',
            options: [
                'Use the same password everywhere so you don\'t forget it',
                'A long, unique password (12+ characters, mixing types), two-factor authentication turned on, and never sharing it, not even with friends',
                'Keep the password on a sticky note in the notebook so it doesn\'t get lost',
                'Change the password every year even if nothing has happened'
            ],
            explanation: 'Multi-factor authentication (MFA) reduces the risk of unauthorized access by 99.9% (Microsoft). A strong password mixes upper and lower case, numbers and symbols, e.g. "M3dien!Pass#2526", or better a sentence: "I-Learn-A-Lot-In-4th-Grade!"'
        },
        kmk_15: {
            question: 'What is cyberbullying and what should the school do when a case is detected?',
            options: [
                'When students play too many video games; the solution is to take their devices away',
                'Repeated, deliberate digital harassment. The response should include: documenting evidence, informing the coordination team, psychological support for the person affected, a formative conversation with the aggressor and communication with the families',
                'It should be handled only among the students involved so they learn to solve their conflicts',
                'It is solely the school psychologist\'s job and the teacher should not intervene'
            ],
            explanation: 'Cyberbullying (Law 1620/2013 on school coexistence in Colombia) requires institutional intervention. The DSB protocol should include: preserving evidence (screenshots), never deleting it, activating the coexistence committee and ensuring the safety of the student affected.'
        },
        kmk_16: {
            question: 'Which license allows a work to be freely reused, modified and distributed, but requires credit to the original author?',
            options: [
                'Full copyright — all rights reserved',
                'Creative Commons Attribution (CC BY) — allows using, distributing and modifying the work while crediting the author',
                'Public domain — any work without a registered creation date',
                'GNU GPL free software license adapted to educational content'
            ],
            explanation: 'Creative Commons CC BY is the most permissive. There are variants: CC BY-SA (share alike), CC BY-NC (non-commercial), CC BY-ND (no derivatives). For class, good sources are Pixabay, Unsplash (CC0), Freesound and Wikimedia Commons, and students should learn to cite correctly.'
        },
        kmk_17: {
            question: 'In ClassNotebook, what advantage does the Content Library have over the Collaboration Space?',
            options: [
                'In the Content Library students can edit the teacher\'s materials directly',
                'The Content Library is read-only for students (the teacher publishes resources); the Collaboration Space allows simultaneous group editing',
                'There is no difference; both sections work exactly the same',
                'The Content Library is only for PDF files; the notebooks only for images'
            ],
            explanation: 'This distinction is key in ClassNotebook: Content Library = the teacher\'s resource repository (read-only for students). Collaboration Space = a space co-edited in real time. Each student also has a personal notebook that the teacher can see but not edit.'
        },
        kmk_18: {
            question: 'What minimum elements should a good digital presentation include from Klasse 4 on?',
            options: [
                'Only text — the more the better, to show the student did research',
                'A clear title, visual hierarchy (max 5 points per slide), licensed images, cited sources, readable contrast and a conclusion or call to action',
                'Eye-catching animations and every possible color to hold attention',
                'The student should copy the text of the sources word for word to be accurate'
            ],
            explanation: 'The 5-5-5 rule: at most 5 words per line, 5 lines per slide, 5 slides with dense ideas. WCAG contrast rule: a minimum ratio of 4.5:1 between text and background. Images must have a CC license or be your own. Always credit sources.'
        },
        kmk_19: {
            question: 'A student records a short video for their MedienPass. Which technical and teaching aspects matter most?',
            options: [
                'It should be as long as possible, at least 10 minutes, to show effort',
                'Planning the script, good lighting, clear audio, a length that fits the goal (1–3 min in primary school), a structured message and respect for the image rights of the people who appear',
                'It should use every effect and filter in the app',
                'Length and technical quality don\'t matter if the content is interesting'
            ],
            explanation: 'In primary school (Klasse 2–6), 1–3 minute videos work best. Pre-production: script and storyboard. Production: rule of thirds, an external microphone if possible, a clean background. Post-production: basic editing, accessible subtitles. Consent: if classmates appear, ask for permission.'
        },
        kmk_20: {
            question: 'Which Microsoft 365 tool is best for students to create infographics or visual designs together?',
            options: [
                'Microsoft Word, because everyone knows it',
                'Microsoft Sway or Canva for Education, which offer visual templates and real-time collaboration and can be published in ClassNotebook',
                'Microsoft Excel, because it lets you insert charts and data tables',
                'Microsoft Outlook, because it makes collaboration by email easier'
            ],
            explanation: 'Microsoft Sway creates responsive web presentations and infographics. Canva for Education (free for schools) allows real-time collaboration and offers millions of licensed elements. Both generate links that can be embedded directly in ClassNotebook pages.'
        },
        kmk_21: {
            question: 'What is the difference between SYNCHRONOUS and ASYNCHRONOUS communication in digital environments?',
            options: [
                'Synchronous uses the internet; asynchronous works offline',
                'Synchronous happens in real time (Teams meetings, video calls, live chat); asynchronous happens with a time gap (email, ClassNotebook, forums, assignments)',
                'Synchronous is always more effective; asynchronous is only a backup',
                'There is no teaching difference between the two'
            ],
            explanation: 'Both have value in digital education. Synchronous: real-time discussions, group dynamics, immediate feedback. Asynchronous: allows reflection, suits students with different paces, produces written evidence. ClassNotebook combines both effectively.'
        },
        kmk_22: {
            question: 'What is "netiquette" and why is it important to teach it in the digital classroom?',
            options: [
                'An app to manage students\' passwords on the school network',
                'The rules of behavior and ethical communication in digital environments: respect, clarity, responsibility for what you publish and how you interact with others',
                'The technical manual for setting up the school Wi-Fi',
                'It is only relevant for adults on professional networks such as LinkedIn'
            ],
            explanation: 'Netiquette includes: not writing in CAPITALS (seen as shouting), replying in reasonable time, telling formal channels (Microsoft Teams) from informal ones (WhatsApp), respecting different opinions, not sharing unverified information. It is a KMK competency in the communication and collaboration area.'
        },
        kmk_23: {
            question: 'In Microsoft Teams, when assigning group work, which good teaching practice does the KMK framework recommend?',
            options: [
                'Always make the same person the group leader to ensure quality',
                'Define clear roles (researcher, writer, presenter, reviewer), agree on collaboration rules, use real-time co-editing and make sure everyone contributes in a documented way',
                'Let students organize themselves without any structure',
                'Use Teams only for communication, not for collaborative work on documents'
            ],
            explanation: 'Effective digital collaboration needs structure. In Teams: create channels per project, use @mentions for specific notifications, take advantage of co-editing in Word/PowerPoint online, set intermediate deadlines. ClassNotebook lets the teacher see the process, not only the final product.'
        },
        kmk_24: {
            question: 'How can a teacher use ClassNotebook to give each student personalized, formative feedback?',
            options: [
                'Feedback is only possible for the whole group through general announcements in Teams',
                'By opening each student\'s individual notebook and inserting comments, audio, ink annotations or replies on their own page without affecting anyone else\'s work',
                'By sending individual emails with attachments after every class',
                'ClassNotebook does not allow individual feedback, only group feedback'
            ],
            explanation: 'ClassNotebook is a powerful feedback tool: the teacher can open each student\'s private space, add text comments and short voice recordings, annotate with a digital pen and award stickers/badges. Each student sees only their own notebook.'
        },
        kmk_25: {
            question: 'Which strategy best promotes active and responsible digital citizenship under the KMK framework?',
            options: [
                'Completely ban devices during breaks to avoid conflicts',
                'Design projects where students create digital content of real value (for the community, parents, other grades), reflect critically on the impact of what they publish and practice responsible curation of information',
                'Limit internet use to searches for specific assignments, without free browsing',
                'Use only platforms without internet access to guarantee students\' safety'
            ],
            explanation: 'KMK digital citizenship is proactive, not restrictive. Students should be creators, curators and critics of content. Projects such as school blogs, podcasts for the community, tutorials for parents or presentations at real events build authentic digital responsibility.'
        }
    }
};

// Banco de preguntas en el idioma pedido (es, de o en); lo que falte se queda en español.
function getKmkQuestions(lang) {
    const tr = translations[lang] || {};
    return kmkTrainingQuestions.map(q => {
        const t = tr[q.id] || {};
        return {
            ...q,
            question: t.question || q.question,
            options: t.options || q.options,
            explanation: t.explanation || q.explanation,
            categoryLabel: (categoryLabels[lang] && categoryLabels[lang][q.category]) || q.categoryLabel,
            difficultyLabel: (difficultyLabels[lang] || difficultyLabels.es)[q.difficulty] || q.difficulty
        };
    });
}

module.exports = { getKmkQuestions };
