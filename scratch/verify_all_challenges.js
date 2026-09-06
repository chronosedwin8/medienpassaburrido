const { allActivities, subjects } = require('../data.js');

console.log('Verifying all subjects have challenges 1-6:');

let allPassed = true;

subjects.forEach(sub => {
    console.log(`Checking subject: ${sub.id} (${sub.name.es})`);
    for (let level = 1; level <= 6; level++) {
        const activitiesForLevel = allActivities[String(level)] || [];
        const activity = activitiesForLevel.find(a => a.subject === sub.id);
        
        if (activity) {
            console.log(`  Level ${level}: ✅ Found (${activity.id})`);
            // Check evidence is populated for K2 to K12
            for (let grade = 2; grade <= 12; grade++) {
                const evidence = activity[`evidence_k${grade}`];
                if (!evidence || evidence.length === 0) {
                    console.error(`    ❌ Missing evidence for Grade K${grade}!`);
                    allPassed = false;
                }
            }
        } else {
            console.error(`  Level ${level}: ❌ NOT FOUND!`);
            allPassed = false;
        }
    }
});

if (allPassed) {
    console.log('\n🎉 SUCCESS: All subjects have active challenges 1-6 with dynamic evidence configured!');
    process.exit(0);
} else {
    console.error('\n❌ FAILURE: Some subjects or challenges are missing configuration.');
    process.exit(1);
}
