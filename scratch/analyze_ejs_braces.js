const fs = require('fs');

const content = fs.readFileSync('views/activity.ejs', 'utf8');

// Find all EJS tags: <% ... %>
const regex = /<%\s*([\s\S]*?)\s*%>/g;
let match;
let tags = [];
while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim();
    const line = content.substring(0, match.index).split('\n').length;
    tags.push({ line, text });
}

console.log(`Total EJS tags: ${tags.length}`);

// Print tags containing control flow or braces
tags.forEach(t => {
    if (t.text.includes('{') || t.text.includes('}') || t.text.includes('try') || t.text.includes('catch') || t.text.includes('for') || t.text.includes('if')) {
        console.log(`Line ${t.line}: ${t.text}`);
    }
});
