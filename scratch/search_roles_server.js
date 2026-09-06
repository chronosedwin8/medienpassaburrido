const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');

console.log("=== Matching lines in server.js for roles or teacher_roles ===");
lines.forEach((line, idx) => {
    if (line.includes('teacher_roles.json') || line.includes('roles[') || line.includes('teacher_roles')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
