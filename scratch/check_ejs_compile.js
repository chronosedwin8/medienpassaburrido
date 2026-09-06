const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

function checkEjsFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules') {
                checkEjsFiles(fullPath);
            }
        } else if (file.endsWith('.ejs')) {
            try {
                const template = fs.readFileSync(fullPath, 'utf8');
                ejs.compile(template);
                console.log(`EJS template ${fullPath} compiled successfully without syntax errors!`);
            } catch (e) {
                console.error(`EJS Compile Error in ${fullPath}:`, e);
                process.exit(1);
            }
        }
    });
}

checkEjsFiles('views');
console.log("All EJS files checked successfully!");

