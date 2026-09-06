const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');

const regex = /<div class="concept-item-card"[\s\S]*?<\/div>\s*<\/div>/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null && count < 20) {
    count++;
    console.log(`=== CARD ${count} ===`);
    console.log(match[0].substring(0, 800));
}
