/**
 * instrument-editor.js - Editor de "Configura tus Retos del 0 al 6" (portal docente).
 * El docente edita las preguntas de un reto para un grado y una materia. Al guardar, el servidor
 * las valida y las ven (y con ellas se califica a) todos los estudiantes de ese grado y materia;
 * "Restablecer" vuelve a las preguntas del sistema. Cada reto 1-6 trabaja la competencia KMK de su
 * número y cada pregunta indica su subcompetencia. Del Reto 0 se edita solo la evaluación, desde
 * la pregunta 10 (K3-K12); allí la subcompetencia es opcional y puede ser de cualquier área.
 * La página (student-preview.ejs) define window.editorConfig = { kmkAreas, access, getSystemQuestions }.
 * También lleva la secuencia de revisión por idioma (en el navegador).
 */

window.currentInstrumentMode = 'editable'; // único modo
window.currentSelectedReto = 0; // 0 | 1 | 2 | 3 | 4 | 5 | 6 | null
window.instrumentState = {}; // por "grado_materia_reto": { status, questions, original, saved, system }

// Persistent Review Sequence State per Language
window.reviewSequenceState = {
    es: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    de: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    en: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
};

const editorClone = value => JSON.parse(JSON.stringify(value));
const editorEscape = value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const editorGrade = () => window.currentGrade || 5;
const editorKey = reto => `${editorGrade()}_${window.currentSubject}_${reto}`;
// Solo se editan las preguntas: el campo de argumento lo agrega el servidor en K3-K12.
// En el Reto 0 la explicación de cada pregunta (practice_explanation) se edita como pista.
const radiosOnly = list => editorClone((list || []).filter(q => q && q.type !== 'textarea'))
    .map(q => (q.hint || !q.practice_explanation) ? q : { ...q, hint: q.practice_explanation });
// Número de la primera pregunta editable: el Reto 0 empieza en la 10 (las 9 primeras son fijas)
const RETO0_FIRST_QUESTION = 10;
const firstQuestionNumber = reto => (reto === 0 ? RETO0_FIRST_QUESTION : 1);

function editorText(field) {
    const lang = window.currentLang || 'es';
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || '';
}

function kmkArea(reto) {
    const areas = (window.editorConfig && window.editorConfig.kmkAreas) || [];
    return areas.find(a => a.id === reto) || null;
}

function subjectName(subjectId) {
    const list = (window.editorConfig && window.editorConfig.subjects) || [];
    const found = list.find(s => s.id === subjectId);
    const lang = window.currentLang || 'es';
    return found ? (found.name[lang] || found.name.es) : subjectId;
}

// ¿Puede el docente guardar la materia elegida? (el servidor lo vuelve a comprobar)
function canEditCurrentSubject() {
    const access = (window.editorConfig && window.editorConfig.access) || {};
    return !!access.anySubject || (!!access.subject && access.subject === window.currentSubject);
}

// Reto que se está editando (0-6) o null. El Reto 0 se edita en K3-K12 (el visual no).
function activeEditReto() {
    const r = window.currentSelectedReto;
    if (r >= 1 && r <= 6) return r;
    return (r === 0 && editorGrade() >= 3) ? 0 : null;
}

// Todas las subcompetencias KMK, para la evaluación del Reto 0
function allKmkSubs() {
    const areas = (window.editorConfig && window.editorConfig.kmkAreas) || [];
    return areas.flatMap(area => area.subs.map(sub => ({ ...sub, area })));
}

function getEditorState(reto) {
    return window.instrumentState[editorKey(reto)];
}

