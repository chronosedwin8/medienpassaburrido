require('dotenv').config();
const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

async function test() {
    console.log("=== Testing Teacher Saving & Role Lookup ===");
    
    const email = "TestTeacher@colegioaleman.edu.co";
    const cleanEmail = email.trim().toLowerCase();
    
    // Simulate openDbAdd / saveDbRecord calculation
    const updates = {
        first_name: "Test",
        last_name: "Teacher",
        email: cleanEmail,
        doc_number: "999999",
        id: 'teacher_' + cleanEmail,
        subject: ''
    };
    
    console.log("Teacher data payload to insert/update:", updates);
    
    if (supabase) {
        // Delete if exists
        await supabase.from('teachers').delete().eq('id', updates.id);
        
        // Insert
        const { data, error } = await supabase.from('teachers').insert(updates).select();
        if (error) {
            console.error("❌ Supabase Insertion Error:", error.message);
        } else {
            console.log("✅ Supabase Insertion Success:", data);
        }
        
        // Simulate assigning role
        const role = "directivo";
        const rolesPath = path.join(__dirname, '..', 'data', 'teacher_roles.json');
        let currentRoles = {};
        if (fs.existsSync(rolesPath)) {
            currentRoles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
        }
        
        // Store in lowercase
        currentRoles[cleanEmail] = role;
        fs.writeFileSync(rolesPath, JSON.stringify(currentRoles, null, 2), 'utf8');
        console.log(`✅ Role directivo saved in JSON for: ${cleanEmail}`);
        
        // Verify Lookup
        const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
        const resolvedRole = roles[email.toLowerCase()] || 'profesor';
        console.log(`resolvedRole for ${email}: ${resolvedRole}`);
        if (resolvedRole === 'directivo') {
            console.log("✅ Case-insensitive Lookup Success!");
        } else {
            console.error("❌ Case-insensitive Lookup Failed!");
        }
        
        // Clean up
        await supabase.from('teachers').delete().eq('id', updates.id);
        delete currentRoles[cleanEmail];
        fs.writeFileSync(rolesPath, JSON.stringify(currentRoles, null, 2), 'utf8');
        console.log("🧹 Cleaned up test data.");
    } else {
        console.log("Supabase not connected. Skipping DB test.");
    }
}

test();
