const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Regex to find and remove the duplicate get and post db-records routes
const regex = /\/\/ API: Get database records \(students or teachers table\)[\s\S]*?\/\/ API: Update a single record by id in a DB table[\s\S]*?app\.post\('\/api\/admin\/db-records\/:table\/:id', requireAdmin, async \(req, res\) => \{[\s\S]*?\}\);/;

if (regex.test(code)) {
    code = code.replace(regex, "");
    fs.writeFileSync('server.js', code, 'utf8');
    console.log("Success: Duplicate routes removed from server.js!");
} else {
    console.error("Error: Could not find duplicate routes using regex!");
}
