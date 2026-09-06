const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');

console.log("=== Matching Lines for '/api/admin/reports' ===");
lines.forEach((line, idx) => {
    if (line.includes('reports') || line.includes('profile')) {
        if (line.includes('app.get') || line.includes('app.post') || line.includes('api/')) {
            console.log(`${idx + 1}: ${line.trim()}`);
        }
    }
});
