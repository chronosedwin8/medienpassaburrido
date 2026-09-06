const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'views', 'admin', 'dashboard.ejs');
console.log('Target file:', targetFile);

let content = fs.readFileSync(targetFile, 'utf8');

// We want to locate the closing script tag at the end:
//     async function rejectTeacher(id) {
//         ...
//     }
//     </script>
// </body>

const jsCodeToAppend = `
    // ════════════════════════════════════════
    // EXECUTIVE DASHBOARD TABS LOGIC
    // ════════════════════════════════════════
    let chartKlasseInst, chartSubjectInst;

    async function refreshExecutiveData() {
        const filterPeriodEl = document.getElementById('filterPeriod');
        const filterYearEl = document.getElementById('filterYear');
        if (!filterPeriodEl || !filterYearEl) return;

        const period = filterPeriodEl.value;
        const year = filterYearEl.value;
        
        // Load KPIs
        try {
            const resp = await fetch('/api/admin/kpis');
            const data = await resp.json();
            if (data.success) {
                document.getElementById('kpiStudents').textContent = data.kpis.totalStudents;
                document.getElementById('kpiProgress').textContent = data.kpis.progressRate + '%';
                document.getElementById('kpiTeachers').textContent = data.kpis.teachersCertified + '%';
                document.getElementById('kpiDevices').textContent = data.kpis.totalDevices;
                document.getElementById('kpiIncidents').textContent = data.kpis.openIncidents;
            }
        } catch (e) { console.error('Error loading KPIs:', e); }

        // Load charts
        try {
            const resp = await fetch('/api/admin/progress-by-klasse?year=' + year);
            const data = await resp.json();
            if (data.success) {
                updateKlasseChart(data.data);
            }
        } catch (e) { console.error('Error loading Klasse chart:', e); }

        try {
            const resp = await fetch('/api/admin/progress-by-subject?year=' + year);
            const data = await resp.json();
            if (data.success) {
                updateSubjectChart(data.data);
            }
        } catch (e) { console.error('Error loading Subject chart:', e); }

        // Load no progress students
        try {
            const resp = await fetch('/api/admin/students-without-progress?year=' + year);
            const data = await resp.json();
            if (data.success) {
                renderNoProgressList(data.students);
            }
        } catch (e) { console.error('Error loading no progress:', e); }

        // Load pending teachers
        try {
            const resp = await fetch('/api/admin/teachers-status');
            const data = await resp.json();
            if (data.success) {
                renderPendingTeachers(data.pending);
            }
        } catch (e) { console.error('Error loading teachers:', e); }
    }

    function updateKlasseChart(data) {
        const canvas = document.getElementById('chartKlasse');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (chartKlasseInst) chartKlasseInst.destroy();
        chartKlasseInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.klasse),
                datasets: [{
                    label: '% Progreso',
                    data: data.map(d => d.progress),
                    backgroundColor: data.map(d => d.progress >= 100 ? '#10b981' : d.progress >= 50 ? '#f59e0b' : '#ef4444')
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }

    function updateSubjectChart(data) {
        const canvas = document.getElementById('chartSubject');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (chartSubjectInst) chartSubjectInst.destroy();
        chartSubjectInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.subject),
                datasets: [{
                    label: 'Estudiantes Activos',
                    data: data.map(d => d.count),
                    backgroundColor: ['#dc2626', '#0ea5e9', '#ea580c', '#059669', '#8b5cf6']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    function renderNoProgressList(students) {
        const el = document.getElementById('noProgressList');
        if (!el) return;
        if (!students || students.length === 0) {
            el.innerHTML = '<p style="color:#10b981;"><i class="fas fa-check-circle"></i> ¡Todos los estudiantes tienen progreso!</p>';
            return;
        }
        let html = '<table><thead><tr><th>Estudiante</th><th>Clase</th></tr></thead><tbody>';
        students.slice(0, 10).forEach(s => {
            html += \`<tr><td>\${s.name}</td><td>\${s.class}</td></tr>\`;
        });
        html += '</tbody></table>';
        if (students.length > 10) html += \`<p style="color:#64748b;">...y \${students.length - 10} más</p>\`;
        el.innerHTML = html;
    }

    function renderPendingTeachers(teachers) {
        const el = document.getElementById('pendingTeachersList');
        if (!el) return;
        if (!teachers || teachers.length === 0) {
            el.innerHTML = '<p style="color:#10b981;"><i class="fas fa-check-circle"></i> ¡Todos los docentes están certificados!</p>';
            return;
        }
        let html = '<table><thead><tr><th>Docente</th><th>Materia</th><th>Estado y Sugerencia</th></tr></thead><tbody>';
        teachers.forEach(t => {
            let statusHtml = '<span class="badge badge-warning">Sin iniciar</span>';
            if (t.score !== undefined && t.score !== null && t.score < 75) {
                statusHtml = \`<span class="badge badge-danger">Falló (\${t.score}%) - Revisar contenidos KMK</span>\`;
            } else if (t.score !== undefined && t.score !== null) {
                statusHtml = \`<span class="badge badge-warning">Pendiente (\${t.score}%)</span>\`;
            }
            html += \`<tr><td>\${t.name}</td><td>\${t.subject || 'N/A'}</td><td>\${statusHtml}</td></tr>\`;
        });
        html += '</tbody></table>';
        el.innerHTML = html;
    }

    // ════════════════════════════════════════
    // INVENTORY TABS LOGIC
    // ════════════════════════════════════════
    let editingInventoryDevice = null;

    async function loadInventoryDevices() {
        const locationEl = document.getElementById('filterLocation');
        const statusEl = document.getElementById('filterStatus');
        if (!locationEl || !statusEl) return;

        const location = locationEl.value;
        const status = statusEl.value;
        
        let url = '/api/devices';
        const params = [];
        if (location) params.push('location=' + location);
        if (status) params.push('status=' + status);
        if (params.length) url += '?' + params.join('&');

        try {
            const resp = await fetch(url);
            const result = await resp.json();
            
            const tbody = document.getElementById('devicesTableBody');
            if (!tbody) return;

            if (!result.success || !result.devices.length) {
                tbody.innerHTML = 
                    '<tr><td colspan="7" style="text-align:center; color:#64748b;">No hay equipos registrados</td></tr>';
                updateInventoryStats([]);
                return;
            }

            updateInventoryStats(result.devices);
            
            tbody.innerHTML = result.devices.map(d => \`
                <tr>
                    <td><strong>\${d.serial_number}</strong></td>
                    <td>\${d.type}</td>
                    <td>\${d.brand || ''} \${d.model || ''}</td>
                    <td>\${d.location}</td>
                    <td><span class="badge badge-\${d.status}">\${getInventoryStatusLabel(d.status)}</span></td>
                    <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis;">\${d.notes || '—'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openInventoryEditModal(\${JSON.stringify(d).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            \`).join('');
        } catch (e) {
            console.error('Error loading devices:', e);
            showToast('Error al cargar equipos', true);
        }
    }

    function updateInventoryStats(devices) {
        const total = devices.length;
        const available = devices.filter(d => d.status === 'available').length;
        const assigned = devices.filter(d => d.status === 'assigned').length;
        const maintenance = devices.filter(d => d.status === 'maintenance' || d.status === 'broken').length;
        
        const statTotal = document.getElementById('statTotal');
        const statAvailable = document.getElementById('statAvailable');
        const statAssigned = document.getElementById('statAssigned');
        const statMaintenance = document.getElementById('statMaintenance');

        if (statTotal) statTotal.textContent = total;
        if (statAvailable) statAvailable.textContent = available;
        if (statAssigned) statAssigned.textContent = assigned;
        if (statMaintenance) statMaintenance.textContent = maintenance;
    }

    function getInventoryStatusLabel(status) {
        const labels = {
            'available': 'Disponible',
            'assigned': 'Asignado',
            'maintenance': 'En Mantenimiento',
            'broken': 'Dañado'
        };
        return labels[status] || status;
    }

    function openInventoryAddModal() {
        editingInventoryDevice = null;
        const modal = document.getElementById('deviceModal');
        if (!modal) return;

        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Agregar Equipo';
        document.getElementById('deviceForm').reset();
        document.getElementById('deviceId').value = '';
        modal.classList.add('active');
    }

    function openInventoryEditModal(device) {
        editingInventoryDevice = device;
        const modal = document.getElementById('deviceModal');
        if (!modal) return;

        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Equipo';
        document.getElementById('deviceId').value = device.id;
        document.getElementById('serial_number').value = device.serial_number;
        document.getElementById('type').value = device.type;
        document.getElementById('brand').value = device.brand || '';
        document.getElementById('model').value = device.model || '';
        document.getElementById('location').value = device.location;
        document.getElementById('status').value = device.status;
        document.getElementById('notes').value = device.notes || '';
        modal.classList.add('active');
    }

    function closeInventoryModal() {
        const modal = document.getElementById('deviceModal');
        if (modal) modal.classList.remove('active');
    }

    // Attach inventory form listener on load
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('deviceForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const device = {
                    serial_number: document.getElementById('serial_number').value,
                    type: document.getElementById('type').value,
                    brand: document.getElementById('brand').value || null,
                    model: document.getElementById('model').value || null,
                    location: document.getElementById('location').value,
                    status: document.getElementById('status').value,
                    notes: document.getElementById('notes').value || null
                };

                const id = document.getElementById('deviceId').value;
                const url = id ? '/api/devices/' + id : '/api/devices';
                const method = id ? 'PUT' : 'POST';

                try {
                    const resp = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(device)
                    });
                    const result = await resp.json();
                    
                    if (result.success) {
                        showToast(id ? 'Equipo actualizado' : 'Equipo agregado');
                        closeInventoryModal();
                        loadInventoryDevices();
                    } else {
                        showToast(result.message || 'Error', true);
                    }
                } catch (e) {
                    showToast('Error de conexión', true);
                }
            });
        }
    });
`;

const marker = '    </script>';
const lastIndex = content.lastIndexOf(marker);

if (lastIndex !== -1) {
    const pre = content.substring(0, lastIndex);
    const post = content.substring(lastIndex);
    
    fs.writeFileSync(targetFile, pre + jsCodeToAppend + post, 'utf8');
    console.log('SUCCESS: JS Code appended successfully!');
} else {
    console.log('ERROR: Closing script tag marker not found!');
}
