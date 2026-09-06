const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const startMarker = "app.post('/teacher/knowledge-test', requireTeacher, async (req, res) => {";
const endMarker = "app.post('/api/incidents', requireTeacher, async (req, res) => {";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.log("Error: markers not found", startIndex, endIndex);
    process.exit(1);
}

const replacement = `app.post('/teacher/knowledge-test', requireTeacher, async (req, res) => {
    const { q1, q2, q3, q4, q5, q6 } = req.body;
    let correct = 0;
    if (q1 === 'C') correct++; 
    if (q2 === 'B') correct++; 
    if (q3 === 'B') correct++; 
    if (q4 === 'C') correct++; 
    if (q5 === 'B') correct++; 
    if (q6 === 'B') correct++; 
    
    const score = Math.round((correct / 6) * 100);
    const passed = score >= 75;

    if (supabase && res.locals.teacher) {
        try {
            await supabase.from('teacher_kmk_tests').insert({
                teacher_id: res.locals.teacher.id,
                score: score,
                passed: passed
            });
            await supabase.from('teachers').update({ 
                training_score: score,
                training_completed: passed
            }).eq('id', res.locals.teacher.id);
        } catch (e) {
            console.error('Error saving kmk test:', e);
        }
    }

    res.render('teacher/knowledge_test', { score: score, passed: passed });
});

app.get('/teacher/logout', (req, res) => {
    res.clearCookie('teacher_auth');
    res.clearCookie('teacher_data');
    res.redirect('/teacher/login');
});

// ════════════════════════════════════════
// PROGRESS DASHBOARD & CHALLENGES PRINT ROUTES
// ════════════════════════════════════════

app.get('/teacher/download-challenges', requireTeacher, (req, res) => {
    res.render('teacher/challenges-print', { sharedProfile, allActivities });
});

app.get('/teacher/progress', requireTeacher, (req, res) => {
    res.render('teacher/progress', { teacher: res.locals.teacher });
});

app.get('/api/teacher/progress/:className', requireTeacher, async (req, res) => {
    const { className } = req.params;
    if (!supabase) return res.status(500).json({ success: false, error: 'No database connection' });

    try {
        const { data: students, error: sErr } = await supabase
            .from('students')
            .select('*')
            .ilike('class_name', className)
            .order('last_name', { ascending: true });

        if (sErr) throw sErr;

        if (!students || students.length === 0) {
            return res.json({ success: true, progress: [] });
        }

        const studentIds = students.map(s => s.id);

        const { data: responses, error: rErr } = await supabase
            .from('activity_responses')
            .select('*')
            .in('student_id', studentIds);

        if (rErr) throw rErr;

        const progressMap = {};
        students.forEach(s => {
            progressMap[s.id] = {
                student: s,
                retos: {
                    0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null
                },
                stars: 0,
                starsCount: 0
            };
        });

        function getRetoNum(actId) {
            if (actId === 'profile') return 0;
            const match = actId.match(/^reto(\\d+)/);
            if (match) return parseInt(match[1]);
            return null;
        }

        responses.forEach(r => {
            const sId = r.student_id;
            if (progressMap[sId]) {
                const rNum = getRetoNum(r.activity_id);
                if (rNum !== null) {
                    progressMap[sId].retos[rNum] = r.data;

                    if (rNum >= 1 && rNum <= 6 && r.data && r.data.star_rating) {
                        const sVal = parseInt(r.data.star_rating);
                        if (!isNaN(sVal) && sVal > 0) {
                            progressMap[sId].stars += sVal;
                            progressMap[sId].starsCount += 1;
                        }
                    }
                }
            }
        });

        const result = Object.values(progressMap).map(item => {
            const avgStars = item.starsCount > 0 ? Math.round(item.stars / item.starsCount) : 0;
            let evalStatus = 'Sin evaluar';
            let evalColor = 'bg-gray-100 text-gray-800';

            if (avgStars >= 4) {
                evalStatus = 'Aprobado (' + avgStars + ' ⭐)';
                evalColor = 'bg-green-100 text-green-800';
            } else if (avgStars >= 2) {
                evalStatus = 'En proceso (' + avgStars + ' ⭐)';
                evalColor = 'bg-yellow-100 text-yellow-800';
            } else if (avgStars === 1) {
                evalStatus = 'Debe mejorar (1 ⭐)';
                evalColor = 'bg-red-100 text-red-800';
            }

            return {
                student: item.student,
                retos: item.retos,
                avgStars: avgStars,
                evalStatus: evalStatus,
                evalColor: evalColor
            };
        });

        res.json({ success: true, progress: result });
    } catch (e) {
        console.error('Error fetching teacher progress:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ════════════════════════════════════════
// TROUBLESHOOTING & BITACORA ROUTES
// ════════════════════════════════════════
app.get('/teacher/troubleshooting', requireTeacher, (req, res) => {
    res.render('teacher/troubleshooting');
});

app.get('/teacher/bitacora', requireTeacher, (req, res) => {
    res.render('teacher/bitacora', { teacher: res.locals.teacher });
});

// API: Incidents (CRUD)
app.get('/api/incidents', requireTeacher, async (req, res) => {
    if (!supabase) return res.json({ success: false });
    try {
        const { status, classroom } = req.query;
        let query = supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(100);
        
        if (status) query = query.eq('status', status);
        if (classroom) query = query.eq('classroom', classroom);
        
        const { data, error } = await query;
        if (error) return res.json({ success: false, message: error.message });
        return res.json({ success: true, incidents: data || [] });
    } catch (e) {
        return res.json({ success: false });
    }
});

`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync('server.js', content, 'utf8');
console.log("server.js patched robustly!");
