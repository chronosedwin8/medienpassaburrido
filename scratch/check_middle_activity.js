const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
for (let i = 71; i < 542; i++) {
    if (lines[i].includes('<%') && !lines[i].includes('activity.id') && !lines[i].includes('//') && !lines[i].includes('/*')) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    }
}
