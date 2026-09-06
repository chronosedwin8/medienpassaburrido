// Dashboard JavaScript extracted from index.ejs
// This file combines the early script and the main dashboard script.

// ─── Dashboard Language Switching ───
function switchDashLang(lang, preventLoop) {
    // Update language tab buttons (if any remain)
    document.querySelectorAll('.lang-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Call full language switch (updates data-i18n, data-lang-content, etc.)
    if (window.langUtils && !preventLoop) {
        window.langUtils.switchLang(lang);
    }

    // Update subject pill sub-names (show secondary language)
    document.querySelectorAll('[data-lang-sub]').forEach(el => {
        try {
            const names = JSON.parse(el.getAttribute('data-lang-sub'));
            if (lang === 'de') el.textContent = names.es || '';
            else if (lang === 'en') el.textContent = names.es || '';
            else el.textContent = names.de || '';
        } catch (e) { /* ignore */ }
    });

    // Update subject pill main names
    document.querySelectorAll('.subject-name-main[data-lang-content]').forEach(el => {
        try {
            const names = JSON.parse(el.getAttribute('data-lang-content'));
            el.textContent = names[lang] || names.de || '';
        } catch (e) { /* ignore */ }
    });
}

// ─── Subject Filtering (from header pills) ───
function filterSubject(subject) {
    document.querySelectorAll('.subject-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-subject') === subject);
    });
    if (subject === 'all') {
        card.style.display = '';
    } else {
        card.style.display = card.getAttribute('data-subject') === subject ? '' : 'none';
    }
}

// Dashboard functions and event handlers
function getLevelCompletionPct(lvl, progress, selectedSubject) {
    // Placeholder implementation (replace with actual logic as needed)
    return 0;
}

function isLevelCompleted(lvl, progress, selectedSubject) {
    // Placeholder implementation (replace with actual logic as needed)
    return true;
}

let totalCompleted = 0;
let levelConfig = {};
let activitiesData = {};
let techActivitiesData = {};
let placeholder = document.getElementById('noSubjectSelectedPlaceholder');
let subjectCombo = document.getElementById('subjectCombo');
let currentYear = new Date().getFullYear();
let schoolYears = [];
let enabledSubjects = {};
let subjects = [];
let levelConfig = {};

function computeProgress() {
    // Implementation similar to original script
    // Compute totalFields and totalCompleted
    // ... (you may need to adjust based on actual data structures)
}

function updateProgressLabels(progress) {
    const selectedSubject = subjectCombo.value;
    if (!selectedSubject) return;
    const lang = window.langUtils ? window.langUtils.getLang() : 'es';
    const unlocked = {};
    unlocked[0] = true;
    let allPreviousCompleted = isLevelCompleted(0, progress, selectedSubject);
    for (let lvl = 1; lvl <= 6; lvl++) {
        const isLvlEnabled = levelConfig[lvl] === true;
        unlocked[lvl] = allPreviousCompleted && isLvlEnabled;
        if (unlocked[lvl]) {
            allPreviousCompleted = allPreviousCompleted && isLevelCompleted(lvl, progress, selectedSubject);
        } else {
            allPreviousCompleted = false;
        }
    }
    const status0 = document.getElementById('status-reto-0');
    const fill0 = document.getElementById('btn-progress-fill-0');
    const pct0 = getLevelCompletionPct(0, progress, selectedSubject);
    if (fill0) fill0.style.width = pct0 + '%';
    if (status0) {
        if (pct0 >= 100 || window.isProfileComplete) {
            status0.textContent = lang === 'es' ? '✅ Completado' : lang === 'en' ? '✅ Complete' : '✅ Fertig';
            status0.className = 'btn-status completed';
        } else if (pct0 > 0) {
            status0.textContent = pct0 + '%';
            status0.className = 'btn-status in-progress';
        } else {
            status0.textContent = lang === 'es' ? '⚠️ Pendiente' : lang === 'en' ? '⚠️ Pending' : '⚠️ Ausstehend';
            status0.className = 'btn-status pending';
        }
    }
    for (let lvl = 1; lvl <= 6; lvl++) {
        const btn = document.getElementById('challenge-btn-' + lvl);
        const statusEl = document.getElementById('status-reto-' + lvl);
        const fillEl = document.getElementById('btn-progress-fill-' + lvl);
        if (!btn) continue;
        btn.disabled = false;
        btn.classList.remove('challenge-locked', 'challenge-completed', 'challenge-not-started');
        btn.classList.add('challenge-unlocked');
        const pct = getLevelCompletionPct(lvl, progress, selectedSubject);
        if (fillEl) fillEl.style.width = pct + '%';
        if (statusEl) {
            if (pct >= 100) {
                statusEl.textContent = lang === 'es' ? '✅ Completado' : '✅ Completed';
                statusEl.className = 'btn-status completed';
                btn.classList.add('challenge-completed');
            } else if (pct > 0) {
                statusEl.textContent = pct + '%';
                statusEl.className = 'btn-status in-progress';
            } else {
                statusEl.textContent = lang === 'es' ? 'Iniciar' : 'Start';
                statusEl.className = 'btn-status pending';
                btn.classList.add('challenge-not-started');
            }
        }
        let lvlActs = activitiesData[lvl] || [];
        if (selectedSubject === 'tecnologia') {
            lvlActs = techActivitiesData.filter(a => a.level === String(lvl));
        } else {
            lvlActs = lvlActs.filter(a => a.subject === selectedSubject);
        }
        if (lvlActs.length > 1) {
            lvlActs.forEach(act => {
                const subBtn = document.getElementById('card-' + act.id);
                const subText = document.getElementById('text-' + act.id);
                const subFill = document.getElementById('bar-' + act.id);
                const prog = progress[act.id];
                if (subBtn) {
                    subBtn.style.pointerEvents = 'auto';
                    subBtn.style.opacity = '1';
                    subBtn.classList.remove('sub-btn-completed', 'sub-btn-not-started');
                }
                if (prog && prog.fieldsCompleted > 0) {
                    const total = (act.evidence ? act.evidence.length : 0) + (act.competencies ? act.competencies.length : 0);
                    const actPct = Math.min(Math.round((prog.fieldsCompleted / total) * 100), 100);
                    if (subFill) subFill.style.width = actPct + '%';
                    if (subText) {
                        if (actPct >= 100) {
                            subText.textContent = lang === 'es' ? 'Completado' : 'Fertig';
                            if (subBtn) subBtn.classList.add('sub-btn-completed');
                        } else {
                            subText.textContent = actPct + '%';
                        }
                    }
                } else {
                    if (subFill) subFill.style.width = '0%';
                    if (subText) subText.textContent = lang === 'es' ? 'Sin iniciar' : 'Nicht gestartet';
                    if (subBtn) subBtn.classList.add('sub-btn-not-started');
                }
            });
        }
    }
}

