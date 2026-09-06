const fs = require('fs');
const content = fs.readFileSync('scratch/activity_modified.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('try')) {
        console.log(`Line ${idx + 1}: ${line}`);
    }
});
