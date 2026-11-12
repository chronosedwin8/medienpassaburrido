// ═══════════════════════════════════════════
// MedienPass visual: Prekínder, Kinder, K1 y K2 (services/class_levels.js).
// Aún no saben escribir: 3 preguntas por reto, con imagen grande y voz, sin campos de texto.
// Cada materia usa su paquete (data_subject_packs.js: name, k2topic, k2search, k2work) para que
// ninguna repita enunciados ni grupos de opciones.
// Se gana con las 3 correctas (services/reto_result.js); si se equivoca, puede intentar otra vez.
// Ids: r{reto}_{materia}_k2_q{n} y r0v_{materia}_q{n} en el Reto 0.
// ═══════════════════════════════════════════

const { getSubjectPack } = require('./data_subject_packs');

const t = (es, de, en) => ({ es, de, en });
const opt = (emoji, text, correct = false) => ({ ...text, emoji, correct });

// Imagen de cada materia: topic, lo que aprende; work, lo que hace
const SUBJECT_PICTURES = {
    aleman: { topic: '🐶', work: '🖍️' },
    espanol: { topic: '📖', work: '📚' },
    ingles: { topic: '🌈', work: '🖍️' },
    tecnologia: { topic: '🤖', work: '🔧' },
    ciencias: { topic: '🌱', work: '🌿' },
    individuos: { topic: '🏘️', work: '🗺️' },
    matematicas: { topic: '🔢', work: '🔺' },
    musica: { topic: '🎸', work: '🎙️' },
    arte: { topic: '🎨', work: '🖌️' },
    mint_sach: { topic: '🌞', work: '🧪' },
    deportes: { topic: '🏊', work: '🏐' }
};
// Materia nueva: su propio ícono como tema
function picturesOf(subject) {
    if (SUBJECT_PICTURES[subject]) return SUBJECT_PICTURES[subject];
    const custom = require('./data_levels').subjects.find(s => s.id === subject && s.custom);
    return custom ? { topic: custom.icon || '📘', work: '📝' } : SUBJECT_PICTURES.tecnologia;
}

// Las 6 competencias, en palabras de niños (Reto 0 y encabezado de cada reto)
const VISUAL_COMPETENCES = {
    1: { icon: '🔍', title: t('Buscar y guardar', 'Suchen und speichern', 'Find and save'),
        say: (E, D, N) => t(`Busco ${E.k2topic} con ayuda y guardo mi trabajo.`, `Mit Hilfe suche ich etwas über ${D.k2topic} und speichere meine Arbeit.`, `With help, I look for ${N.k2topic} and save my work.`) },
    2: { icon: '💬', title: t('Hablar y ayudar', 'Sprechen und helfen', 'Talk and help'),
        say: (E, D, N) => t(`Hablo con respeto y ayudo a mi grupo en ${E.name}.`, `Ich spreche respektvoll und helfe meiner Gruppe in ${D.name}.`, `I speak with respect and help my group in ${N.name}.`) },
    3: { icon: '🎨', title: t('Crear y mostrar', 'Gestalten und zeigen', 'Create and show'),
        say: (E, D, N) => t(`Hago ${E.k2work} y se lo muestro a la clase.`, `Ich mache ${D.k2work} und zeige es der Klasse.`, `I make ${N.k2work} and show it to the class.`) },
    4: { icon: '🛡️', title: t('Cuidarme', 'Auf mich aufpassen', 'Stay safe'),
        say: (E, D, N) => t(`Cuido mis datos y mi cuerpo cuando uso la tableta en ${E.name}.`, `Ich schütze meine Daten und meinen Körper, wenn ich das Tablet in ${D.name} benutze.`, `I look after my details and my body when I use the tablet in ${N.name}.`) },
    5: { icon: '⚙️', title: t('Resolver', 'Probleme lösen', 'Solve problems'),
        say: (E, D, N) => t(`Si algo falla en ${E.name}, lo intento otra vez o pido ayuda.`, `Wenn in ${D.name} etwas nicht klappt, versuche ich es noch einmal oder bitte um Hilfe.`, `If something goes wrong in ${N.name}, I try again or ask for help.`) },
    6: { icon: '🧠', title: t('Pensar', 'Nachdenken', 'Think'),
        say: (E, D, N) => t(`Pregunto si es verdad lo que veo sobre ${E.k2topic}.`, `Ich frage, ob stimmt, was ich über ${D.k2topic} sehe.`, `I ask whether what I see about ${N.k2topic} is true.`) }
};

