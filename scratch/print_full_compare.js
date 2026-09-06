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

const ids = ['pillar1', 'pillar2', 'pillar3', 'method1', 'method2', 'method3', 'kmk1', 'kmk2', 'kmk3', 'kmk4', 'kmk5', 'kmk6', 'finalgoal', 'glossary1', 'glossary2', 'glossary3'];

let out = "=== COMPARING CONCEPTS ===\n";
ids.forEach(id => {
    out += `\nID: ${id}\n`;
    out += `BACKUP:  ${backup[id] || 'NOT FOUND'}\n`;
    out += `CURRENT: ${current[id] || 'NOT FOUND'}\n`;
});

fs.writeFileSync('scratch/compare_output.txt', out, 'utf8');
console.log("Wrote comparison to scratch/compare_output.txt");
