// Se carga antes de cada prueba (npm test usa node -r ./test/isolate.js): las materias nuevas que el
// desarrollador crea en la app real (data/subjects_config.json) no cambian lo que esperan las pruebas.
// Las pruebas que necesitan su propio archivo de materias lo definen ellas mismas.
const os = require('os');
const path = require('path');

if (!process.env.SUBJECTS_CONFIG_FILE) {
    process.env.SUBJECTS_CONFIG_FILE = path.join(os.tmpdir(), `medienpass-test-no-subjects-${process.pid}.json`);
}
