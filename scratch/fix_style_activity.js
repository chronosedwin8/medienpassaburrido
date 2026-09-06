const fs = require('fs');
let code = fs.readFileSync('views/activity.ejs', 'utf8');

// Replace the dangling closing brace and open the style block
const targetStr = '<div class="save-status" id="saveStatus"></div>\r\n                                                                 </div>\r\n    <% } %>\r\n        }\r\n        .concept-header-row {';
const targetStrLf = '<div class="save-status" id="saveStatus"></div>\n                                                                 </div>\n    <% } %>\n        }\n        .concept-header-row {';

let replaced = false;
if (code.includes(targetStr)) {
    code = code.replace(targetStr, '<div class="save-status" id="saveStatus"></div>\r\n                                                                 </div>\r\n    <% } %>\r\n\r\n    <style>\r\n        .concept-header-row {');
    replaced = true;
} else if (code.includes(targetStrLf)) {
    code = code.replace(targetStrLf, '<div class="save-status" id="saveStatus"></div>\n                                                                 </div>\n    <% } %>\n\n    <style>\n        .concept-header-row {');
    replaced = true;
} else {
    // Try a more generic replacement around that area
    console.log("Direct match not found. Trying regex...");
    const regex = /<div class="save-status" id="saveStatus"><\/div>\s*<\/div>\s*<%\s*}\s*%>\s*\}\s*\.concept-header-row\s*\{/g;
    if (regex.test(code)) {
        code = code.replace(regex, '<div class="save-status" id="saveStatus"></div>\n                                                                 </div>\n    <% } %>\n\n    <style>\n        .concept-header-row {');
        replaced = true;
    }
}

if (replaced) {
    fs.writeFileSync('views/activity.ejs', code, 'utf8');
    console.log("Success: activity.ejs style block updated!");
} else {
    console.error("Error: Could not find the target string to replace!");
}
