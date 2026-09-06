const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
const edilimLines = lines.slice(704, 742); // line 705 to 742
fs.writeFileSync('scratch/original_edilim.txt', edilimLines.join('\n'), 'utf8');
console.log('Original Edilim block saved. Length:', edilimLines.join('\n').length);
