// Indicadores institucionales, niveles de clase y vínculos de evidencia.
// Uso: node test/indicators.test.js
const assert = require('assert');
const { classInfo, isVisualClass, questionGrade } = require('../services/class_levels');
const { computeIndicators, segmentsFromMapping, teacherSegments } = require('../services/indicators');
const { normalizeLinks, validLinks, storedLinks, isValidLink } = require('../services/evidence_links');

function testClassLevels() {
    const segmentOf = name => classInfo(name).segment;
    ['PK1', 'PK3', 'KIN1', 'KIN3', 'K1A'].forEach(c => assert.strictEqual(segmentOf(c), 'preescolar', c));
    ['K2A', 'K4B', 'K6D', '3A', '5C'].forEach(c => assert.strictEqual(segmentOf(c), 'primaria', c));
    ['K7A', 'K9C', 'K12A'].forEach(c => assert.strictEqual(segmentOf(c), 'secundaria', c));
    assert.strictEqual(classInfo('sinact'), null, 'sinact has no level');

    // Kinder 3 y Prekínder 3 no son K3: no pueden recibir preguntas que exigen escribir
    ['PK3', 'KIN3', 'KIN1', 'K1A', 'K2D'].forEach(c => {
        assert.strictEqual(isVisualClass(c), true, c);
        assert.strictEqual(questionGrade(c), 2, c);
    });
    ['K3A', '3A', 'K12A'].forEach(c => assert.strictEqual(isVisualClass(c), false, c));
    assert.strictEqual(questionGrade('K3A'), 3);
    assert.strictEqual(questionGrade('5B'), 5);
    console.log('✅ Class levels: segments, no-K classes and the visual version (KIN3 and PK3 are not K3)');
}

function testIndicators() {
    const students = [
        { id: 'a', class_name: 'K2A', student_code: '1' },
        { id: 'b', class_name: 'K2A', student_code: '2' },
        { id: 'c', class_name: 'K7B', student_code: '3' },
        { id: 'd', class_name: 'KIN1', student_code: '4' },
        { id: 'e', class_name: 'sinact', student_code: '5' },
        { id: 'f', class_name: 'K5A', student_code: '6' },
        { id: 'f2', class_name: '5A', student_code: '6' }, // el mismo estudiante, sin K
        { id: 'g', class_name: '5C', student_code: null }
    ];
    const wonRetos = new Map([
        ['a', new Set([1, 2, 3])],
        ['b', new Set([1, 2])],
        ['c', new Set([4, 5, 6])],
        ['e', new Set([1, 2, 3])], // sinact no cuenta
        ['f', new Set([1])],
        ['f2', new Set([2, 3])] // suma con su otro registro
    ]);
    const data = computeIndicators({
        students,
        teachers: [
            { email: 'uno@x.co', first_name: 'Ana', last_name: 'Uno', training_completed: true },
            { email: 'dos@x.co', first_name: 'Beto', last_name: 'Dos', training_completed: false },
            { email: 'tres@x.co', first_name: 'Cata', last_name: 'Tres', training_completed: true }
        ],
        assignedSegments: { 'uno@x.co': ['primaria', 'secundaria'] },
        mappingSegments: { 'dos@x.co': ['primaria'] },
        wonRetos,
        withEvidence: new Set(['a', 'd', 'e', 'f2'])
    });

    // 6 personas: sinact queda por fuera y f y f2 son una sola
    assert.strictEqual(data.students.total, 6);
    assert.strictEqual(data.students.value, 3, 'a, c and f reach 3 different challenges');
    assert.strictEqual(data.students.pct, 50);
    assert.deepStrictEqual(data.students.segments.primaria, { value: 2, total: 4, pct: 50 });
    assert.deepStrictEqual(data.students.segments.secundaria, { value: 1, total: 1, pct: 100 });
    assert.deepStrictEqual(data.students.segments.preescolar, { value: 0, total: 1, pct: 0 });

    assert.strictEqual(data.evidence.value, 3, 'a, d and f have evidence; sinact does not count');
    assert.deepStrictEqual(data.evidence.segments.preescolar, { value: 1, total: 1, pct: 100 });

    // Docentes: el total cuenta a cada uno una vez, aunque esté en dos segmentos
    assert.deepStrictEqual({ value: data.teachers.value, total: data.teachers.total, pct: data.teachers.pct }, { value: 2, total: 3, pct: 67 });
    assert.deepStrictEqual(data.teachers.segments.primaria, { value: 1, total: 2, pct: 50 });
    assert.deepStrictEqual(data.teachers.segments.secundaria, { value: 1, total: 1, pct: 100 });
    assert.deepStrictEqual(data.teachers.segments.sin_segmento, { value: 1, total: 1, pct: 100 });

    assert.deepStrictEqual([data.teachers.goal, data.students.goal, data.evidence.goal], [70, 85, 85]);
    assert.deepStrictEqual(data.classes.map(c => c.className), ['KIN1', 'K2A', 'K5A', 'K5C', 'K7B'], 'classes ordered by segment, no-K classes normalised');
    const k5a = data.classes.find(c => c.className === 'K5A');
    assert.deepStrictEqual([k5a.total, k5a.withMin, k5a.withEvidence], [1, 1, 1]);
    console.log('✅ Indicators: 3 different challenges in any subject, segments, duplicates merged, sinact excluded');
}

