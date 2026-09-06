const fs = require('fs');
const content = fs.readFileSync('scratch/ejs_debug.txt', 'utf8');

// Find the generated function body in debug output
const lines = content.split('\n');
console.log('Total debug lines:', lines.length);

// Print compilation error message
const errLine = lines.find(l => l.includes('SyntaxError') || l.includes('Compilation failed'));
if (errLine) {
    console.log('Error message found:', errLine);
}

// Print the last 100 lines of debug output (which contains the compiled JS and function body)
console.log('--- Last 100 lines: ---');
const lastLines = lines.slice(-100);
console.log(lastLines.join('\n'));
