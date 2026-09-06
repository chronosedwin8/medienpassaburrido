const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'views', 'admin', 'dashboard.ejs');
console.log('Reading from:', targetFile);

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add sidebar.css and Chart.js to the head
const headTarget = '<link rel="stylesheet" href="/css/style.css">';
const headReplacement = '<link rel="stylesheet" href="/css/style.css">\n    <link rel="stylesheet" href="/css/sidebar.css">\n    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';

if (content.includes(headTarget)) {
    content = content.replace(headTarget, headReplacement);
    console.log('SUCCESS: Injected CSS/JS in head');
} else {
    console.log('ERROR: headTarget not found!');
}

// 2. Add custom CSS rules for executive and inventory right before </style>
const styleEndTarget = '    </style>';
const customCSS = `
        /* ── Executive Dashboard Styles ── */
        .exec-container { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px; margin-bottom: 24px;
        }
        .kpi-card {
            background: white; border-radius: 16px; padding: 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .kpi-card .icon { font-size: 2em; margin-bottom: 10px; }
        .kpi-card .value { font-size: 2.5em; font-weight: 800; color: var(--admin-primary); }
        .kpi-card .label { color: #64748b; font-size: 0.9em; }
        .kpi-card.success .value { color: #10b981; }
        .kpi-card.warning .value { color: #f59e0b; }
        .kpi-card.danger .value { color: #ef4444; }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px; margin-bottom: 24px;
        }
        .chart-card {
            background: white; border-radius: 16px; padding: 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .chart-card h3 { margin: 0 0 16px; color: #1e1b4b; }
        
        .tables-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        .table-card {
            background: white; border-radius: 16px; padding: 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }
        .table-card h3 { margin: 0 0 16px; color: #1e1b4b; }
        .exec-container table { width: 100%; border-collapse: collapse; }
        .exec-container th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 0.8em; text-transform: uppercase; color: #64748b; }
        .exec-container td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        
        .filters { background: white; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .filters select, .filters button {
            padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.9em;
        }
        .filters button { background: var(--admin-primary); color: white; border: none; cursor: pointer; }
        .filters button:hover { background: #4338ca; }
        
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.8em; font-weight: 600; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }

        /* ── Inventory Styles ── */
        .inv-container { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .card h2 { margin: 0 0 16px; color: #1e1b4b; display: flex; align-items: center; gap: 10px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .stat-card .num { font-size: 2em; font-weight: 800; }
        .stat-card .label { color: #64748b; font-size: 0.85em; }
        .stat-card.total { border-left: 4px solid #4f46e5; }
        .stat-card.available { border-left: 4px solid #10b981; }
        .stat-card.assigned { border-left: 4px solid #f59e0b; }
        .stat-card.maintenance { border-left: 4px solid #ef4444; }
        
        .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
        .filter-bar select, .filter-bar input { padding: 8px 14px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.9em; }
        .filter-bar button { padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; }
        
        .inv-container table { width: 100%; border-collapse: collapse; }
        .inv-container th { background: #f8fafc; padding: 12px; text-align: left; font-size: 0.8em; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        .inv-container td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .inv-container tr:hover { background: #fafbfe; }
        
        .badge-available { background: #d1fae5; color: #065f46; }
        .badge-assigned { background: #fef3c7; color: #92400e; }
        .badge-maintenance { background: #fee2e2; color: #991b1b; }
        .badge-broken { background: #991b1b; color: white; }
        
        .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1100; justify-content: center; align-items: center; }
        .modal.active { display: flex; }
        .modal-content { background: white; border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; }
        .modal h3 { margin: 0 0 16px; }
        .form-group { margin-bottom: 12px; }
        .form-group label { display: block; font-weight: 600; color: #475569; margin-bottom: 6px; font-size: 0.9em; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    </style>`;

// Replace last occurrence of styleEndTarget
const lastStyleIdx = content.lastIndexOf(styleEndTarget);
if (lastStyleIdx !== -1) {
    content = content.substring(0, lastStyleIdx) + customCSS + content.substring(lastStyleIdx + styleEndTarget.length);
    console.log('SUCCESS: Injected CSS styles in style block');
} else {
    console.log('ERROR: styleEndTarget not found!');
}

