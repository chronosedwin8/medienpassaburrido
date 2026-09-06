const { allActivities } = require('./data');
const reto1 = allActivities['1'][0];
console.log('Keys of reto1_aleman:', Object.keys(reto1));
console.log('reto1_aleman.level:', reto1.level);
console.log('reto1_aleman.subject:', reto1.subject);
for (const key of Object.keys(reto1)) {
    if (key.startsWith('evidence')) {
        console.log(`- ${key}: ${Array.isArray(reto1[key]) ? reto1[key].length : typeof reto1[key]} items`);
    }
}
process.exit(0);
