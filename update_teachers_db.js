require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const correctTeachersList = [
  { name: "ACERO RONDERO, LUIS CARLOS", doc: "72179991", email: "lacero@colegioaleman.edu.co" },
  { name: "ACOSTA SUÁREZ, KARINA", doc: "1129518628", email: "kacosta@colegioaleman.edu.co" },
  { name: "ANDRADE MÁRQUEZ, CARMEN DOLORES", doc: "32681542", email: "candrade@colegioaleman.edu.co" },
  { name: "ARAUJO ESCOBAR, JUNELL LORENA", doc: "1129502414", email: "jaraujo@colegioaleman.edu.co" },
  { name: "AYALA MENDOZA, EDINSON", doc: "71707903", email: "eayala@colegioaleman.edu.co" },
  { name: "AYALA ORTIZ, MARLON", doc: "1129534515", email: "mayala@colegioaleman.edu.co" },
  { name: "BALAGUERA GARCIA, ADOLFO MARIO", doc: "72342113", email: "abalaguera@colegioaleman.edu.co" },
  { name: "BALENTINE FOLGOSO, SOLANGEL", doc: "22517024", email: "sbalentine@colegioaleman.edu.co" },
  { name: "BALLESTEROS GARCIA, KARLA JUDITH", doc: "1140852599", email: "kballesteros@colegioaleman.edu.co" },
  { name: "BARRAZA DORIA, CAROLA DEL CARMEN", doc: "1048275818", email: "cbarraza@colegioaleman.edu.co" },
  { name: "BARRERA IBARRA, FATINA ESTHER", doc: "22517724", email: "fbarrera@colegioaleman.edu.co" },
  { name: "BARROS CERVERA, MARILIN", doc: "32891379", email: "mbarros@colegioaleman.edu.co" },
  { name: "BEHAINE HERRERA, LUZ ELSA", doc: "1140814707", email: "lbehaine@colegioaleman.edu.co" },
  { name: "BERMEJO PÉREZ, JOSÉ CARLOS", doc: "72312674", email: "jbermejo@colegioaleman.edu.co" },
  { name: "BOSSIO RUIZ, JOHANNA MARGARITA", doc: "55305507", email: "jbossio@colegioaleman.edu.co" },
  { name: "CABARCAS CASTRO, MARIA FERNANDA", doc: "1001995102", email: "mcabarcas@colegioaleman.edu.co" },
  { name: "CARDONA PATRON, KAREN", doc: "55305398", email: "kcardona@colegioaleman.edu.co" },
  { name: "CARDONA RAMIREZ, PAULA ANDREA", doc: "24339178", email: "pcardona@colegioaleman.edu.co" },
  { name: "CARIELLO MERCADO, TATIANA MARGARITA", doc: "22735058", email: "tcariello@colegioaleman.edu.co" },
  { name: "CASIANIS CAMACHO, JUAN ALEJANDRO", doc: "1143252201", email: "jcasianis@colegioaleman.edu.co" },
  { name: "CASTRO MENDOZA, JUAN CAMILO", doc: "1043025906", email: "jcastro@colegioaleman.edu.co" },
  { name: "CERVANTES HERNANDEZ, JOSIMAR ISMAEL", doc: "1129570081", email: "jcervantes@colegioaleman.edu.co" },
  { name: "CHERENEK CHARENEKS, ELENA", doc: "1063550", email: "echerenek@colegioaleman.edu.co" },
  { name: "CUESTA RIOS, GAVINA", doc: "1129576457", email: "gcuesta@colegioaleman.edu.co" },
  { name: "DE CASTRO DEULOFEUT, JESSICA MARIA", doc: "1041690394", email: "jdecastro@colegioaleman.edu.co" },
  { name: "DE LA CRUZ NATERA, LEONARDO", doc: "1048211708", email: "ldelacruz@colegioaleman.edu.co" },
  { name: "DE VICARIA, MARIA CLAUDIA", doc: "45517729", email: "mdevicaria@colegioaleman.edu.co" },
  { name: "ESCOBAR BRACHE, LEYNIKER", doc: "1047337358", email: "lescobar@colegioaleman.edu.co" },
  { name: "FERRER MENDOZA, YICERA", doc: "32757095", email: "yferrer@colegioaleman.edu.co" },
  { name: "FONNEGRA MARIÑO, SILVANA MARGARITA", doc: "22523106", email: "sfonnegra@colegioaleman.edu.co" },
  { name: "GARCIA CUARTAS, VALENTINA", doc: "1001886145", email: "vgarcia@colegioaleman.edu.co" },
  { name: "GARCÍA ELGUEDO, YOHANNA CENITH", doc: "32895266", email: "ygarcia@colegioaleman.edu.co" },
  { name: "GARCÍA QUINTERO, MARÍA AUXILIADORA", doc: "22548707", email: "mgarciaa@colegioaleman.edu.co" },
  { name: "GARCÍA QUINTERO, LOURDES CRISTINA", doc: "22548708", email: "lgarcia@colegioaleman.edu.co" },
  { name: "GERDTS NOVOA, RONALD LUIS", doc: "72285934", email: "rgerdts@colegioaleman.edu.co" },
  { name: "GOMEZ CASTELLANOS, LAURA MARCELA", doc: "1143123835", email: "lgomez@colegioaleman.edu.co" },
  { name: "GRIMALDO ACEVEDO, GLORIA ELENA", doc: "55224681", email: "gloriagrimaldo1284@gmail.com" },
  { name: "GRUNWALDT DENNIS, KAREN MARIA", doc: "1140840030", email: "kgrunwaldt@colegioaleman.edu.co" },
  { name: "GUTIERREZ ALTAMAR, IVETH DEL ROSARIO", doc: "32673837", email: "igutierrez@colegioaleman.edu.co" },
  { name: "GUTIÉRREZ CABALLERO, MARYORIS MERCEDES", doc: "22505838", email: "mgutierrez@colegioaleman.edu.co" },
  { name: "GUTIÉRREZ FONTALVO, GLORIA ISABEL", doc: "1129570074", email: "ggutierrez@colegioaleman.edu.co" },
  { name: "GUTIERREZ ROMERO, VANESSA ESTHER", doc: "55312518", email: "vgutierrez@colegioaleman.edu.co" },
  { name: "HERNANDEZ, CRISTIAN PATRICIO", doc: "CCJVNLYC5", email: "cphernandez@colegioaleman.edu.co" },
  { name: "HERNÁNDEZ GIL, XIMENA", doc: "60261949", email: "xhernandez@colegioaleman.edu.co" },
  { name: "JIMENEZ CAMARGO, RAFAEL ALEJANDRO", doc: "8743773", email: "rjimenez@colegioaleman.edu.co" },
  { name: "JIMENEZ CAÑAS, EDWARD JOSÉ", doc: "72256137", email: "ejimenez@colegioaleman.edu.co" },
  { name: "JIMÉNEZ GUTIÉRREZ, ALISSON", doc: "1019033870", email: "ajimenez@colegioaleman.edu.co" },
  { name: "JIMÉNEZ JIMÉNEZ, JUAN CARLOS", doc: "72009812", email: "jjimenez@colegioaleman.edu.co" },
  { name: "JINETE PORRAS, STEFANY", doc: "1140881709", email: "sjinete@colegioaleman.edu.co" },
  { name: "LAMBIS CASTRO, ESTEFANY PAOLA", doc: "1129526154", email: "elambis@colegioaleman.edu.co" },
  { name: "LÓPEZ BARRETO, LUIS FERNANDO", doc: "72241842", email: "llopez@colegioaleman.edu.co" },
  { name: "LOPEZ MEZA, JOSE AGUSTIN", doc: "1100025433", email: "jlopez@colegioaleman.edu.co" },
  { name: "MACÍA ROMÁN, PAOLA", doc: "1140834372", email: "pmacia@colegioaleman.edu.co" },
  { name: "MARTÍNEZ ÁLVAREZ, ALCIRA", doc: "32857160", email: "amartinez@colegioaleman.edu.co" },
  { name: "MARTINEZ BARRANCO, ADELFO ANDRES", doc: "1048292844", email: "amartinezb@colegioaleman.edu.co" },
  { name: "MEJIA CUADRADO, MIGUEL", doc: "72004332", email: "mmejia@colegioaleman.edu.co" },
  { name: "MEJÍA MIER, OSCAR ALEJANDRO", doc: "85442438", email: "omejia@colegioaleman.edu.co" },
  { name: "MEJIA TEJEDA, JOSE AUGUSTO", doc: "70302880", email: "jmejia@colegioaleman.edu.co" },
  { name: "MENDOZA NARVAEZ, JUAN DANIEL", doc: "1049484228", email: "jdmendoza@colegioaleman.edu.co" },
  { name: "MERCADO BARRERA, ENRIQUE ANTONIO", doc: "72274916", email: "emercado@colegioaleman.edu.co" },
  { name: "MESA FUENTES, MAYLI CECILIA", doc: "1042351170", email: "mmesa@colegioaleman.edu.co" },
  { name: "MEZA FUENTES, MAYURIS", doc: "1129541071", email: "mmeza@colegioaleman.edu.co" },
  { name: "MOLINA ORTEGA, EDWIN", doc: "1048217839", email: "ejmolina@colegioaleman.edu.co" },
  { name: "MONTOYA RUIZ, MARYORI MARIA", doc: "22487555", email: "mmontoya@colegioaleman.edu.co" },
  { name: "MORALES AGUDELO, FRANCISCO", doc: "1046992141", email: "fmorales@colegioaleman.edu.co" },
  { name: "MORALES MIRANDA, CAROLINA", doc: "55313439", email: "cmorales@colegioaleman.edu.co" },
  { name: "MOSQUERA CAPDEVILLA, MARÍA INMACULADA", doc: "55302601", email: "mmosquera@colegioaleman.edu.co" },
  { name: "MOSQUERA CAPDEVILLA, KAFFE", doc: "1126905064", email: "kmosquera@colegioaleman.edu.co" },
  { name: "MOYA TOVAR, LILIAN JACOB", doc: "1045740577", email: "lmoya@colegioaleman.edu.co" },
  { name: "MUÑOZ BLANCO, MARCO ARTURO", doc: "1032414036", email: "mmunoz@colegioaleman.edu.co" },
  { name: "NAVARRO ESCORCIA, HEIDYS", doc: "22547551", email: "hnavarro@colegioaleman.edu.co" },
  { name: "OROZCO MARRIAGA, MERY BEATRIZ", doc: "32704496", email: "morozco@colegioaleman.edu.co" },
  { name: "ORTIZ HERAZO, EDWIN", doc: "72003036", email: "eortiz@colegioaleman.edu.co" },
  { name: "ORTIZ HERNANDEZ, MARCELA IRENE", doc: "36385539", email: "mortiz@colegioaleman.edu.co" },
  { name: "PÁEZ VILLA, MÓNICA PATRICIA", doc: "22524843", email: "mpaez@colegioaleman.edu.co" },
  { name: "Paternina Padilla, Sonia Sofía", doc: "44159686", email: "spaternina@colegioaleman.edu.co" },
  { name: "PERTUZ MARTINEZ, GRACE DEL SOCORRO", doc: "22624411", email: "gpertuz@colegioaleman.edu.co" },
  { name: "PRIETO CASTELLANO, MARIA PAULINA", doc: "1043023002", email: "mprieto@colegioaleman.edu.co" },
  { name: "PRIETO CERVANTES, KIMBERLY", doc: "1045589670", email: "kprieto@colegioaleman.edu.co" },
  { name: "QUINTEROS, MARIA MAGDALENA", doc: "1023136", email: "mquinteros@colegioaleman.edu.co" },
  { name: "QUIROZ OROZCO, HERMYLUZ", doc: "32888122", email: "hquiroz@colegioaleman.edu.co" },
  { name: "RAMÍREZ BLANCO, ALEXANDER", doc: "9020165", email: "aramirez@colegioaleman.edu.co" },
  { name: "REGINO ESCOBAR, JAVIER", doc: "1045719281", email: "jregino@colegioaleman.edu.co" },
  { name: "RENZ PAULSEN, KATHERINA", doc: "22579680", email: "krenz@colegioaleman.edu.co" },
  { name: "RESTREPO VARGAS, JUAN", doc: "877298", email: "jrestrepo@colegioaleman.edu.co" },
  { name: "RODRIGUEZ BELEÑO, ANA JULIA", doc: "32583595", email: "arodriguez@colegioaleman.edu.co" },
  { name: "RODRÍGUEZ MARTÍNEZ, VIVIANA MARÍA", doc: "32766811", email: "vrodriguez@colegioaleman.edu.co" },
  { name: "ROJAS MADERA, ROSSANA MARIA", doc: "22669020", email: "rrojas@colegioaleman.edu.co" },
  { name: "ROJAS MELENDEZ, LORENA", doc: "55300262", email: "lrojas@colegioaleman.edu.co" },
  { name: "ROKOHL, NORMEN", doc: "764103", email: "NROKOHL@COLEGIOALEMAN.EDU.CO" },
  { name: "ROMÁN RIVÉROS, MARÍA EUGENIA", doc: "45488050", email: "mroman@colegioaleman.edu.co" },
  { name: "RUEDA VILLANOVA, LIZBANA", doc: "22585855", email: "lrueda@colegioaleman.edu.co" },
  { name: "RUIZ MEDINA, ALDAIR ENRIQUE", doc: "1143153788", email: "aruiz@colegioaleman.edu.co" },
  { name: "SALOM PERNA, AYDA CRISTINA", doc: "64558909", email: "asalom@colegioaleman.edu.co" },
  { name: "SÁNCHEZ MONTAÑO, SULEIMY", doc: "1143258416", email: "ssanchezm@colegioaleman.edu.co" },
  { name: "SIMMONDS ARRIETA, ANDREA KATHERINE", doc: "1045668918", email: "asimmonds@colegioaleman.edu.co" },
  { name: "SOLANO GOENAGA, ALEJANDRA", doc: "1044423400", email: "asolano@colegioaleman.edu.co" },
  { name: "SUAREZ ALMANZA, GABRIEL", doc: "1001818333", email: "gsuarez@colegioaleman.edu.co" },
  { name: "SUÁREZ ZAPATA, JOSÉ ANTONIO", doc: "72310897", email: "jsuarez@colegioaleman.edu.co" },
  { name: "TERAN ROMERO, WALKYN DARIO", doc: "72204539", email: "wteran@colegioaleman.edu.co" },
  { name: "TERRAZA HENRÍQUEZ, SILVANA", doc: "22461708", email: "sterraza@colegioaleman.edu.co" },
  { name: "TORRES NIETO, ROSA CATHERINE", doc: "52316814", email: "ctorres@colegioaleman.edu.co" },
  { name: "TRAWIN, ALINA TAMARA", doc: "7793066", email: "atrawin@colegioaleman.edu.co" },
  { name: "URRUCHURTO MUÑOZ, JOISE ISABELL", doc: "32837441", email: "jurruchurto@colegioaleman.edu.co" },
  { name: "UTRIA MOLINA, ALFONSO MANUEL", doc: "1143146746", email: "autria@colegioaleman.edu.co" },
  { name: "VALLEJO MACEA, HELLMAN SMITH", doc: "1140858082", email: "hvallejo@colegioaleman.edu.co" },
  { name: "VEGA GUTIERREZ, ADRIANA CAROLINA", doc: "1143445317", email: "avega@colegioaleman.edu.co" },
  { name: "VELOZA SANTANA, SERGIO ANDRES", doc: "1070015348", email: "sveloza@colegioaleman.edu.co" },
  { name: "WIESE, RALPH", doc: "C4J6ZG69Y", email: "rector.baq@colegioaleman.edu.co" },
  { name: "YUNES JAIME, VANNERY LOREIN", doc: "1143156813", email: "vyunes@colegioaleman.edu.co" },
  { name: "ZAPATA REALES, ANDREA CAMILA", doc: "1140895370", email: "azapata@colegioaleman.edu.co" }
];

