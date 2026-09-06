const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '..', 'views', 'activity.ejs');
let content = fs.readFileSync(targetFilePath, 'utf8');

// Normalize line endings to LF for easier string matching during operations, we will preserve original line endings on save
const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
const normalized = content.replace(/\r\n/g, '\n');

// 1. Replace the broken loading logic
const loadSearchStart = '// ── Load existing data';
const loadSearchEnd = 'function showToast(message, type = \'success\') {';

const startIdx = normalized.indexOf(loadSearchStart);
const endIdx = normalized.indexOf(loadSearchEnd);

if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find loading logic block markers!');
    process.exit(1);
}

const replacementLoad = `// ── Load existing data and merge ──
            let serverData = {};
            let serverUpdatedAt = null;

            try {
                const response = await fetch('/api/load/' + activityId);
                const result = await response.json();
                if (result.success && result.data) {
                    serverData = result.data;
                    serverUpdatedAt = result.updated_at;
                }
            } catch (e) {
                console.warn('Failed to load server data:', e);
            }

            const storageKey = 'medienpass_' + activityId;
            let localData = {};
            try {
                localData = JSON.parse(localStorage.getItem(storageKey) || '{}');
            } catch (e) {
                console.warn('Failed to parse local storage data:', e);
            }

            // Merge server and local storage, prioritizing the newest timestamp
            const serverTime = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;
            const localTime = localData.local_updated_at ? new Date(localData.local_updated_at).getTime() : 0;

            let mergedData = {};
            if (serverTime >= localTime) {
                mergedData = { ...localData, ...serverData };
            } else {
                mergedData = { ...serverData, ...localData };
            }

            // Restore field values
            inputs.forEach(input => {
                if (input.id && mergedData[input.id] !== undefined) {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = mergedData[input.id] === true || mergedData[input.id] === 'true';
                    } else {
                        input.value = mergedData[input.id];
                    }
                }
            });

            // Restore star rating if applicable
            if (mergedData.star_rating && typeof setStarRating === 'function') {
                setStarRating(parseInt(mergedData.star_rating));
            }

            // Restore profile photo (avatar)
            if (mergedData.profile_photo && typeof selectAvatar === 'function') {
                selectAvatar(mergedData.profile_photo);
            }

            // Restore field stars
            if (activityId !== 'profile') {
                if (typeof recalculateInteractiveStars === 'function') {
                    recalculateInteractiveStars();
                }
            } else {
                document.querySelectorAll('.field-star-rating').forEach(container => {
                    const fieldId = container.getAttribute('data-field-id');
                    const starKey = 'star_' + fieldId;
                    if (mergedData[starKey] !== undefined && typeof setFieldStar === 'function') {
                        setFieldStar(fieldId, parseInt(mergedData[starKey]));
                    }
                });
                if (typeof updateStarSummary === 'function') {
                    updateStarSummary();
                }
            }

            // Check if student completed the Reto 0 quiz (Profile) with >= 80%
            if (activityId === 'profile') {
                if (window.currentScorePct >= 80) {
                    let hits = 0;
                    document.querySelectorAll('.radio-group').forEach(group => {
                        const selected = group.querySelector('input[type="radio"]:checked');
                        if (selected && selected.getAttribute('data-correct') === 'true') {
                            hits++;
                        }
                    });
                    if (typeof window.triggerReto0Graduation === 'function') {
                        window.triggerReto0Graduation(hits);
                    }
                    const successBanner = document.getElementById('reto0-success-banner');
                    if (successBanner) {
                        successBanner.style.display = 'block';
                    }
                } else if (window.currentScorePct > 0) {
                    if (typeof setEvaluationMode === 'function') setEvaluationMode();
                }
            }

            `;

const firstPart = normalized.substring(0, startIdx);
const secondPart = normalized.substring(endIdx);
let intermediateContent = firstPart + replacementLoad + secondPart;

// 2. Replace the performSave function
const saveSearchStart = 'async function performSave() {';
const saveSearchEnd = 'if (saveBtn) saveBtn.addEventListener(\'click\', performSave);';

const saveStartIdx = intermediateContent.indexOf(saveSearchStart);
const saveEndIdx = intermediateContent.indexOf(saveSearchEnd);

if (saveStartIdx === -1 || saveEndIdx === -1) {
    console.error('Could not find performSave function block markers!');
    process.exit(1);
}

