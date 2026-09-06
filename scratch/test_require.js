const { part2Competencies } = require('../training_competencies');
console.log('part2Competencies is:', typeof part2Competencies);
if (part2Competencies) {
    console.log('Length:', part2Competencies.length);
    console.log('First element:', part2Competencies[0] ? part2Competencies[0].title : 'none');
}
