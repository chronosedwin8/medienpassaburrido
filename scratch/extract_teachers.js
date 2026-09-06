const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
const teacherLines = lines.slice(744, 785); // line 745 to 785
fs.writeFileSync('scratch/original_teachers.txt', teacherLines.join('\n'), 'utf8');
console.log('Original teachers block saved. Length:', teacherLines.join('\n').length);
