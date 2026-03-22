import { NextResponse } from "next/server";
import {
  BLOG_ADMIN_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/blog-admin-session";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const password = body.password ?? "";
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = createSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Server missing BLOG_SESSION_SECRET" },
      { status: 500 }
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(BLOG_ADMIN_COOKIE, token, sessionCookieOptions());
  return res;
}
