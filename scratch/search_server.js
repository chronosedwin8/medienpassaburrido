const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const lines = code.split('\n');

console.log("=== Matching Lines for 'teachers' or '/api/admin/teacher-roles' or login ===");
lines.forEach((line, idx) => {
    if (line.includes('teacher-roles') || line.includes('/api/admin/db-records/:table') || line.includes('/login/teacher') || line.includes('/api/admin/db-records/:table/:id')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
