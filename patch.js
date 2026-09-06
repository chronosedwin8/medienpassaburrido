const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /app\.get\('\/admin', requireAdmin, async \(req, res\) => \{[\s\S]*?students = data \|\| \[\];\s*\} catch \(e\) \{ \/\* ignore \*\/ \}\s*\}/;

const replacement = `app.get('/admin', requireAdmin, async (req, res) => {
    let students = [];
    if (supabase) {
        try {
            const { data } = await supabase.from('students').select('*');
            students = data || [];
            
            function getSortName(name) {
                if (!name) return '';
                const parts = name.trim().toUpperCase().split(/\\s+/);
                if (parts.length > 2) {
                    return parts.slice(-2).join(' ') + ' ' + parts.slice(0, -2).join(' ');
                }
                return name.toUpperCase();
            }

            students.sort((a, b) => {
                if (a.class_name < b.class_name) return -1;
                if (a.class_name > b.class_name) return 1;
                
                const nameA = getSortName(a.full_name || a.username);
                const nameB = getSortName(b.full_name || b.username);
                return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
            });

            let currentClass = null;
            let counter = 1;
            students.forEach(s => {
                if (s.class_name !== currentClass) {
                    currentClass = s.class_name;
                    counter = 1;
                }
                s.list_number = counter++;
            });
            
        } catch (e) { /* ignore */ }
    }`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('server.js', code, 'utf8');
    console.log('Replaced successfully');
} else {
    console.log('Regex not found');
}
