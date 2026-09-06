const fs = require('fs');
const code = fs.readFileSync('data.js', 'utf8');
const lines = code.split('\n');

console.log("=== Matching lines in data.js for retos ===");
lines.forEach((line, idx) => {
    if (line.includes('competencyGroups') || line.includes('generateEvidence') || line.includes('medienpassActivities')) {
        if (line.length < 120) {
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    }
});
