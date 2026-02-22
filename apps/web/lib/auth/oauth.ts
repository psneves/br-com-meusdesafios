import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID;

const googleClient =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    : null;

const validAudiences = [GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID].filter(
  Boolean
) as string[];

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function verifyGoogleToken(
  idToken: string
): Promise<GoogleProfile | null> {
  if (!googleClient) {
    throw new Error("Google OAuth not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: validAudiences,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email || "",
    name: payload.name || "",
    picture: payload.picture || "",
  };
}

export function getGoogleAuthUrl(redirectUri: string): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID not configured");
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
) {
  if (!googleClient) {
    throw new Error("Google OAuth not configured");
  }

  const { tokens } = await googleClient.getToken({
    code,
    redirect_uri: redirectUri,
  });

  return tokens;
}
