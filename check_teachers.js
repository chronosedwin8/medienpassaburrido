require('dotenv').config();
const supabase = require('./supabaseClient');
supabase.from('teachers').select('*').limit(3).then(res => {
console.log(JSON.stringify(res.data, null, 2));
process.exit(0);
});
