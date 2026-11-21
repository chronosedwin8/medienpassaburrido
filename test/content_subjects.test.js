// Contenidos por materia: todas tienen sus retos 0 a 6 y ninguna repite preguntas ni opciones.
// Medienpass visual: pocas preguntas, sin escribir y se puede ganar.
// Uso: node test/content_subjects.test.js
const assert = require('assert');
const { allActivities, getReto0ForSubject, getVisualReto0, subjects } = require('../data');
const { agentToolsFor } = require('../default_agent_tools');
const { retoResult } = require('../services/reto_result');
const { normalizeCustomQuestions } = require('../services/instrument_store');

const LANGS = ['es', 'de', 'en'];
const RETOS = [1, 2, 3, 4, 5, 6];
const K3_GRADES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// Tecnología y Deportes tienen preguntas propias desde K7; de K3 a K6 todas las materias usan las de
// Primaria (data_questions_primary.js)
const K7_GRADES = [7, 8, 9, 10, 11, 12];
const activity = (n, subject) => allActivities[String(n)].find(a => a.id === `reto${n}_${subject}`);
const radios = list => list.filter(item => item.type === 'radio_group');
const optionText = (option, lang) => option[lang] || (option.label && option.label[lang]);

function assertAllDifferent(values, what) {
    const repeated = values.filter((value, i) => values.indexOf(value) !== i);
    assert.deepStrictEqual(repeated, [], `${what} repeated across subjects`);
}

function testEverySubjectHasItsRetos() {
    assert.strictEqual(subjects.length, 11);
    subjects.forEach(({ id }) => {
        assert.strictEqual(getReto0ForSubject(id).evidence.filter(item => item.quiz).length, 10, `${id}: Reto 0`);
        assert.strictEqual(getVisualReto0(id).evidence.length, 3, `${id}: Reto 0 visual`);
        RETOS.forEach(n => {
            const act = activity(n, id);
            assert.ok(act, `${id}: reto ${n}`);
            K3_GRADES.forEach(g => assert.strictEqual(radios(act[`evidence_k${g}`]).length, 6, `${id}: reto ${n} K${g}`));
            assert.strictEqual(radios(act.evidence_k2).length, 3, `${id}: reto ${n} visual`);
        });
    });
    console.log('✅ The 11 subjects have challenges 0 to 6, in the K3-K12 and visual versions');
}

function testNoRepetitionBetweenSubjects() {
    RETOS.forEach(n => {
        ['evidence_k5', 'evidence_k2'].forEach(field => {
            const count = radios(activity(n, 'aleman')[field]).length;
            for (let q = 0; q < count; q++) {
                LANGS.forEach(lang => {
                    const where = `reto ${n} ${field} q${q + 1} (${lang})`;
                    const questions = subjects.map(({ id }) => radios(activity(n, id)[field])[q]);
                    assertAllDifferent(questions.map(item => item.label[lang]), `${where} text`);
                    assertAllDifferent(questions.map(item => item.options.map(o => optionText(o, lang)).join(' | ')), `${where} options`);
                });
            }
        });
    });
    console.log('✅ No subject repeats a question or a group of options, in K3-K12 or in the visual version');
}

