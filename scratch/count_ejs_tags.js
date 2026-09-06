const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');

// Count tags
const openCount = (content.match(/<%/g) || []).length;
const closeCount = (content.match(/%>/g) || []).length;
console.log('Open tags (<%):', openCount);
console.log('Close tags (%>):', closeCount);

// Count braces inside EJS tags
const ejsBracesOpen = (content.match(/<%\s*[^%]*\{[^%]*%>/g) || []).length;
const ejsBracesClose = (content.match(/<%\s*[^%]*\}[^%]*%>/g) || []).length;
console.log('Braces Open inside EJS:', ejsBracesOpen);
console.log('Braces Close inside EJS:', ejsBracesClose);
