const fs = require('fs');
const content = fs.readFileSync('views/activity.ejs', 'utf8');
console.log('Total characters:', content.length);
console.log('Total lines:', content.split('\n').length);

// Let's count how many times '<form id="activityForm">' appears:
console.log('Form tags count:', (content.match(/<form id="activityForm">/g) || []).length);
console.log('Slide deck div count:', (content.match(/id="reto-zero-section"/g) || []).length);
console.log('Avatar selector container count:', (content.match(/id="avatarSelectorContainer"/g) || []).length);
console.log('Edilim game container count:', (content.match(/id="edilim-game-container"/g) || []).length);
console.log('Teachers section count:', (content.match(/class="section teachers-by-subject-section"/g) || []).length);
