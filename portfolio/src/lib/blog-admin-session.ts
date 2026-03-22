import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const BLOG_ADMIN_COOKIE = "blog_admin_session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function getSessionSecret(): string | null {
  const s = process.env.BLOG_SESSION_SECRET;
  if (!s || s.length < 16) return null;
  return s;
}

function signPayload(payloadB64url: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64url).digest("base64url");
}

/** Create signed session token: base64url(payload).signature */
export function createSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = Buffer.from(JSON.stringify({ exp }), "utf8").toString(
    "base64url"
  );
  const sig = signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const secret = getSessionSecret();
  if (!secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = signPayload(payloadB64, secret);
  try {
    if (sig.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  try {
    const json = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as { exp?: number };
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const envPw = process.env.BLOG_ADMIN_PASSWORD;
  const secret = getSessionSecret();
  if (!password || !envPw || !secret) return false;
  const a = createHmac("sha256", secret).update(password).digest();
  const b = createHmac("sha256", secret).update(envPw).digest();
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isBlogAdminSession(): boolean {
  const token = cookies().get(BLOG_ADMIN_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