// 3. Replace header, tabs, and sub-nav with sidebar and container start
// Find from "<body>" to the end of "<div class="sub-nav no-print">...</div>"
const bodyStart = '<body>';
const subNavEnd = '</div>\r\n\r\n            <!-- ── SUB: ESTUDIANTES ── -->';
const subNavEnd2 = '</div>\n\n            <!-- ── SUB: ESTUDIANTES ── -->';

let bodyIdx = content.indexOf(bodyStart);
let subNavIdx = content.indexOf(subNavEnd);
let usingUnixEndings = false;

if (subNavIdx === -1) {
    subNavIdx = content.indexOf(subNavEnd2);
    usingUnixEndings = true;
}

if (bodyIdx !== -1 && subNavIdx !== -1) {
    const endOffset = usingUnixEndings ? subNavEnd2.indexOf('\n') : subNavEnd.indexOf('\r');
    const cutIdx = subNavIdx + endOffset;
    
    const pre = content.substring(0, bodyIdx + bodyStart.length);
    const post = content.substring(cutIdx);
    
    content = pre + `
    <%- include(\'../partials/sidebar\', { context: \'admin\', activeItem: \'executive\' }) %>

    <div class="admin-container">
        <!-- ═══════════ MAIN TAB: CONTENIDOS GLOBALES ═══════════ -->
        <div class="tab-content active" id="maintab-contenidos">
            <div class="sub-nav no-print" style="display: none !important;">
                <button class="sub-nav-btn active" id="sub-btn-students" onclick="switchSub(\'students\')">Estudiantes</button>
            </div>
    ` + post;
    console.log('SUCCESS: Replaced header, tabs, and sub-nav with sidebar');
} else {
    console.log('ERROR: bodyStart or subNavEnd not found!');
}

// 4. Inject IDs in Monitoreo cards
content = content.replace('<!-- KPI Metas Institucionales -->\r\n            <div class="admin-card">', '<!-- KPI Metas Institucionales -->\r\n            <div class="admin-card" id="kpi-goals-card">');
content = content.replace('<!-- KPI Metas Institucionales -->\n            <div class="admin-card">', '<!-- KPI Metas Institucionales -->\n            <div class="admin-card" id="kpi-goals-card">');

content = content.replace('<!-- ═══ BLOQUE A: CAPACITACIÓN KMK x DOCENTE ═══ -->\r\n            <div class="admin-card">', '<!-- ═══ BLOQUE A: CAPACITACIÓN KMK x DOCENTE ═══ -->\r\n            <div class="admin-card" id="kmk-docente-card">');
content = content.replace('<!-- ═══ BLOQUE A: CAPACITACIÓN KMK x DOCENTE ═══ -->\n            <div class="admin-card">', '<!-- ═══ BLOQUE A: CAPACITACIÓN KMK x DOCENTE ═══ -->\n            <div class="admin-card" id="kmk-docente-card">');

content = content.replace('<!-- Reporte de Grupos por Docente -->\r\n            <div class="admin-card">', '<!-- Reporte de Grupos por Docente -->\r\n            <div class="admin-card" id="grupos-docente-card">');
content = content.replace('<!-- Reporte de Grupos por Docente -->\n            <div class="admin-card">', '<!-- Reporte de Grupos por Docente -->\n            <div class="admin-card" id="grupos-docente-card">');

content = content.replace('<!-- Matriz Global Klassen vs Materias -->\r\n            <div class="admin-card">', '<!-- Matriz Global Klassen vs Materias -->\r\n            <div class="admin-card" id="matriz-global-card">');
content = content.replace('<!-- Matriz Global Klassen vs Materias -->\n            <div class="admin-card">', '<!-- Matriz Global Klassen vs Materias -->\n            <div class="admin-card" id="matriz-global-card">');