// VISUAL_TEMPLATES[reto] = [{ kmk, build: (E, D, N, pictures) => { label, options } }]
const VISUAL_TEMPLATES = {
    1: [
        { kmk: '1.1', build: (E, D, N) => ({
            label: t(`¿Dónde buscas ${E.k2topic} con ayuda de tu profe?`, `Wo findest du mit deiner Lehrkraft etwas über ${D.k2topic}?`, `Where do you look for ${N.k2topic} with your teacher's help?`),
            options: [
                opt('🔍', t(`En el buscador: «${E.k2search}»`, `In der Suchmaschine: „${D.k2search}“`, `In the search box: “${N.k2search}”`), true),
                opt('🎮', t(`En un juego de carros, sin mirar ${E.k2topic}`, `In einem Rennspiel, ohne etwas über ${D.k2topic} zu sehen`, `In a racing game, without looking at ${N.k2topic}`)),
                opt('🛏️', t('Debajo de la cama', 'Unter dem Bett', 'Under the bed'))
            ]
        }) },
        // IA: lo que dice un robot que habla también se comprueba con un adulto
        { kmk: '1.2', ai: true, build: (E, D, N) => ({
            label: t(`Un robot que habla (una IA) te cuenta algo sobre ${E.k2topic}. ¿Cómo sabes si es verdad?`, `Ein sprechender Roboter (eine KI) erzählt dir etwas über ${D.k2topic}. Wie findest du heraus, ob es stimmt?`, `A talking robot (an AI) tells you something about ${N.k2topic}. How do you find out if it is true?`),
            options: [
                opt('🤖', t('Le creo todo porque es un robot', 'Ich glaube alles, weil es ein Roboter ist', 'I believe everything because it is a robot')),
                opt('🧑‍🏫', t(`Le pregunto a mi profe de ${E.name}`, `Ich frage meine Lehrkraft in ${D.name}`, `I ask my ${N.name} teacher`), true),
                opt('🙈', t(`No le pregunto a nadie sobre ${E.k2topic}`, `Ich frage niemanden zu ${D.k2topic}`, `I don't ask anyone about ${N.k2topic}`))
            ]
        }) },
        { kmk: '1.3', build: (E, D, N) => ({
            label: t(`¿Dónde guardas ${E.k2work} para que no se pierda?`, `Wo speicherst du ${D.k2work}, damit nichts verloren geht?`, `Where do you save ${N.k2work} so it doesn't get lost?`),
            options: [
                opt('🗑️', t('En la papelera', 'Im Papierkorb', 'In the recycle bin')),
                opt('🧸', t('En la caja de juguetes', 'In der Spielzeugkiste', 'In the toy box')),
                opt('📁', t(`En la carpeta de ${E.name}`, `Im Ordner für ${D.name}`, `In the ${N.name} folder`), true)
            ]
        }) }
    ],
    2: [
        { kmk: '2.1', build: (E, D, N) => ({
            label: t(`Quieres preguntarle algo a tu profe de ${E.name}. ¿Cómo empiezas?`, `Du willst deine Lehrkraft in ${D.name} etwas fragen. Wie fängst du an?`, `You want to ask your ${N.name} teacher something. How do you start?`),
            options: [
                opt('👋', t(`«Hola, tengo una pregunta de ${E.name}, por favor»`, `„Hallo, ich habe bitte eine Frage zu ${D.name}“`, `“Hello, I have a question about ${N.name}, please”`), true),
                opt('😡', t('Grito: «¡Conteste ya!»', 'Ich schreie: „Antworte sofort!“', 'I shout: “Answer now!”')),
                opt('🙈', t('Me quedo callado', 'Ich sage gar nichts', 'I say nothing'))
            ]
        }) },
        { kmk: '2.3', build: (E, D, N) => ({
            label: t(`En ${E.name} trabajas con tu grupo. ¿Qué haces?`, `In ${D.name} arbeitest du in einer Gruppe. Was tust du?`, `In ${N.name} you work in a group. What do you do?`),
            options: [
                opt('✂️', t('Rompo el trabajo de mi amigo', 'Ich mache die Arbeit meines Freundes kaputt', "I break my friend's work")),
                opt('🤝', t(`Cada uno ayuda en ${E.name}`, `Jeder hilft in ${D.name} mit`, `Everyone helps in ${N.name}`), true),
                opt('🏃', t(`Me voy a jugar y dejo ${E.name}`, `Ich gehe spielen und lasse ${D.name} sein`, `I go and play and forget ${N.name}`))
            ]
        }) },
        // IA: un dibujo feo de un compañero hecho con una máquina no se comparte
        { kmk: '2.4', ai: true, build: (E, D, N) => ({
            label: t(`Alguien hizo con una máquina (una IA) un dibujo feo de un compañero de ${E.name}. ¿Qué haces?`, `Jemand hat mit einer Maschine (einer KI) ein gemeines Bild von einem Mitschüler in ${D.name} gemacht. Was tust du?`, `Someone used a machine (an AI) to make a mean picture of a classmate in ${N.name}. What do you do?`),
            options: [
                opt('😂', t('Me río y lo muestro', 'Ich lache und zeige es herum', 'I laugh and show it around')),
                opt('📤', t('Se lo mando a todos', 'Ich schicke es allen', 'I send it to everyone')),
                opt('🙋', t(`No lo comparto y le aviso a mi profe de ${E.name}`, `Ich teile es nicht und sage es meiner Lehrkraft in ${D.name}`, `I don't share it and I tell my ${N.name} teacher`), true)
            ]
        }) }
    ],
    3: [
        { kmk: '3.1', build: (E, D, N, pictures) => ({
            label: t(`¿Con qué haces ${E.k2work} en la tableta?`, `Womit machst du ${D.k2work} auf dem Tablet?`, `What do you use to make ${N.k2work} on the tablet?`),
            options: [
                opt(pictures.work, t(`Con la app de ${E.name} que indica tu profe`, `Mit der App für ${D.name}, die deine Lehrkraft zeigt`, `With the ${N.name} app your teacher shows you`), true),
                opt('🥄', t('Con una cuchara', 'Mit einem Löffel', 'With a spoon')),
                opt('🚗', t('Con un carrito de juguete', 'Mit einem Spielzeugauto', 'With a toy car'))
            ]
        }) },
        { kmk: '3.1', build: (E, D, N) => ({
            label: t(`Vas a mostrar ${E.k2work} a la clase. ¿Cómo queda mejor?`, `Du zeigst der Klasse ${D.k2work}. Wie ist es am besten?`, `You are going to show ${N.k2work} to the class. How is it best?`),
            options: [
                opt('🔬', t('Muy chiquito', 'Ganz winzig', 'Tiny')),
                opt('✨', t(`Grande y claro, para que toda la clase de ${E.name} lo entienda`, `Groß und klar, damit die ganze Klasse in ${D.name} es versteht`, `Big and clear, so the whole ${N.name} class understands`), true),
                opt('🌫️', t('Borroso', 'Verschwommen', 'Blurry'))
            ]
        }) },
        // IA: si una máquina te ayudó, lo dices
        { kmk: '3.3', ai: true, build: (E, D, N) => ({
            label: t(`Una máquina (una IA) te ayudó a hacer ${E.k2work}. ¿Qué dices?`, `Eine Maschine (eine KI) hat dir bei ${D.k2work} geholfen. Was sagst du?`, `A machine (an AI) helped you make ${N.k2work}. What do you say?`),
            options: [
                opt('🤫', t('Que lo hice yo solito', 'Dass ich es ganz allein gemacht habe', 'That I did it all by myself')),
                opt('🙈', t('Nada, lo escondo', 'Nichts, ich verstecke es', 'Nothing, I hide it')),
                opt('🤖', t(`Que me ayudó una IA, en mi trabajo de ${E.name}`, `Dass mir eine KI geholfen hat, in meiner Arbeit für ${D.name}`, `That an AI helped me, in my ${N.name} work`), true)
            ]
        }) }
    ],
    4: [
        { kmk: '4.1', build: (E, D, N) => ({
            label: t(`Trabajas en ${E.name} y aparece un premio en la pantalla. ¿Qué haces?`, `Du arbeitest in ${D.name} und auf dem Bildschirm erscheint ein Preis. Was tust du?`, `You are working in ${N.name} and a prize appears on the screen. What do you do?`),
            options: [
                opt('🧑‍🏫', t(`Llamo a mi profe de ${E.name}`, `Ich rufe meine Lehrkraft in ${D.name}`, `I call my ${N.name} teacher`), true),
                opt('👆', t('Toco el premio', 'Ich tippe auf den Preis', 'I tap the prize')),
                opt('🔑', t('Escribo mi clave', 'Ich gebe mein Passwort ein', 'I type my password'))
            ]
        }) },
        // IA: a un robot que habla tampoco se le dice dónde vives
        { kmk: '4.2', ai: true, build: (E, D, N) => ({
            label: t(`Un robot que habla en la tableta (una IA) te pregunta dónde vives mientras ves ${E.k2topic}. ¿Qué haces?`, `Ein sprechender Roboter auf dem Tablet (eine KI) fragt dich, wo du wohnst, während du etwas über ${D.k2topic} siehst. Was tust du?`, `A talking robot on the tablet (an AI) asks where you live while you look at ${N.k2topic}. What do you do?`),
            options: [
                opt('🏠', t('Le digo dónde vivo', 'Ich sage, wo ich wohne', 'I say where I live')),
                opt('🚫', t('No se lo digo y aviso a un adulto', 'Ich sage es nicht und hole einen Erwachsenen', "I don't say and I tell an adult"), true),
                opt('📸', t(`Le mando mi foto y ${E.k2work}`, `Ich schicke mein Foto und ${D.k2work}`, `I send my photo and ${N.k2work}`))
            ]
        }) },
        { kmk: '4.3', build: (E, D, N) => ({
            label: t(`Llevas mucho rato en la tableta con ${E.k2work}. ¿Qué haces ahora?`, `Du arbeitest schon lange am Tablet für ${D.name}. Was tust du jetzt?`, `You have spent a long time on the tablet with ${N.k2work}. What do you do now?`),
            options: [
                opt('👀', t('Me pego a la pantalla', 'Ich gehe ganz nah an den Bildschirm', 'I put my face close to the screen')),
                opt('🌙', t(`Sigo con ${E.name} hasta la noche`, `Ich mache bis in die Nacht mit ${D.name} weiter`, `I keep going with ${N.name} until night`)),
                opt('🤸', t('Descanso y me muevo', 'Ich mache Pause und bewege mich', 'I take a break and move'), true)
            ]
        }) }
    ],
    5: [
        { kmk: '5.1', build: (E, D, N) => ({
            label: t(`La tableta no prende y vas a trabajar en ${E.name}. ¿Qué haces?`, `Das Tablet geht nicht an und du willst in ${D.name} arbeiten. Was tust du?`, `The tablet won't turn on and you want to work in ${N.name}. What do you do?`),
            options: [
                opt('🔌', t('Reviso si está cargada', 'Ich schaue, ob es geladen ist', 'I check if it is charged'), true),
                opt('🔨', t('La golpeo', 'Ich schlage darauf', 'I hit it')),
                opt('🚪', t(`Me voy de la clase de ${E.name}`, `Ich verlasse den Unterricht in ${D.name}`, `I leave the ${N.name} lesson`))
            ]
        }) },
        // IA: la máquina ayuda a aprender, no lo hace todo por ti
        { kmk: '5.3', ai: true, build: (E, D, N) => ({
            label: t(`No sabes hacer ${E.k2work}. Una máquina (una IA) dice que lo hace por ti. ¿Qué es mejor?`, `Du weißt nicht, wie du ${D.k2work} machst. Eine Maschine (eine KI) sagt, sie macht es für dich. Was ist am besten?`, `You don't know how to make ${N.k2work}. A machine (an AI) says it will do it for you. What is best?`),
            options: [
                opt('😴', t('Que lo haga todo y yo me duermo', 'Sie soll alles machen und ich schlafe', 'Let it do everything while I sleep')),
                opt('🙋', t(`Lo hago yo, con ayuda de mi profe de ${E.name}`, `Ich mache es selbst, mit Hilfe meiner Lehrkraft in ${D.name}`, `I do it myself, with help from my ${N.name} teacher`), true),
                opt('🧨', t('Borro todo', 'Ich lösche alles', 'I delete everything'))
            ]
        }) },
        { kmk: '5.5', build: (E, D, N) => ({
            label: t(`Vas a hacer ${E.k2work}. ¿Cómo te queda mejor?`, `Du machst ${D.k2work}. Wie gelingt es am besten?`, `You are going to make ${N.k2work}. What is the best way?`),
            options: [
                opt('🔀', t('Todo al mismo tiempo', 'Alles gleichzeitig', 'Everything at once')),
                opt('🏁', t('Empiezo por el final', 'Ich fange am Ende an', 'I start at the end')),
                opt('🔢', t(`Paso a paso: 1, 2, 3, en ${E.name}`, `Schritt für Schritt: 1, 2, 3, in ${D.name}`, `Step by step: 1, 2, 3, in ${N.name}`), true)
            ]
        }) }
    ],
    6: [
        // IA: una imagen hecha por una máquina puede no ser real
        { kmk: '6.1', ai: true, build: (E, D, N) => ({
            label: t(`Ves una imagen de ${E.k2topic} que parece de mentira, hecha por una máquina (una IA). ¿Qué haces?`, `Du siehst ein Bild über ${D.k2topic}, das unecht aussieht und von einer Maschine (einer KI) gemacht wurde. Was tust du?`, `You see a picture of ${N.k2topic} that looks fake, made by a machine (an AI). What do you do?`),
            options: [
                opt('🙋', t('Le pregunto a un adulto si es real', 'Ich frage einen Erwachsenen, ob es echt ist', 'I ask an adult if it is real'), true),
                opt('📢', t(`Se lo cuento a toda la clase de ${E.name}`, `Ich erzähle es der ganzen Klasse in ${D.name}`, `I tell the whole ${N.name} class`)),
                opt('🎉', t('Lo creo de una vez', 'Ich glaube es sofort', 'I believe it right away'))
            ]
        }) },
        { kmk: '6.1', build: (E, D, N) => ({
            label: t(`Un anuncio te muestra un juguete para aprender ${E.name}. ¿Qué quiere el anuncio?`, `Eine Werbung zeigt ein Spielzeug zum Lernen für ${D.name}. Was will die Werbung?`, `An ad shows a toy for learning ${N.name}. What does the ad want?`),
            options: [
                opt('🤝', t('Ser mi amigo', 'Mein Freund sein', 'To be my friend')),
                opt('🛒', t('Que lo compre', 'Dass ich es kaufe', 'For me to buy it'), true),
                opt('📚', t(`Darme clase de ${E.name}`, `Mir ${D.name} beibringen`, `To teach me ${N.name}`))
            ]
        }) },
        { kmk: '6.2', build: (E, D, N) => ({
            label: t(`Terminaste en la tableta lo de ${E.name}. ¿Qué es mejor ahora?`, `Du bist am Tablet mit ${D.name} fertig. Was ist jetzt am besten?`, `You have finished ${N.name} on the tablet. What is best now?`),
            options: [
                opt('📱', t('Ver videos y más videos', 'Immer mehr Videos schauen', 'Watch more and more videos')),
                opt('🌙', t('Seguir toda la noche', 'Die ganze Nacht weitermachen', 'Keep going all night')),
                opt('⚽', t(`Jugar y contarle a mi familia sobre ${E.k2topic}`, `Spielen und der Familie davon erzählen: ${D.k2topic}`, `Play and tell my family about ${N.k2topic}`), true)
            ]
        }) }
    ]
};

