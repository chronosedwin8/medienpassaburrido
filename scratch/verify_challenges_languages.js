const data = require('../data');
const activities = data.allActivities;

console.log("=== Checking Language Coverage for Retos 1-6 ===");
for (let lvl = 1; lvl <= 6; lvl++) {
    const list = activities[lvl] || [];
    console.log(`\n--- Reto ${lvl} (${list.length} activities) ---`);
    list.forEach(act => {
        console.log(`Activity [${act.id}]:`);
        
        // Title
        const title = act.title;
        console.log(`  Title: de: ${!!title?.de}, es: ${!!title?.es}, en: ${!!title?.en}`);
        
        // Subtitle
        if (act.subtitle) {
            console.log(`  Subtitle: de: ${!!act.subtitle.de}, es: ${!!act.subtitle.es}, en: ${!!act.subtitle.en}`);
        }
        
        // Instruction
        if (act.instruction) {
            console.log(`  Instruction: de: ${!!act.instruction.de}, es: ${!!act.instruction.es}, en: ${!!act.instruction.en}`);
        }
        
        // Competencies
        if (act.competencies) {
            const missingComp = act.competencies.some(comp => typeof comp === 'object' && (!comp.de || !comp.es || !comp.en));
            console.log(`  Competencies: ${act.competencies.length} items (all translated: ${!missingComp})`);
        }
        
        // Evidence
        if (act.evidence) {
            const missingEv = act.evidence.some(ev => typeof ev.label === 'object' && (!ev.label.de || !ev.label.es || !ev.label.en));
            console.log(`  Evidence: ${act.evidence.length} items (all translated: ${!missingEv})`);
            
            // Check options
            act.evidence.forEach(ev => {
                if (ev.options) {
                    const missingOpt = ev.options.some(opt => typeof opt === 'object' && (!opt.de && !opt.label?.de));
                    if (missingOpt) {
                        console.log(`    WARNING: Evidence ${ev.id} options are missing some translations.`);
                    }
                }
            });
        }
    });
}
