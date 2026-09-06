const fs = require('fs');
const content = fs.readFileSync('public/css/style.css', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('activity-card') || line.includes('welcome-modal')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