function testTeacherSegments() {
    const teachers = [
        { email: 'Ana@x.co', first_name: 'Ana María', last_name: 'Pérez Gómez' },
        { email: 'beto@x.co', first_name: 'Beto', last_name: 'Ruiz' }
    ];
    const mapping = {
        'KLASSE 2 (K2A)': { aleman: 'ANA PEREZ', arte: 'NADIE CONOCIDO' },
        'KLASSE 7 (K7B)': { aleman: 'ANA MARIA PEREZ GOMEZ' }
    };
    const fromMapping = segmentsFromMapping(mapping, teachers);
    assert.deepStrictEqual(fromMapping['ana@x.co'].sort(), ['primaria', 'secundaria']);
    assert.strictEqual(fromMapping['beto@x.co'], undefined);

    assert.deepStrictEqual(teacherSegments(teachers[0], {}, fromMapping), ['primaria', 'secundaria']);
    assert.deepStrictEqual(teacherSegments(teachers[0], { 'ana@x.co': ['preescolar'] }, fromMapping), ['preescolar'], 'what the admin assigned wins');
    assert.deepStrictEqual(teacherSegments(teachers[0], { 'ana@x.co': [] }, fromMapping), [], 'the admin can also clear it');
    console.log('✅ Teacher segments: taken from the mapping unless the admin assigned them');
}

function testEvidenceLinks() {
    assert.deepStrictEqual(normalizeLinks(['https://a.co/x', ' http://b.co ', '']), { links: ['https://a.co/x', 'http://b.co'] });
    assert.deepStrictEqual(normalizeLinks(['https://a.co', 'https://a.co']), { links: ['https://a.co'] }, 'repeated links count once');
    assert.strictEqual(normalizeLinks(['https://a.co', 'https://b.co', 'https://c.co', 'https://d.co']).error, 'too_many');
    ['javascript:alert(1)', 'data:text/html,x', 'www.sin-protocolo.com', 'nada', 'https://x.co/' + 'y'.repeat(600)]
        .forEach(bad => assert.strictEqual(isValidLink(bad), false, bad));
    assert.strictEqual(normalizeLinks(['javascript:alert(1)']).error, 'invalid');

    // Lo anterior, con un vínculo no válido, sigue visible para corregirlo pero no cuenta ni se enlaza
    assert.deepStrictEqual(storedLinks('www.viejo.com\nhttps://ok.co'), ['www.viejo.com', 'https://ok.co']);
    assert.deepStrictEqual(validLinks('www.viejo.com\nhttps://ok.co'), ['https://ok.co']);
    assert.deepStrictEqual(validLinks(null), []);
    console.log('✅ Evidence links: up to 3, only http(s), and a dangerous link never counts or gets linked');
}

// Inicio › Estudiantes sin empezar el Medienpass: por clase, sin "sinact", repetidos una vez
function testNoProgressReport() {
    const { buildNoProgressReport } = require('../services/no_progress');
    const students = [
        { id: 'a1', class_name: 'K5A', student_code: '1', full_name: 'ZOE ALVAREZ' },
        { id: 'a2', class_name: '5A', student_code: '1', full_name: 'ZOE ALVAREZ' }, // la misma persona: empezó con este registro
        { id: 'a3', class_name: 'K5A', student_code: '2', full_name: 'ANA BETANCUR' },
        { id: 'b1', class_name: 'K9A', student_code: '3', full_name: 'LUIS CORTES' },
        { id: 'b2', class_name: 'K9A', student_code: '4', full_name: 'EVA DIAZ' },
        { id: 'c1', class_name: 'KIN1', student_code: '5', full_name: 'Valeria Maza' },
        { id: 'x1', class_name: 'sinact', student_code: '6', full_name: 'NADIE' }
    ];
    const report = buildNoProgressReport({ students, startedIds: new Set(['a2', 'b1']) });
    assert.deepStrictEqual(report.summary, { total: 5, pending: 3, pct: 60, classes: 3, complete: 0 }, 'sinact is left out and a repeated code counts once');
    assert.deepStrictEqual(report.classes.map(c => [c.className, c.pending, c.total, c.pct, c.nobodyStarted]),
        [['KIN1', 1, 1, 100, true], ['K5A', 1, 2, 50, false], ['K9A', 1, 2, 50, false]], 'By segment, then the highest share first');
    assert.deepStrictEqual(report.classes[1].students, ['ANA BETANCUR'], 'Names of the students who have not started');
    assert.deepStrictEqual(report.segments.secundaria, { total: 2, pending: 1, pct: 50, classes: 1, complete: 0 });
    assert.ok(!JSON.stringify(report).includes('student_code') && !JSON.stringify(report).includes('"1"'), 'No student codes in the report');
    const done = buildNoProgressReport({ students, startedIds: new Set(['a1', 'a3', 'b1', 'b2', 'c1']) });
    assert.deepStrictEqual([done.classes.length, done.summary.complete], [0, 3], 'Classes where everyone started are not listed');
    console.log('✅ Students who have not started: by class and school level, no "sinact", repeated codes once, no codes sent');
}

testClassLevels();
testIndicators();
testTeacherSegments();
testEvidenceLinks();
testNoProgressReport();
console.log('\nAll indicator tests passed.');
