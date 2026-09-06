const fs = require('fs');

function extractConcepts(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /<div class="concept-item-card" onclick="exploreConcept\(this,\s*'([^']+)'/g;
    let match;
    const cards = {};
    while ((match = regex.exec(content)) !== null) {
        const id = match[1];
        const cardStart = match.index;
        const bodyStart = content.indexOf('<div class="concept-body-content">', cardStart);
        if (bodyStart !== -1) {
            const pStart = content.indexOf('<p ', bodyStart);
            const pEnd = content.indexOf('</p>', pStart);
            if (pStart !== -1 && pEnd !== -1) {
                const pTag = content.substring(pStart, pEnd + 4);
                cards[id] = pTag;
            }
        }
    }
    return cards;
}

const current = extractConcepts('views/activity.ejs');
const backup = extractConcepts('scratch/activity.ejs.backup');

console.log("=== COMPARING CONCEPTS ===");
for (const id of Object.keys(backup)) {
    console.log(`\nID: ${id}`);
    console.log(`BACKUP:  ${backup[id]}`);
    console.log(`CURRENT: ${current[id] || 'NOT FOUND'}`);
}
