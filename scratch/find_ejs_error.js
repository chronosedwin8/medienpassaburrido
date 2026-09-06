const ejs = require('ejs');
const fs = require('fs');

try {
    const template = fs.readFileSync('views/activity.ejs', 'utf8');
    ejs.compile(template, { filename: 'views/activity.ejs', debug: true });
} catch (e) {
    console.error('Compilation failed as expected:', e.message);
}
