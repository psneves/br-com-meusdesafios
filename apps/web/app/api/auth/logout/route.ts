import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  session.destroy();

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/login", appUrl));
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}

export async function POST() {
  const session = await getSession();
  session.destroy();

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/login", appUrl));
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
