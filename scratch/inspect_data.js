const { allActivities, tecnologiaActivities, subjects } = require('../data');
console.log('Subjects:', subjects);
console.log('Levels in allActivities:', Object.keys(allActivities));
for (const lvl of Object.keys(allActivities)) {
    console.log(`Level ${lvl}:`, allActivities[lvl].map(a => ({ id: a.id, subject: a.subject, title: a.title })));
}
console.log('TecnologiaActivities:', tecnologiaActivities.map(a => ({ id: a.id, level: a.level, subject: a.subject, title: a.title })));
