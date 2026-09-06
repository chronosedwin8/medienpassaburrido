const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');

function printRange(start, end) {
    console.log(`--- Lines ${start} to ${end} ---`);
    for (let i = start - 1; i < end; i++) {
        if (lines[i].includes('h2') || lines[i].includes('h3') || lines[i].includes('class=') || lines[i].includes('id=')) {
            console.log(`${i + 1}: ${lines[i].trim()}`);
        }
    }
}

printRange(72, 100);
printRange(540, 560);
printRange(700, 725);
