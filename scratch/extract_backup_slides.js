const fs = require('fs');
const content = fs.readFileSync('scratch/activity.ejs.backup', 'utf8');

const regex = /<!-- Slide \d+ -->[\s\S]*?(?=<!-- Slide \d+ -->|<div class="slide-nav">)/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log("=========================================");
    console.log(match[0].substring(0, 1000) + "\n...");
}