// Carga la versión guardada (si la hay) o las preguntas del sistema de ese grado, materia y reto
async function ensureInstrumentLoaded(reto) {
    const key = editorKey(reto);
    const current = window.instrumentState[key];
    if (current && current.status !== 'error') return current;
    window.instrumentState[key] = { status: 'loading' };
    const [grade, subject] = key.split('_');
    try {
        const res = await fetch(`/api/instruments/${grade}/${encodeURIComponent(subject)}/${reto}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'load');
        const system = radiosOnly(window.editorConfig.getSystemQuestions(reto, Number(grade), subject));
        const saved = data.custom ? data.data : null;
        const questions = saved ? radiosOnly(saved.questions) : editorClone(system);
        window.instrumentState[key] = { status: 'ready', questions, original: editorClone(questions), saved, system };
    } catch (e) {
        console.error('Error loading instrument:', e);
        window.instrumentState[key] = { status: 'error' };
    }
    if (typeof updateUI === 'function') updateUI();
    return window.instrumentState[key];
}

function editableQuestions(retoNum) {
    const state = getEditorState(retoNum);
    return state && state.status === 'ready' ? state.questions : null;
}

function refreshEditor() {
    if (typeof updateUI === 'function') updateUI();
}

function switchInstrumentMode() {
    window.currentInstrumentMode = 'editable';
    const labelMode = document.getElementById('labelCurrentMode');
    if (labelMode) labelMode.innerText = window.t('doc_inst_editable');
    if (typeof updateBadges === 'function') updateBadges();
    refreshEditor();
}

// Nota de la barra lateral: quién puede guardar y a quién llega; los botones se desactivan sin permiso
function renderEditorAccess() {
    const note = document.getElementById('editorAccessNote');
    const access = (window.editorConfig && window.editorConfig.access) || {};
    if (note) {
        let text;
        if (access.anySubject) text = window.t('doc_inst_js_acceso_todas');
        else if (access.subject) text = window.t('doc_inst_js_acceso_materia').replace('{materia}', subjectName(access.subject));
        else text = window.t('doc_inst_js_acceso_sin_materia');
        note.innerText = text + ' ' + window.t('doc_inst_js_aplica_a_todos');
    }
    const allowed = canEditCurrentSubject();
    ['btnSaveInstrument', 'btnResetInstrument'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = !allowed;
        btn.classList.toggle('opacity-50', !allowed);
        btn.classList.toggle('cursor-not-allowed', !allowed);
        btn.title = allowed ? '' : window.t('doc_inst_js_err_forbidden');
    });
}

function getStorageKey() {
    const grade = window.currentGrade !== null && window.currentGrade !== undefined ? window.currentGrade : 'all';
    const sub = window.currentSubject || 'all';
    return `medienpass_review_seq_${grade}_${sub}`;
}

function loadReviewSequence() {
    try {
        const key = getStorageKey();
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            window.reviewSequenceState = Object.assign({
                es: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
                de: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
                en: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
            }, parsed);
        }
    } catch(e) {
        console.error("Error loading review sequence:", e);
    }
    renderReviewSequenceList();
}

function toggleRetoReviewStatus(retoNum) {
    const lang = window.currentLang || 'es';
    if (!window.reviewSequenceState[lang]) {
        window.reviewSequenceState[lang] = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
    }
    window.reviewSequenceState[lang][retoNum] = !window.reviewSequenceState[lang][retoNum];

    renderReviewSequenceList();
    refreshEditor();
}

function saveReviewSequence() {
    const lang = window.currentLang || 'es';
    const btn = document.getElementById('btnSaveReviewSeq');
    try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(window.reviewSequenceState));
        if (btn) {
            const originalHtml = btn.innerHTML;
            btn.className = "w-full py-2 px-3 bg-green-600 text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2";
            btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${editorEscape(window.t('doc_inst_js_secuencia_guardada').replace('{idioma}', lang.toUpperCase()))}`;
            setTimeout(() => {
                btn.className = "w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2";
                btn.innerHTML = originalHtml;
            }, 2000);
        }
    } catch(e) {
        console.error("Error saving review sequence:", e);
        alert(window.t('doc_inst_js_error_secuencia'));
    }
}

