// Capacitación y ayuda: los videos del botón AYUDA y la serie de correos para docentes.
// Lo editado se guarda en data/help_campaign.json y el registro de envíos en data/campaign_log.json,
// para no enviar dos veces el mismo correo a un docente.

const fs = require('fs');
const path = require('path');
const { DEFAULT_VIDEOS, DEFAULT_EMAILS, HELP_SEGMENT } = require('../data_campaign_defaults');
const { isValidLink } = require('./evidence_links');

const CONFIG_FILE = process.env.HELP_CAMPAIGN_FILE
    ? path.resolve(process.env.HELP_CAMPAIGN_FILE)
    : path.join(__dirname, '..', 'data', 'help_campaign.json');
const LOG_FILE = process.env.CAMPAIGN_LOG_FILE
    ? path.resolve(process.env.CAMPAIGN_LOG_FILE)
    : path.join(__dirname, '..', 'data', 'campaign_log.json');

const MAX_SUBJECT = 200;
const MAX_BODY = 8000;

function readJson(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        return fallback;
    }
}

function writeJson(file, data) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = `${file}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(temp, file);
}

const readConfig = () => readJson(CONFIG_FILE, {});

function getVideos() {
    const links = readConfig().videos || {};
    return DEFAULT_VIDEOS.map(video => ({ ...video, url: isValidLink(links[video.id]) ? links[video.id] : '' }));
}

// { id: url }: un enlace vacío quita el video. Devuelve { error, id } si un enlace no es válido.
function saveVideos(links) {
    const clean = {};
    for (const video of DEFAULT_VIDEOS) {
        const url = String((links && links[video.id]) || '').trim();
        if (url && !isValidLink(url)) return { error: 'invalid', id: video.id };
        if (url) clean[video.id] = url;
    }
    writeJson(CONFIG_FILE, { ...readConfig(), videos: clean });
    return { videos: getVideos() };
}

function getEmails() {
    const edited = readConfig().emails || {};
    return DEFAULT_EMAILS.map(email => ({ ...email, ...(edited[email.id] || {}) }));
}

function saveEmail(id, { subject, body }) {
    if (!DEFAULT_EMAILS.some(email => email.id === id)) return { error: 'unknown' };
    const cleanSubject = String(subject || '').trim();
    const cleanBody = String(body || '').trim();
    if (!cleanSubject || cleanSubject.length > MAX_SUBJECT) return { error: 'subject' };
    if (!cleanBody || cleanBody.length > MAX_BODY) return { error: 'body' };
    const config = readConfig();
    writeJson(CONFIG_FILE, { ...config, emails: { ...(config.emails || {}), [id]: { subject: cleanSubject, body: cleanBody } } });
    return { email: getEmails().find(email => email.id === id) };
}

function getSettings() {
    const config = readConfig();
    return { appUrl: config.appUrl || process.env.PUBLIC_APP_URL || '', helpSegment: config.helpSegment || HELP_SEGMENT };
}

function saveSettings({ appUrl, helpSegment }) {
    const url = String(appUrl || '').trim().replace(/\/+$/, '');
    if (url && !isValidLink(url)) return { error: 'invalid' };
    const segment = String(helpSegment || '').trim().slice(0, 1000);
    writeJson(CONFIG_FILE, { ...readConfig(), appUrl: url, helpSegment: segment || HELP_SEGMENT });
    return { settings: getSettings() };
}

const escapeHtml = value => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const firstName = teacher => String((teacher && teacher.first_name) || '').trim().split(/\s+/)[0] || '';

// Reemplaza {nombre}, {materia}, {enlace} y {video:id}. Devuelve también los videos sin enlace.
function fillPlaceholders(text, { teacher, subjectName, appUrl, videos }, missing) {
    return String(text)
        .replace(/\{nombre\}/g, firstName(teacher))
        .replace(/\{materia\}/g, subjectName || 'tu materia')
        .replace(/\{enlace\}/g, appUrl || '')
        .replace(/\{video:([a-z0-9-]+)\}/g, (match, id) => {
            const video = videos.find(v => v.id === id);
            if (video && video.url) return video.url;
            missing.add(id);
            return '';
        });
}

// Correo listo para enviar. Todo lo que viene de datos se escapa y solo se enlazan http(s).
function renderEmail(email, context) {
    const settings = getSettings();
    const data = { videos: getVideos(), appUrl: settings.appUrl, ...context };
    const missing = new Set();
    const subject = fillPlaceholders(email.subject, data, missing);
    const body = fillPlaceholders(email.body, data, missing);
    const toHtml = text => escapeHtml(text)
        .split(/\n{2,}/)
        .map(block => `<p>${block.replace(/\n/g, '<br>').replace(/https?:\/\/[^\s<]+/g, url => `<a href="${url}">${url}</a>`)}</p>`)
        .join('');
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1e293b;">${toHtml(body)}`
        + `<hr style="border:0;border-top:1px solid #e2e8f0;margin:20px 0;">${toHtml(settings.helpSegment)}</div>`;
    return { subject, html, missingVideos: [...missing] };
}

// ── Destinatarios ──
const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = value => String(value || '').trim().toLowerCase();

function readLog() {
    const log = readJson(LOG_FILE, []);
    return Array.isArray(log) ? log : [];
}

function appendLog(entry) {
    const log = readLog();
    log.push(entry);
    writeJson(LOG_FILE, log);
}

const sentTo = emailId => new Set(readLog().filter(row => row.emailId === emailId && row.ok).map(row => row.to));

// filter: { type: 'all' | 'untrained' | 'subject', subject }. Sin correo válido o ya enviado, no entra.
function selectRecipients(teachers, emailId, filter = {}) {
    const already = sentTo(emailId);
    const seen = new Set();
    const recipients = [];
    let alreadySent = 0;
    let invalid = 0;
    (teachers || []).forEach(teacher => {
        if (filter.type === 'untrained' && (teacher.training_completed || teacher.exempt)) return; // exentos: no reciben recordatorios
        if (filter.type === 'subject' && teacher.subject !== filter.subject) return;
        const to = normalizeEmail(teacher.email);
        if (!SIMPLE_EMAIL.test(to)) { invalid++; return; }
        if (seen.has(to)) return;
        seen.add(to);
        if (already.has(to)) { alreadySent++; return; }
        recipients.push({ id: teacher.id, to, teacher, external: !to.endsWith('@colegioaleman.edu.co') });
    });
    return { recipients, alreadySent, invalid };
}

function emailStats() {
    const stats = {};
    readLog().forEach(row => {
        const item = stats[row.emailId] || (stats[row.emailId] = { sent: 0, failed: 0, lastSentAt: null });
        if (row.ok) {
            item.sent++;
            if (!item.lastSentAt || row.at > item.lastSentAt) item.lastSentAt = row.at;
        } else {
            item.failed++;
        }
    });
    return stats;
}

module.exports = {
    getVideos, saveVideos, getEmails, saveEmail, getSettings, saveSettings,
    renderEmail, selectRecipients, appendLog, emailStats, readLog
};
