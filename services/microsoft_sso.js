// Ingreso con la cuenta institucional de Microsoft (Entra ID / Office 365), OpenID Connect con
// código de autorización + PKCE. Sirve para estudiantes, docentes y perfiles del panel.
//
// Variables de entorno (en .env y en CapRover; nunca en el código):
//   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
//   APP_BASE_URL (opcional): dirección pública, p. ej. https://medienpass.panel.fundales.com.
//   Sin ella se usa la dirección de la petición.
// En Azure › App registrations › la app › Authentication hay que registrar, como plataforma «Web»,
// la dirección de retorno <APP_BASE_URL>/auth/microsoft/callback.
//
// El id_token se recibe directamente del endpoint de tokens de Microsoft por HTTPS y con el secreto
// del cliente (OIDC Core 3.1.3.7), así que se validan emisor, audiencia, vigencia y nonce.

const crypto = require('crypto');

const SCOPES = 'openid profile email';
const b64url = buf => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function config() {
    return {
        tenant: process.env.AZURE_TENANT_ID || '',
        clientId: process.env.AZURE_CLIENT_ID || '',
        clientSecret: process.env.AZURE_CLIENT_SECRET || ''
    };
}

function configured() {
    const c = config();
    return !!(c.tenant && c.clientId && c.clientSecret);
}

function redirectUri(req) {
    const base = (process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    return `${base}/auth/microsoft/callback`;
}

// Datos de un ingreso que empieza: se guardan firmados en una cookie de 10 minutos
function newLoginState(extra = {}) {
    const verifier = b64url(crypto.randomBytes(32));
    return {
        state: b64url(crypto.randomBytes(16)),
        nonce: b64url(crypto.randomBytes(16)),
        verifier,
        challenge: b64url(crypto.createHash('sha256').update(verifier).digest()),
        ...extra
    };
}

function authorizeUrl(login, uri, { loginHint } = {}) {
    const { tenant, clientId } = config();
    const url = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', uri);
    url.searchParams.set('response_mode', 'query');
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('state', login.state);
    url.searchParams.set('nonce', login.nonce);
    url.searchParams.set('code_challenge', login.challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('prompt', 'select_account');
    if (loginHint) url.searchParams.set('login_hint', loginHint);
    return url.toString();
}

function decodeJwtPayload(token) {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) throw new Error('id_token mal formado');
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
}

// Comprueba el id_token y devuelve { email, name, oid, tid }
function identityFromIdToken(idToken, { nonce, now = Date.now() } = {}) {
    const { tenant, clientId } = config();
    const claims = decodeJwtPayload(idToken);
    if (claims.aud !== clientId) throw new Error('El token no es para esta aplicación');
    if (claims.tid !== tenant || !String(claims.iss || '').includes(tenant)) throw new Error('El token es de otra organización');
    if (!claims.exp || claims.exp * 1000 < now - 60000) throw new Error('El token venció');
    if (nonce && claims.nonce !== nonce) throw new Error('El token no corresponde a este ingreso');
    const email = String(claims.email || claims.preferred_username || claims.upn || '').trim().toLowerCase();
    if (!email.includes('@')) throw new Error('La cuenta no tiene correo');
    return { email, name: String(claims.name || '').trim(), oid: claims.oid || null, tid: claims.tid };
}

async function exchangeCode(code, verifier, uri) {
    const { tenant, clientId, clientSecret } = config();
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: uri,
        code_verifier: verifier,
        scope: SCOPES
    });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
        const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
            body,
            signal: ctrl.signal
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.id_token) {
            throw new Error(json.error_description || json.error || `Microsoft respondió ${res.status}`);
        }
        return json;
    } finally {
        clearTimeout(timer);
    }
}

function logoutUrl(postLogout) {
    const { tenant } = config();
    const url = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/logout`);
    if (postLogout) url.searchParams.set('post_logout_redirect_uri', postLogout);
    return url.toString();
}

module.exports = { configured, redirectUri, newLoginState, authorizeUrl, exchangeCode, identityFromIdToken, decodeJwtPayload, logoutUrl };