function renderReviewSequenceList() {
    const container = document.getElementById('reviewSequenceList');
    const badge = document.getElementById('reviewLangBadge');
    const lang = window.currentLang || 'es';
    if (badge) badge.innerText = lang.toUpperCase();

    if (!container) return;

    const currentLangState = window.reviewSequenceState[lang] || {};
    let html = '';

    for (let r = 0; r <= 6; r++) {
        const isReviewed = !!currentLangState[r];
        const retoTitle = r === 0 ? window.t('doc_inst_reto_0_diagnostico_intro') : `${window.t('doc_prev_js_reto')} ${r}`;

        html += `
            <div onclick="toggleRetoReviewStatus(${r})" class="flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition text-xs select-none ${isReviewed ? 'bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}">
                <div class="flex items-center gap-2">
                    <span class="${isReviewed ? 'text-emerald-400' : 'text-slate-500'}">
                        ${isReviewed ? '<i class="fa-solid fa-square-check"></i>' : '<i class="fa-regular fa-square"></i>'}
                    </span>
                    <span>${editorEscape(retoTitle)}</span>
                </div>
                <span class="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${isReviewed ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}">
                    ${editorEscape(window.t(isReviewed ? 'doc_inst_js_habilitado' : 'doc_inst_js_pendiente'))}
                </span>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Encabezado del reto: competencia KMK, sus subcompetencias (con cuántas preguntas trabajan cada
// una) y el estado (editado por / preguntas del sistema)
function renderCompetenceHeader(retoNum) {
    const area = kmkArea(retoNum);
    const state = getEditorState(retoNum);
    const lang = window.currentLang || 'es';
    if (retoNum === 0 && state && state.status === 'ready') return renderReto0Header(state, lang);
    if (!area || !state || state.status !== 'ready') return '';
    const counts = {};
    state.questions.forEach(q => { counts[q.kmk] = (counts[q.kmk] || 0) + 1; });
    const subs = area.subs.map(sub => `
        <li class="flex items-start justify-between gap-3 py-1 border-b border-indigo-100 last:border-b-0">
            <span><strong class="text-indigo-700">${sub.id}</strong> ${editorEscape(sub.name[lang] || sub.name.es)}</span>
            <span class="kmk-count shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${counts[sub.id] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}">${counts[sub.id] || 0}</span>
        </li>`).join('');

    let status;
    if (state.saved) {
        const when = state.saved.updatedAt ? new Date(state.saved.updatedAt).toLocaleString(lang) : '';
        status = window.t('doc_inst_js_editado_por').replace('{docente}', state.saved.updatedBy || '—').replace('{fecha}', when);
    } else {
        status = window.t('doc_inst_js_preguntas_sistema');
    }

    return `
        <div id="kmkCompetenceHeader" class="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2 no-print">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <h5 class="text-sm font-extrabold text-indigo-900">${area.icon} ${editorEscape(window.t('doc_inst_js_competencia_kmk').replace('{n}', area.id))}: ${editorEscape(area.name[lang] || area.name.es)}</h5>
                <span id="instrumentStatus" class="text-[11px] font-bold px-2 py-0.5 rounded-lg ${state.saved ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-white text-slate-600 border border-slate-200'}">${editorEscape(status)}</span>
            </div>
            <p class="text-[11px] text-indigo-800/80">${editorEscape(window.t('doc_inst_js_enfasis_competencia'))}</p>
            <ul class="text-xs text-slate-700">${subs}</ul>
            ${area.ai ? `<p class="text-[11px] rounded-lg px-3 py-2" style="background:#111111;color:#f2f2f2;"><span aria-hidden="true">🤖</span> <strong style="color:#f0ce2d;">${editorEscape(window.t('doc_inst_js_ia_competencia'))}</strong> ${editorEscape(area.ai[lang] || area.ai.es)}</p>` : ''}
            <p class="text-[11px] text-slate-500"><i class="fa-solid fa-language"></i> ${editorEscape(window.t('doc_inst_js_editas_idioma').replace('{idioma}', lang.toUpperCase()))}</p>
        </div>
    `;
}

// Encabezado de la evaluación del Reto 0: qué se edita (desde la pregunta 10) y el estado
function renderReto0Header(state, lang) {
    const status = state.saved
        ? window.t('doc_inst_js_editado_por').replace('{docente}', state.saved.updatedBy || '—')
            .replace('{fecha}', state.saved.updatedAt ? new Date(state.saved.updatedAt).toLocaleString(lang) : '')
        : window.t('doc_inst_js_preguntas_sistema');
    return `
        <div id="kmkCompetenceHeader" class="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2 no-print">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <h5 class="text-sm font-extrabold text-indigo-900">🚀 ${editorEscape(window.t('doc_inst_js_reto0_evaluacion'))}</h5>
                <span id="instrumentStatus" class="text-[11px] font-bold px-2 py-0.5 rounded-lg ${state.saved ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-white text-slate-600 border border-slate-200'}">${editorEscape(status)}</span>
            </div>
            <p class="text-[11px] text-indigo-800/80">${editorEscape(window.t('doc_inst_js_reto0_ayuda'))}</p>
            <p class="text-[11px] text-slate-500"><i class="fa-solid fa-language"></i> ${editorEscape(window.t('doc_inst_js_editas_idioma').replace('{idioma}', lang.toUpperCase()))}</p>
        </div>
    `;
}

// Tarjeta editable de una pregunta: enunciado, pista, subcompetencia y opciones (con la correcta)
function renderEditableQuestionCard(q, retoNum, idx) {
    const lang = window.currentLang || 'es';
    const area = kmkArea(retoNum);
    const labelVal = editorText(q.label);
    const hintVal = editorText(q.hint);
    const showHint = editorGrade() !== 2;
    const subName = sub => `${sub.id} ${editorEscape(sub.name[lang] || sub.name.es)}`;

    // Retos 1-6: las subcompetencias del área del reto. Reto 0: todas, por área, y es opcional.
    const kmkOptions = retoNum === 0
        ? [`<option value="" ${q.kmk ? '' : 'selected'}>${editorEscape(window.t('doc_inst_js_sin_subcompetencia'))}</option>`]
            .concat(((window.editorConfig && window.editorConfig.kmkAreas) || []).map(a =>
                `<optgroup label="${editorEscape(`${a.id}. ${a.name[lang] || a.name.es}`)}">${a.subs.map(sub =>
                    `<option value="${sub.id}" ${q.kmk === sub.id ? 'selected' : ''}>${subName(sub)}</option>`).join('')}</optgroup>`))
            .join('')
        : [`<option value="" ${q.kmk ? '' : 'selected'}>${editorEscape(window.t('doc_inst_js_elige_subcompetencia'))}</option>`]
            .concat((area ? area.subs : []).map(sub =>
                `<option value="${sub.id}" ${q.kmk === sub.id ? 'selected' : ''}>${subName(sub)}</option>`))
            .join('');
    const kmkMissing = retoNum !== 0 && !q.kmk;

    let optionsHtml = '';
    (q.options || []).forEach((opt, oIdx) => {
        const optVal = editorText(opt);
        const isCorrect = !!opt.correct;
        optionsHtml += `
            <div class="flex items-start gap-2.5 mt-2.5 p-2 rounded-xl transition-all ${isCorrect ? 'bg-emerald-500/10 border border-emerald-400/40 ring-1 ring-emerald-500/20' : 'bg-white border border-slate-200'}">
                <label class="flex items-center gap-1.5 pt-2 shrink-0 cursor-pointer" title="${editorEscape(window.t('doc_inst_js_marcar_correcta'))}">
                    <input type="radio" name="correct_opt_${retoNum}_${idx}" ${isCorrect ? 'checked' : ''}
                           onchange="setCorrectOption(${retoNum}, ${idx}, ${oIdx})"
                           class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer">
                    ${isCorrect
                        ? `<span class="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow-sm uppercase"><i class="fa-solid fa-check"></i> ${editorEscape(window.t('doc_inst_js_correcta'))}</span>`
                        : `<span class="text-[10px] text-slate-400 font-bold uppercase">${editorEscape(window.t('doc_inst_js_opcion'))}</span>`}
                </label>
                ${editorGrade() === 2 ? `<input type="text" maxlength="16" value="${editorEscape(opt.emoji || '⭐')}" onchange="updateOptionPicture(${retoNum}, ${idx}, ${oIdx}, this.value)" aria-label="${editorEscape(window.t('doc_inst_js_imagen_opcion'))}" title="${editorEscape(window.t('doc_inst_js_imagen_opcion'))}" class="w-12 px-1 py-1.5 text-xl text-center rounded-lg border border-slate-200 bg-white shrink-0">` : ''}
                <textarea rows="2" onchange="updateOptionValue(${retoNum}, ${idx}, ${oIdx}, this.value)"
                          placeholder="${editorEscape(window.t('doc_inst_js_texto_opcion'))}"
                          class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-y">${editorEscape(optVal)}</textarea>
                <button type="button" onclick="removeOptionFromQuestion(${retoNum}, ${idx}, ${oIdx})" class="text-rose-500 hover:text-rose-700 text-xs px-2 py-2 shrink-0 font-bold" title="${editorEscape(window.t('doc_inst_js_eliminar_opcion'))}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    return `
        <div class="editor-question-card bg-amber-50/40 border-2 border-amber-200 rounded-xl p-4 space-y-3 relative group" data-question-id="${editorEscape(q.id || '')}">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                <span class="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <i class="fa-solid fa-pen-to-square"></i> ${editorEscape(window.t('doc_inst_js_pregunta_n').replace('{n}', idx + firstQuestionNumber(retoNum)))}
                </span>
                <button type="button" onclick="removeQuestionFromEditor(${retoNum}, ${idx})" class="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1">
                    <i class="fa-solid fa-trash"></i> ${editorEscape(window.t('doc_inst_js_eliminar_pregunta'))}
                </button>
            </div>

            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">${editorEscape(window.t('doc_inst_js_subcompetencia'))}</label>
                <select onchange="setQuestionKmk(${retoNum}, ${idx}, this.value)" class="editor-kmk-select w-full px-3 py-1.5 text-xs rounded-lg border ${kmkMissing ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-indigo-300 bg-indigo-50 text-indigo-900'} font-semibold focus:ring-2 focus:ring-indigo-400 focus:outline-none">${kmkOptions}</select>
            </div>

            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">${editorEscape(window.t('doc_inst_js_enunciado'))}</label>
                <textarea rows="2" onchange="updateQuestionLabel(${retoNum}, ${idx}, this.value)"
                          placeholder="${editorEscape(window.t('doc_inst_js_escribe_enunciado'))}"
                          class="editor-label w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-y">${editorEscape(labelVal)}</textarea>
            </div>

            ${showHint ? `
            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">${editorEscape(window.t('doc_inst_js_pista'))}</label>
                <textarea rows="2" onchange="updateQuestionHint(${retoNum}, ${idx}, this.value)"
                          placeholder="${editorEscape(window.t('doc_inst_js_escribe_pista'))}"
                          class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-y">${editorEscape(hintVal)}</textarea>
            </div>` : ''}

            <div class="space-y-1 pt-2 border-t border-amber-200/60">
                <div class="flex items-center justify-between">
                    <label class="block text-[11px] font-bold text-slate-600 uppercase">${editorEscape(window.t('doc_inst_js_opciones_respuesta'))}</label>
                    <button type="button" onclick="addOptionToQuestion(${retoNum}, ${idx})" class="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                        <i class="fa-solid fa-plus-circle"></i> ${editorEscape(window.t('doc_inst_js_agregar_opcion'))}
                    </button>
                </div>
                ${optionsHtml}
            </div>
        </div>
    `;
}

function setCorrectOption(retoNum, qIdx, selectedOIdx) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx] && Array.isArray(questions[qIdx].options)) {
        questions[qIdx].options.forEach((opt, oIdx) => {
            if (typeof opt === 'object') opt.correct = (oIdx === selectedOIdx);
        });
        refreshEditor();
    }
}

function setQuestionKmk(retoNum, qIdx, value) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx]) {
        questions[qIdx].kmk = value;
        refreshEditor();
    }
}

// Escribe el texto en el idioma activo; los otros idiomas no cambian
function setLangText(holder, field, val) {
    const lang = window.currentLang || 'es';
    if (!holder[field] || typeof holder[field] !== 'object') {
        const old = typeof holder[field] === 'string' ? holder[field] : '';
        holder[field] = { es: old, de: old, en: old };
    }
    holder[field][lang] = val;
}

function updateQuestionLabel(retoNum, qIdx, val) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx]) setLangText(questions[qIdx], 'label', val);
}

function updateQuestionHint(retoNum, qIdx, val) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx]) setLangText(questions[qIdx], 'hint', val);
}

function updateOptionValue(retoNum, qIdx, oIdx, val) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx] && questions[qIdx].options && questions[qIdx].options[oIdx]) {
        const lang = window.currentLang || 'es';
        const opt = questions[qIdx].options[oIdx];
        if (typeof opt !== 'object') {
            questions[qIdx].options[oIdx] = { es: String(opt), de: String(opt), en: String(opt), correct: false };
        }
        questions[qIdx].options[oIdx][lang] = val;
    }
}

// Imagen de una opción del Medienpass visual (grado 2)
function updateOptionPicture(retoNum, qIdx, oIdx, val) {
    const questions = editableQuestions(retoNum);
    const opt = questions && questions[qIdx] && questions[qIdx].options && questions[qIdx].options[oIdx];
    if (opt && typeof opt === 'object') opt.emoji = val;
}

function addOptionToQuestion(retoNum, qIdx) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx]) {
        if (!questions[qIdx].options) questions[qIdx].options = [];
        questions[qIdx].options.push({ es: '', de: '', en: '', correct: false });
        refreshEditor();
    }
}

function removeOptionFromQuestion(retoNum, qIdx, oIdx) {
    const questions = editableQuestions(retoNum);
    if (questions && questions[qIdx] && questions[qIdx].options) {
        questions[qIdx].options.splice(oIdx, 1);
        refreshEditor();
    }
}

// Pregunta nueva: el docente elige la subcompetencia, escribe el enunciado y las opciones
function addNewQuestionToEditor() {
    const reto = activeEditReto();
    if (reto === null) return alert(window.t('doc_inst_js_elige_reto'));
    const questions = editableQuestions(reto);
    if (!questions) return;
    const empty = () => ({ es: '', de: '', en: '' });
    questions.push({
        id: '',
        type: 'radio_group',
        kmk: '',
        label: empty(),
        hint: empty(),
        options: [{ ...empty(), correct: true }, { ...empty(), correct: false }, { ...empty(), correct: false }]
    });
    refreshEditor();
    setTimeout(() => {
        const cards = document.querySelectorAll('.editor-question-card');
        if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
}

function removeQuestionFromEditor(retoNum, qIdx) {
    const questions = editableQuestions(retoNum);
    if (questions) {
        questions.splice(qIdx, 1);
        refreshEditor();
    }
}

const hasText = field => !!field && (typeof field === 'string' ? field.trim() : ['es', 'de', 'en'].some(l => (field[l] || '').trim()));

// Las mismas reglas que comprueba el servidor; devuelve el mensaje del primer problema o ''
function validateEditorQuestions(questions, reto) {
    if (!questions.length) return editorErrorMessage('empty');
    const area = kmkArea(reto);
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!hasText(q.label)) return editorErrorMessage('label', i, reto);
        const options = (q.options || []).filter(hasText);
        if (options.length < 2) return editorErrorMessage('options', i, reto);
        if (options.filter(o => o.correct).length !== 1) return editorErrorMessage('correct', i, reto);
        const kmkOk = reto === 0 ? (!q.kmk || allKmkSubs().some(sub => sub.id === q.kmk)) : (area && area.subs.some(sub => sub.id === q.kmk));
        if (!kmkOk) return editorErrorMessage('kmk', i, reto);
    }
    return '';
}

// Mensaje de un error, con el número de la pregunta tal como se ve (el Reto 0 empieza en la 10)
function editorErrorMessage(code, index, reto) {
    const known = ['empty', 'too_many', 'label', 'options', 'correct', 'kmk', 'forbidden', 'invalid'];
    const key = known.includes(code) ? `doc_inst_js_err_${code}` : 'doc_inst_js_err_server';
    const first = firstQuestionNumber(reto === undefined ? window.currentSelectedReto : reto);
    return window.t(key).replace('{n}', (index || 0) + first);
}

// ¿Cambió la respuesta correcta de alguna pregunta que ya existía? (sus respuestas se recalifican)
function correctAnswerChanged(state) {
    const correctIndex = q => (q.options || []).findIndex(o => o.correct);
    return state.questions.some(q => {
        const before = q.id && state.original.find(o => o.id === q.id);
        return before && correctIndex(before) !== correctIndex(q);
    });
}

async function saveCustomInstrumentToServer() {
    const reto = activeEditReto();
    if (reto === null) return alert(window.t('doc_inst_js_elige_reto'));
    const state = getEditorState(reto);
    if (!state || state.status !== 'ready') return;
    if (!canEditCurrentSubject()) return alert(editorErrorMessage('forbidden'));
    const problem = validateEditorQuestions(state.questions, reto);
    if (problem) return alert(problem);

    let message = window.t('doc_inst_js_confirmar_guardar')
        .replace('{reto}', reto).replace('{grado}', editorGrade()).replace('{materia}', subjectName(window.currentSubject));
    if (correctAnswerChanged(state)) message += '\n\n' + window.t('doc_inst_js_aviso_recalificar');
    if (!confirm(message)) return;

    const key = editorKey(reto);
    try {
        const res = await fetch('/api/instruments/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade: editorGrade(), subject: window.currentSubject, reto, questions: state.questions })
        });
        const data = await res.json();
        if (!data.success) return alert(editorErrorMessage(data.error, data.index));
        const questions = radiosOnly(data.saved.questions);
        window.instrumentState[key] = { status: 'ready', questions, original: editorClone(questions), saved: data.saved, system: state.system };
        refreshEditor();
        alert(window.t('doc_inst_js_guardado').replace('{reto}', reto));
    } catch (e) {
        console.error(e);
        alert(editorErrorMessage('server'));
    }
}

async function resetInstrumentToDefault() {
    const reto = activeEditReto();
    if (reto === null) return alert(window.t('doc_inst_js_elige_reto'));
    const state = getEditorState(reto);
    if (!state || state.status !== 'ready') return;
    if (!canEditCurrentSubject()) return alert(editorErrorMessage('forbidden'));
    const message = window.t('doc_inst_js_confirmar_restablecer')
        .replace('{reto}', reto).replace('{grado}', editorGrade()).replace('{materia}', subjectName(window.currentSubject));
    if (!confirm(message)) return;

    const key = editorKey(reto);
    try {
        const res = await fetch('/api/instruments/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade: editorGrade(), subject: window.currentSubject, reto })
        });
        const data = await res.json();
        if (!data.success) return alert(editorErrorMessage(data.error));
        window.instrumentState[key] = { status: 'ready', questions: editorClone(state.system), original: editorClone(state.system), saved: null, system: state.system };
        refreshEditor();
        alert(window.t('doc_inst_js_restablecido').replace('{reto}', reto));
    } catch (e) {
        console.error(e);
        alert(editorErrorMessage('server'));
    }
}

window.instrumentEditor = {
    switchInstrumentMode,
    renderEditorAccess,
    ensureInstrumentLoaded,
    getEditorState,
    loadReviewSequence,
    toggleRetoReviewStatus,
    saveReviewSequence,
    renderReviewSequenceList,
    renderCompetenceHeader,
    renderEditableQuestionCard,
    setCorrectOption,
    setQuestionKmk,
    updateQuestionLabel,
    updateQuestionHint,
    updateOptionValue,
    addOptionToQuestion,
    removeOptionFromQuestion,
    addNewQuestionToEditor,
    removeQuestionFromEditor,
    saveCustomInstrumentToServer,
    resetInstrumentToDefault
};
