const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
const slideDeckLines = lines.slice(73, 404); // line 74 to 404
fs.writeFileSync('scratch/original_slide_deck.txt', slideDeckLines.join('\n'), 'utf8');
console.log('Original slide deck saved. Length:', slideDeckLines.join('\n').length);
