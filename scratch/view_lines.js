const fs = require('fs');
const content = fs.readFileSync('scratch/activity_modified.ejs', 'utf8');
const lines = content.split('\n');

function printRange(start, end) {
    console.log(`--- Lines ${start} to ${end} ---`);
    for (let i = start - 1; i < end; i++) {
        if (lines[i] !== undefined) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
}

printRange(695, 745);
printRange(1040, 1070);
