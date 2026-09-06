const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');

let openBraces = [];
let ejsBlocks = [];

lines.forEach((line, index) => {
    // Look for <% ... %>
    const regex = /<%\s*([\s\S]*?)\s*%>/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const block = match[1].trim();
        // Count open and close braces in block
        for (let char of block) {
            if (char === '{') {
                openBraces.push({ line: index + 1, block: block });
            } else if (char === '}') {
                if (openBraces.length === 0) {
                    console.log(`Unmatched close brace '}' at line ${index + 1}: ${block}`);
                } else {
                    openBraces.pop();
                }
            }
        }
    }
});

console.log('Unbalanced open braces left at end:', openBraces.length);
openBraces.forEach(b => {
    console.log(`Open brace at line ${b.line}: ${b.block}`);
});
