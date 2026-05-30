/**
 * Edge Runtime compatible JWT verification using Web Crypto API.
 * Used by middleware (which runs in Edge Runtime where Node.js crypto is unavailable).
 * For signing tokens in API routes, use jwt.ts (which uses jsonwebtoken).
 */

type AccessTokenPayload = {
  userId: string;
  email: string;
};

type RefreshTokenPayload = {
  userId: string;
};

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyHS256(
  token: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  // Verify header is HS256
  try {
    const header = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(headerB64)),
    );
    if (header.alg !== "HS256") return null;
  } catch {
    return null;
  }

  // Import the secret key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  // Verify signature
  const signedContent = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    signedContent,
  );
  if (!valid) return null;

  // Parse payload
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64)),
    );

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function verifyAccessTokenEdge(
  token: string,
): Promise<AccessTokenPayload | null> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) return null;

  const payload = await verifyHS256(token, secret);
  if (!payload || !payload.userId || !payload.email) return null;

  return { userId: payload.userId as string, email: payload.email as string };
}

export async function verifyRefreshTokenEdge(
  token: string,
): Promise<RefreshTokenPayload | null> {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) return null;

  const payload = await verifyHS256(token, secret);
  if (!payload || !payload.userId) return null;

  return { userId: payload.userId as string };
}
