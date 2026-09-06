const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.includes('start-reto0-eval-btn') || line.includes('edilim-game-container') || line.includes('saveBtnQuiz')) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
    }
});
