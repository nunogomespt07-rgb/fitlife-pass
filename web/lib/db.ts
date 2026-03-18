/**
 * MongoDB connection for server-side API routes only.
 * Uses MONGODB_URI. Do not import in client components.
 */

import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "fitlife";
const envAuthSource = process.env.MONGODB_AUTH_SOURCE ?? "";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

function maskMongoUri(input: string): string {
  // Mask password part only (keep host/path).
  // Example: mongodb+srv://user:pass@host/db?...
  return input.replace(/^(mongodb(?:\+srv)?:\/\/[^:]+):([^@]+)@/i, "$1:***@");
}

function parseMongoHost(input: string): string | null {
  const at = input.indexOf("@");
  if (at === -1) return null;
  const afterAt = input.slice(at + 1);
  const host = afterAt.split("/")[0]?.split("?")[0];
  return host || null;
}

function parseMongoDbFromUri(input: string): string | null {
  // Extract DB name from "/<db>" segment in the URI path.
  const at = input.indexOf("@");
  if (at === -1) return null;
  const firstSlashAfterAt = input.indexOf("/", at);
  if (firstSlashAfterAt === -1) return null;
  const pathPart = input.slice(firstSlashAfterAt + 1);
  const dbPart = pathPart.split("?")[0]?.split("/")[0];
  return dbPart || null;
}

function parseAuthSourceFromUri(input: string): string | null {
  const m = input.match(/[?&]authSource=([^&]+)/i);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function isAuthError(errMessage: string): boolean {
  return /bad auth|authentication failed|auth failed/i.test(errMessage);
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local to use the database.");
  }
  if (cachedDb) return cachedDb;

  const scheme = uri.startsWith("mongodb+srv://") ? "mongodb+srv" : "mongodb";
  const host = parseMongoHost(uri);
  const dbFromUri = parseMongoDbFromUri(uri);
  const authSourceFromUri = parseAuthSourceFromUri(uri);
  const maskedUri = maskMongoUri(uri);

  console.log("[mongo] connect config", {
    envVar: "MONGODB_URI",
    scheme,
    host,
    dbNameSelected: dbName,
    dbNameFromUri: dbFromUri,
    authSourceFromUri: authSourceFromUri ?? null,
    hasEnvAuthSource: !!envAuthSource,
    authSourceEnv: envAuthSource ? "***" : null,
    maskedUri,
  });

  async function connectOnce(authSource?: string) {
    const options: Record<string, unknown> = {};
    if (authSource) options.authSource = authSource;
    return MongoClient.connect(uri, options);
  }

  try {
    const client = await connectOnce(envAuthSource || undefined);
    cachedClient = client;
    cachedDb = client.db(dbName);
    return cachedDb;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[mongo] connect error", { message });

    if (isAuthError(message)) {
      // Retry matrix for authSource mismatch. Never changes credentials.
      const candidates: string[] = [];
      // Common Atlas default.
      if (!candidates.includes("admin")) candidates.push("admin");
      // URI db name, if present.
      if (dbFromUri && !candidates.includes(dbFromUri)) candidates.push(dbFromUri);
      // App selected db name.
      if (dbName && !candidates.includes(dbName)) candidates.push(dbName);

      for (const candidate of candidates) {
        try {
          console.warn("[mongo] retrying connect with authSource", candidate);
          const client2 = await connectOnce(candidate);
          cachedClient = client2;
          cachedDb = client2.db(dbName);
          return cachedDb;
        } catch (e2) {
          const m2 = e2 instanceof Error ? e2.message : String(e2);
          console.warn("[mongo] retry authSource failed", {
            authSource: candidate,
            message: m2,
          });
        }
      }
    }

    throw err;
  }
}

export function getCustomersCollection() {
  return getDb().then((db) => db.collection<CustomerDocument>("customers"));
}

/** DB document shape for customers collection */
export type CustomerDocument = {
  _id?: unknown;
  email: string;
  name: string | null;
  credits: number;
  /** Idempotency keys for credit grants (e.g., Stripe session/payment intent ids) */
  processedCreditEvents?: string[];
  plan: string | null;
  planId?: string | null;
  planName?: string | null;
  createdAt: string;
  updatedAt: string;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  blocked?: boolean;
  deletedAt?: string | null;
};