async function updateDb() {
    console.log("Fetching existing teachers...");
    const { data: existingTeachers, error: fetchErr } = await supabase.from('teachers').select('*');
    if (fetchErr) {
        console.error("Error fetching:", fetchErr);
        return;
    }
    console.log(`Found ${existingTeachers.length} existing teachers.`);

    const validDocs = new Set(correctTeachersList.map(t => t.doc.toString().trim()));

    // 1. Delete or archive teachers not in the correct list
    let deletedCount = 0;
    for (const t of existingTeachers) {
        if (!t.doc_number || !validDocs.has(t.doc_number.toString().trim())) {
            // Let's delete them as requested ("usa sólo esta información")
            const { error: delErr } = await supabase.from('teachers').delete().eq('id', t.id);
            if (delErr) {
                console.log(`❌ Could not delete ${t.doc_number} (maybe foreign keys?). Error:`, delErr.message);
            } else {
                console.log(`🗑️  Deleted old teacher ${t.doc_number}`);
                deletedCount++;
            }
        }
    }

    // 2. Insert or update correct ones
    let insertedCount = 0;
    let updatedCount = 0;

    const crypto = require('crypto');

    for (const ct of correctTeachersList) {
        const parts = ct.name.split(',').map(s => s.trim());
        const last_name = parts[0] || '';
        const first_name = parts[1] || '';
        const doc_number = ct.doc.trim();
        const email = ct.email.trim();

        const existing = existingTeachers.find(t => t.doc_number === doc_number);
        
        if (existing) {
            // Update email, name
            const { error: upErr } = await supabase.from('teachers').update({
                first_name,
                last_name,
                email
            }).eq('id', existing.id);
            if (upErr) console.error("Error updating", doc_number, upErr);
            else updatedCount++;
        } else {
            // Insert new
            const { error: inErr } = await supabase.from('teachers').insert({
                id: crypto.randomUUID(),
                doc_number,
                first_name,
                last_name,
                email,
                subject: ''
            });
            if (inErr) console.error("Error inserting", doc_number, inErr);
            else insertedCount++;
        }
    }

    console.log(`✅ Done. Deleted: ${deletedCount}, Inserted: ${insertedCount}, Updated: ${updatedCount}`);
}

updateDb();
