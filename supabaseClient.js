const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase connected successfully');
    } catch (e) {
        console.warn('⚠️  Could not initialize Supabase:', e.message);
    }
} else {
    console.warn('⚠️  Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
    console.warn('   The app will run but data will NOT be persisted to the cloud.');
}

module.exports = supabase;
