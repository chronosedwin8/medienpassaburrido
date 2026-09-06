require('dotenv').config();
const xlsx = require('xlsx');
const supabase = require('./supabaseClient');

async function importTeachers() {
    const wb = xlsx.readFile('C:\\Users\\lacero\\Downloads\\exported (4)(in).csv');
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} teachers`);

    const records = data.map(row => {
        const email = (row['Email'] || '').trim().toLowerCase();
        const docNumber = String(row['Documento'] || '').trim();
        const lastName1 = (row['Apellido 1'] || '').trim();
        const lastName2 = (row['Apellido 2'] || '').trim();
        const lastName = [lastName1, lastName2].filter(Boolean).join(' ').toUpperCase();
        if (!email || !docNumber) return null;
        return {
            id: 'teacher_' + email,
            email,
            last_name: lastName,
            doc_number: docNumber,
            subject: 'aleman' // default subject to satisfy NOT NULL
        };
    }).filter(Boolean);

    console.log(`Importing ${records.length} records...`);

    const batchSize = 50;
    let total = 0;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { data: result, error } = await supabase
            .from('teachers')
            .upsert(batch, { onConflict: 'id' })
            .select();
        if (error) {
            console.error(`Batch error:`, error.message);
        } else {
            total += result?.length || 0;
        }
    }

    console.log(`Done! Imported: ${total} teachers`);

    // Verify lacero
    const { data: lacero } = await supabase.from('teachers').select('email,doc_number,last_name').eq('email','lacero@colegioaleman.edu.co').single();
    console.log('Verification lacero:', lacero);

    process.exit(0);
}

importTeachers().catch(e => { console.error(e); process.exit(1); });
