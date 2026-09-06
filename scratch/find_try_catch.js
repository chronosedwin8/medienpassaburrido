const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('<%') && (line.includes('try') || line.includes('catch') || line.includes('finally'))) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
