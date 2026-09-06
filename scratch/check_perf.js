require('dotenv').config();
const supabase = require('../supabaseClient');

async function test() {
    if (!supabase) {
        console.log("Supabase client is not initialized. Please check your .env file.");
        return;
    }
    console.log("Testing Supabase connectivity...");
    
    // Test 1: Simple select
    const startSelect = Date.now();
    try {
        const { data, error } = await supabase.from('students').select('id').limit(1);
        const endSelect = Date.now();
        if (error) {
            console.error("Select error:", error);
        } else {
            console.log(`Select completed in ${endSelect - startSelect}ms. Rows found:`, data.length);
        }
    } catch(e) {
        console.error("Select exception:", e);
    }

    // Test 2: Upsert dummy response
    const startUpsert = Date.now();
    try {
        const { data, error } = await supabase.from('activity_responses').upsert({
            student_id: '8cb80fa8-9d0d-45bf-a6d1-cfc09f3c7e7b', // a dummy or existing UUID depending on DB. We can use a random or test uuid
            activity_id: 'test_perf_latency',
            data: { test: true },
            period: 1,
            school_year: '2627',
            updated_at: new Date().toISOString()
        }, { onConflict: 'student_id,activity_id' }).select();
        const endUpsert = Date.now();
        if (error) {
            console.error("Upsert error (ignore if student_id FK fails):", error.message);
        } else {
            console.log(`Upsert completed in ${endUpsert - startUpsert}ms.`);
        }
    } catch(e) {
        console.error("Upsert exception:", e);
    }
}

test();
