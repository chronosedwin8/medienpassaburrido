const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('toggleAccordionPanel')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
        console.log('--- Context: ---');
        for (let i = Math.max(0, index - 10); i < Math.min(lines.length, index + 10); i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
});
