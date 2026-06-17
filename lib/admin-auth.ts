const cookieName = "desapego_admin_session";
const tokenMaxAgeSeconds = 60 * 60 * 8;

function base64UrlEncode(value: ArrayBuffer | Uint8Array | string) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : value instanceof Uint8Array
        ? value
        : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(payload: string, secret: string) {
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(signature);
}

export function getAdminCookieName() {
  return cookieName;
}

export function getAdminTokenMaxAge() {
  return tokenMaxAgeSeconds;
}

export async function createAdminToken(secret: string) {
  const expiresAt = Date.now() + tokenMaxAgeSeconds * 1000;
  const payload = base64UrlEncode(JSON.stringify({ role: "admin", expiresAt }));
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret || !token.includes(".")) {
    return false;
  }

  const [payload, signature] = token.split(".");
  const expected = await sign(payload, secret);

  if (signature !== expected) {
    return false;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as { role?: string; expiresAt?: number };
    return parsed.role === "admin" && typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}
