require('dotenv').config();
const supabase = require('../supabaseClient');

async function check() {
    if (!supabase) return;
    const { data, error } = await supabase.from('students').select('*').limit(1);
    if (error) console.error(error);
    else console.log('Columns:', Object.keys(data[0] || {}));
}
check();
