/**
 * Customer state in MongoDB. Replaces file-based demo-customer-state.json.
 * Used by adminDataServer and API routes. Do not import in client components.
 */

import type { CustomerStateRecord } from "@/lib/adminDataServer";
import { getCustomersCollection, type CustomerDocument } from "@/lib/db";

function toRecord(doc: CustomerDocument | null): CustomerStateRecord | null {
  if (!doc) return null;
  return {
    purchasedCredits: doc.credits,
    subscriptionPlanId: doc.planId ?? doc.plan ?? null,
    subscriptionPlanName: doc.planName ?? doc.plan ?? null,
    createdAt: doc.createdAt,
    fullName: doc.name,
    country: doc.country ?? null,
    city: doc.city ?? null,
    phone: doc.phone ?? null,
    blocked: doc.blocked ?? false,
    deletedAt: doc.deletedAt ?? null,
  };
}

function patchToSet(patch: Partial<CustomerStateRecord>): Record<string, unknown> {
  const set: Record<string, unknown> = {};
  if (patch.purchasedCredits !== undefined) set.credits = Math.max(0, Math.floor(patch.purchasedCredits));
  if (patch.subscriptionPlanId !== undefined) set.planId = patch.subscriptionPlanId;
  if (patch.subscriptionPlanName !== undefined) set.planName = patch.subscriptionPlanName;
  if (patch.fullName !== undefined) set.name = patch.fullName;
  if (patch.country !== undefined) set.country = patch.country;
  if (patch.city !== undefined) set.city = patch.city;
  if (patch.phone !== undefined) set.phone = patch.phone;
  if (patch.blocked !== undefined) set.blocked = patch.blocked;
  if (patch.deletedAt !== undefined) set.deletedAt = patch.deletedAt;
  if (patch.createdAt !== undefined) set.createdAt = patch.createdAt;
  if (set.planId !== undefined || set.planName !== undefined) {
    set.plan = (set.planName as string) ?? (set.planId as string) ?? null;
  }
  return set;
}

export async function ensureCollectionIndex(): Promise<void> {
  const col = await getCustomersCollection();
  try {
    await col.createIndex({ email: 1 }, { unique: true });
  } catch {
    // index may already exist
  }
}

export async function findCustomerByEmail(email: string): Promise<CustomerDocument | null> {
  const canonical = email.trim().toLowerCase();
  if (!canonical) return null;
  const col = await getCustomersCollection();
  const doc = await col.findOne({ email: canonical });
  return doc as CustomerDocument | null;
}

/** Create user if not exists; return existing or new (atomic upsert). */
export async function ensureCustomerWithMeta(params: {
  email: string;
  name?: string | null;
}): Promise<{ customer: CustomerDocument; created: boolean }> {
  // Source of truth was unified to Railway User model.
  // Keep this helper explicit to avoid accidental writes to customers collection.
  throw new Error("customerDb writes are disabled: use Railway User endpoints instead.");
}

export async function ensureCustomer(params: {
  email: string;
  name?: string | null;
}): Promise<CustomerDocument> {
  const { customer } = await ensureCustomerWithMeta(params);
  return customer;
}

export async function updateCustomerByEmail(
  email: string,
  patch: Partial<CustomerStateRecord>
): Promise<void> {
  void email;
  void patch;
  throw new Error("customerDb writes are disabled: use Railway User endpoints instead.");
}

export async function grantCreditsIdempotent(params: {
  email: string;
  amount: number;
  eventId?: string | null;
}): Promise<{ applied: boolean; credits: number }> {
  void params;
  throw new Error("customerDb writes are disabled: use Railway User endpoints instead.");
}

/** Returns store shape keyed by u:email for drop-in replacement of readCustomerState. */
export async function findAllCustomersAsStore(): Promise<Record<string, CustomerStateRecord>> {
  const col = await getCustomersCollection();
  const cursor = col.find({});
  const store: Record<string, CustomerStateRecord> = {};
  for await (const doc of cursor) {
    const d = doc as CustomerDocument;
    const key = `u:${d.email}`;
    const rec = toRecord(d);
    if (rec) store[key] = rec;
  }
  return store;
}

export function customerToRecord(doc: CustomerDocument | null): CustomerStateRecord | null {
  return toRecord(doc);
}
