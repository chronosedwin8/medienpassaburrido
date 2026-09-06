const fs = require('fs');
const content = fs.readFileSync('views/admin/dashboard.ejs', 'utf8');
const lines = content.split('\n');

console.log("=== SEARCH FOR DIPLOMA ===");
lines.forEach((line, i) => {
    if (line.toLowerCase().includes('diploma')) {
        console.log(`${i+1}: ${line.trim().substring(0, 100)}`);
    }
});

console.log("\n=== SEARCH FOR LOADREPORT ===");
lines.forEach((line, i) => {
    if (line.toLowerCase().includes('loadreport')) {
        console.log(`${i+1}: ${line.trim().substring(0, 100)}`);
    }
});
