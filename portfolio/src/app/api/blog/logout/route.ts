import { NextResponse } from "next/server";
import { BLOG_ADMIN_COOKIE } from "@/lib/blog-admin-session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(BLOG_ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
