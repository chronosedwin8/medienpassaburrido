require('dotenv').config();
const supabase = require('../supabaseClient');

async function testSupabase() {
    console.log('Testing Supabase connection and write...');
    if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return;
    }

    try {
        // 1. Check connection/read
        const { data: students, error: readError } = await supabase.from('students').select('*').limit(1);
        if (readError) {
            console.error('❌ Error reading students:', readError);
            return;
        }
        console.log('✅ Read test successful. Found', students.length, 'students.');

        if (students.length === 0) {
            console.warn('⚠️ No students found, skipping write test.');
            return;
        }

        const student = students[0];
        const testActivityId = 'test_activity_' + Date.now();

        // 2. Write test
        console.log(`Attempting to write test response for student ${student.id}...`);
        const { data: insertData, error: writeError } = await supabase
            .from('activity_responses')
            .upsert({
                student_id: student.id,
                activity_id: testActivityId,
                data: { test: true, timestamp: new Date().toISOString() },
                period: 1,
                school_year: '2526',
                updated_at: new Date().toISOString()
            })
            .select();

        if (writeError) {
            console.error('❌ Error writing activity_response:', writeError);
        } else {
            console.log('✅ Write test successful:', insertData);
            
            // 3. Cleanup
            const { error: deleteError } = await supabase
                .from('activity_responses')
                .delete()
                .eq('activity_id', testActivityId);
            
            if (deleteError) {
                console.warn('⚠️ Cleanup failed:', deleteError);
            } else {
                console.log('✅ Cleanup successful.');
            }
        }

    } catch (e) {
        console.error('❌ Unexpected error during test:', e);
    }
}

testSupabase();
