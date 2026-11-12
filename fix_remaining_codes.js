require('dotenv').config();
const supabase = require('./supabaseClient');

async function run() {
    // Get all students without student_code
    const { data } = await supabase.from('students').select('id, username').is('student_code', null);
    console.log(`Found ${data.length} students without student_code`);
    
    let count = 0;
    for (const s of data) {
        await supabase.from('students').update({ student_code: s.username }).eq('id', s.id);
        count++;
        if (count % 50 === 0) console.log(count);
    }
    console.log(`Fixed ${count} students`);
}

run();
