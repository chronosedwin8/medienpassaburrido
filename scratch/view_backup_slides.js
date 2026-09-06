const fs = require('fs');
const content = fs.readFileSync('scratch/activity.ejs.backup', 'utf8');

// Find the index of the first mySlides fade
const start = content.indexOf('<div class="slideshow-container">');
const end = content.indexOf('<!-- Navigation Buttons -->', start);

if (start !== -1 && end !== -1) {
    console.log(content.substring(start, end + 300));
} else {
    console.log("Could not find slideshow section in backup.");
}
