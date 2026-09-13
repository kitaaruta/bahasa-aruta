/**
 * Aruta SSO Session Management
 * Menggunakan Web Crypto API (HMAC-SHA256) yang kompatibel penuh dengan Node.js dan Edge / Cloudflare Pages.
 */

export const SESSION_COOKIE_NAME = 'aruta_session';
export const OAUTH_STATE_COOKIE_NAME = 'aruta_oauth_state';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 hari dalam detik

export interface ArutaSessionUser {
  sub: string;
  name: string;
  username: string;
  email: string;
  picture?: string;
  ssoRole: string; // "Superadmin" | "Admin" | "Member" | peran khusus
  roles: ('superadmin' | 'admin' | 'verifier' | 'contributor' | 'supporter')[];
  primaryRole: 'superadmin' | 'admin' | 'verifier' | 'contributor' | 'supporter';
  status: 'active' | 'suspended';
  company?: string;
  title?: string;
  origin: string;
  honorificTitle?: string;
  bio?: string;
  badge: string;
  isOnboarded: boolean;
  accessToken?: string;
  expiresAt: number; // Unix timestamp in ms
}

function getSecretKey(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ARUTA_CLIENT_SECRET ||
    'aruta_default_session_secret_change_in_production_key_32bytes'
  );
}

// Convert string to Uint8Array
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64 URL encode
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Base64 URL decode
function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Sign payload using HMAC-SHA256
export async function signSession(payload: ArutaSessionUser): Promise<string> {
  const secret = getSecretKey();
  const key = await crypto.subtle.importKey(
    'raw',
    stringToBytes(secret) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payloadString = JSON.stringify(payload);
  const payloadBytes = stringToBytes(payloadString);
  const encodedPayload = base64UrlEncode(payloadBytes);

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    stringToBytes(encodedPayload) as unknown as BufferSource
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${encodedPayload}.${encodedSignature}`;
}

// Verify and decode session token
export async function verifySession(token: string): Promise<ArutaSessionUser | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, encodedSignature] = parts;

  try {
    const secret = getSecretKey();
    const key = await crypto.subtle.importKey(
      'raw',
      stringToBytes(secret) as unknown as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      stringToBytes(encodedPayload) as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(encodedPayload);
    const payloadString = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadString) as ArutaSessionUser;

    // Check expiration
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    // Check status
    if (payload.status !== 'active') {
      return null;
    }

    return payload;
  } catch (err) {
    console.error('Failed to verify session token:', err);
    return null;
  }
}

// Generate random secure token (for CSRF state)
export function generateRandomState(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
