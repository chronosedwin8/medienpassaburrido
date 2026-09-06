const fs = require('fs');

const current = fs.readFileSync('views/activity.ejs', 'utf8');

// Header is lines 1 to 71 of current
const lines = current.split('\n');
const origHeader = lines.slice(0, 71).join('\n') + '\n<% if (activity.id === \'profile\') { %>\n';

// Slide deck (no extra <% } %> added)
const origSlideDeck = fs.readFileSync('scratch/original_slide_deck.txt', 'utf8');

// Middle part
const middlePart = `
<!-- Star Self-Evaluation -->
<% if (activity.id !== \'profile\') { %>
    <div class="star-self-eval" id="starSelfEval" style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #8b5cf6;">
        <span class="star-eval-label" data-i18n="selfEvaluation">Autoevaluación</span>
        <p style="font-size: 0.9em; color: #4b5563; margin: 5px 0 10px 0;">
            Estimado estudiante, tu autoevaluación será analizada por Inteligencia Artificial, la cual te dará un puntaje teniendo en cuenta tu respuesta y la ampliación de la misma en la sección de ¿Puedes explicar por qué seleccionaste esa respuesta?
        </p>
        <div class="star-rating-interactive" id="starRating">
            <% for (let i=1; i<=5; i++) { %>
                <span class="star-clickable" data-star="<%= i %>"
                    onclick="setStarRating(<%= i %>)">☆</span>
            <% } %>
        </div>
        <input type="hidden" id="star_rating_value" name="star_rating" value="0">
    </div>
<% } %>
</div>
`;

// Form content
const origFormContent = fs.readFileSync('scratch/original_form_content.txt', 'utf8');

// Footer
const footerStart = current.lastIndexOf('</form>');
let footerPart = '';
if (footerStart !== -1) {
    footerPart = current.substring(footerStart + '</form>'.length);
    const injectionToken = 'window.toggleAccordionPanel = function(num) {';
    const injectionIndex = footerPart.indexOf(injectionToken);
    if (injectionIndex !== -1) {
        footerPart = footerPart.substring(0, injectionIndex) + '\n    </script>\n';
    }
}

const rebuilt = `${origHeader}
${origSlideDeck}
${middlePart}
${origFormContent}
${footerPart}`;

fs.writeFileSync('views/activity.ejs', rebuilt, 'utf8');
console.log('Rebuilt views/activity.ejs to a clean original state');

// Test compilation
try {
    const ejs = require('ejs');
    ejs.compile(rebuilt, { filename: 'views/activity.ejs' });
    console.log('✅ Compilation check PASSED for clean activity.ejs!');
} catch (e) {
    console.error('❌ Compilation check FAILED for clean activity.ejs:', e.message);
}
