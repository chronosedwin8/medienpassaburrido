/**
 * instrument-editor.js - Client-side Manager for 3 Instrument Alternatives
 * Handles Automatic, Google Forms Editable Mode, AI Assistance Mode, 
 * Deselection features, Undo history, and Persistent Review Sequence.
 */

window.currentInstrumentMode = 'auto'; // 'auto' | 'editable' | 'ai' | null
window.currentSelectedReto = 0; // 0 | 1 | 2 | 3 | 4 | 5 | 6 | null
window.customQuestionsCache = {}; // Cache per reto
window.undoQuestionsCache = {}; // Backup per reto for Undo feature

// Persistent Review Sequence State per Language
window.reviewSequenceState = {
    es: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    de: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
    en: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
};

function selectRetoFilter(reto) {
    window.currentSelectedReto = reto;

    // Update Reto Selector buttons UI in sidebar
    [0, 1, 2, 3, 4, 5, 6].forEach(r => {
        const btn = document.getElementById(`btn-reto-${r}`);
        if (!btn) return;

        const isActive = (r === reto);
        if (isActive) {
            btn.className = "btn-reto-filter w-full px-3 py-2 rounded-lg border transition-all flex items-center justify-between bg-indigo-600/35 border-l-4 border-l-indigo-400 border-indigo-500/40 text-white font-bold text-xs shadow-md shadow-indigo-950/40";
        } else {
            btn.className = "btn-reto-filter w-full px-3 py-2 rounded-lg border border-transparent text-xs font-medium transition-all flex items-center justify-between text-slate-300 hover:bg-white/10 hover:text-white";
        }
    });

    if (typeof updateBadges === 'function') updateBadges();
    if (typeof updateUI === 'function') updateUI();
}

