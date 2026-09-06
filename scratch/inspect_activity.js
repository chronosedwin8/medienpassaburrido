const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../views/activity.ejs');
const content = fs.readFileSync(filePath, 'utf8');

// Find matches for 'profile' or similar strings
const regex = /activity\.id\s*===\s*['"]profile['"]/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(`Found activity.id === 'profile' at index ${match.index}:`);
    console.log(content.substring(match.index - 100, match.index + 500));
}
