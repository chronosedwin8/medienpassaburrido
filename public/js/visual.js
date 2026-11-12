// Medienpass visual (Prekínder, Kinder, K1 y K2): imagen grande, voz del dispositivo y sin escribir.
// Una pantalla a la vez. Un error invita a intentar de nuevo; solo se guarda con el botón final.
(function () {
    const SPEECH_LANGS = { es: 'es-CO', de: 'de-DE', en: 'en-US' };
    const currentLang = () => (window.langUtils ? window.langUtils.getLang() : document.documentElement.lang) || 'es';
    const text = value => (value && (value[currentLang()] || value.es)) || '';
    const tr = key => (window.t ? window.t(key) : key);

    // ── Voz ──
    const canSpeak = 'speechSynthesis' in window;

    function stopSpeech() {
        if (canSpeak) window.speechSynthesis.cancel();
        document.querySelectorAll('.is-speaking').forEach(el => el.classList.remove('is-speaking'));
    }

    // parts: [{ text, element }]. Resalta cada opción mientras se lee.
    function speak(parts) {
        if (!canSpeak) return;
        stopSpeech();
        parts.filter(part => part.text).forEach(part => {
            const utterance = new SpeechSynthesisUtterance(part.text);
            utterance.lang = SPEECH_LANGS[currentLang()] || 'es-CO';
            utterance.rate = 0.9;
            if (part.element) {
                utterance.onstart = () => part.element.classList.add('is-speaking');
                utterance.onend = () => part.element.classList.remove('is-speaking');
            }
            window.speechSynthesis.speak(utterance);
        });
    }

    // ── Sonidos cortos, sin archivos ──
    let audio = null;
    function tone(frequencies) {
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            frequencies.forEach((frequency, i) => {
                const oscillator = audio.createOscillator();
                const gain = audio.createGain();
                oscillator.frequency.value = frequency;
                gain.gain.value = 0.06;
                oscillator.connect(gain).connect(audio.destination);
                oscillator.start(audio.currentTime + i * 0.13);
                oscillator.stop(audio.currentTime + i * 0.13 + 0.12);
            });
        } catch (e) { /* sin sonido */ }
    }
    const happySound = () => tone([523, 659, 784]);
    const tryAgainSound = () => tone([330, 262]);

    // ── Inicio y paradas: los botones 🔊 y las tarjetas dicen su nombre ──
    function bindSpeakers() {
        document.querySelectorAll('[data-speak-key]').forEach(button => {
            if (!canSpeak) { button.hidden = true; return; }
            button.addEventListener('click', () => speak([{ text: tr(button.dataset.speakKey) }]));
        });
    }

    // ── Página de un reto ──
    function startReto(config) {
        const stage = document.getElementById('visualReto');
        const progress = document.getElementById('visProgress');
        const title = document.getElementById('visRetoTitle');
        const answers = {};
        let avatar = '';
        let saved = false;
        let previouslyWon = false;

        const AVATARS = ['🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐸', '🦄', '🐢', '🐳', '🦖', '🤖', '🦸', '🧚', '🚀', '⭐'];
        const steps = [];
        if (config.reto === 0) steps.push({ type: 'avatar' });
        config.competences.forEach(competence => steps.push({ type: 'card', competence }));
        config.questions.forEach(question => steps.push({ type: 'question', question }));
        steps.push({ type: 'finish' });
        let index = 0;

        const el = (tag, className, content) => {
            const node = document.createElement(tag);
            if (className) node.className = className;
            if (content !== undefined) node.textContent = content;
            return node;
        };

        function speakerButton(parts) {
            const button = el('button', 'vis-speak', '🔊');
            button.type = 'button';
            button.setAttribute('aria-label', tr('est_vis_escuchar'));
            button.hidden = !canSpeak;
            button.addEventListener('click', () => speak(parts()));
            return button;
        }

        function nextButton(labelKey) {
            const button = el('button', 'vis-button vis-next');
            button.type = 'button';
            button.append(el('span', '', tr(labelKey)), el('span', 'vis-next-arrow', ' ➡️'));
            button.addEventListener('click', () => go(index + 1));
            return button;
        }

        function renderAvatar() {
            const heading = el('h3', 'vis-question', tr('est_vis_avatar'));
            const grid = el('div', 'vis-avatars');
            AVATARS.forEach(picture => {
                const button = el('button', 'vis-avatar' + (avatar === picture ? ' is-selected' : ''), picture);
                button.type = 'button';
                button.setAttribute('aria-pressed', String(avatar === picture));
                button.addEventListener('click', () => {
                    avatar = picture;
                    happySound();
                    render();
                });
                grid.append(button);
            });
            const row = el('div', 'vis-question-row');
            row.append(heading, speakerButton(() => [{ text: tr('est_vis_avatar') }]));
            const next = nextButton('est_vis_siguiente');
            next.disabled = !avatar;
            stage.append(row, grid, next);
            return [{ text: tr('est_vis_avatar') }];
        }

        function renderCard(step) {
            const { competence } = step;
            const card = el('div', 'vis-card');
            card.append(el('span', 'vis-card-picture', competence.icon), el('h3', 'vis-card-title', text(competence.title)), el('p', 'vis-card-say', text(competence.say)));
            const parts = () => [{ text: text(competence.title) }, { text: text(competence.say) }];
            const row = el('div', 'vis-question-row vis-row-end');
            row.append(speakerButton(parts));
            stage.append(row, card, nextButton('est_vis_siguiente'));
            return parts();
        }

        function renderQuestion(step) {
            const { question } = step;
            const row = el('div', 'vis-question-row');
            row.append(el('h3', 'vis-question', text(question.label)));
            const grid = el('div', 'vis-options');
            const feedback = el('p', 'vis-feedback');
            feedback.setAttribute('role', 'status');
            const answeredOk = answers[question.id] !== undefined;

            const buttons = question.options.map((option, optionIndex) => {
                const button = el('button', 'vis-option');
                button.type = 'button';
                button.append(el('span', 'vis-option-picture', option.emoji || '⭐'), el('span', 'vis-option-text', text(option)));
                if (answeredOk && answers[question.id] === String(option.val !== undefined ? option.val : optionIndex)) button.classList.add('is-right');
                button.addEventListener('click', () => {
                    stopSpeech();
                    if (option.correct) {
                        answers[question.id] = String(option.val !== undefined ? option.val : optionIndex);
                        grid.querySelectorAll('.vis-option').forEach(other => { other.disabled = true; });
                        button.classList.add('is-right');
                        feedback.textContent = '⭐ ' + tr('est_vis_muy_bien');
                        happySound();
                        speak([{ text: tr('est_vis_muy_bien') }]);
                        setTimeout(() => go(index + 1), 1100);
                    } else {
                        button.classList.remove('is-wrong');
                        void button.offsetWidth; // reinicia la animación
                        button.classList.add('is-wrong');
                        feedback.textContent = '🙂 ' + tr('est_vis_intenta');
                        tryAgainSound();
                        speak([{ text: tr('est_vis_intenta') }]);
                    }
                });
                grid.append(button);
                return { option, button };
            });

            const parts = () => [{ text: text(question.label) }, ...buttons.map(({ option, button }) => ({ text: text(option), element: button }))];
            row.append(speakerButton(parts));
            stage.append(row, grid, feedback);
            if (answeredOk) stage.append(nextButton('est_vis_siguiente'));
            return parts();
        }

        function showAdultPanel() {
            const panel = document.getElementById('visAdult');
            if (panel) panel.hidden = false;
        }

        function celebrate(wonMessage) {
            stage.textContent = '';
            const box = el('div', 'vis-finish');
            box.append(el('span', 'vis-finish-picture', '🏆'), el('p', 'vis-finish-stars', '⭐⭐⭐'), el('h3', 'vis-card-title', wonMessage));
            const back = el('a', 'vis-button', tr('est_vis_volver'));
            back.href = config.backUrl;
            box.append(back);
            stage.append(box);
            happySound();
            speak([{ text: wonMessage }]);
            showAdultPanel();
        }

        function renderFinish() {
            const box = el('div', 'vis-finish');
            box.append(el('span', 'vis-finish-picture', '🎉'), el('p', 'vis-finish-stars', '⭐⭐⭐'), el('h3', 'vis-card-title', tr('est_vis_terminaste')));
            const status = el('p', 'vis-feedback');
            status.setAttribute('role', 'status');
            const save = el('button', 'vis-button vis-save', '💾 ' + tr('est_vis_guardar'));
            save.type = 'button';
            if (config.preview) {
                save.disabled = true;
                status.textContent = tr('est_vis_vista_previa');
            }
            save.addEventListener('click', async () => {
                save.disabled = true;
                status.textContent = tr('saving');
                const body = { ...answers };
                if (config.reto === 0) {
                    body.reto0_subject = config.subject;
                    if (avatar) body.profile_photo = avatar;
                }
                try {
                    const response = await fetch('/api/save/' + encodeURIComponent(config.id), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    const result = await response.json();
                    if (!result.success) throw new Error(result.message || 'error');
                    saved = true;
                    celebrate(result.retoResult && result.retoResult.won ? tr('est_vis_ganaste') : tr('est_vis_guardado'));
                } catch (e) {
                    status.textContent = '😕 ' + tr('est_vis_error');
                    save.disabled = false;
                }
            });
            box.append(save, status);
            stage.append(box);
            return [{ text: tr('est_vis_terminaste') }];
        }

        function render(withVoice) {
            stopSpeech();
            stage.textContent = '';
            title.textContent = text(config.title);
            progress.textContent = '';
            steps.forEach((_, i) => {
                const dot = el('span', 'vis-dot' + (i < index ? ' is-done' : i === index ? ' is-current' : ''));
                progress.append(dot);
            });
            const step = steps[index];
            if (previouslyWon && index === 0) stage.append(el('p', 'vis-already', '🏆 ' + tr('est_vis_ya_ganaste')));
            let parts = [];
            if (step.type === 'avatar') parts = renderAvatar();
            else if (step.type === 'card') parts = renderCard(step);
            else if (step.type === 'question') parts = renderQuestion(step);
            else parts = renderFinish();
            if (withVoice) speak(parts);
        }

        function go(next) {
            index = Math.max(0, Math.min(steps.length - 1, next));
            render(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Lo guardado: avatar y si ya lo ganó. Las preguntas se responden de nuevo si quiere volver a jugar.
        async function loadSaved() {
            if (config.preview) return;
            try {
                const result = await (await fetch('/api/load/' + encodeURIComponent(config.id))).json();
                const data = (result && result.data) || {};
                if (config.reto === 0 && data.profile_photo && AVATARS.includes(data.profile_photo)) avatar = data.profile_photo;
                previouslyWon = config.questions.length > 0 && config.questions.every(question => {
                    const correct = question.options.findIndex(option => option.correct);
                    const option = question.options[correct];
                    return String(data[question.id]) === String(option.val !== undefined ? option.val : correct);
                });
                if (previouslyWon) showAdultPanel();
                if (!saved) render(false);
            } catch (e) { /* empieza vacío */ }
        }

        // Evidencias: las adjunta un adulto, igual que en los retos de K3 a K12
        function bindAdultPanel() {
            const toggle = document.getElementById('visAdultToggle');
            if (!toggle) return;
            const form = document.getElementById('visAdultForm');
            const status = document.getElementById('visAdultStatus');
            toggle.addEventListener('click', () => {
                form.hidden = !form.hidden;
                toggle.setAttribute('aria-expanded', String(!form.hidden));
            });
            fetch('/api/student/multimedia-product/' + encodeURIComponent(config.id)).then(r => r.json()).then(({ data }) => {
                ((data && data.links) || []).slice(0, 3).forEach((link, i) => { document.getElementById('vis_link_' + (i + 1)).value = link; });
            }).catch(() => {});
            document.getElementById('visAdultSave').addEventListener('click', async () => {
                const links = [...document.querySelectorAll('.vis-link')].map(input => input.value.trim()).filter(Boolean);
                if (!links.length) { status.textContent = tr('est_ev_falta_vinculo'); return; }
                status.textContent = tr('saving');
                try {
                    const result = await (await fetch('/api/student/multimedia-product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ activity_id: config.id, links })
                    })).json();
                    status.textContent = result.success ? tr('est_ev_guardado') : (result.code === 'invalid' ? tr('est_ev_invalido') : tr('est_vis_error'));
                } catch (e) {
                    status.textContent = tr('est_vis_error');
                }
            });
        }

        document.addEventListener('langchange', () => { if (!saved) render(false); });
        bindAdultPanel();
        render(false);
        loadSaved();
    }

    bindSpeakers();
    if (window.VISUAL_RETO) startReto(window.VISUAL_RETO);
})();