const replacementSave = `async function performSave() {
                const isProfile = activityId === 'profile';
                const data = collectData();

                // Validation for profile (normalize teacher fields but do not abort saving)
                if (isProfile) {
                    Object.keys(data).forEach(key => {
                        if (key.startsWith('teacher_')) {
                            const val = data[key] ? data[key].trim() : '';
                            const field = document.getElementById(key);
                            if (val) {
                                if (field) field.classList.remove('input-error');
                                data[key] = val.toUpperCase();
                            }
                        }
                    });
                }

                // Force saving locally first
                saveLocally();

                const saveBtnQuiz = document.getElementById('saveBtnQuiz');
                const saveStatusQuiz = document.getElementById('saveStatusQuiz');

                const disableButtons = (disabled) => {
                    if (saveBtn) saveBtn.disabled = disabled;
                    if (saveBtnQuiz) saveBtnQuiz.disabled = disabled;
                };

                const updateButtonContent = (html) => {
                    if (saveBtn) saveBtn.innerHTML = html;
                    if (saveBtnQuiz) saveBtnQuiz.innerHTML = html;
                };

                disableButtons(true);
                updateButtonContent('<i class="fas fa-spinner fa-spin"></i> ' + t('saving'));

                try {
                    const response = await fetch('/api/save/' + activityId, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    const updateStatus = (html, className) => {
                        if (saveStatus) {
                            saveStatus.innerHTML = html;
                            saveStatus.className = className;
                        }
                        if (saveStatusQuiz) {
                            saveStatusQuiz.innerHTML = html;
                            saveStatusQuiz.className = className;
                        }
                    };

                    if (result.success) {
                        if (result.localOnly) {
                            showToast(t('savedLocal'), 'success');
                            updateStatus('<i class="fas fa-check-circle"></i> ' + t('localSave') + ' ' + new Date().toLocaleTimeString(), 'save-status saved');
                        } else {
                            showToast(t('savedSuccess'), 'success');
                            updateStatus('<i class="fas fa-check"></i> ' + t('lastSaved') + ' ' + new Date().toLocaleTimeString(), 'save-status saved');
                        }

                        // Update header avatar dynamically if on profile page
                        if (isProfile) {
                            const avatarVal = document.getElementById('profile_photo')?.value;
                            const headerAvatar = document.getElementById('headerUserAvatar');
                            if (headerAvatar && avatarVal) {
                                if (avatarVal.length < 15) {
                                    headerAvatar.innerHTML = avatarVal;
                                    headerAvatar.style.fontSize = '1.1em';
                                } else if (avatarVal.startsWith('data:image')) {
                                    headerAvatar.innerHTML = \`<img src="\${avatarVal}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">\`;
                                }
                            }
                        }

                        // If student completed Reto 0 with 80% or more, trigger graduation and show banner
                        if (isProfile && window.currentScorePct >= 80) {
                            let hits = 0;
                            document.querySelectorAll('.radio-group').forEach(group => {
                                const selected = group.querySelector('input[type="radio"]:checked');
                                if (selected && selected.getAttribute('data-correct') === 'true') {
                                    hits++;
                                }
                            });
                            if (typeof window.triggerReto0Graduation === 'function') {
                                window.triggerReto0Graduation(hits);
                            }
                            const successBanner = document.getElementById('reto0-success-banner');
                            if (successBanner) {
                                successBanner.style.display = 'block';
                                successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        } else if (isProfile) {
                            showToast('Guardado. Recuerda que necesitas obtener al menos el 80% en la evaluación para completar el reto.', 'warning');
                        }
                    } else {
                        showToast(t('saveError'), 'error');
                        updateStatus('<i class="fas fa-exclamation-triangle"></i> ' + t('saveError'), 'save-status error');
                    }
                } catch (e) {
                    console.error('Save error:', e);
                    showToast(t('noConnection'), 'error');
                    const errStatus = '<i class="fas fa-wifi"></i> ' + t('noConnection');
                    if (saveStatus) {
                        saveStatus.innerHTML = errStatus;
                        saveStatus.className = 'save-status error';
                    }
                    if (saveStatusQuiz) {
                        saveStatusQuiz.innerHTML = errStatus;
                        saveStatusQuiz.className = 'save-status error';
                    }
                }

                disableButtons(false);
                updateButtonContent('<i class="fas fa-cloud-upload-alt"></i> ' + t('save'));
            }

            `;

const saveFirstPart = intermediateContent.substring(0, saveStartIdx);
const saveSecondPart = intermediateContent.substring(saveEndIdx);
const finalContent = (saveFirstPart + replacementSave + saveSecondPart).replace(/\n/g, lineEnding);

fs.writeFileSync(targetFilePath, finalContent, 'utf8');
console.log('Successfully applied loading and saving fixes to activity.ejs!');