function testTemplatesAreComplete() {
    const texts = [];
    const collect = value => {
        if (typeof value === 'string') texts.push(value);
        else if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    subjects.forEach(({ id }) => {
        RETOS.forEach(n => {
            const act = activity(n, id);
            collect(act.evidence_k2);
            collect(act.evidence_k5);
            collect(act.evidenceExample);
        });
        collect(getVisualReto0(id));
        collect(agentToolsFor(id));
    });
    const broken = texts.filter(text => /undefined|\[object|\$\{/.test(text));
    assert.deepStrictEqual(broken, [], 'a template left a hole in the text');
    console.log(`✅ Templates are complete in the 3 languages (${texts.length} texts checked)`);
}

function testAgentToolsPerSubject() {
    RETOS.forEach(n => {
        LANGS.forEach(lang => {
            const values = subjects.map(({ id }) => agentToolsFor(id)[n][lang]);
            assertAllDifferent(values, `agent tools reto ${n} (${lang})`);
            values.forEach(value => assert.strictEqual(value.split('\n').length, 3, 'three suggestions'));
        });
    });
    console.log('✅ The teacher agent card has its own suggestions for each subject and challenge');
}

function testVisualVersion() {
    const answerAll = questions => Object.fromEntries(questions.map(q => {
        const i = q.options.findIndex(o => o.correct);
        return [q.id, String(q.options[i].val)];
    }));

    subjects.forEach(({ id }) => {
        RETOS.forEach(n => {
            const act = activity(n, id);
            const questions = act.evidence_k2;
            assert.ok(questions.every(q => q.type === 'radio_group' && q.visual), `${id} reto ${n}: nothing to write`);
            assert.ok(questions.every(q => q.options.every(o => o.emoji)), `${id} reto ${n}: every option has a picture`);
            assert.ok(questions.every(q => q.options.filter(o => o.correct).length === 1), 'one right answer');
            assert.ok(questions.every(q => q.kmk && q.kmk.startsWith(`${n}.`)), `${id} reto ${n}: KMK of the challenge`);
            assert.deepStrictEqual(questions.map(q => q.options.findIndex(o => o.correct)), [0, 1, 2], 'the right answer moves');

            const all = answerAll(questions);
            const won = retoResult({ ...act, evidence: questions }, all);
            assert.deepStrictEqual([won.kind, won.pct, won.won], ['hits', 100, true], 'all right wins, without writing');
            const missing = { ...all };
            delete missing[questions[0].id];
            assert.strictEqual(retoResult({ ...act, evidence: questions }, missing).won, false, '2 of 3 does not reach 80%');
        });

        const reto0 = getVisualReto0(id);
        assert.strictEqual(reto0.competences.length, 6, 'the 6 competences');
        assert.ok(reto0.evidence.every(q => q.quiz && q.visual));
        assert.strictEqual(retoResult(reto0, answerAll(reto0.evidence)).won, true, `${id}: Reto 0 can be won`);
    });
    console.log('✅ Visual version: 3 picture questions, nothing to write, and all right wins');
}

function testEditorKeepsPictures() {
    const act = activity(1, 'arte');
    const sent = JSON.parse(JSON.stringify(act.evidence_k2));
    sent[0].options[0].emoji = '🦄';
    delete sent[1].options[1].emoji;
    sent[2].options[0].emoji = '<script>';
    const { questions, error } = normalizeCustomQuestions(sent, { grade: 2, subject: 'arte', reto: 1 });
    assert.strictEqual(error, undefined);
    assert.ok(questions.every(q => q.visual), 'still visual after editing');
    assert.strictEqual(questions.length, 3, 'no written argument added');
    assert.strictEqual(questions[0].options[0].emoji, '🦄');
    assert.strictEqual(questions[1].options[1].emoji, '⭐', 'an option without a picture gets a star');
    assert.strictEqual(questions[2].options[0].emoji, '⭐', 'markup is not accepted as a picture');
    console.log('✅ The teacher editor keeps the pictures of the visual version');
}

// Tecnología: retos 1-6 ambientados en las plataformas del colegio, mezcladas en cada reto, con la
// misma subcompetencia KMK y la misma posición de la respuesta correcta que la plantilla común
function testTechnologyPlatforms() {
    const { TECHNOLOGY_PLATFORMS } = require('../data_tecnologia_retos');
    const textOf = q => [q.label.es, ...q.options.map(o => o.es), q.hint ? q.hint.es : ''].join(' ');
    const seen = new Set();
    let visualWithCodeSpark = 0;
    RETOS.forEach(n => {
        const tech = activity(n, 'tecnologia');
        const reference = radios(activity(n, 'aleman').evidence_k5);
        K7_GRADES.forEach(g => {
            const questions = radios(tech[`evidence_k${g}`]);
            questions.forEach((q, i) => {
                assert.strictEqual(q.kmk, reference[i].kmk, `tecnologia reto ${n} q${i + 1}: same KMK sub-competence`);
                assert.strictEqual(q.options.findIndex(o => o.correct), reference[i].options.findIndex(o => o.correct),
                    `tecnologia reto ${n} q${i + 1}: the right answer keeps its position (saved answers grade the same)`);
                LANGS.forEach(lang => assert.ok(q.label[lang] && q.options.every(o => o[lang]) && q.hint[lang], `tecnologia reto ${n} q${i + 1} (${lang})`));
                assert.ok(TECHNOLOGY_PLATFORMS.some(p => textOf(q).includes(p)), `tecnologia reto ${n} q${i + 1} is set in a platform`);
            });
        });
        const inReto = TECHNOLOGY_PLATFORMS.filter(p => radios(tech.evidence_k7).some(q => textOf(q).includes(p)));
        assert.ok(inReto.length >= 4, `tecnologia reto ${n} mixes platforms (${inReto.join(', ')})`);
        inReto.forEach(p => seen.add(p));
        const all = JSON.stringify([tech.evidence_k5, tech.evidence_k7, tech.evidence_k2, tech.evidenceExample]);
        assert.ok(!/MakeCode|micro:bit|Tinkercad|seguidor de línea/.test(all), `tecnologia reto ${n}: the old robot content is gone`);
        if (JSON.stringify(tech.evidence_k2).includes('codeSpark')) visualWithCodeSpark++;
    });
    assert.deepStrictEqual([...seen].sort(), [...TECHNOLOGY_PLATFORMS].sort(), 'Every platform appears in the Technology retos');
    // Versión visual (Prekínder a K2): codeSpark en los retos cuyas preguntas nombran el tema o el trabajo
    assert.ok(visualWithCodeSpark >= 5, `the visual version is set in codeSpark (${visualWithCodeSpark} of 6 retos)`);
    console.log(`✅ Technology retos 1-6 are set in ${TECHNOLOGY_PLATFORMS.join(', ')}, mixed in each reto, with the same KMK and answer positions`);

    // Retos 1 a 3: temática de Ready Player One («Misión OASIS») en cada pregunta y al comienzo del reto
    const rpo = /Ready Player One|OASIS|Halliday|Parzival|Art3mis|Aech|IOI|gunters|easter egg/;
    [1, 2, 3].forEach(n => {
        const tech = activity(n, 'tecnologia');
        radios(tech.evidence_k7).forEach((q, i) => assert.ok(rpo.test(textOf(q)), `tecnologia reto ${n} q${i + 1} uses the Ready Player One theme`));
        LANGS.forEach(lang => assert.ok(tech.theme && /OASIS/.test(tech.theme[lang]), `tecnologia reto ${n}: OASIS mission intro (${lang})`));
    });
    assert.ok([4, 5, 6].every(n => !activity(n, 'tecnologia').theme) && !activity(1, 'matematicas').theme, 'Only Technology retos 1-3 have the theme');
    console.log('✅ Technology retos 1-3 follow the Ready Player One theme (OASIS mission)');
}

// Deportes: retos 1-6 con contenidos de natación, polimotor, voleibol, baloncesto y atletismo,
// mezclados en cada reto, con la misma subcompetencia KMK y la misma posición de la respuesta correcta
function testSportsAreas() {
    const { SPORTS_QUESTIONS, SPORTS_AREAS } = require('../data_deportes_retos');
    const subjectConfig = require('../subject_config.json');
    const seen = new Set();
    RETOS.forEach(n => {
        const sport = activity(n, 'deportes');
        const reference = radios(activity(n, 'aleman').evidence_k5);
        K7_GRADES.forEach(g => {
            radios(sport[`evidence_k${g}`]).forEach((q, i) => {
                const own = SPORTS_QUESTIONS[n][i + 1];
                assert.strictEqual(q.label.es, own.label.es, `deportes reto ${n} q${i + 1}: its own question`);
                assert.strictEqual(q.kmk, reference[i].kmk, `deportes reto ${n} q${i + 1}: same KMK sub-competence`);
                assert.strictEqual(q.options.findIndex(o => o.correct), reference[i].options.findIndex(o => o.correct),
                    `deportes reto ${n} q${i + 1}: the right answer keeps its position`);
                LANGS.forEach(lang => assert.ok(q.label[lang] && q.options.every(o => o[lang]) && q.hint[lang], `deportes reto ${n} q${i + 1} (${lang})`));
            });
        });
        const areas = new Set(Object.values(SPORTS_QUESTIONS[n]).map(q => q.area));
        assert.deepStrictEqual([...areas].sort(), [...SPORTS_AREAS].sort(), `deportes reto ${n} mixes the five sports`);
        areas.forEach(a => seen.add(a));
    });
    assert.strictEqual(seen.size, 5);
    const reto0 = getReto0ForSubject('deportes').evidence;
    assert.ok(reto0.some(q => q.id === 'reto0_deportes_q1'), 'Reto 0 has its own open questions for Deportes');
    assert.ok(Object.values(subjectConfig).every(c => c.deportes === true), 'Deportes is enabled in every class');
    console.log(`✅ Sports retos 1-6 mix ${SPORTS_AREAS.join(', ')}, with the same KMK and answer positions; enabled in every class`);
}

// Materia nueva (Administración › Materias): contenido general con su nombre en los 3 idiomas,
// sin restos de otra materia, con la misma estructura, subcompetencias y respuestas correctas
function testNewSubjectContent() {
    const { registerSubjectActivities } = require('../data');
    const sub = { id: 'quimica_prueba', name: { es: 'Química', de: 'Chemie', en: 'Chemistry' }, icon: '⚗️', color: '#7a1f5c', custom: true };
    subjects.push(sub);
    try {
        assert.strictEqual(registerSubjectActivities(sub), 6, 'Challenges 1 to 6 are created');
        assert.strictEqual(registerSubjectActivities(sub), 0, 'Registering twice adds nothing');
        const texts = [];
        const collect = value => {
            if (typeof value === 'string') texts.push(value);
            else if (Array.isArray(value)) value.forEach(collect);
            else if (value && typeof value === 'object') Object.values(value).forEach(collect);
        };
        RETOS.forEach(n => {
            const act = activity(n, sub.id);
            const reference = radios(activity(n, 'aleman').evidence_k5);
            const qs = radios(act.evidence_k5);
            assert.strictEqual(qs.length, 6);
            qs.forEach((q, i) => {
                assert.strictEqual(q.kmk, reference[i].kmk, `new subject reto ${n} q${i + 1}: KMK`);
                assert.strictEqual(q.options.findIndex(o => o.correct), reference[i].options.findIndex(o => o.correct), `new subject reto ${n} q${i + 1}: answer position`);
            });
            assert.strictEqual(radios(act.evidence_k2).length, 3, 'Visual version');
            collect([act.evidence_k5, act.evidence_k2, act.evidenceExample]);
        });
        const reto0 = getReto0ForSubject(sub.id);
        assert.deepStrictEqual(reto0.evidence.filter(q => /^reto0_quimica_prueba_q\d$/.test(q.id)).length, 4, 'Four open questions of its own');
        assert.strictEqual(reto0.evidence.filter(q => q.quiz).length, 10, 'The 10-question Reto 0 test');
        collect([reto0.evidence, reto0.study, getVisualReto0(sub.id), agentToolsFor(sub.id)]);
        LANGS.forEach(lang => assert.ok(texts.some(text => text.includes(sub.name[lang])), `The name appears in ${lang}`));
        assert.deepStrictEqual(texts.filter(text => /undefined|\[object|\$\{/.test(text)), [], 'No holes in the texts');
        assert.deepStrictEqual(texts.filter(text => /CodeCombat|Ozaria|codeSpark|Minecraft|Tecnología|Technologie|Technology/.test(text)), [],
            'No Technology content leaks into a new subject');
        console.log(`✅ A new subject gets general content with its own name in DE, EN and ES (${texts.length} texts checked)`);
    } finally {
        subjects.splice(subjects.indexOf(sub), 1);
    }
}

// Inteligencia artificial en todos los retos: cada competencia KMK tiene su dimensión de IA y cada
// reto (0 a 6, también la versión visual) tiene una pregunta sobre IA en todas las materias
function testArtificialIntelligence() {
    const { KMK_AREAS } = require('../data_kmk_competences');
    const { getReto0Study } = require('../data_reto0_quiz');
    const words = { es: /inteligencia artificial|\bIA\b/, de: /künstliche[rn]? Intelligenz|\bKI\b|KI-/, en: /artificial intelligence|\bAI\b/ };
    assert.strictEqual(KMK_AREAS.length, 6);
    KMK_AREAS.forEach(area => LANGS.forEach(lang => assert.ok(area.ai && area.ai[lang] && area.ai[lang].length > 40, `KMK ${area.id}: AI dimension (${lang})`)));
    subjects.forEach(({ id }) => {
        RETOS.forEach(n => {
            const act = activity(n, id);
            ['evidence_k5', 'evidence_k12', 'evidence_k2'].forEach(field => {
                const ai = radios(act[field]).filter(q => q.ai);
                assert.strictEqual(ai.length, 1, `${id} reto ${n} ${field}: one AI question`);
                LANGS.forEach(lang => assert.ok(words[lang].test(ai[0].label[lang]), `${id} reto ${n} ${field}: the AI question talks about AI (${lang})`));
                assert.ok(ai[0].kmk.startsWith(`${n}.`), 'It keeps a sub-competence of the challenge area');
            });
        });
        const reto0 = getReto0ForSubject(id).evidence.filter(q => q.quiz);
        assert.ok(reto0[9].ai && words.es.test(reto0[9].label.es), `${id}: question 10 of Reto 0 is about AI`);
        const study = getReto0Study(id);
        assert.strictEqual(study.safety.length, 3, `${id}: the study slide keeps both subject rules and adds the AI one`);
        assert.ok(study.examples.every(e => e.ai && e.ai.es), `${id}: every competence shows its AI dimension in Reto 0`);
    });
    console.log('✅ Artificial intelligence: each KMK competence has its AI dimension and every challenge 0-6 has an AI question in every subject');
}

// Retos 1-6 de Primaria (K3 a K6): más sencillos, con la dificultad que sube poco a poco.
// Mismos identificadores, subcompetencia KMK, pregunta de IA y posición de la respuesta correcta que
// la versión anterior; K3 = K4 y K5 = K6; K3 distinto de K5 y K5 distinto de K7; K7 = K12.
function testPrimaryRetos() {
    const legacy = require('./fixtures/legacy_correct_positions.json');
    const { isPrimaryGrade } = require('../data_questions_primary');
    assert.ok([3, 4, 5, 6].every(isPrimaryGrade) && !isPrimaryGrade(2) && !isPrimaryGrade(7));
    const textOf = q => JSON.stringify([q.label, q.options.map(o => [o.es, o.de, o.en])]);
    subjects.forEach(({ id }) => {
        RETOS.forEach(n => {
            const act = activity(n, id);
            const reference = radios(act.evidence_k7);
            const byGrade = {};
            K3_GRADES.forEach(g => {
                const items = act[`evidence_k${g}`];
                const qs = radios(items);
                byGrade[g] = qs.map(textOf).join('|');
                qs.forEach((q, i) => {
                    assert.strictEqual(q.id, `r${n}_${id}_k${g}_q${i + 1}`, `${id} reto ${n} K${g} q${i + 1}: id`);
                    assert.strictEqual(q.kmk, reference[i].kmk, `${id} reto ${n} K${g} q${i + 1}: KMK`);
                    assert.strictEqual(!!q.ai, !!reference[i].ai, `${id} reto ${n} K${g} q${i + 1}: AI question`);
                    assert.strictEqual(q.options.findIndex(o => o.correct), legacy[`r${n}q${i + 1}`],
                        `${id} reto ${n} K${g} q${i + 1}: the right answer keeps its position`);
                    assert.ok(q.hint && LANGS.every(l => q.hint[l] && q.label[l] && q.options.every(o => o[l])), `${id} reto ${n} K${g} q${i + 1}: 3 languages`);
                    assert.ok(items.some(it => it.id === `${q.id}_explain`), `${id} reto ${n} K${g} q${i + 1}: explanation field`);
                });
            });
            assert.strictEqual(byGrade[3], byGrade[4], `${id} reto ${n}: K3 = K4`);
            assert.strictEqual(byGrade[5], byGrade[6], `${id} reto ${n}: K5 = K6`);
            assert.notStrictEqual(byGrade[3], byGrade[5], `${id} reto ${n}: K3 differs from K5`);
            assert.notStrictEqual(byGrade[5], byGrade[7], `${id} reto ${n}: K5 differs from K7`);
            assert.strictEqual(byGrade[7], byGrade[12], `${id} reto ${n}: K7 = K12 (secondary unchanged)`);
        });
    });
    // Ninguna materia repite enunciado ni grupo de opciones en K3 (en K5 lo revisa testNoRepetitionBetweenSubjects)
    RETOS.forEach(n => {
        for (let q = 0; q < 6; q++) {
            LANGS.forEach(lang => {
                const questions = subjects.map(({ id }) => radios(activity(n, id).evidence_k3)[q]);
                assertAllDifferent(questions.map(item => item.label[lang]), `reto ${n} K3 q${q + 1} (${lang}) text`);
                assertAllDifferent(questions.map(item => item.options.map(o => optionText(o, lang)).join(' | ')), `reto ${n} K3 q${q + 1} (${lang}) options`);
            });
        }
    });
    console.log('✅ Primary retos 1-6 (K3-K6): simpler, same ids, KMK, AI question and answer positions; K3=K4, K5=K6, K7-K12 unchanged');
}

testEverySubjectHasItsRetos();
testPrimaryRetos();
testNoRepetitionBetweenSubjects();
testTemplatesAreComplete();
testAgentToolsPerSubject();
testVisualVersion();
testEditorKeepsPictures();
testTechnologyPlatforms();
testSportsAreas();
testArtificialIntelligence();
testNewSubjectContent();
console.log('\nAll content tests passed.');
