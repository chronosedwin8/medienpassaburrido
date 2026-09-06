require('dotenv').config();
const supabase = require('../supabaseClient');

async function check() {
    if (!supabase) return;
    const { data: sData } = await supabase.from('students').select('*').limit(1);
    console.log('Student Columns:', Object.keys(sData[0] || {}));
    
    const { data: tData } = await supabase.from('teachers').select('*').limit(1);
    console.log('Teacher Columns:', Object.keys(tData[0] || {}));
}
check();
