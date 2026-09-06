const fs = require('fs');
const content = fs.readFileSync('scratch/original_form_content.txt', 'utf8');
const lines = content.split('\n');

let openBraces = [];
lines.forEach((line, index) => {
    const regex = /<%\s*([\s\S]*?)\s*%>/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const block = match[1].trim();
        for (let char of block) {
            if (char === '{') {
                openBraces.push({ line: index + 1, block: block });
            } else if (char === '}') {
                if (openBraces.length === 0) {
                    console.log(`Unmatched close brace '}' in original_form_content.txt at line ${index + 1}: ${block}`);
                } else {
                    openBraces.pop();
                }
            }
        }
    }
});
console.log('Unbalanced open braces left at end of original_form_content.txt:', openBraces.length);
