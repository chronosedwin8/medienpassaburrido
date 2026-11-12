const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

const helperCode = `
// Helper: get unique class names from DB
async function getUniqueClasses() {
    if (!supabase) return [];
    try {
        const { data } = await supabase.from('students').select('class_name');
        return [...new Set((data || []).map(s => s.class_name))].filter(Boolean).sort();
    } catch (e) { return []; }
}
`;

if (!c.includes('async function getUniqueClasses')) {
    // Insert before the LOGIN ROUTES section
    const idx = c.indexOf('// LOGIN ROUTES');
    if (idx > -1) {
        // Find the start of the decoration line before it
        const decorIdx = c.lastIndexOf('// ═', idx - 5);
        if (decorIdx > -1) {
            c = c.slice(0, decorIdx) + helperCode + '\n' + c.slice(decorIdx);
            console.log('Inserted helper at position', decorIdx);
        }
    }
} else {
    console.log('Helper already exists');
}

fs.writeFileSync('server.js', c);
console.log('Done');