function switchInstrumentMode(mode) {
    window.currentInstrumentMode = mode;

    // Update Sidebar Button Styles
    const btnAuto = document.getElementById('btn-mode-auto');
    const btnEditable = document.getElementById('btn-mode-editable');
    const btnAI = document.getElementById('btn-mode-ai');
    const labelMode = document.getElementById('labelCurrentMode');

    const panelEditable = document.getElementById('sidebarPanelEditable');
    const panelAI = document.getElementById('sidebarPanelAI');

    // Reset base button styles
    [btnAuto, btnEditable, btnAI].forEach(b => {
        if (!b) return;
        b.className = "w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3 bg-white/5 border-l-4 border-l-transparent border-white/5 text-slate-300 hover:bg-white/10 hover:text-white";
    });

    if (panelEditable) panelEditable.classList.add('hidden');
    if (panelAI) panelAI.classList.add('hidden');

    if (mode === 'auto') {
        if (btnAuto) btnAuto.className = "w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3 bg-indigo-600/25 border-l-4 border-l-indigo-500 border-indigo-500/40 text-white shadow-lg shadow-indigo-950/50";
        if (labelMode) labelMode.innerText = "AUTOMÁTICA";
    } else if (mode === 'editable') {
        if (btnEditable) btnEditable.className = "w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3 bg-amber-500/20 border-l-4 border-l-amber-500 border-amber-500/40 text-white shadow-lg shadow-amber-950/50";
        if (labelMode) labelMode.innerText = "EDITABLE";
        if (panelEditable) panelEditable.classList.remove('hidden');
    } else if (mode === 'ai') {
        if (btnAI) btnAI.className = "w-full text-left px-3.5 py-3 rounded-xl border transition-all duration-200 flex items-start gap-3 bg-emerald-500/20 border-l-4 border-l-emerald-500 border-emerald-500/40 text-white shadow-lg shadow-emerald-950/50";
        if (labelMode) labelMode.innerText = "LA IA TE AYUDA";
        if (panelAI) panelAI.classList.remove('hidden');
    } else {
        if (labelMode) labelMode.innerText = "SIN SELECCIONAR";
    }

    if (typeof updateBadges === 'function') updateBadges();
    if (typeof updateUI === 'function') updateUI();
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
    if (typeof updateUI === 'function') updateUI();
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
            btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> ¡Secuencia para ${lang.toUpperCase()} Guardada!`;
            setTimeout(() => {
                btn.className = "w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2";
                btn.innerHTML = originalHtml;
            }, 2000);
        }
    } catch(e) {
        console.error("Error saving review sequence:", e);
        alert("Error al guardar la secuencia de revisión.");
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
        const retoTitle = r === 0 
            ? (lang === 'de' ? 'Reto 0 - Diagnose' : lang === 'en' ? 'Reto 0 - Diagnosis' : 'Reto 0 - Diagnóstico') 
            : `Reto ${r}`;

        html += `
            <div onclick="toggleRetoReviewStatus(${r})" class="flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition text-xs select-none ${isReviewed ? 'bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}">
                <div class="flex items-center gap-2">
                    <span class="${isReviewed ? 'text-emerald-400' : 'text-slate-500'}">
                        ${isReviewed ? '<i class="fa-solid fa-square-check"></i>' : '<i class="fa-regular fa-square"></i>'}
                    </span>
                    <span>${retoTitle}</span>
                </div>
                <span class="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${isReviewed ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}">
                    ${isReviewed ? 'Habilitado' : 'Pendiente'}
                </span>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Renders an editable Google Form card for a question
function renderEditableQuestionCard(q, retoNum, idx) {
    const lang = window.currentLang || 'es';
    
    const getVal = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field[lang] || field.es || field.de || field.en || '';
    };

    const labelVal = getVal(q.label);
    const hintVal = getVal(q.hint);

    let optionsHtml = '';
    if (q.options && q.options.length > 0) {
        q.options.forEach((opt, oIdx) => {
            const optVal = getVal(opt);
            optionsHtml += `
                <div class="flex items-center gap-2 mt-2">
                    <input type="radio" disabled ${opt.correct ? 'checked' : ''} class="w-4 h-4 text-amber-500">
                    <input type="text" 
                           value="${optVal.replace(/"/g, '&quot;')}" 
                           onchange="updateOptionValue(${retoNum}, ${idx}, ${oIdx}, this.value)"
                           placeholder="Opción de respuesta..."
                           class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                    <button onclick="removeOptionFromQuestion(${retoNum}, ${idx}, ${oIdx})" class="text-rose-500 hover:text-rose-700 text-xs px-2 py-1">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        });
    }

    return `
        <div class="bg-amber-50/40 border-2 border-amber-200 rounded-xl p-4 space-y-3 relative group">
            <div class="flex items-center justify-between">
                <span class="text-xs font-black bg-amber-500 text-white px-2.5 py-0.5 rounded-md">Pregunta ${idx + 1} (Google Form)</span>
                <button onclick="removeQuestionFromEditor(${retoNum}, ${idx})" class="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>

            <!-- Question Label -->
            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">Enunciado de la Pregunta:</label>
                <input type="text" 
                       value="${labelVal.replace(/"/g, '&quot;')}" 
                       onchange="updateQuestionLabel(${retoNum}, ${idx}, this.value)"
                       placeholder="Escribe la pregunta..."
                       class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            </div>

            <!-- Hint / Explanation -->
            <div class="space-y-1">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">Pista / Explicación:</label>
                <input type="text" 
                       value="${hintVal.replace(/"/g, '&quot;')}" 
                       onchange="updateQuestionHint(${retoNum}, ${idx}, this.value)"
                       placeholder="Pista de ayuda para los estudiantes..."
                       class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            </div>

            <!-- Options (if multiple choice) -->
            <div class="space-y-1 pt-2 border-t border-amber-200/60">
                <div class="flex items-center justify-between">
                    <label class="block text-[11px] font-bold text-slate-600 uppercase">Opciones de Respuesta:</label>
                    <button onclick="addOptionToQuestion(${retoNum}, ${idx})" class="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                        <i class="fa-solid fa-plus-circle"></i> Agregar Opción
                    </button>
                </div>
                ${optionsHtml}
            </div>
        </div>
    `;
}

function updateQuestionLabel(retoNum, qIdx, val) {
    const questions = window.customQuestionsCache[retoNum];
    if (questions && questions[qIdx]) {
        const lang = window.currentLang || 'es';
        if (typeof questions[qIdx].label !== 'object') {
            questions[qIdx].label = { es: val, de: val, en: val };
        } else {
            questions[qIdx].label[lang] = val;
            if (!questions[qIdx].label.es) questions[qIdx].label.es = val;
        }
    }
}

function updateQuestionHint(retoNum, qIdx, val) {
    const questions = window.customQuestionsCache[retoNum];
    if (questions && questions[qIdx]) {
        const lang = window.currentLang || 'es';
        if (!questions[qIdx].hint || typeof questions[qIdx].hint !== 'object') {
            questions[qIdx].hint = { es: val, de: val, en: val };
        } else {
            questions[qIdx].hint[lang] = val;
            if (!questions[qIdx].hint.es) questions[qIdx].hint.es = val;
        }
    }
}

function updateOptionValue(retoNum, qIdx, oIdx, val) {
    const questions = window.customQuestionsCache[retoNum];
    if (questions && questions[qIdx] && questions[qIdx].options && questions[qIdx].options[oIdx]) {
        const lang = window.currentLang || 'es';
        const opt = questions[qIdx].options[oIdx];
        if (typeof opt !== 'object') {
            questions[qIdx].options[oIdx] = { es: val, de: val, en: val, correct: oIdx === 0 };
        } else {
            opt[lang] = val;
            if (!opt.es) opt.es = val;
        }
    }
}

function addOptionToQuestion(retoNum, qIdx) {
    const questions = window.customQuestionsCache[retoNum];
    if (questions && questions[qIdx]) {
        if (!questions[qIdx].options) questions[qIdx].options = [];
        const newOpt = { es: "Nueva opción", de: "Neue Option", en: "New option", correct: false };
        questions[qIdx].options.push(newOpt);
        if (typeof updateUI === 'function') updateUI();
    }
}

function removeOptionFromQuestion(retoNum, qIdx, oIdx) {
    const questions = window.customQuestionsCache[retoNum];
    if (questions && questions[qIdx] && questions[qIdx].options) {
        questions[qIdx].options.splice(oIdx, 1);
        if (typeof updateUI === 'function') updateUI();
    }
}

function addNewQuestionToEditor() {
    const activeR = (window.currentSelectedReto && window.currentSelectedReto >= 1 && window.currentSelectedReto <= 6) ? window.currentSelectedReto : 1;
    if (!window.customQuestionsCache[activeR]) window.customQuestionsCache[activeR] = [];
    
    window.customQuestionsCache[activeR].push({
        id: `custom_q_${Date.now()}`,
        type: "radio_group",
        label: { es: "Nueva pregunta personalizada", de: "Neue benutzerdefinierte Frage", en: "New custom question" },
        hint: { es: "Escribe una pista explicativa...", de: "Schreibe einen Hinweis...", en: "Write a hint..." },
        options: [
            { es: "a) Opción correcta", de: "a) Richtige Option", en: "a) Correct option", correct: true },
            { es: "b) Opción secundaria", de: "b) Zweite Option", en: "b) Secondary option", correct: false }
        ]
    });
    if (typeof updateUI === 'function') updateUI();
}

function removeQuestionFromEditor(retoNum, qIdx) {
    const questions = window.customQuestionsCache[retoNum];
    if (questions) {
        questions.splice(qIdx, 1);
        if (typeof updateUI === 'function') updateUI();
    }
}

async function saveCustomInstrumentToServer() {
    const grade = window.currentGrade || 5;
    const subject = window.currentSubject || 'aleman';
    const activeR = (window.currentSelectedReto && window.currentSelectedReto >= 1 && window.currentSelectedReto <= 6) ? window.currentSelectedReto : 1;

    try {
        const questions = window.customQuestionsCache[activeR] || [];
        const res = await fetch('/api/instruments/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grade,
                subject,
                reto: activeR,
                mode: window.currentInstrumentMode,
                questions
            })
        });
        const data = await res.json();
        if (data.success) {
            alert(`¡Éxito! Se guardaron los cambios del Reto ${activeR} en el servidor.`);
        } else {
            alert(`Error al guardar: ${data.message || 'Intente de nuevo.'}`);
        }
    } catch (e) {
        console.error(e);
        alert('Error al guardar el instrumento personalizado.');
    }
}

function undoAICustomization() {
    const activeR = (window.currentSelectedReto && window.currentSelectedReto >= 1 && window.currentSelectedReto <= 6) ? window.currentSelectedReto : 1;
    if (window.undoQuestionsCache[activeR]) {
        window.customQuestionsCache[activeR] = JSON.parse(JSON.stringify(window.undoQuestionsCache[activeR]));
        alert(`↩️ Se han deshecho los cambios de IA para el Reto ${activeR}.`);
        if (typeof updateUI === 'function') updateUI();
    } else {
        alert('No hay cambios previos registrados para deshacer.');
    }
}

async function resetInstrumentToDefault() {
    if (!confirm('¿Deseas restablecer las preguntas al modo automático por defecto del sistema?')) return;
    
    const grade = window.currentGrade || 5;
    const subject = window.currentSubject || 'aleman';
    const activeR = (window.currentSelectedReto && window.currentSelectedReto >= 1 && window.currentSelectedReto <= 6) ? window.currentSelectedReto : 1;

    try {
        await fetch('/api/instruments/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grade, subject, reto: activeR })
        });
        delete window.customQuestionsCache[activeR];
        delete window.undoQuestionsCache[activeR];
        switchInstrumentMode('auto');
        alert(`Se ha restablecido el Reto ${activeR} al modo automático por defecto.`);
    } catch (e) {
        console.error(e);
    }
}

async function generateInstrumentWithAI() {
    const btn = document.getElementById('btnGenerateAI');
    const promptInput = document.getElementById('aiPromptInput');
    const prompt = promptInput ? promptInput.value.trim() : '';

    const grade = window.currentGrade || 5;
    const subject = window.currentSubject || 'aleman';
    const lang = window.currentLang || 'es';

    // Target current active selected Reto (if Reto 0 or none, target Reto 1)
    const activeR = (window.currentSelectedReto && window.currentSelectedReto >= 1 && window.currentSelectedReto <= 6) ? window.currentSelectedReto : 1;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Leyendo Reto ${activeR} y Generando...`;
    }

    try {
        // Save current questions as backup for UNDO
        if (window.customQuestionsCache[activeR]) {
            window.undoQuestionsCache[activeR] = JSON.parse(JSON.stringify(window.customQuestionsCache[activeR]));
        }

        const currentQuestions = window.customQuestionsCache[activeR] || [];

        const res = await fetch('/api/instruments/generate-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grade,
                subject,
                reto: activeR,
                prompt,
                lang,
                currentQuestions
            })
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.questions) {
            alert(`No se pudieron generar las preguntas con IA.\n\nDetalle: ${data.error || data.message || `HTTP ${res.status}`}`);
            return;
        }

        window.customQuestionsCache[activeR] = data.questions;
        switchInstrumentMode('ai');

        if (data.source === 'gemini') {
            let msg = `✅ Gemini reescribió las ${data.questions.length} preguntas del Reto ${activeR} (${subject.toUpperCase()}) siguiendo tu prompt.\n\n`;
            msg += `Modelo: ${data.model}\n`;
            if (data.warning) msg += `\n⚠️ ${data.warning}\n`;
            msg += `\nRevisa la vista previa y presiona 'Guardar' para confirmar o 'Deshacer' para revertir.`;
            alert(msg);
        } else {
            // La IA no está disponible: se aplicó el modo local de respaldo
            alert(
                `⚠️ La IA de Google NO generó estas preguntas (modo de respaldo local).\n\n` +
                `Motivo: ${data.warning || 'servicio de IA no disponible.'}\n\n` +
                `Las preguntas mostradas son las originales con una marca de adaptación. ` +
                `Configura GEMINI_API_KEY en el archivo .env y reinicia el servidor para obtener una reescritura real.`
            );
        }
    } catch (e) {
        console.error(e);
        alert(`Ocurrió un error al generar las preguntas con IA.\n\nDetalle: ${e.message}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-robot"></i> Modificar / Generar con IA`;
        }
    }
}

window.instrumentEditor = {
    switchInstrumentMode,
    selectRetoFilter,
    loadReviewSequence,
    toggleRetoReviewStatus,
    saveReviewSequence,
    renderReviewSequenceList,
    renderEditableQuestionCard,
    updateQuestionLabel,
    updateQuestionHint,
    updateOptionValue,
    addOptionToQuestion,
    removeOptionFromQuestion,
    addNewQuestionToEditor,
    removeQuestionFromEditor,
    saveCustomInstrumentToServer,
    undoAICustomization,
    resetInstrumentToDefault,
    generateInstrumentWithAI
};
