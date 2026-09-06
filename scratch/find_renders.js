const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
const regex = /res\.render\(\s*['"]index['"]/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(`Found render('index') at index ${match.index}: ${content.substring(match.index - 50, match.index + 100)}`);
}
