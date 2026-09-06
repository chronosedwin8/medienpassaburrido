require('dotenv').config();
const path = require('path');
const supabase = require(path.join(__dirname, '..', 'supabaseClient'));

async function check() {
    const { data, error } = await supabase.from('teachers').select('subject, subject_assigned');
    if (error) {
        console.error(error);
        return;
    }
    const counts = {};
    data.forEach(t => {
        const s = t.subject_assigned || t.subject || 'none';
        counts[s] = (counts[s] || 0) + 1;
    });
    console.log('Subject Counts:', counts);
    process.exit(0);
}
check();
