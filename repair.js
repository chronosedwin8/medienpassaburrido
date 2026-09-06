const fs = require('fs');
let c = fs.readFileSync('server.js', 'utf8');

const targetRegex = /\/\/ ════════════════════════════════════════\r?\n\/\/ INVENTORY ROUTES\r?\n\/\/ ════════════════════════════════════════[\s\S]*?\/\/ ════════════════════════════════════════\r?\n\/\/ TEACHER ROUTES \(PORTAL DOCENTE - CAPACITACIÓN\)/;

const replacement = `// API: Teachers status
app.get('/api/admin/teachers-status', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { data: teachers } = await supabase.from('teachers').select('*');
        const pending = teachers?.filter(t => !t.training_completed) || [];
        
        return res.json({
            success: true,
            total: teachers?.length || 0,
            certified: teachers?.filter(t => t.training_completed)?.length || 0,
            pending: pending.map(t => ({
                name: t.first_name + ' ' + t.last_name,
                subject: t.subject,
                score: t.training_score
            }))
        });
    } catch (e) {
        return res.json({ success: false });
    }
});

// ════════════════════════════════════════
// INVENTORY ROUTES
// ════════════════════════════════════════
app.get('/admin/inventory', requireAdmin, (req, res) => {
    res.render('admin/inventory');
});

app.get('/api/devices', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { location, status } = req.query;
        let query = supabase.from('devices').select('*').order('serial_number');
        
        if (location) query = query.eq('location', location);
        if (status) query = query.eq('status', status);
        
        const { data, error } = await query;
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, devices: data || [] });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.post('/api/devices', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { serial_number, type, brand, model, location, status, notes } = req.body;
        
        const { data, error } = await supabase
            .from('devices')
            .insert({ serial_number, type, brand, model, location, status: status || 'available', notes })
            .select();

        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, device: data?.[0] });
    } catch (e) {
        return res.json({ success: false });
    }
});

app.put('/api/devices/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { serial_number, type, brand, model, location, status, notes } = req.body;
        
        const { error } = await supabase
            .from('devices')
            .update({ serial_number, type, brand, model, location, status, notes })
            .eq('id', req.params.id);

        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true });
    } catch (e) {
        return res.json({ success: false });
    }
});

// API: Update a single record by id in a DB table
app.post('/api/admin/db-records/:table/:id', requireAdmin, async (req, res) => {
    if (!supabase) return res.json({ success: false, message: 'No Supabase' });
    const allowedTables = ['students', 'teachers'];
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
});

// ════════════════════════════════════════
// TEACHER ROUTES (PORTAL DOCENTE - CAPACITACIÓN)`;

c = c.replace(targetRegex, replacement);
fs.writeFileSync('server.js', c);
console.log('Fixed syntax and restored endpoints!');
