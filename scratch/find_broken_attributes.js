const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

console.log('Analyzing ALL EJS files for broken data-lang-content attributes...');

const viewsDir = path.join(__dirname, '../views');

walkDir(viewsDir, (filePath) => {
    if (!filePath.endsWith('.ejs')) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /data-lang-content\s*=\s*(['"])([\s\S]*?)\1/g;
    let match;
    const lines = content.split('\n');
    
    while ((match = regex.exec(content)) !== null) {
        const quote = match[1];
        const attrVal = match[2];
        const index = match.index;
        const lineNumber = content.substring(0, index).split('\n').length;
        
        if (attrVal.includes('<%-') || attrVal.includes('${')) continue;
        
        try {
            JSON.parse(attrVal);
        } catch (e) {
            const relPath = path.relative(path.join(__dirname, '..'), filePath);
            console.log(`${relPath}:${lineNumber}: Failed to parse JSON! (Quote style: ${quote})`);
            console.log(`  Snippet: ${lines[lineNumber - 1].trim().substring(0, 100)}...`);
            console.log(`  Error: ${e.message}\n`);
        }
    }
});

console.log('Completed scanning.');
