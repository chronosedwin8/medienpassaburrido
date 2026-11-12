// Nivel escolar de una clase.
// - Preescolar: PK, KIN, KKP y K1. Primaria: K2 a K6. Secundaria: K7 a K12.
// - PK, KIN, KKP, K1 y K2 usan el Medienpass visual porque aún no saben escribir. Sus preguntas son
//   las del grado 2 (evidence_k2).
// - Algunas clases están escritas sin K ("5A" es "K5A"). Otras, como "sinact", no son de ningún nivel.

const SEGMENTS = ['preescolar', 'primaria', 'secundaria'];

function classInfo(className) {
    const name = String(className || '').trim().toUpperCase();
    const early = /^(PK|KIN|KKP)(\d+)$/.exec(name);
    if (early) return { key: name, klasse: early[1], grade: 0, segment: 'preescolar', visual: true };

    const klasse = /^K?(\d{1,2})([A-Z])$/.exec(name);
    if (!klasse) return null;
    const grade = Number(klasse[1]);
    if (grade < 1 || grade > 12) return null;
    return {
        key: `K${grade}${klasse[2]}`,
        klasse: `K${grade}`,
        letter: klasse[2],
        grade,
        segment: grade === 1 ? 'preescolar' : grade <= 6 ? 'primaria' : 'secundaria',
        visual: grade <= 2
    };
}

function isVisualClass(className) {
    const info = classInfo(className);
    return !!(info && info.visual);
}

// Grado de las preguntas de una clase: 2 en la versión visual y 3 si la clase no tiene nivel
function questionGrade(className) {
    const info = classInfo(className);
    if (!info) return 3;
    return info.visual ? 2 : info.grade;
}

// Segmento de una clave del mapeo de profesores, como "KLASSE 6 (K6A)"
function segmentOfMappingKey(key) {
    const inParens = /\(([^)]+)\)/.exec(String(key || ''));
    const info = classInfo(inParens ? inParens[1] : key);
    return info ? info.segment : null;
}

module.exports = { SEGMENTS, classInfo, isVisualClass, questionGrade, segmentOfMappingKey };
