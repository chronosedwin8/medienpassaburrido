const fs = require('fs');

const current = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = current.split('\n');

const origSlideDeck = fs.readFileSync('scratch/original_slide_deck.txt', 'utf8');
const origFormContent = fs.readFileSync('scratch/original_form_content.txt', 'utf8');

// Construct header properly with the open brace
const origHeader = lines.slice(0, 71).join('\n') + '\n<% if (activity.id === \'profile\') { %>\n<!-- ── Reto 0 / Interactive Slide-Deck Section ── -->';

// Find middle part
const selfEvalIndex = current.indexOf('<!-- Star Self-Evaluation -->');
const formIndex = current.indexOf('<form id="activityForm">');
let middlePart = '';
if (selfEvalIndex !== -1 && formIndex !== -1) {
    middlePart = '\n' + current.substring(selfEvalIndex, formIndex);
}

// Find footer part
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

// Rebuild EJS
const originalRebuilt = `${origHeader}
${origSlideDeck}
${middlePart}
${origFormContent}
${footerPart}`;

fs.writeFileSync('views/activity.ejs', originalRebuilt, 'utf8');
console.log('Restored activity.ejs to original state!');

// Run compilation test
try {
    const ejs = require('ejs');
    ejs.compile(originalRebuilt, { filename: 'views/activity.ejs' });
    console.log('✅ Compilation check PASSED for restored activity.ejs!');
} catch (e) {
    console.error('❌ Compilation check FAILED for restored activity.ejs:', e.message);
}
