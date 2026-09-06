const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
const lines = content.split('\n');
const avatarLines = lines.slice(542, 633); // line 543 to 633
fs.writeFileSync('scratch/original_avatar.txt', avatarLines.join('\n'), 'utf8');
console.log('Original avatar selector saved. Length:', avatarLines.join('\n').length);
