const fs = require('fs');
const ejs = require('ejs');

// 1. Read clean views/activity.ejs
let content = fs.readFileSync('views/activity.ejs', 'utf8');

// 2. Remove the old slide deck block
const slideDeckPattern = /<%\s*if\s*\(\s*activity\.id\s*===\s*['"]profile['"]\s*\)\s*\{\s*%>\s*<div class="section" id="reto-zero-section"[\s\S]*?<\/div>\s*<%\s*\}\s*%>/;
if (content.match(slideDeckPattern)) {
    content = content.replace(slideDeckPattern, '');
    console.log('✅ Removed old slide deck block');
} else {
    console.error('❌ Could not find old slide deck block pattern');
    process.exit(1);
}

// 3. Load segment contents
const slideDeckHtml = fs.readFileSync('scratch/original_slide_deck.txt', 'utf8');
const avatarHtml = fs.readFileSync('scratch/original_avatar.txt', 'utf8');
const edilimHtml = fs.readFileSync('scratch/original_edilim.txt', 'utf8');
const teachersHtml = fs.readFileSync('scratch/original_teachers.txt', 'utf8');

// Profile fields (Module 3)
const profileFieldsHtml = `
<div class="profile-fields-section">
    <% activity.evidence.forEach(item=> { %>
        <% if (!item.id.startsWith('eval_q')) { %>
            <div class="form-group">
                <label for="<%= item.id %>" data-lang-content="<%- JSON.stringify(item.label).replace(/"/g, '&quot;') %>">
                    <span class="lang-line lang-primary">
                        <%= (item.label && item.label.es) || (item.label && item.label.de) || '' %>
                    </span>
                </label>
                <% if (item.type === 'text') { %>
                    <input type="text" id="<%= item.id %>" name="<%= item.id %>" placeholder="Escribe aquí...">
                <% } else if (item.type === 'textarea') { %>
                    <textarea id="<%= item.id %>" name="<%= item.id %>" rows="<%= item.rows || 3 %>" placeholder="Escribe aquí..."></textarea>
                <% } %>
            </div>
        <% } %>
    <% }) %>
</div>
`;

// Hidden quiz fields
const hiddenQuizHtml = `
<div style="display: none;">
    <% activity.evidence.forEach(item=> { %>
        <% if (item.id.startsWith('eval_q')) { %>
            <div class="form-group">
                <% item.options.forEach((opt, optIdx) => { %>
                    <input type="radio" id="<%= item.id %>_<%= optIdx %>" name="<%= item.id %>" value="<%= opt.val !== undefined ? opt.val : optIdx %>" data-correct="<%= opt.correct ? 'true' : 'false' %>">
                <% }) %>
            </div>
        <% } %>
    <% }) %>
</div>
`;

// Accordion Html
const accordionHtml = `
        <% if (activity.id === 'profile') { %>
            <div class="reto0-accordion" id="reto0Accordion">
                <!-- Panel 1: Misión descubre el medienpass -->
                <div class="accordion-panel" id="panel-1">
                    <button type="button" class="accordion-header active" onclick="toggleAccordionPanel(1)">
                        <div class="panel-header-left">
                            <span class="panel-num">1</span>
                            <span class="panel-title">Misión: descubre el medienpass</span>
                        </div>
                        <span class="panel-arrow">▼</span>
                    </button>
                    <div class="accordion-content" style="display: block;">
                        <p class="panel-description">🧭 Debes hacer clic en los botones de desplazamiento y en los botones explicativos y ganar puntos o XP.</p>
                        ${slideDeckHtml}
                        <div class="panel-actions" style="text-align: right; margin-top: 20px;">
                            <button type="button" class="accordion-next-btn" onclick="advanceAccordionPanel(1)">
                                Siguiente Módulo <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Panel 2: Mi avatar favorito -->
                <div class="accordion-panel" id="panel-2">
                    <button type="button" class="accordion-header" onclick="toggleAccordionPanel(2)">
                        <div class="panel-header-left">
                            <span class="panel-num">2</span>
                            <span class="panel-title">Mi avatar favorito</span>
                        </div>
                        <span class="panel-arrow">▼</span>
                    </button>
                    <div class="accordion-content" style="display: none;">
                        <p class="panel-description">👤 Elige tu avatar favorito. Tu identidad digital es muy valiosa; no compartas fotos reales en sitios públicos de internet.</p>
                        ${avatarHtml}
                        <div class="panel-actions" style="text-align: right; margin-top: 20px;">
                            <button type="button" class="save-btn" onclick="saveProfileModule(2, this)">
                                <i class="fas fa-save"></i> Guardar mi Avatar y Continuar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Panel 3: Este soy yo!!! -->
                <div class="accordion-panel" id="panel-3">
                    <button type="button" class="accordion-header" onclick="toggleAccordionPanel(3)">
                        <div class="panel-header-left">
                            <span class="panel-num">3</span>
                            <span class="panel-title">Este soy yo!!!</span>
                        </div>
                        <span class="panel-arrow">▼</span>
                    </button>
                    <div class="accordion-content" style="display: none;">
                        <p class="panel-description">📝 Completa tu perfil. Tus datos personales son sensibles y merecen ser protegidos de personas extrañas.</p>
                        ${profileFieldsHtml}
                        <div class="panel-actions" style="text-align: right; margin-top: 20px;">
                            <button type="button" class="save-btn" onclick="saveProfileModule(3, this)">
                                <i class="fas fa-save"></i> Guardar Datos Personales y Continuar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Panel 4: Mis asignaturas y sus profesores -->
                <div class="accordion-panel" id="panel-4">
                    <button type="button" class="accordion-header" onclick="toggleAccordionPanel(4)">
                        <div class="panel-header-left">
                            <span class="panel-num">4</span>
                            <span class="panel-title">Mis asignaturas y sus profesores</span>
                        </div>
                        <span class="panel-arrow">▼</span>
                    </button>
                    <div class="accordion-content" style="display: none;">
                        <p class="panel-description">🏫 Aquí están las materias y los profesores que te van a ayudar a desarrollar tu Medienpass.</p>
                        ${teachersHtml}
                        <div class="panel-actions" style="text-align: right; margin-top: 20px;">
                            <button type="button" class="save-btn" onclick="saveProfileModule(4, this)">
                                <i class="fas fa-save"></i> Guardar Profesores y Continuar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Panel 5: ¿Estás listo para la evaluación? -->
                <div class="accordion-panel" id="panel-5">
                    <button type="button" class="accordion-header" onclick="toggleAccordionPanel(5)">
                        <div class="panel-header-left">
                            <span class="panel-num">5</span>
                            <span class="panel-title">¿Estás listo para la evaluación?</span>
                        </div>
                        <span class="panel-arrow">▼</span>
                    </button>
                    <div class="accordion-content" style="display: none;">
                        <p class="panel-description">✏️ En este nivel ya debes tener muy claro para qué sirve el MedienPass. ¡Es hora de la evaluación!</p>
                        ${edilimHtml}
                        <div id="reto0-eval-save-footer" class="save-actions" style="display: none; text-align: center; margin-top: 20px;">
                            <button type="button" class="save-btn" id="saveBtnQuiz" onclick="saveProfileModule(5, this)">
                                <i class="fas fa-cloud-upload-alt"></i> Guardar y Terminar Reto 0
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hidden radio fields for Edilim integration -->
            ${hiddenQuizHtml}

            <!-- Success Banner for Reto 0 Completion -->
            <div id="reto0-success-banner" class="reto0-success-banner" style="display: none; margin-top: 30px; padding: 25px; background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                <div class="banner-icon" style="font-size: 3.5em; margin-bottom: 15px;">🎉✨🚀</div>
                <h3 style="color: #1e3a8a; font-size: 1.8em; margin-bottom: 10px; font-weight: 700;">¡Muy bien! Ahora ve al siguiente módulo.</h3>
                <p style="color: #1e40af; font-size: 1.15em; margin-bottom: 20px;">Has completado exitosamente la autoevaluación y diagnóstico del Reto Cero.</p>
                <a href="/" class="btn-back-dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 30px; border-radius: 30px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 15px rgba(59,130,246,0.4); transition: all 0.2s;"><i class="fas fa-arrow-left"></i> Volver al Dashboard</a>
            </div>
        <% } %>
`;

// Insert accordion at start of form
const formStartStr = '<form id="activityForm">';
content = content.replace(formStartStr, formStartStr + '\n' + accordionHtml);
console.log('✅ Inserted accordion at start of form');

// Disable Avatar check for profile (first avatar block)
const avatarPattern = /<%\s*if\s*\(\s*activity\.id\s*===\s*['"]profile['"]\s*\)\s*\{\s*%>\s*<div class="section" style="text-align: center;">\s*<h2><i class="fas fa-camera">/;
if (content.match(avatarPattern)) {
    content = content.replace(avatarPattern, "<% if (activity.id==='profile' && false) { %>\n<div class=\"section\" style=\"text-align: center;\">\n<h2><i class=\"fas fa-camera\">");
    console.log('✅ Disabled avatar block in cleanFormContent');
} else {
    console.warn('⚠️ Could not find original avatar block pattern');
}

// Modify Evidence check
const evidencePattern = /<%\s*if\s*\(\s*activity\.evidence\s*&&\s*activity\.evidence\.length\s*>\s*0\s*\)\s*\{\s*%>/;
if (content.match(evidencePattern)) {
    content = content.replace(evidencePattern, "<% if (activity.evidence && activity.evidence.length > 0 && activity.id !== 'profile') { %>");
    console.log('✅ Excluded profile from evidence loop');
} else {
    console.warn('⚠️ Could not find evidence loop check');
}

// Disable Edilim check for profile
const edilimPattern = /<%\s*if\s*\(\s*activity\.id\s*===\s*['"]profile['"]\s*\)\s*\{\s*%>\s*<!-- Edilim Game Container -->/;
if (content.match(edilimPattern)) {
    content = content.replace(edilimPattern, "<% if (activity.id === 'profile' && false) { %>\n<!-- Edilim Game Container -->");
    console.log('✅ Disabled Edilim quiz block in cleanFormContent');
} else {
    console.warn('⚠️ Could not find edilim block pattern');
}

// Modify Teachers check
const teachersPattern = /<%\s*if\s*\(\s*activity\.teachersBySubject\s*&&\s*activity\.teachersBySubject\.length\s*>\s*0\s*\)\s*\{\s*%>/;
if (content.match(teachersPattern)) {
    content = content.replace(teachersPattern, "<% if (activity.teachersBySubject && activity.teachersBySubject.length > 0 && activity.id !== 'profile') { %>");
    console.log('✅ Excluded profile from teachers section');
} else {
    console.warn('⚠️ Could not find teachers check');
}

// Wrap global save actions
const saveActionsPattern = /<div class="save-actions">\s*<button type="button" class="save-btn" id="saveBtn">/;
if (content.match(saveActionsPattern)) {
    content = content.replace(saveActionsPattern, "<% if (activity.id !== 'profile') { %>\n<div class=\"save-actions\">\n<button type=\"button\" class=\"save-btn\" id=\"saveBtn\">");
    // Also need to find the matching close tag or close it before form ends
    const formEndIndex = content.lastIndexOf('</form>');
    if (formEndIndex !== -1) {
        content = content.substring(0, formEndIndex) + '<% } %>\n' + content.substring(formEndIndex);
        console.log('✅ Wrapped saveBtn and added closing <% } %> before form ends');
    }
} else {
    console.warn('⚠️ Could not find save-actions block');
}

// Inject Javascript functions
const scriptInjection = `
            window.toggleAccordionPanel = function(num) {
                const panels = document.querySelectorAll('.accordion-panel');
                panels.forEach(p => {
                    const pNum = parseInt(p.getAttribute('id').split('-')[1]);
                    const content = p.querySelector('.accordion-content');
                    const header = p.querySelector('.accordion-header');
                    const arrow = p.querySelector('.panel-arrow');
                    
                    if (pNum === num) {
                        const isVisible = content.style.display === 'block';
                        content.style.display = isVisible ? 'none' : 'block';
                        if (header) header.classList.toggle('active', !isVisible);
                        if (arrow) arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
                    } else {
                        content.style.display = 'none';
                        if (header) header.classList.remove('active');
                        if (arrow) arrow.style.transform = 'rotate(0deg)';
                    }
                });
            };

            window.advanceAccordionPanel = function(num) {
                toggleAccordionPanel(num + 1);
                setTimeout(() => {
                    const nextHeader = document.querySelector(\`#panel-\${num + 1} .accordion-header\`);
                    if (nextHeader) nextHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            };

            window.saveProfileModule = async function(num, btnEl) {
                if (!btnEl) return;
                
                if (num === 2) {
                    const avatarVal = document.getElementById('profile_photo').value;
                    if (!avatarVal) {
                        alert('Por favor, selecciona un avatar primero.');
                        return;
                    }
                }

                const originalHtml = btnEl.innerHTML;
                btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
                btnEl.disabled = true;

                const data = collectData();
                saveLocally();

                try {
                    const response = await fetch('/api/save/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    const resData = await response.json();
                    if (resData.success) {
                        showToast('¡Módulo ' + num + ' guardado con éxito!', 'success');
                        
                        if (num === 2) {
                            const avatarVal = document.getElementById('profile_photo').value;
                            const headerAvatar = document.getElementById('headerUserAvatar');
                            if (headerAvatar && avatarVal) {
                                headerAvatar.innerHTML = avatarVal;
                                headerAvatar.style.fontSize = '1.1em';
                            }
                        }

                        if (num < 5) {
                            advanceAccordionPanel(num);
                        } else {
                            const successBanner = document.getElementById('reto0-success-banner');
                            if (successBanner) {
                                successBanner.style.display = 'block';
                                successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }
                    } else {
                        showToast('Error al guardar el módulo.', 'error');
                    }
                } catch (e) {
                    console.error('Error saving profile module:', e);
                    showToast('Error de red. Intenta de nuevo.', 'error');
                } finally {
                    btnEl.innerHTML = originalHtml;
                    btnEl.disabled = false;
                }
            };
`;

const scriptEndIndex = content.lastIndexOf('</script>');
if (scriptEndIndex !== -1) {
    content = content.substring(0, scriptEndIndex) + '\n' + scriptInjection + content.substring(scriptEndIndex);
    console.log('✅ Injected JS functions before </script>');
} else {
    console.error('❌ Could not find closing </script> tag');
    process.exit(1);
}

fs.writeFileSync('scratch/activity_modified.ejs', content, 'utf8');
console.log('✅ Always wrote to scratch/activity_modified.ejs');

// Try compiling
try {
    ejs.compile(content, { filename: 'scratch/activity_modified.ejs' });
    console.log('✅ EJS compiles successfully!');
} catch(err) {
    console.error('❌ EJS compilation failed:', err.message);
}
