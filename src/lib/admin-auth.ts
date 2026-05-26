import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_UNLOCK_SECRET || process.env.APP_PASSWORD || process.env.OPENAI_API_KEY || 'xsp-image-playground';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function sign(payload: string) {
    return crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
}

export function getAdminPassword() {
    return process.env.ADMIN_PASSWORD || process.env.APP_PASSWORD || '';
}

export function verifyAdminPassword(password: string) {
    const adminPassword = getAdminPassword();
    return Boolean(adminPassword) && password === adminPassword;
}

export function createAdminUnlockToken() {
    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = `${expiresAt}.${nonce}`;

    return `${payload}.${sign(payload)}`;
}

export function verifyAdminUnlockToken(token: unknown) {
    if (typeof token !== 'string' || !token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [expiresAtRaw, nonce, signature] = parts;
    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now() || !nonce || !signature) return false;

    const payload = `${expiresAtRaw}.${nonce}`;
    const expected = sign(payload);
    if (signature.length !== expected.length) return false;

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function hashAdminPasswordForClient() {
    const password = getAdminPassword();
    return password ? sha256(password) : '';
}