const VISUAL_RETO0_TEMPLATES = [
    (E, D, N) => ({
        label: t(`¿Qué es el Medienpass en ${E.name}?`, `Was ist der Medienpass in ${D.name}?`, `What is the Medienpass in ${N.name}?`),
        options: [
            opt('🍕', t('Una comida', 'Ein Essen', 'A meal')),
            opt('🏆', t(`Retos de ${E.name} para aprender con la tableta`, `Aufgaben in ${D.name}, um mit dem Tablet zu lernen`, `${N.name} challenges for learning with the tablet`), true),
            opt('🚌', t('Un bus', 'Ein Bus', 'A bus'))
        ]
    }),
    (E, D, N) => ({
        label: t(`Terminas un reto de ${E.name}. ¿Quién lo revisa?`, `Du beendest eine Aufgabe in ${D.name}. Wer prüft sie?`, `You finish a ${N.name} challenge. Who checks it?`),
        options: [
            opt('🧑‍🏫', t(`Mi profe de ${E.name}`, `Meine Lehrkraft in ${D.name}`, `My ${N.name} teacher`), true),
            opt('🐕', t('Mi mascota', 'Mein Haustier', 'My pet')),
            opt('🌧️', t('La lluvia', 'Der Regen', 'The rain'))
        ]
    }),
    (E, D, N) => ({
        label: t(`Tu avatar te representa en ${E.name}. ¿Pones tu foto real en internet?`, `Dein Avatar steht in ${D.name} für dich. Stellst du dein echtes Foto ins Internet?`, `Your avatar stands for you in ${N.name}. Do you put your real photo on the internet?`),
        options: [
            opt('📸', t('Sí, para que todos me vean', 'Ja, damit mich alle sehen', 'Yes, so everyone sees me')),
            opt('📣', t('Sí, y también mi dirección', 'Ja, und auch meine Adresse', 'Yes, and my address too')),
            opt('🦊', t(`No, uso mi avatar en ${E.name}`, `Nein, ich benutze meinen Avatar in ${D.name}`, `No, I use my avatar in ${N.name}`), true)
        ]
    })
];

