const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

try {
    const file = path.join('C:', 'Users', 'lacero', 'Downloads', 'PROFESORES MATERIAS KLASSEN.xlsx');
    console.log('Leyendo archivo:', file);
    
    const workbook = xlsx.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // El objetivo es un JSON donde la llave sea { "K1A": { "aleman": "Nombre Profe", "ingles": "Nombre Profe", ... } }
    // Asumiendo columnas estándar como: Clase, Materia, Profesor
    
    const config = {};
    
    // Primero, veamos la estructura de columnas:
    if(data.length > 0) {
        console.log('Columnas encontradas:', Object.keys(data[0]));
        
        // Tratar de mapear a nuestras IDs internas de Subjects
        const subjectMap = {
            'aleman': 'aleman', 'alemán': 'aleman', 'deutsch': 'aleman',
            'espanol': 'espanol', 'español': 'espanol', 'spanish': 'espanol', 'spanisch': 'espanol',
            'ingles': 'ingles', 'inglés': 'ingles', 'english': 'ingles', 'englisch': 'ingles',
            'tecnologia': 'tecnologia', 'tecnología': 'tecnologia', 'technologie': 'tecnologia',
            'ciencias': 'ciencias', 'naturwissenschaften': 'ciencias',
            'individuos': 'individuos', 'individuen': 'individuos',
            'matematicas': 'matematicas', 'matemáticas': 'matematicas', 'mathematik': 'matematicas',
            'musica': 'musica', 'música': 'musica', 'musik': 'musica',
            'arte': 'arte', 'kunst': 'arte',
            'mint': 'mint_sach', 'sachunterricht': 'mint_sach', 'mint mas sachunterricht': 'mint_sach'
        };

        // Identificar claves de columna
        const keys = Object.keys(data[0]);
        let classKey = keys.find(k => k.toLowerCase().includes('klas') || k.toLowerCase().includes('clas') || k.toLowerCase().includes('curso'));
        let subjKey = keys.find(k => k.toLowerCase().includes('mat') || k.toLowerCase().includes('sub') || k.toLowerCase().includes('area'));
        let teacherKey = keys.find(k => k.toLowerCase().includes('prof') || k.toLowerCase().includes('doc') || k.toLowerCase().includes('teach'));
        
        if(classKey && subjKey && teacherKey) {
            data.forEach(row => {
                let rawClass = String(row[classKey]).trim().toUpperCase();
                // Normalizar '1A' a 'K1A'
                if (/^\d[A-Z]$/i.test(rawClass)) rawClass = 'K' + rawClass;
                
                const rawSubj = String(row[subjKey]).trim().toLowerCase();
                let matchedSubj = null;
                for(let k in subjectMap) {
                    if(rawSubj.includes(k)) {
                        matchedSubj = subjectMap[k];
                        break;
                    }
                }
                
                const teacher = String(row[teacherKey]).trim();
                
                if (rawClass && matchedSubj && teacher && teacher.toLowerCase() !== 'no aplica') {
                    if (!config[rawClass]) config[rawClass] = {};
                    config[rawClass][matchedSubj] = teacher;
                }
            });
            
            const outPath = path.join(__dirname, 'class_teacher_config.json');
            fs.writeFileSync(outPath, JSON.stringify(config, null, 2), 'utf8');
            console.log('✅ Archivo exportado exitosamente con mapping de: ', Object.keys(config).length, 'clases.');
            console.log('Ruta:', outPath);
        } else {
            console.log('❌ No se pudieron identificar las columnas requeridas. Info:', {classKey, subjKey, teacherKey});
        }
    } else {
        console.log('El archivo está vacío');
    }
} catch (e) {
    console.error('Error procesando el excel:', e);
}
