require('dotenv').config();
const supabase = require('./supabaseClient');

async function run() {
    const { data } = await supabase.from('students').select('id, username');
    let count = 0;
    for (let s of data) {
        await supabase.from('students').update({ student_code: s.username }).eq('id', s.id);
        count++;
        if (count % 50 === 0) console.log(count);
    }
    console.log('Fixed ' + count);
}

run();
