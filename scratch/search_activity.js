const fs = require('fs');
const code = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = code.split('\n');

console.log("=== Matching lines in activity.ejs for retos ===");
lines.forEach((line, idx) => {
    if (line.includes('activity.id') || line.includes('generateEvidence') || line.includes('reto') || line.includes('evidence')) {
        if (line.length < 120) {
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    }
});
