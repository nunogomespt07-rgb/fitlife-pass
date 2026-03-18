/**
 * MongoDB connection for server-side API routes only.
 * Uses MONGODB_URI. Do not import in client components.
 */

import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "fitlife";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local to use the database.");
  }
  if (cachedDb) return cachedDb;
  const client = await MongoClient.connect(uri);
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
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
