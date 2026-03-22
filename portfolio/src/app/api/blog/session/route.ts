import { NextResponse } from "next/server";
import { isBlogAdminSession } from "@/lib/blog-admin-session";

export async function GET() {
  return NextResponse.json({ ok: isBlogAdminSession() });
}
