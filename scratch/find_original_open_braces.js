const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
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
                    console.log(`Unmatched close brace '}' at line ${index + 1}: ${block}`);
                } else {
                    const matched = openBraces.pop();
                    if (index + 1 === 743 || index + 1 === 742 || index + 1 === 745 || index + 1 === 746) {
                        console.log(`Close brace at line ${index + 1} (${block}) matched with open brace at line ${matched.line}: ${matched.block}`);
                    }
                }
            }
        }
    }
});
