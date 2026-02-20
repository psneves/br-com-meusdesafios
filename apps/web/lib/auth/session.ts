import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  // avatarUrl is stored only in DB (base64 too large for cookies)
  isLoggedIn: boolean;
  provider?: "google";
}

const FALLBACK_PASSWORD = "dev_dummy_password_32_chars_long__";
const sessionPassword =
  process.env.SECRET_COOKIE_PASSWORD &&
  process.env.SECRET_COOKIE_PASSWORD.length >= 32
    ? process.env.SECRET_COOKIE_PASSWORD
    : FALLBACK_PASSWORD;

export const SESSION_COOKIE_NAME = "meusdesafios-session";

export const sessionOptions = {
  password: sessionPassword,
  cookieName: SESSION_COOKIE_NAME,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

if (sessionPassword === FALLBACK_PASSWORD) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SECRET_COOKIE_PASSWORD is not set or too short. Set a >= 32 char random string in production."
    );
  } else {
    console.warn(
      "[meusdesafios] Using fallback cookie password. Set SECRET_COOKIE_PASSWORD for stronger security."
    );
  }
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookiesValue = await cookies();
  const session = await getIronSession<SessionData>(
    cookiesValue,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }

  return session;
}
