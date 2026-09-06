const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');

function findLineContaining(str) {
    const res = [];
    lines.forEach((line, idx) => {
        if (line.includes(str)) {
            res.push({ lineNum: idx + 1, content: line.trim() });
        }
    });
    return res;
}

console.log('Search profile:', findLineContaining("id=\"reto-zero-section\""));
console.log('Search avatar:', findLineContaining("id=\"avatarSelectorContainer\""));
console.log('Search edilim:', findLineContaining("id=\"edilim-game-container\""));
console.log('Search teachers:', findLineContaining("teachers-by-subject-section"));
console.log('Search saveBtn:', findLineContaining("id=\"saveBtn\""));
console.log('Search saveBtnQuiz:', findLineContaining("id=\"saveBtnQuiz\""));
console.log('Search readyForEvalBtn:', findLineContaining("readyForEvalBtn"));
