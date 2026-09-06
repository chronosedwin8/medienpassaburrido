/**
 * Seed Script - Agregar equipos al inventario
 * Ejecutar: node seed_devices.js
 * 
 * Equipos: 26 laptops de estudiantes + 1 laptop del profesor
 * Ubicaciones: AM1 (Aula Móvil 1)
 */

require('dotenv').config();
const supabase = require('./supabaseClient');

const devices = [
    // Equipos del profesor (equipo 1)
    {
        serial_number: 'DSB-PROF-001',
        type: 'laptop',
        brand: 'Dell',
        model: 'Latitude 5520',
        status: 'assigned',
        location: 'AM1',
        notes: 'Equipo del profesor - DSB-PROF-001'
    },
    // Equipos de estudiantes (equipos 2-27)
    { serial_number: 'DSB-STU-001', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 1' },
    { serial_number: 'DSB-STU-002', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 2' },
    { serial_number: 'DSB-STU-003', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 3' },
    { serial_number: 'DSB-STU-004', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 4' },
    { serial_number: 'DSB-STU-005', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 5' },
    { serial_number: 'DSB-STU-006', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 6' },
    { serial_number: 'DSB-STU-007', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 7' },
    { serial_number: 'DSB-STU-008', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 8' },
    { serial_number: 'DSB-STU-009', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 9' },
    { serial_number: 'DSB-STU-010', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 10' },
    { serial_number: 'DSB-STU-011', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 11' },
    { serial_number: 'DSB-STU-012', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 12' },
    { serial_number: 'DSB-STU-013', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 13' },
    { serial_number: 'DSB-STU-014', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 14' },
    { serial_number: 'DSB-STU-015', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 15' },
    { serial_number: 'DSB-STU-016', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 16' },
    { serial_number: 'DSB-STU-017', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 17' },
    { serial_number: 'DSB-STU-018', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 18' },
    { serial_number: 'DSB-STU-019', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 19' },
    { serial_number: 'DSB-STU-020', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 20' },
    { serial_number: 'DSB-STU-021', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 21' },
    { serial_number: 'DSB-STU-022', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 22' },
    { serial_number: 'DSB-STU-023', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 23' },
    { serial_number: 'DSB-STU-024', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 24' },
    { serial_number: 'DSB-STU-025', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 25' },
    { serial_number: 'DSB-STU-026', type: 'laptop', brand: 'Dell', model: 'Latitude 3320', status: 'available', location: 'AM1', notes: 'Estudiante 26' }
];

async function seedDevices() {
    if (!supabase) {
        console.log('❌ Supabase no configurado. Configure .env para ejecutar este script.');
        return;
    }

    console.log('🚀 Iniciando seed de dispositivos...');
    console.log(`📦 Total de equipos a insertar: ${devices.length}`);

    let inserted = 0;
    let errors = 0;

    for (const device of devices) {
        try {
            const { data, error } = await supabase
                .from('devices')
                .upsert(device, { onConflict: 'serial_number' })
                .select();

            if (error) {
                console.log(`❌ Error inserting ${device.serial_number}: ${error.message}`);
                errors++;
            } else {
                inserted++;
                console.log(`✅ Insertado: ${device.serial_number} (${device.notes})`);
            }
        } catch (e) {
            console.log(`❌ Error: ${e.message}`);
            errors++;
        }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Insertados: ${inserted}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📋 Total: ${devices.length}`);
}

seedDevices();
