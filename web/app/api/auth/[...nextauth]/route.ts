import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Validate required env at load time so /api/auth/error is easier to diagnose
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
// DEMO ONLY fallback so JWT decoding works consistently without env vars in dev.
// In production, always set NEXTAUTH_SECRET.
const AUTH_SECRET = (NEXTAUTH_SECRET && NEXTAUTH_SECRET.trim()) ? NEXTAUTH_SECRET : "demo-nextauth-secret";
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "").trim();
        if (!email || !password) return null;

        // Server-side login against backend auth (demo/prod). This enables auto-login after register.
        const base =
          process.env.BACKEND_API_URL?.replace(/\/$/, "") ||
          process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        if (!base) return null;

        const res = await fetch(`${base}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) return null;

        const data = (await res.json().catch(() => null)) as
          | { user?: { id?: string; name?: string; email?: string } }
          | null;
        const u = data?.user;
        if (!u?.id) return null;
        return {
          id: u.id,
          name: u.name ?? "",
          email: u.email ?? email,
        };
      },
    }),
  ],
  secret: AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as { id?: string }).id ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token as { userId?: string }).userId ?? token.sub ?? "";
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };