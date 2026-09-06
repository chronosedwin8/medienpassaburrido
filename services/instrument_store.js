/**
 * instrument_store.js - Custom Instruments Storage Service
 * Manages custom and AI-generated instruments for grades, subjects, and challenges.
 */

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/custom_instruments.json');

// Ensure directory and file exist
function ensureStore() {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
        fs.writeFileSync(STORE_PATH, JSON.stringify({}), 'utf8');
    }
}

function loadAllCustom() {
    ensureStore();
    try {
        const raw = fs.readFileSync(STORE_PATH, 'utf8');
        return JSON.parse(raw || '{}');
    } catch (e) {
        console.error("Error loading custom instruments store:", e);
        return {};
    }
}

/**
 * Gets key for grade, subject, reto
 */
function getKey(grade, subject, retoNum) {
    return `${grade}_${subject}_${retoNum}`;
}

/**
 * Gets custom instrument if saved, or returns null if default should be used
 */
function getCustomInstrument(grade, subject, retoNum) {
    const store = loadAllCustom();
    const key = getKey(grade, subject, retoNum);
    return store[key] || null;
}

/**
 * Saves custom instrument for a given grade, subject, reto
 */
function saveCustomInstrument(grade, subject, retoNum, mode, questions) {
    ensureStore();
    const store = loadAllCustom();
    const key = getKey(grade, subject, retoNum);
    
    store[key] = {
        mode: mode || 'editable', // 'auto', 'editable', 'ai'
        updatedAt: new Date().toISOString(),
        questions: questions || []
    };

    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
    return store[key];
}

/**
 * Resets instrument back to automatic default mode
 */
function resetToDefault(grade, subject, retoNum) {
    ensureStore();
    const store = loadAllCustom();
    const key = getKey(grade, subject, retoNum);
    if (store[key]) {
        delete store[key];
        fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
    }
    return true;
}

module.exports = {
    getCustomInstrument,
    saveCustomInstrument,
    resetToDefault,
    loadAllCustom
};