content = content.replace('<!-- ═══ BLOQUE B: PRODUCTOS MULTIMEDIA ═══ -->\r\n            <div class="admin-card">', '<!-- ═══ BLOQUE B: PRODUCTOS MULTIMEDIA ═══ -->\r\n            <div class="admin-card" id="productos-multimedia-card">');
content = content.replace('<!-- ═══ BLOQUE B: PRODUCTOS MULTIMEDIA ═══ -->\n            <div class="admin-card">', '<!-- ═══ BLOQUE B: PRODUCTOS MULTIMEDIA ═══ -->\n            <div class="admin-card" id="productos-multimedia-card">');

content = content.replace('<!-- Indicadores PSP por Estudiante -->\r\n            <div class="admin-card">', '<!-- Indicadores PSP por Estudiante -->\r\n            <div class="admin-card" id="psp-estudiante-card">');
content = content.replace('<!-- Indicadores PSP por Estudiante -->\n            <div class="admin-card">', '<!-- Indicadores PSP por Estudiante -->\n            <div class="admin-card" id="psp-estudiante-card">');

content = content.replace('<!-- ═══ BLOQUE C: RETO 0 - DIAGNÓSTICO ESTUDIANTIL ═══ -->\r\n            <div class="admin-card">', '<!-- ═══ BLOQUE C: RETO 0 - DIAGNÓSTICO ESTUDIANTIL ═══ -->\r\n            <div class="admin-card" id="reto0-diagnostico-card">');
content = content.replace('<!-- ═══ BLOQUE C: RETO 0 - DIAGNÓSTICO ESTUDIANTIL ═══ -->\n            <div class="admin-card">', '<!-- ═══ BLOQUE C: RETO 0 - DIAGNÓSTICO ESTUDIANTIL ═══ -->\n            <div class="admin-card" id="reto0-diagnostico-card">');

console.log('SUCCESS: Injected CSS IDs in Monitoreo cards');

// 5. Inject the HTML for Executive and Inventory tabs at the end of monitoreo tab
const monitoreoEnd = '<!-- END MONITOREO INDICADORES -->';
const containerEnd = '</div><!-- end admin-container -->';

