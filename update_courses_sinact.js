const fs = require('fs');
require('dotenv').config();
const supabase = require('./supabaseClient');

// ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
const CSV_PATH = 'C:/Users/lacero/Downloads/Estudiantes Matriculados_2026-08-26.csv';
const SINACT_COURSE = 'sinact';

// Columnas del CSV (header real):
// level,course,section,id,code,firstname,lastname,name,gender,email,...
//
//   "code"    (índice 4) → username del estudiante en la BD
//   "section" (índice 2) → nuevo curso/clase
// ───────────────────────────────────────────────────────────────────────────────

async function updateCourses() {

    // 1. Verificar que el archivo existe
    if (!fs.existsSync(CSV_PATH)) {
        console.error(`❌ Archivo no encontrado: ${CSV_PATH}`);
        return;
    }

    // 2. Parsear el CSV usando la cabecera para localizar columnas
    const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = fileContent
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const codeIdx    = headers.indexOf('code');    // username del estudiante
    const sectionIdx = headers.indexOf('section'); // curso asignado

    if (codeIdx === -1 || sectionIdx === -1) {
        console.error('❌ No se encontraron columnas "code" y/o "section" en el CSV.');
        console.error('   Columnas detectadas:', headers.join(', '));
        return;
    }

    // Mapa: username (code) → section (clase)
    const csvStudents = new Map();

    for (const line of lines.slice(1)) {
        const parts = line.split(',');
        if (parts.length <= Math.max(codeIdx, sectionIdx)) continue;

        const username   = parts[codeIdx].trim();
        const class_name = parts[sectionIdx].trim();

        if (!username || !class_name) continue;

        // Guardar; si hay duplicados conservar el último
        csvStudents.set(username, class_name);
    }

    console.log(`📋 CSV parseado: ${csvStudents.size} estudiantes con curso asignado`);
    console.log(`   (identificados por la columna "code" → username en BD)`);

    // 3. Obtener TODOS los estudiantes de la BD
    console.log('\n🔍 Consultando base de datos...');
    let allStudents = [];
    let from = 0;
    const PAGE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('students')
            .select('username, class_name')
            .range(from, from + PAGE - 1);

        if (error) {
            console.error('❌ Error al consultar la BD:', error.message);
            return;
        }
        if (!data || data.length === 0) break;
        allStudents = allStudents.concat(data);
        if (data.length < PAGE) break;
        from += PAGE;
    }

    console.log(`📊 Total estudiantes en BD: ${allStudents.length}`);

    // 4. Clasificar
    const toUpdateFromCSV = []; // están en el CSV → nuevo curso del CSV
    const toSetSinact     = []; // NO están en el CSV → retirados/sin matrícula

    for (const student of allStudents) {
        if (csvStudents.has(student.username)) {
            const newCourse = csvStudents.get(student.username);
            toUpdateFromCSV.push({ username: student.username, class_name: newCourse });
        } else {
            // Solo si no tienen ya sinact
            if (student.class_name !== SINACT_COURSE) {
                toSetSinact.push(student.username);
            }
        }
    }

    const alreadySinact = allStudents.length - toUpdateFromCSV.length - toSetSinact.length;

    console.log(`\n📝 Plan de actualización:`);
    console.log(`   ✅ Actualizar curso desde CSV:     ${toUpdateFromCSV.length} estudiantes`);
    console.log(`   🚫 Asignar '${SINACT_COURSE}':             ${toSetSinact.length} estudiantes`);
    console.log(`   ℹ️  Ya tenían '${SINACT_COURSE}' (sin cambio): ${alreadySinact} estudiantes`);

    let successCount = 0;
    let errorCount   = 0;
    const BATCH = 50;

    // 5. Actualizar cursos desde el CSV (uno a uno para seguridad)
    if (toUpdateFromCSV.length > 0) {
        console.log('\n⬆️  Actualizando cursos desde CSV...');
        for (let i = 0; i < toUpdateFromCSV.length; i += BATCH) {
            const batch = toUpdateFromCSV.slice(i, i + BATCH);
            for (const s of batch) {
                const { error } = await supabase
                    .from('students')
                    .update({ class_name: s.class_name })
                    .eq('username', s.username);

                if (error) {
                    console.error(`  ❌ Error actualizando ${s.username}:`, error.message);
                    errorCount++;
                } else {
                    successCount++;
                }
            }
            const lote = Math.floor(i / BATCH) + 1;
            const total = Math.ceil(toUpdateFromCSV.length / BATCH);
            console.log(`  Lote ${lote}/${total} procesado...`);
        }
    }

    // 6. Asignar 'sinact' a los que NO están en el CSV (en lote por .in())
    if (toSetSinact.length > 0) {
        console.log(`\n🚫 Asignando '${SINACT_COURSE}' a ${toSetSinact.length} estudiantes no matriculados...`);
        for (let i = 0; i < toSetSinact.length; i += BATCH) {
            const batch = toSetSinact.slice(i, i + BATCH);
            const { error } = await supabase
                .from('students')
                .update({ class_name: SINACT_COURSE })
                .in('username', batch);

            if (error) {
                console.error(`  ❌ Error al asignar sinact (lote ${Math.floor(i/BATCH)+1}):`, error.message);
                errorCount += batch.length;
            } else {
                successCount += batch.length;
            }
            const lote = Math.floor(i / BATCH) + 1;
            const total = Math.ceil(toSetSinact.length / BATCH);
            console.log(`  Lote ${lote}/${total} procesado...`);
        }
    }

    // 7. Resumen final
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ PROCESO COMPLETADO');
    console.log(`   Actualizados exitosamente: ${successCount}`);
    console.log(`   Errores:                   ${errorCount}`);
    console.log('═══════════════════════════════════════════');
}

updateCourses();
