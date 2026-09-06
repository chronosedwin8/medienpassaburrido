const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('saveAvatarAndContinue') || line.includes('api/save') || line.includes('save-btn') || line.includes('submit')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
