// ═══════════════════════════════════════════
// Capacitación por correo para docentes: la serie de 5 correos y los videos que graba el administrador.
// Es el libreto inicial. Lo que se cambie en Administración › Capacitación y ayuda se guarda en data/.
// En los correos: {nombre}, {materia} y {enlace} se reemplazan al enviar; {video:id} pone el enlace del video.
// ═══════════════════════════════════════════

const t = (es, de, en) => ({ es, de, en });

// script: guion del video, para quien lo graba. En AYUDA solo se muestra el título.
const DEFAULT_VIDEOS = [
    {
        id: 'que-es',
        title: t('Qué es el Medienpass', 'Was ist der Medienpass', 'What the Medienpass is'),
        script: 'Duración: 2 minutos.\nMuestra: la pantalla de inicio del módulo de estudiante.\nDi: «El Medienpass enseña a usar los medios digitales con criterio, en cada materia. Son 7 retos: el Reto 0 y los retos del 1 al 6, uno por cada competencia KMK. El colegio mide tres cosas: docentes capacitados, estudiantes con mínimo 3 de 6 retos ganados y estudiantes con evidencias».'
    },
    {
        id: 'entrar',
        title: t('Cómo entra un estudiante', 'So melden sich Schüler*innen an', 'How a student logs in'),
        script: 'Duración: 2 minutos.\nMuestra: la página de ingreso, la clase y el código del estudiante, y la elección de materia.\nDi: «El estudiante elige su clase y escribe su código. Luego elige la materia. En Prekínder, Kinder, K1 y K2 un adulto hace este paso». Usa un estudiante de prueba: no muestres datos reales de menores.'
    },
    {
        id: 'reto0',
        title: t('El Reto 0 en tu materia', 'Reto 0 in deinem Fach', 'Challenge 0 in your subject'),
        script: 'Duración: 3 minutos.\nMuestra: el Reto 0 de una materia: avatar, datos, profesores, las 6 competencias con su ejemplo y la evaluación de 10 preguntas.\nDi: «Cada competencia aparece con lo que significa y cómo se aplica en la materia. Al terminar, el estudiante ve qué competencias debe reforzar».'
    },
    {
        id: 'reto',
        title: t('Cómo se gana un reto', 'So gewinnt man eine Herausforderung', 'How to win a challenge'),
        script: 'Duración: 3 minutos.\nMuestra: un reto del 1 al 6: las preguntas, el argumento escrito y las estrellas.\nDi: «Cada pregunta da 3 estrellas si la respuesta es correcta y 2 más si el argumento es coherente. Se gana con el 80 %. Ganar 3 retos distintos, en cualquier materia, cumple el indicador».'
    },
    {
        id: 'evidencias',
        title: t('Cómo adjuntar evidencias', 'So hängt man Nachweise an', 'How to attach evidence'),
        script: 'Duración: 2 minutos.\nMuestra: el botón «Adjuntar vínculos de evidencia» dentro de un reto, pegar un vínculo de OneNote o de un video y guardar.\nDi: «Se pueden adjuntar hasta 3 vínculos por reto. No hace falta para ganar, pero es el tercer indicador del colegio».'
    },
    {
        id: 'visual',
        title: t('El Medienpass visual', 'Der visuelle Medienpass', 'The visual Medienpass'),
        script: 'Duración: 2 minutos.\nMuestra: la versión de Prekínder a K2: elegir la materia con un dibujo, el botón de voz y una pregunta con imágenes.\nDi: «Los más pequeños no escriben: tocan la imagen y escuchan la pregunta. Si se equivocan, lo intentan de nuevo. Con las 3 correctas ganan el reto».'
    },
    {
        id: 'seguimiento',
        title: t('Cómo hacer seguimiento', 'So verfolgst du den Fortschritt', 'How to follow progress'),
        script: 'Duración: 2 minutos.\nMuestra: «Configura tus Retos del 0 al 6» en el portal docente, el avance de una clase y el botón AYUDA.\nDi: «Aquí ves quién ganó cada reto. Si un estudiante tiene dudas, el botón AYUDA está en todas las páginas».'
    }
];

const HELP_SEGMENT = 'AYUDA\nEn todas las páginas de la plataforma hay un botón AYUDA con estos videos y las preguntas frecuentes. Si algo no funciona, responde a este correo.';

// audience: destinatarios que el módulo propone para ese correo (all o untrained)
const DEFAULT_EMAILS = [
    {
        id: 'bienvenida',
        day: 0,
        audience: 'all',
        subject: 'Medienpass: empezamos la capacitación',
        body: 'Hola, {nombre}:\n\nDurante las próximas dos semanas recibirás una serie corta de correos para conocer el Medienpass. Cada uno toma menos de 10 minutos.\n\nEl colegio medirá tres cosas: docentes capacitados, estudiantes con mínimo 3 de 6 retos ganados y estudiantes con evidencias adjuntas.\n\nEmpieza por este video de 2 minutos:\n{video:que-es}\n\nEntra a la plataforma aquí: {enlace}'
    },
    {
        id: 'reto0',
        day: 3,
        audience: 'all',
        subject: 'Medienpass: mira el Reto 0 de {materia}',
        body: 'Hola, {nombre}:\n\nHoy te proponemos ver lo que encuentran tus estudiantes al empezar.\n\n1. Cómo entra un estudiante:\n{video:entrar}\n\n2. El Reto 0, con las 6 competencias explicadas en tu materia:\n{video:reto0}\n\nPuedes recorrerlo tú mismo en el portal docente, en Modo Estudiante: {enlace}'
    },
    {
        id: 'retos',
        day: 7,
        audience: 'all',
        subject: 'Medienpass: los retos 1 a 6 y las evidencias',
        body: 'Hola, {nombre}:\n\nCada reto trabaja una competencia KMK con preguntas de tu materia. Un estudiante cumple el indicador cuando gana 3 retos distintos con el 80 % o más.\n\n1. Cómo se gana un reto:\n{video:reto}\n\n2. Cómo se adjuntan los vínculos de evidencia:\n{video:evidencias}\n\nPide a tus estudiantes que adjunten el vínculo de lo que hagan en clase, por ejemplo en OneNote.\n\nPlataforma: {enlace}'
    },
    {
        id: 'test',
        day: 10,
        audience: 'untrained',
        subject: 'Medienpass: presenta tu test KMK (12 preguntas)',
        body: 'Hola, {nombre}:\n\nTodavía no aparece tu test KMK como aprobado. Son 12 preguntas: 6 sobre las competencias y 6 sobre su aplicación en tu materia. Se aprueba con 9 correctas y puedes repetirlo.\n\nAntes del test, en la capacitación encuentras cada competencia explicada, con ejemplos para {materia}.\n\nCapacitación y test: {enlace}/teacher/training'
    },
    {
        id: 'cierre',
        day: 14,
        audience: 'all',
        subject: 'Medienpass: los más pequeños y el seguimiento',
        body: 'Hola, {nombre}:\n\nDos últimos videos para cerrar esta serie.\n\n1. La versión visual, para Prekínder, Kinder, K1 y K2, que no exige escribir:\n{video:visual}\n\n2. Cómo hacer seguimiento a tus clases:\n{video:seguimiento}\n\nGracias por acompañar a tus estudiantes en este proceso.\n\nPlataforma: {enlace}'
    }
];

module.exports = { DEFAULT_VIDEOS, DEFAULT_EMAILS, HELP_SEGMENT };