const numbered = options => options.map((option, idx) => ({ ...option, val: idx }));

// Las 3 preguntas visuales de un reto 1-6 de una materia
function buildVisualQuestions(retoNum, subject) {
    const pack = getSubjectPack(subject);
    return (VISUAL_TEMPLATES[retoNum] || []).map((template, i) => {
        const data = template.build(pack.es, pack.de, pack.en, picturesOf(subject));
        return {
            id: `r${retoNum}_${subject}_k2_q${i + 1}`,
            type: 'radio_group',
            visual: true,
            kmk: template.kmk,
            ...(template.ai ? { ai: true } : {}), // pregunta sobre inteligencia artificial
            label: data.label,
            options: numbered(data.options)
        };
    });
}

// Las 3 preguntas del Reto 0 visual de una materia. quiz: las cuenta services/reto_result.js
function buildVisualReto0Questions(subject) {
    const pack = getSubjectPack(subject);
    return VISUAL_RETO0_TEMPLATES.map((template, i) => {
        const data = template(pack.es, pack.de, pack.en);
        return {
            id: `r0v_${subject}_q${i + 1}`,
            type: 'radio_group',
            visual: true,
            quiz: true,
            label: data.label,
            options: numbered(data.options)
        };
    });
}

// Las 6 competencias con la frase de la materia (recorrido del Reto 0 visual)
function visualCompetences(subject) {
    const pack = getSubjectPack(subject);
    return Object.entries(VISUAL_COMPETENCES).map(([n, comp]) => ({
        reto: Number(n),
        icon: comp.icon,
        title: comp.title,
        say: comp.say(pack.es, pack.de, pack.en)
    }));
}

module.exports = { SUBJECT_PICTURES, picturesOf, VISUAL_COMPETENCES, buildVisualQuestions, buildVisualReto0Questions, visualCompetences };