function applySubjectFilter(selectedSubject) {
    if (!selectedSubject) {
        document.getElementById('challengesContainer').style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
        return;
    }
    document.getElementById('challengesContainer').style.display = 'flex';
    if (placeholder) placeholder.style.display = 'none';
    const lang = window.langUtils ? window.langUtils.getLang() : 'es';
    for (let lvl = 1; lvl <= 6; lvl++) {
        const wrapper = document.getElementById('wrapper-reto-' + lvl);
        if (!wrapper) continue;
        let lvlActs = activitiesData[lvl] || [];
        if (selectedSubject === 'tecnologia') {
            lvlActs = techActivitiesData.filter(a => a.level === String(lvl));
        } else {
            lvlActs = lvlActs.filter(a => a.subject === selectedSubject);
        }
        if (lvlActs.length === 0) {
            wrapper.style.display = 'none';
        } else {
            wrapper.style.display = 'block';
            const btn = document.getElementById('challenge-btn-' + lvl);
            if (lvlActs.length === 1) {
                const act = lvlActs[0];
                const actTitle = act.title[lang] || act.title.es || act.title.de || act.title;
                const nameEl = document.getElementById('reto-name-' + lvl);
                if (nameEl) nameEl.textContent = actTitle;
                btn.setAttribute('data-activity-id', act.id);
                btn.setAttribute('href', act.subject === 'tecnologia' ? '/tecnologia/' + act.id : `/activity/${currentYear}/${act.id}`);
            } else {
                const nameEl = document.getElementById('reto-name-' + lvl);
                if (nameEl) {
                    nameEl.textContent = selectedSubject === 'tecnologia' ? 'Tecnología e Informática' : 'Reto ' + lvl;
                }
                btn.removeAttribute('href');
                const subpanel = document.getElementById('subpanel-reto-' + lvl);
                if (subpanel) {
                    subpanel.querySelectorAll('.pastel-sub-activity-btn').forEach(subBtn => {
                        const subSubj = subBtn.getAttribute('data-subject');
                        subBtn.style.display = (subSubj === selectedSubject) ? 'flex' : 'none';
                    });
                }
            }
        }
    }
    let targetLang = 'es';
    if (selectedSubject === 'aleman') targetLang = 'de';
    else if (selectedSubject === 'ingles') targetLang = 'en';
    if (window.langUtils) window.langUtils.switchLang(targetLang);
    if (window.latestProgressResult) updateProgressLabels(window.latestProgressResult);
}

if (subjectCombo) {
    subjectCombo.addEventListener('change', e => {
        const val = e.target.value;
        localStorage.setItem('selectedSubject', val);
        applySubjectFilter(val);
    });
    const savedSubject = localStorage.getItem('selectedSubject');
    if (savedSubject) {
        const opt = subjectCombo.querySelector(`option[value="${savedSubject}"]`);
        if (opt && !opt.disabled) {
            subjectCombo.value = savedSubject;
            applySubjectFilter(savedSubject);
        } else {
            applySubjectFilter('');
        }
    } else {
        applySubjectFilter('');
    }
} else {
    applySubjectFilter('');
}

document.addEventListener('langchange', () => {
    if (window.latestProgressResult) {
        updateProgressLabels(window.latestProgressResult);
    }
});

// Welcome Modal Logic
const welcomeModal = document.getElementById('welcomeModal');
const closeWelcomeModal = document.getElementById('closeWelcomeModal');
if (welcomeModal && !sessionStorage.getItem('welcomeModalShown')) {
    welcomeModal.style.display = 'flex';
}
if (closeWelcomeModal) {
    closeWelcomeModal.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        sessionStorage.setItem('welcomeModalShown', 'true');
    });
}
