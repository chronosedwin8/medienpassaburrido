const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(/klassenConfig\.klassen\.forEach\(\s*k\s*=>\s*\{\s*klassenConfig\.kurse\.forEach\(\s*kurs\s*=>\s*\{\s*const cName = k \+ kurs;/g, 
'const uniqueClasses = [...new Set(students.map(s => s.class_name))].filter(Boolean).sort();\n        uniqueClasses.forEach(cName => {');

c = c.replace(/\}\);\s*\}\);\s*\/\/\s*Group students by class/g, 
'});\n\n        // Group students by class');

fs.writeFileSync('server.js', c);
console.log('Patched');
