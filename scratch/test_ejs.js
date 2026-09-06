const ejs = require('ejs');
const fs = require('fs');

try {
    const template = fs.readFileSync('views/activity.ejs', 'utf8');
    const fn = ejs.compile(template, { filename: 'views/activity.ejs' });
    console.log('✅ views/activity.ejs compiled successfully!');
} catch (e) {
    console.error('❌ views/activity.ejs compilation failed:', e);
}

try {
    const template2 = fs.readFileSync('views/index.ejs', 'utf8');
    const fn2 = ejs.compile(template2, { filename: 'views/index.ejs' });
    console.log('✅ views/index.ejs compiled successfully!');
} catch (e) {
    console.error('❌ views/index.ejs compilation failed:', e);
}
