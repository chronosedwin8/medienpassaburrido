const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const downloadsDir = 'C:\\Users\\lacero\\Downloads';
const files = fs.readdirSync(downloadsDir).filter(f => f.endsWith('.csv'));

for (const file of files) {
    try {
        const wb = xlsx.readFile(path.join(downloadsDir, file));
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(`\n=== ${file} (${data.length} rows) ===`);
        if (data.length > 0) {
            console.log('Headers:', Object.keys(data[0]));
            console.log('Sample:', data.slice(0, 3));
        }
    } catch(e) { console.log(`Error reading ${file}:`, e.message); }
}
