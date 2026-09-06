const fs = require('fs');
const code = fs.readFileSync('data_questions.js', 'utf8');

// Find all occurrences of "case 1:", "case 2:", etc., inside the switch (retoNum) block
const matches = code.match(/case \d+:/g);
console.log("Found reto cases:", matches);

// Check module exports and any errors
try {
    const dataQuestions = require('../data_questions');
    console.log("data_questions.js loaded successfully!");
    console.log("Keys exported:", Object.keys(dataQuestions));
    
    // Let's test generating evidence for Reto 1, subject 'aleman', grade 4
    const evidence = dataQuestions.generateEvidenceForReto(1, 'aleman', 4);
    console.log(`Generated evidence for Reto 1, aleman, grade 4: ${evidence.length} items.`);
    if (evidence.length > 0) {
        console.log("First question example ID:", evidence[0].id);
        console.log("First question label (es):", evidence[0].label.es);
    }
} catch (e) {
    console.error("Error loading or running data_questions.js:", e);
}
