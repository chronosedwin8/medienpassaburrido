const fs = require('fs');
const content = fs.readFileSync('scratch/activity.ejs.backup', 'utf8');

const matches = [];
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.includes('proceso de aprendizaje') || line.includes('dueños y responsables') || line.includes('Estudiante') || line.includes('Transversal') || line.includes('Híbrido')) {
        matches.push(`${i+1}: ${line.trim()}`);
    }
});

console.log(matches.slice(0, 100).join('\n'));
