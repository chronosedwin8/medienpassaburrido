const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

c = c.replace(/let cleanEmail = email\.trim\(\)\.toLowerCase\(\);\s*const \{ data: teacher, error \} = await supabase/g, 
`let cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.includes('@')) {
                cleanEmail += '@colegioaleman.edu.co';
            }
            const cleanPassword = password.trim();
            const { data: teacher, error } = await supabase`);

fs.writeFileSync('server.js', c);
console.log('Fixed server.js');
