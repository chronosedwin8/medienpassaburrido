const fs = require('fs');

const content = fs.readFileSync('scratch/activity_modified.ejs', 'utf8');

// Parse EJS blocks and extract JS code
const regex = /<%\s*([\s\S]*?)\s*%>/g;
let match;
let stack = [];

function cleanCode(code) {
    // Strip single line comments
    code = code.replace(/\/\/.*$/gm, '');
    // Strip multi line comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    // Strip single-quoted strings
    code = code.replace(/'(\\.|[^'\\])*'/g, '');
    // Strip double-quoted strings
    code = code.replace(/"(\\.|[^"\\])*"/g, '');
    // Strip template literals
    code = code.replace(/`(\\.|[^`\\])*`/g, '');
    return code;
}

const lines = content.split('\n');
lines.forEach((line, index) => {
    const lineNum = index + 1;
    // Find all EJS tags in this line
    let tagRegex = /<%\s*([\s\S]*?)\s*%>/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(line)) !== null) {
        let code = tagMatch[1];
        // If it starts with '=', '-', or '_', it's an output/unescape tag, not control structure
        if (code.startsWith('=') || code.startsWith('-') || code.startsWith('_')) {
            continue;
        }
        
        let cleaned = cleanCode(code);
        for (let i = 0; i < cleaned.length; i++) {
            let char = cleaned[i];
            if (char === '{') {
                stack.push({ line: lineNum, code: code.trim() });
            } else if (char === '}') {
                if (stack.length === 0) {
                    console.log(`❌ Unmatched closing brace '}' at line ${lineNum}: "${code.trim()}"`);
                } else {
                    let opened = stack.pop();
                    // console.log(`Matched: { (line ${opened.line}) with } (line ${lineNum})`);
                }
            }
        }
    }
});

if (stack.length > 0) {
    console.log(`❌ ${stack.length} unmatched opening braces left:`);
    stack.forEach(op => {
        console.log(`  Line ${op.line}: "${op.code}"`);
    });
} else {
    console.log('✅ All braces inside EJS blocks match perfectly!');
}
