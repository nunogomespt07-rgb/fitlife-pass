import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Validate required env at load time so /api/auth/error is easier to diagnose
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

if (typeof window === "undefined") {
  if (!GOOGLE_CLIENT_ID?.trim()) {
    console.error("[NextAuth] GOOGLE_CLIENT_ID is missing or empty. Set it in .env.local (web folder).");
  }
  if (!GOOGLE_CLIENT_SECRET?.trim()) {
    console.error("[NextAuth] GOOGLE_CLIENT_SECRET is missing or empty. Set it in .env.local (web folder).");
  }
  if (!NEXTAUTH_SECRET?.trim()) {
    console.error("[NextAuth] NEXTAUTH_SECRET is missing or empty. Required for production. Generate with: openssl rand -hex 32");
  }
  if (!NEXTAUTH_URL?.trim()) {
    console.error("[NextAuth] NEXTAUTH_URL is missing or empty. OAuth callback will fail. Set to e.g. http://localhost:3000 (no trailing slash). In Google Cloud Console add redirect URI: http://localhost:3000/api/auth/callback/google");
  } else if (NEXTAUTH_URL.endsWith("/")) {
    console.warn("[NextAuth] NEXTAUTH_URL should not have a trailing slash. Current:", NEXTAUTH_URL);
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: NEXTAUTH_SECRET ?? undefined,
});

export { handler as GET, handler as POST };