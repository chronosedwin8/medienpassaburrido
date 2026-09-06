const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('favorite_sport') || line.includes('favorite_color') || line.includes('allTeachers')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
