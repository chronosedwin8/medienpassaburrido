// Envío de correos con Microsoft Graph, con una aplicación registrada en Microsoft Entra (permiso
// Mail.Send). No usa SMTP con contraseña: Microsoft lo desactiva por defecto a finales de 2026.
// Hace falta: MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET y MAIL_FROM (el buzón remitente).
// GRAPH_LOGIN_URL y GRAPH_API_URL solo se cambian en las pruebas.

const REQUIRED = ['MS_TENANT_ID', 'MS_CLIENT_ID', 'MS_CLIENT_SECRET', 'MAIL_FROM'];

function serviceStatus(env = process.env) {
    const missing = REQUIRED.filter(name => !String(env[name] || '').trim());
    return { configured: missing.length === 0, missing, from: env.MAIL_FROM || '' };
}

let cachedToken = null; // { value, expiresAt }

async function getToken(env) {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.value;
    const loginUrl = env.GRAPH_LOGIN_URL || 'https://login.microsoftonline.com';
    const response = await fetch(`${loginUrl}/${encodeURIComponent(env.MS_TENANT_ID)}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.MS_CLIENT_ID,
            client_secret: env.MS_CLIENT_SECRET,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials'
        })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
        throw new Error(`Microsoft no entregó el permiso (${response.status}${data.error ? ': ' + data.error : ''})`);
    }
    cachedToken = { value: data.access_token, expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000 };
    return cachedToken.value;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendMail({ to, subject, html }, env = process.env) {
    const status = serviceStatus(env);
    if (!status.configured) throw new Error('El envío de correos no está configurado');
    const token = await getToken(env);
    const apiUrl = env.GRAPH_API_URL || 'https://graph.microsoft.com/v1.0';
    const url = `${apiUrl}/users/${encodeURIComponent(env.MAIL_FROM)}/sendMail`;
    const body = JSON.stringify({
        message: {
            subject,
            body: { contentType: 'HTML', content: html },
            toRecipients: [{ emailAddress: { address: to } }]
        },
        saveToSentItems: true
    });
    const post = () => fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body
    });

    let response = await post();
    if (response.status === 429) { // Microsoft pide esperar: se reintenta una vez
        await wait(Math.min(60, Number(response.headers.get('retry-after')) || 10) * 1000);
        response = await post();
    }
    if (response.status !== 202) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(`Microsoft rechazó el correo (${response.status}${detail.error && detail.error.code ? ': ' + detail.error.code : ''})`);
    }
}

function resetTokenCache() {
    cachedToken = null;
}

module.exports = { serviceStatus, sendMail, resetTokenCache };
