const fs = require('fs');
const code = fs.readFileSync('data_questions.js', 'utf8');
const lines = code.split('\n');

console.log("=== Matching lines in data_questions.js for generateEvidenceForReto ===");
lines.forEach((line, idx) => {
    if (line.includes('generateEvidenceForReto')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