const monitoreoEndIdx = content.indexOf(monitoreoEnd);
if (monitoreoEndIdx !== -1) {
    const injectHTML = `
        <!-- ═══════════ MAIN TAB: DASHBOARD EJECUTIVO ═══════════ -->
        <div class="tab-content" id="maintab-executive">
            <div class="exec-container">
                <!-- Filters -->
                <div class="filters">
                    <label><strong>Periodo:</strong></label>
                    <select id="filterPeriod">
                        <option value="all">Todos</option>
                        <option value="1">Periodo 1</option>
                        <option value="2">Periodo 2</option>
                        <option value="3">Periodo 3</option>
                        <option value="4">Periodo 4</option>
                    </select>
                    <label><strong>Año:</strong></label>
                    <select id="filterYear">
                        <option value="2627">2026/2027</option>
                        <option value="2526">2025/2026</option>
                    </select>
                    <button onclick="refreshExecutiveData()"><i class="fas fa-sync-alt"></i> Actualizar</button>
                    <button onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
                </div>

                <!-- KPI Cards -->
                <div class="kpi-grid">
                    <div class="kpi-card">
                        <div class="icon">👥</div>
                        <div class="value" id="kpiStudents">0</div>
                        <div class="label">Estudiantes Registrados</div>
                    </div>
                    <div class="kpi-card success">
                        <div class="icon">✅</div>
                        <div class="value" id="kpiProgress">0%</div>
                        <div class="label">Con productos/periodo (Meta: 100%)</div>
                    </div>
                    <div class="kpi-card success">
                        <div class="icon">🎓</div>
                        <div class="value" id="kpiTeachers">0%</div>
                        <div class="label">Docentes Certificados (Meta: 100%)</div>
                    </div>
                    <div class="kpi-card">
                        <div class="icon">💻</div>
                        <div class="value" id="kpiDevices">0</div>
                        <div class="label">Equipos Registrados</div>
                    </div>
                    <div class="kpi-card warning">
                        <div class="icon">⚠️</div>
                        <div class="value" id="kpiIncidents">0</div>
                        <div class="label">Novedades Abiertas</div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3><i class="fas fa-chart-bar"></i> Progreso por Klasse (K3-K9)</h3>
                        <canvas id="chartKlasse" height="200"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3><i class="fas fa-chart-bar"></i> Progreso por Materia</h3>
                        <canvas id="chartSubject" height="200"></canvas>
                    </div>
                </div>

                <!-- Tables -->
                <div class="tables-grid">
                    <div class="table-card">
                        <h3><i class="fas fa-exclamation-triangle"></i> Estudiantes sin Progreso</h3>
                        <div id="noProgressList">
                            <p style="color:#64748b;">Cargando...</p>
                        </div>
                    </div>
                    <div class="table-card">
                        <h3><i class="fas fa-chalkboard-teacher"></i> Docentes Pendientes de Certificación</h3>
                        <div id="pendingTeachersList">
                            <p style="color:#64748b;">Cargando...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════ MAIN TAB: INVENTARIO ═══════════ -->
        <div class="tab-content" id="maintab-inventory">
            <div class="inv-container">
                <!-- Stats -->
                <div class="stats-grid">
                    <div class="stat-card total">
                        <div class="num" id="statTotal">0</div>
                        <div class="label">Total Equipos</div>
                    </div>
                    <div class="stat-card available">
                        <div class="num" id="statAvailable">0</div>
                        <div class="label">Disponibles</div>
                    </div>
                    <div class="stat-card assigned">
                        <div class="num" id="statAssigned">0</div>
                        <div class="label">Asignados</div>
                    </div>
                    <div class="stat-card maintenance">
                        <div class="num" id="statMaintenance">0</div>
                        <div class="label">En Mantenimiento</div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card">
                    <div class="filter-bar">
                        <select id="filterLocation" onchange="loadInventoryDevices()">
                            <option value="">Todos los salones</option>
                            <option value="AM1">Aula Móvil 1</option>
                            <option value="AM2">Aula Móvil 2</option>
                            <option value="C11">C11</option>
                            <option value="C12">C12</option>
                            <option value="Chomsky">Chomsky</option>
                            <option value="Biblioteca">Biblioteca</option>
                        </select>
                        <select id="filterStatus" onchange="loadInventoryDevices()">
                            <option value="">Todos los estados</option>
                            <option value="available">Disponible</option>
                            <option value="assigned">Asignado</option>
                            <option value="maintenance">En Mantenimiento</option>
                            <option value="broken">Dañado</option>
                        </select>
                        <button onclick="openInventoryAddModal()"><i class="fas fa-plus"></i> Agregar Equipo</button>
                        <button onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
                    </div>

                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Serial</th>
                                <th>Tipo</th>
                                <th>Marca/Modelo</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th>Notas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="devicesTableBody">
                            <tr><td colspan="7" style="text-align:center; color:#64748b;">Cargando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal Agregar/Editar Equipos -->
            <div class="modal" id="deviceModal">
                <div class="modal-content">
                    <h3 id="modalTitle"><i class="fas fa-plus"></i> Agregar Equipo</h3>
                    <form id="deviceForm">
                        <input type="hidden" id="deviceId">
                        <div class="form-group">
                            <label>Serial Number *</label>
                            <input type="text" id="serial_number" required placeholder="Ej: DSB-STU-001">
                        </div>
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select id="type" required>
                                <option value="laptop">Laptop</option>
                                <option value="tablet">Tablet</option>
                                <option value="proyector">Proyector</option>
                                <option value="audifonos">Audífonos</option>
                                <option value="teclado">Teclado</option>
                                <option value="mouse">Mouse</option>
                                <option value="cargador">Cargador</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Marca</label>
                            <input type="text" id="brand" placeholder="Ej: Dell">
                        </div>
                        <div class="form-group">
                            <label>Modelo</label>
                            <input type="text" id="model" placeholder="Ej: Latitude 3320">
                        </div>
                        <div class="form-group">
                            <label>Ubicación *</label>
                            <select id="location" required>
                                <option value="AM1">Aula Móvil 1</option>
                                <option value="AM2">Aula Móvil 2</option>
                                <option value="C11">C11</option>
                                <option value="C12">C12</option>
                                <option value="Chomsky">Chomsky</option>
                                <option value="Biblioteca">Biblioteca</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <select id="status">
                                <option value="available">Disponible</option>
                                <option value="assigned">Asignado</option>
                                <option value="maintenance">En Mantenimiento</option>
                                <option value="broken">Dañado</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <input type="text" id="notes" placeholder="Ej: Estudiante 1">
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn" style="background:#e2e8f0; border: none; padding: 10px 20px; border-radius: 10px;" onclick="closeInventoryModal()">Cancelar</button>
                            <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Insert right before containerEnd which follows monitoreoEnd
    const targetIdx = content.indexOf(containerEnd, monitoreoEndIdx);
    if (targetIdx !== -1) {
        content = content.substring(0, targetIdx) + injectHTML + content.substring(targetIdx);
        console.log('SUCCESS: Injected tabs HTML');
    } else {
        console.log('ERROR: containerEnd not found after monitoreoEnd!');
    }
} else {
    console.log('ERROR: monitoreoEnd not found!');
}

// 6. Replace switchMainTab, switchSub, and add updateSidebarActive
const switchMainTabDef = 'function switchMainTab(name) {';
const switchMainTabIdx = content.indexOf(switchMainTabDef);

if (switchMainTabIdx !== -1) {
    // Find where switchSub ends: we can replace from switchMainTabDef to switchSub's end.
    const switchSubDef = 'function switchSub(name) {';
    const switchSubIdx = content.indexOf(switchSubDef, switchMainTabIdx);
    if (switchSubIdx !== -1) {
        const nextClosingBraceIdx = content.indexOf('}', switchSubIdx);
        if (nextClosingBraceIdx !== -1) {
            const cutStart = switchMainTabIdx;
            const cutEnd = nextClosingBraceIdx + 1;
            
            const replacementJS = `function switchMainTab(name) {
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
            
            content = content.substring(0, cutStart) + replacementJS + content.substring(cutEnd);
            console.log('SUCCESS: Replaced routing functions');
        }
    }
} else {
    console.log('ERROR: switchMainTabDef not found!');
}

