const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'views', 'admin', 'dashboard.ejs');
console.log('Target file:', targetFile);

let content = fs.readFileSync(targetFile, 'utf8');

// We want to find the line containing "</div><!-- end admin-container -->"
// and the switchSub function that immediately follows it, and replace that area.
const searchPattern = /<\/div><!-- end admin-container -->\s*\/\/ ── Sub-section switching \(inside Contenidos Globales\) ──\s*function switchSub\(name\) \{\s*document\.querySelectorAll\('\.sub-section'\)\.forEach\(el => el\.classList\.remove\('active'\)\);\s*document\.querySelectorAll\('\.sub-nav-btn'\)\.forEach\(el => el\.classList\.remove\('active'\)\);\s*document\.getElementById\('sub-' \+ name\)\.classList\.add\('active'\);\s*document\.getElementById\('sub-btn-' \+ name\)\.classList\.add\('active'\);\s*\}/;

const replacement = `</div><!-- end admin-container -->

    <script>
        // ── Main tab switching ──
        function switchMainTab(name) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            const contentEl = document.getElementById('maintab-' + name);
            if (contentEl) contentEl.classList.add('active');
            
            const btnEl = document.getElementById('mainTab-' + name);
            if (btnEl) btnEl.classList.add('active');
            
            // Sync with sidebar active state
            updateSidebarActive(name);
            
            if (name === 'monitoreo') {
                loadAllKpis();
                loadKmkStats();
                loadMultimediaStats();
                loadReto0Stats();
            } else if (name === 'executive') {
                refreshExecutiveData();
            } else if (name === 'inventory') {
                loadInventoryDevices();
            }
        }

        // ── Sidebar active sync ──
        function updateSidebarActive(tabName, subName = null) {
            // Remove active classes from links
            document.querySelectorAll('.sidebar .menu-link, .sidebar .submenu-link').forEach(el => {
                el.classList.remove('active');
            });
            // Reset other submenus
            document.querySelectorAll('.sidebar .submenu').forEach(el => {
                if (el.id !== 'submenu-' + tabName) {
                    el.classList.remove('open');
                    el.parentElement.classList.remove('open');
                }
            });

            if (tabName === 'executive') {
                const el = document.getElementById('menu-executive');
                if (el) el.classList.add('active');
            } else if (tabName === 'inventory') {
                const el = document.getElementById('menu-inventory');
                if (el) el.classList.add('active');
            } else if (tabName === 'contenidos') {
                const group = document.getElementById('menu-group-contenidos');
                if (group) group.classList.add('active');
                const sub = document.getElementById('submenu-contenidos');
                if (sub) {
                    sub.classList.add('open');
                    sub.parentElement.classList.add('open');
                }
                if (subName) {
                    const subLink = document.getElementById('submenu-' + subName);
                    if (subLink) subLink.classList.add('active');
                }
            } else if (tabName === 'monitoreo') {
                const group = document.getElementById('menu-group-monitoreo');
                if (group) group.classList.add('active');
                const sub = document.getElementById('submenu-monitoreo');
                if (sub) {
                    sub.classList.add('open');
                    sub.parentElement.classList.add('open');
                }
            }
        }

        // ── Load all 4 KPI cards with real data ──
        async function loadAllKpis() {
            // KPI 1: Integration (students with >=1 multimedia evidence)
            try {
                const res1 = await fetch('/api/admin/multimedia-stats');
                const d1 = await res1.json();
                if (d1.success) {
                    const allStudentIds = new Set();
                    d1.stats.forEach(s => s.products.forEach(p => allStudentIds.add(p.student_id)));
                    const pct = d1.totalStudents > 0 ? Math.round((allStudentIds.size / d1.totalStudents) * 100) : 0;
                    document.getElementById('kpi-integration-pct').textContent = pct + '%';
                }
            } catch(e) {
                document.getElementById('kpi-integration-pct').textContent = '—';
            }

            // KPI 2: KMK Teacher Certification
            try {
                const res2 = await fetch('/api/admin/teachers-status');
                const d2 = await res2.json();
                if (d2.success) {
                    const pct = d2.total > 0 ? Math.round((d2.certified / d2.total) * 100) : 0;
                    document.getElementById('kpi-kmk-pct').textContent = pct + '%';
                }
            } catch(e) {
                document.getElementById('kpi-kmk-pct').textContent = '—';
            }
        }

        // ── Sub-section switching (inside Contenidos Globales) ──
        function switchSub(name) {
            document.querySelectorAll('.sub-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.sub-nav-btn').forEach(el => el.classList.remove('active'));
            
            const secEl = document.getElementById('sub-' + name);
            if (secEl) secEl.classList.add('active');
            
            const btnEl = document.getElementById('sub-btn-' + name);
            if (btnEl) btnEl.classList.add('active');
            
            updateSidebarActive('contenidos', name);
        }`;

if (searchPattern.test(content)) {
    content = content.replace(searchPattern, replacement);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('SUCCESS: Replaced routing functions successfully!');
} else {
    console.log('ERROR: Pattern not found! Trying simpler split-based replacement.');
    // Let's try split-based
    const splitStr = '</div><!-- end admin-container -->';
    const idx = content.indexOf(splitStr);
    if (idx !== -1) {
        const pre = content.substring(0, idx + splitStr.length);
        const post = content.substring(idx + splitStr.length);
        // Find next closing brace of switchSub
        const subSubSearch = 'function switchSub(name) {';
        const subSubIdx = post.indexOf(subSubSearch);
        if (subSubIdx !== -1) {
            const nextClosingBraceIdx = post.indexOf('}', subSubIdx);
            if (nextClosingBraceIdx !== -1) {
                const finalPost = post.substring(nextClosingBraceIdx + 1);
                fs.writeFileSync(targetFile, pre + '\n\n' + replacement + '\n\n' + finalPost.trimStart(), 'utf8');
                console.log('SUCCESS: split-based replacement done!');
                process.exit(0);
            }
        }
    }
    console.log('FAILED: split-based replacement failed!');
}
