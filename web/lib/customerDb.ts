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
  const now = new Date().toISOString();
  const set: Record<string, unknown> = { updatedAt: now };
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
  const email = params.email.trim().toLowerCase();
  const name = params.name ?? null;
  const col = await getCustomersCollection();
  await ensureCollectionIndex();

  const now = new Date().toISOString();
  const res = await col.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        email,
        name,
        credits: 0,
        plan: null,
        createdAt: now,
        updatedAt: now,
      },
      $set: {
        ...(name ? { name } : {}),
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const customer = (res.value ?? null) as CustomerDocument | null;
  // MongoDB driver shape varies slightly; use best-effort flag.
  const created =
    !!(res as unknown as { lastErrorObject?: { updatedExisting?: boolean } }).lastErrorObject &&
    (res as unknown as { lastErrorObject?: { updatedExisting?: boolean } }).lastErrorObject!.updatedExisting === false;

  if (!customer) {
    // Fallback: should not happen, but keep API stable.
    const doc: CustomerDocument = {
      email,
      name,
      credits: 0,
      plan: null,
      createdAt: now,
      updatedAt: now,
    };
    return { customer: doc, created: true };
  }

  return { customer, created };
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
  const canonical = email.trim().toLowerCase();
  if (!canonical) return;
  const set = patchToSet(patch);
  if (Object.keys(set).length <= 1) return; // only updatedAt
  const col = await getCustomersCollection();
  const now = new Date().toISOString();
  await ensureCollectionIndex();
  await col.updateOne(
    { email: canonical },
    {
      $set: set,
      $setOnInsert: {
        email: canonical,
        name: null,
        credits: 0,
        plan: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true }
  );
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
