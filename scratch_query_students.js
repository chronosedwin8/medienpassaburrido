require('dotenv').config();
const supabase = require('./supabaseClient');

async function run() {
    try {
        console.log('Querying students...');
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .like('class_name', 'K4%')
            .limit(10);
        if (error) {
            console.error(error);
            return;
        }
        data.forEach(s => {
            console.log(`ID: ${s.id}, Username: ${s.username}, Class: ${s.class_name}, Code: ${s.student_code}`);
        });
    } catch (e) {
        console.error(e);
    }
}
run();
