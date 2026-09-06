const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../views/admin/dashboard.ejs');
let content = fs.readFileSync(filePath, 'utf8');

const startStr = "let dbCurrentTable = null;";
const endStr = "function cancelDbEdit() {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = `let dbCurrentTable = null;
        let dbEditingRecord = null;
        let adminTeacherRolesMap = {};

        async function loadDbTable(table) {
            dbCurrentTable = table;
            const loading = document.getElementById('dbLoadingMsg');
            const area = document.getElementById('dbEditorArea');
            const title = document.getElementById('dbTableTitle');
            area.style.display = 'none';
            loading.style.display = 'block';
            cancelDbEdit();
            try {
                if (table === 'teachers') {
                    try {
                        const rRes = await fetch('/api/admin/teacher-roles');
                        const rData = await rRes.json();
                        if (rData.success) adminTeacherRolesMap = rData.roles || {};
                    } catch(e){}
                }

                const res = await fetch('/api/admin/db-records/' + table);
                const result = await res.json();
                loading.style.display = 'none';
                if (!result.success) return showToast('Error: ' + result.message, true);
                
                const records = result.records || [];
                area.style.display = 'block';
                title.innerHTML = \`<i class="fas fa-table"></i> Tabla: <strong>\${table}</strong> — \${records.length} registros\`;
                
                if (records.length === 0) {
                    document.getElementById('dbTableHead').innerHTML = '';
                    document.getElementById('dbTableBody').innerHTML = '<tr><td>No hay registros</td></tr>';
                    document.getElementById('dbAddBtn').style.display = 'inline-block'; // Allow adding to empty table
                    return;
                }

                document.getElementById('dbAddBtn').style.display = 'inline-block';

                // Build header from first record keys
                const keys = Object.keys(records[0]);
                const displayKeys = keys.filter(k => !['password', 'doc_number'].includes(k));
                let headHtml = '<tr>' + displayKeys.map(k => \`<th>\${k}</th>\`).join('');
                if (table === 'teachers') headHtml += '<th>Rol Extra</th>';
                headHtml += '<th>Acciones</th></tr>';
                document.getElementById('dbTableHead').innerHTML = headHtml;

                // Build rows
                let rows = '';
                records.forEach((rec, idx) => {
                    let rowHtml = \`<tr data-idx="\${idx}">\` + 
                        displayKeys.map(k => {
                            const val = rec[k] != null ? String(rec[k]) : '—';
                            return \`<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="\${val}">\${val}</td>\`;
                        }).join('');
                    
                    if (table === 'teachers') {
                        const extraRole = adminTeacherRolesMap[rec.email] || 'profesor';
                        let badgeBg = '#64748b';
                        if (extraRole === 'desarrollador') badgeBg = '#9333ea';
                        else if (extraRole === 'coordinador') badgeBg = '#2563eb';
                        else if (extraRole === 'directivo') badgeBg = '#059669';
                        rowHtml += \`<td><span style="background:\${badgeBg}; color:white; padding:4px 10px; border-radius:12px; font-size:0.8em; font-weight:bold; text-transform:uppercase; display:inline-block;">\${extraRole}</span></td>\`;
                    }

                    rowHtml += \`<td style="white-space:nowrap;">
                            <button class="btn btn-sm" style="background:#6366f1;color:white;margin-right:4px;" onclick='openDbEdit(\${JSON.stringify(rec)})'><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm" style="background:#ef4444;color:white;" onclick="deleteDbRecord('\${rec.id}')"><i class="fas fa-trash"></i></button>
                        </td></tr>\`;
                    rows += rowHtml;
                });
                document.getElementById('dbTableBody').innerHTML = rows;
            } catch(e) {
                loading.style.display = 'none';
                showToast('Error de conexión', true);
            }
        }

        async function deleteDbRecord(id) {
            if (!confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se endeshacer.')) return;
            try {
                const res = await fetch(\`/api/admin/db-records/\${dbCurrentTable}/\${id}\`, { method: 'DELETE' });
                const result = await res.json();
                if (result.success) {
                    showToast('✅ Registro eliminado');
                    loadDbTable(dbCurrentTable);
                } else {
                    showToast('Error: ' + result.message, true);
                }
            } catch(e) { showToast('Error de conexión', true); }
        }

        function openDbAdd() {
            dbEditingRecord = null; // null means CREATE
            const form = document.getElementById('dbEditForm');
            const fields = document.getElementById('dbEditFields');
            const cancelBtn = document.getElementById('dbCancelEdit');
            const title = document.getElementById('dbEditTitle');
            
            title.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Registro en ' + dbCurrentTable;
            
            // Get typical fields for this table from an existing record if possible
            const rows = document.querySelectorAll('#dbTableHead th');
            const tableFields = [];
            rows.forEach(th => { if (th.textContent !== 'Acciones') tableFields.push(th.textContent); });

            // Default fields if table is empty
            const defaultFields = {
                students: ['username', 'full_name', 'nombre', 'apellido1', 'apellido2', 'class_name', 'student_code'],
                teachers: ['first_name', 'last_name', 'email', 'doc_number', 'subject'],
                devices: ['serial_number', 'type', 'brand', 'model', 'location', 'status'],
                incidents: ['device_id', 'reported_by', 'description', 'status']
            };

            const fieldsToShow = tableFields.length > 0 ? tableFields : (defaultFields[dbCurrentTable] || []);
            const readOnly = ['id', 'created_at', 'updated_at'];

            let html = '';
            fieldsToShow.forEach(key => {
                if (readOnly.includes(key)) return;
                html += \`<div>
                    <label style="display:block; font-size:0.8em; font-weight:bold; color:#64748b; margin-bottom:4px;">\${key}</label>
                    <input type="text" id="dbedit_\${key}" data-field="\${key}" value=""
                        style="width:100%; padding:6px 10px; border-radius:6px; border:1px solid #cbd5e1;">
                </div>\`;
            });
            fields.innerHTML = html;
            form.style.display = 'block';
            cancelBtn.style.display = 'inline-block';
            form.scrollIntoView({ behavior: 'smooth' });
        }

        function openDbEdit(record) {
            dbEditingRecord = record;
            const form = document.getElementById('dbEditForm');
            const fields = document.getElementById('dbEditFields');
            const cancelBtn = document.getElementById('dbCancelEdit');
            const title = document.getElementById('dbEditTitle');
            
            title.innerHTML = '<i class="fas fa-edit"></i> Editar Registro en ' + dbCurrentTable;
            
            const readOnly = ['id', 'created_at', 'updated_at'];
            const hidden = ['password', 'doc_number'];

            let html = '';
            Object.keys(record).forEach(key => {
                if (hidden.includes(key)) return;
                const val = record[key] != null ? String(record[key]) : '';
                const ro = readOnly.includes(key);
                html += \`<div>
                    <label style="display:block; font-size:0.8em; font-weight:bold; color:#64748b; margin-bottom:4px;">\${key}</label>
                    <input type="text" id="dbedit_\${key}" data-field="\${key}" value="\${val.replace(/"/g,'&quot;')}"
                        \${ro ? 'readonly style="background:#f1f5f9; cursor:not-allowed;"' : 'style="border:1px solid #cbd5e1;"'}
                        style="width:100%; padding:6px 10px; border-radius:6px; \${ro ? 'background:#f1f5f9;' : ''}">
                </div>\`;
            });

            if (dbCurrentTable === 'teachers') {
                const currentRole = adminTeacherRolesMap[record.email] || 'profesor';
                html += \`<div style="margin-top:16px; padding:16px; background:#f3e8ff; border-radius:12px; border:2px solid #a855f7;">
                    <label style="display:block; font-size:0.9em; font-weight:bold; color:#9333ea; margin-bottom:8px;"><i class="fas fa-user-shield"></i> Rol Extra Institucional (Jerarquía Medienpass)</label>
                    <select id="dbedit_extra_role" style="width:100%; padding:8px 12px; border-radius:8px; border:2px solid #9333ea; font-weight:bold; color:#9333ea; background:white; font-size:1em;">
                        <option value="profesor" \${currentRole === 'profesor' ? 'selected' : ''}>Profesor (Por defecto)</option>
                        <option value="coordinador" \${currentRole === 'coordinador' ? 'selected' : ''}>Coordinador</option>
                        <option value="directivo" \${currentRole === 'directivo' ? 'selected' : ''}>Directivo</option>
                        <option value="desarrollador" \${currentRole === 'desarrollador' ? 'selected' : ''}>Desarrollador (Acceso Manual Técnico)</option>
                    </select>
                    <p style="font-size:0.8em; color:#6b7280; margin-top:8px;"><i class="fas fa-info-circle"></i> Nota: El perfil <strong>Desarrollador</strong> es el único con permiso para visualizar el Manual Técnico en el portal /docs/technical.</p>
                </div>\`;
            }

            fields.innerHTML = html;
            form.style.display = 'block';
            cancelBtn.style.display = 'inline-block';
            form.scrollIntoView({ behavior: 'smooth' });
        }

        async function saveDbRecord() {
            if (!dbCurrentTable) return;
            const updates = {};
            document.querySelectorAll('#dbEditFields input[data-field]').forEach(inp => {
                const field = inp.getAttribute('data-field');
                if (!['id','created_at','updated_at'].includes(field)) {
                    updates[field] = inp.value;
                }
            });

            // Si es teachers, guardar el rol extra
            if (dbCurrentTable === 'teachers' && dbEditingRecord) {
                const roleSelect = document.getElementById('dbedit_extra_role');
                if (roleSelect) {
                    try {
                        await fetch('/api/admin/teacher-roles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: dbEditingRecord.email, role: roleSelect.value })
                        });
                        adminTeacherRolesMap[dbEditingRecord.email] = roleSelect.value;
                    } catch(e){}
                }
            }

            try {
                let url = \`/api/admin/db-records/\${dbCurrentTable}\`;
                if (dbEditingRecord) {
                    url += '/' + dbEditingRecord.id;
                }
                
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
                const result = await res.json();
                if (result.success) {
                    showToast(dbEditingRecord ? '✅ Registro actualizado' : '✅ Registro creado');
                    cancelDbEdit();
                    loadDbTable(dbCurrentTable);
                } else {
                    showToast('Error: ' + result.message, true);
                }
            } catch(e) {
                showToast('Error de conexión', true);
            }
        }

        `;

    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reemplazo determinista en dashboard.ejs completado con éxito.');
} else {
    console.log('No se encontraron startStr o endStr en dashboard.ejs');
}
