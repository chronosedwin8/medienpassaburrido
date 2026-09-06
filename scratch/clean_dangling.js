const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const target = `    const allowedTables = ['students', 'teachers'];
    const { table, id } = req.params;
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ success: false, message: 'Tabla no permitida' });
    }
    try {
        // Remove read-only fields
        const updates = { ...req.body };
        delete updates.id;
        delete updates.created_at;
        const { error } = await supabase.from(table).update(updates).eq('id', id);
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false, message: e.message });
    }
});`;

// Replace targets supporting both CRLF and LF
const targetCrLf = target.replace(/\n/g, '\r\n');

if (code.includes(target)) {
    code = code.replace(target, "");
    fs.writeFileSync('server.js', code, 'utf8');
    console.log("Success: Dangling routes removed (LF)!");
} else if (code.includes(targetCrLf)) {
    code = code.replace(targetCrLf, "");
    fs.writeFileSync('server.js', code, 'utf8');
    console.log("Success: Dangling routes removed (CRLF)!");
} else {
    // Try generic string replace
    const lines = code.split('\n');
    let startIdx = -1;
    let endIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("const allowedTables = ['students', 'teachers'];") && lines[i+1]?.includes("const { table, id } = req.params;")) {
            startIdx = i;
        }
        if (startIdx !== -1 && lines[i].trim() === "});" && i > startIdx && i < startIdx + 20) {
            endIdx = i;
            break;
        }
    }
    if (startIdx !== -1 && endIdx !== -1) {
        lines.splice(startIdx, endIdx - startIdx + 1);
        fs.writeFileSync('server.js', lines.join('\n'), 'utf8');
        console.log("Success: Generic lines spliced!");
    } else {
        console.error("Error: Could not locate dangling routes!");
    }
}
