const fs = require('fs');
const code = fs.readFileSync('data.js', 'utf8');
const lines = code.split('\n');

console.log("=== Matching lines in data.js for allActivities ===");
lines.forEach((line, idx) => {
    if (line.includes('allActivities') || line.includes('const allActivities')) {
        if (line.length < 120) {
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    }
});
