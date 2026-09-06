const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');

// Print lines 423 to 909
const formStart = 423;
const formEnd = 909;
const formLines = lines.slice(formStart - 1, formEnd);
fs.writeFileSync('scratch/original_form_content.txt', formLines.join('\n'), 'utf8');
console.log('Original form content saved. Length:', formLines.join('\n').length);
