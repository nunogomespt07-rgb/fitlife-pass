/**
 * Server-only data access for admin and customer state.
 * Used by API routes only. Do not import in client components.
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const CUSTOMER_STATE_FILE = path.join(DATA_DIR, "demo-customer-state.json");
const RESERVATIONS_FILE = path.join(DATA_DIR, "demo-reservations.json");

export type CustomerStateRecord = {
  purchasedCredits?: number;
  subscriptionPlanId?: string | null;
  subscriptionPlanName?: string | null;
  createdAt?: string;
  fullName?: string | null;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  blocked?: boolean;
  deletedAt?: string | null;
};

export type CustomerStateStore = Record<string, CustomerStateRecord>;

export type ServerReservation = {
  id: string;
  userEmail: string;
  customerName?: string | null;
  partnerId: string;
  partnerName: string;
  activityId?: string | null;
  activityTitle?: string | null;
  type: "activity" | "restaurant" | "gym";
  date: string;
  time: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
  cancelledAt?: string | null;
  completedAt?: string | null;
};

export type ReservationsStore = { reservations: ServerReservation[] };

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export async function readCustomerState(): Promise<CustomerStateStore> {
  try {
    const raw = await fs.readFile(CUSTOMER_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? (parsed as CustomerStateStore) : {};
  } catch {
    return {};
  }
}

export async function readReservations(): Promise<ServerReservation[]> {
  try {
    const raw = await fs.readFile(RESERVATIONS_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "reservations" in parsed && Array.isArray((parsed as ReservationsStore).reservations)) {
      return (parsed as ReservationsStore).reservations;
    }
    return [];
  } catch {
    return [];
  }
}

export async function appendReservation(r: ServerReservation): Promise<void> {
  const list = await readReservations();
  list.push(r);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify({ reservations: list }, null, 2), "utf8");
}

export async function writeReservations(list: ServerReservation[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RESERVATIONS_FILE, JSON.stringify({ reservations: list }, null, 2), "utf8");
}

export async function updateCustomerState(
  key: string,
  patch: Partial<CustomerStateRecord>
): Promise<void> {
  const store = await readCustomerState();
  const prev = store[key] ?? {};
  store[key] = { ...prev, ...patch };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CUSTOMER_STATE_FILE, JSON.stringify(store, null, 2), "utf8");
}
