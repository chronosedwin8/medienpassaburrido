const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');

function printContext(lineNum) {
    console.log(`=== Context around line ${lineNum} ===`);
    const start = Math.max(1, lineNum - 5);
    const end = Math.min(lines.length, lineNum + 5);
    for (let i = start - 1; i < end; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
    }
}

printContext(702);
printContext(734);
printContext(1223);
