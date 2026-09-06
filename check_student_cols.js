require('dotenv').config();
const supabase = require('./supabaseClient');
supabase.from('students').select('*').limit(1).then(res => {
console.log(res.data ? Object.keys(res.data[0]) : res.error);
process.exit(0);
});
