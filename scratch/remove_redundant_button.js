const fs = require('fs');

let content = fs.readFileSync('views/activity.ejs', 'utf8');

const targetStr1 = `                        <div class="panel-actions" style="text-align: right; margin-top: 20px;">
                            <button type="button" class="save-btn" onclick="saveProfileModule(2, this)">
                                <i class="fas fa-save"></i> Guardar mi Avatar y Continuar
                            </button>
                        </div>`;

const targetStr2 = targetStr1.replace(/\n/g, '\r\n');

if (content.includes(targetStr1)) {
    content = content.replace(targetStr1, '');
    console.log('✅ Removed redundant button (LF version)');
} else if (content.includes(targetStr2)) {
    content = content.replace(targetStr2, '');
    console.log('✅ Removed redundant button (CRLF version)');
} else {
    // Try a fuzzy match ignoring whitespace/newlines
    console.log('⚠️ Could not find exact match, attempting regex replacement...');
    const regex = /<div class="panel-actions" style="text-align: right; margin-top: 20px;">\s*<button type="button" class="save-btn" onclick="saveProfileModule\(2, this\)">\s*<i class="fas fa-save"><\/i> Guardar mi Avatar y Continuar\s*<\/button>\s*<\/div>/;
    if (content.match(regex)) {
        content = content.replace(regex, '');
        console.log('✅ Removed redundant button via regex');
    } else {
        console.error('❌ Redundant button not found!');
        process.exit(1);
    }
}

fs.writeFileSync('views/activity.ejs', content, 'utf8');

// Compile test
try {
    const ejs = require('ejs');
    ejs.compile(content, { filename: 'views/activity.ejs' });
    console.log('✅ Compilation check passed!');
} catch (e) {
    console.error('❌ Compilation check failed:', e.message);
    process.exit(1);
}
