const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('function collectData') || line.includes('const collectData')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
