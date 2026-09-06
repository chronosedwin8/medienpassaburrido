const fs = require('fs');
const code = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = code.split('\n');

console.log("=== Style tags in activity.ejs ===");
lines.forEach((line, idx) => {
    if (line.includes('<style') || line.includes('</style>')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
