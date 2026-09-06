const fs = require('fs');

// We can read apply_profile_accordion.js and let it save the modified content to scratch/activity_modified.ejs instead of failing
// Let's modify apply_profile_accordion.js temporarily to save to scratch/activity_modified.ejs on failure so we can view it
const script = fs.readFileSync('scratch/apply_profile_accordion.js', 'utf8');
const modifiedScript = script.replace(
    "process.exit(1);",
    "fs.writeFileSync('scratch/activity_modified.ejs', content, 'utf8'); console.log('Saved modified EJS to scratch/activity_modified.ejs for debugging'); process.exit(1);"
);
fs.writeFileSync('scratch/apply_profile_accordion.js', modifiedScript, 'utf8');
console.log('Updated apply_profile_accordion.js to write debug file on fail');
