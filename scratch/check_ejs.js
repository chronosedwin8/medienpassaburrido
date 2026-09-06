const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'views', 'activity.ejs');
const content = fs.readFileSync(filePath, 'utf8');

try {
    ejs.compile(content);
    console.log("EJS is valid");
} catch (e) {
    console.error(e);
}
