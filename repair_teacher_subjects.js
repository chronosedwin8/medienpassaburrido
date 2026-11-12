require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('./supabaseClient');

async function repair() {
    const configPath = path.join(__dirname, 'class_teacher_config.json');
    if (!fs.existsSync(configPath)) {
        console.error('Config file not found');
        return;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Build Teacher -> Set of Subjects map
    const teacherSubjects = {};
    Object.values(config).forEach(classMapping => {
        Object.entries(classMapping).forEach(([subject, teacherName]) => {
            if (!teacherName || teacherName.toLowerCase() === 'no aplica') return;
            const name = teacherName.trim().toUpperCase();
            if (!teacherSubjects[name]) teacherSubjects[name] = new Set();
            teacherSubjects[name].add(subject);
        });
    });

    const { data: teachers, error } = await supabase.from('teachers').select('id, first_name, last_name');
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Processing ${teachers.length} teachers...`);

    for (const t of teachers) {
        const fullName = `${t.first_name || ''} ${t.last_name || ''}`.trim().toUpperCase();
        
        // Try to match
        let matchedName = null;
        if (teacherSubjects[fullName]) {
            matchedName = fullName;
        } else {
            // Try fuzzy match or partial match if needed
            matchedName = Object.keys(teacherSubjects).find(name => name.includes(fullName) || fullName.includes(name));
        }

        if (matchedName) {
            const subjectsSet = teacherSubjects[matchedName];
            const subjectsArray = Array.from(subjectsSet);
            const primarySubject = subjectsArray[0]; // For now pick one
            
            console.log(`Updating ${fullName} -> ${primarySubject} (All: ${subjectsArray.join(', ')})`);
            
            const { error: updateError } = await supabase.from('teachers')
                .update({ subject: primarySubject })
                .eq('id', t.id);
            
            if (updateError) console.error(`Error updating ${fullName}:`, updateError);
        } else {
            console.log(`No mapping found for ${fullName}`);
        }
    }

    console.log('Done');
    process.exit(0);
}

repair();
