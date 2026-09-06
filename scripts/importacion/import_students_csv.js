const fs = require('fs');
require('dotenv').config();
const supabase = require('./supabaseClient');

async function importStudents() {
    const csvPath = 'c:/Users/lacero/Downloads/nuevo_estudiantes.csv';
    
    if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found at path:', csvPath);
        return;
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const students = lines.map(line => {
        const parts = line.split(',');
        const username = parts[0].trim();
        const class_name = parts[parts.length - 1].trim();
        const full_name = parts.slice(1, parts.length - 1).join(',').trim();

        return { username, full_name, class_name, student_code: username };
    });

    console.log(`Parsed ${students.length} students from CSV.`);

    // Batch insert/upsert
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        // Polyfill for upsert since unique constraint might not be present on username
        const { data: existingRecords, error: fetchError } = await supabase
            .from('students')
            .select('username')
            .in('username', batch.map(s => s.username));
            
        if (fetchError) {
            console.error('Error fetching existing batch:', fetchError.message);
            errorCount += batch.length;
            continue;
        }

        const existingUsernames = new Set((existingRecords || []).map(r => r.username));
        const newStudents = batch.filter(s => !existingUsernames.has(s.username));
        const existingStudents = batch.filter(s => existingUsernames.has(s.username));

        if (newStudents.length > 0) {
            const { error: insertError } = await supabase.from('students').insert(newStudents);
            if (insertError) {
                console.error('Error inserting new students:', insertError.message);
                errorCount += newStudents.length;
            } else {
                successCount += newStudents.length;
            }
        }

        if (existingStudents.length > 0) {
            // Update them one by one or ignore. Usually we can just update.
            let hasError = false;
            for (const s of existingStudents) {
                const { error: updateError } = await supabase
                    .from('students')
                    .update({ full_name: s.full_name, class_name: s.class_name, student_code: s.student_code })
                    .eq('username', s.username);
                if (updateError) {
                    hasError = true;
                    console.error('Error updating existing student:', updateError.message);
                }
            }
            if (hasError) {
                errorCount += existingStudents.length;
            } else {
                successCount += existingStudents.length;
            }
        }
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}...`);
    }

    console.log(`Done. Successfully processed: ${successCount}. Errors: ${errorCount}.`);
}

importStudents();