// 7. Append tab logic JS to the end of the script tag
const endScriptMarker = '    </script>\r\n\r\n    <!-- Modal de Perfil del Estudiante -->';
const endScriptMarker2 = '    </script>\n\n    <!-- Modal de Perfil del Estudiante -->';

let markerIdx = content.indexOf(endScriptMarker);
let usingUnixEndScript = false;

if (markerIdx === -1) {
    markerIdx = content.indexOf(endScriptMarker2);
    usingUnixEndScript = true;
}

if (markerIdx !== -1) {
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
    
    const pre = content.substring(0, markerIdx);
    const post = content.substring(markerIdx);
    content = pre + jsCodeToAppend + post;
    console.log('SUCCESS: Appended tab logic JS');
} else {
    console.log('ERROR: endScriptMarker not found!');
}

// 8. Set default tab to executive on DomContentLoaded
const rejectTeacherDef = 'async function rejectTeacher(id) {';
const rejectTeacherIdx = content.indexOf(rejectTeacherDef);
if (rejectTeacherIdx !== -1) {
    const closingScriptIdx = content.indexOf('</script>', rejectTeacherIdx);
    if (closingScriptIdx !== -1) {
        const pre = content.substring(0, closingScriptIdx);
        const post = content.substring(closingScriptIdx);
        content = pre + `
    // Set default tab on load
    document.addEventListener('DOMContentLoaded', () => {
        switchMainTab('executive');
    });
` + post;
        console.log('SUCCESS: Set default tab to executive');
    }
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('SUCCESS: All changes applied successfully to dashboard.ejs!');
