import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { promises as fs } from "fs";
import path from "path";

type CustomerState = {
  purchasedCredits?: number;
  subscriptionPlanId?: string | null;
  subscriptionPlanName?: string | null;
};

type StoreShape = Record<string, CustomerState>;

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.trim()
    ? process.env.NEXTAUTH_SECRET
    : "demo-nextauth-secret";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function clampCredits(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

function storeFilePath(): string {
  // DEMO ONLY: file-based store to keep account state consistent across devices hitting the same app instance.
  // In production this must live in a real database keyed by a stable user id.
  // process.cwd() in this app already points at the Next.js app root ("web"), so do not prepend "web" again.
  return path.join(process.cwd(), ".data", "demo-customer-state.json");
}

async function readStore(): Promise<StoreShape> {
  const file = storeFilePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? (parsed as StoreShape) : {};
  } catch {
    return {};
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  const file = storeFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}

/** Canonical key for authenticated users: ONLY normalized lowercase session email. No sub/userId/body fallback — ensures same key across devices. */
async function getCanonicalKey(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: AUTH_SECRET });
  const email = typeof token?.email === "string" ? token.email.trim().toLowerCase() : "";
  if (!email) return null;
  return `u:${email}`;
}

export async function GET(req: NextRequest) {
  const key = await getCanonicalKey(req);
  if (!key) {
    console.log("[credits][GET] no canonical key (session email missing)");
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const store = await readStore();
  const state = store[key] ?? {};
  const purchasedCredits = clampCredits(state.purchasedCredits) ?? 0;
  console.log("[credits][GET] canonical key", key, "[credits][session email]", key.replace(/^u:/, ""), "[credits][final returned value]", purchasedCredits);
  return Response.json(
    {
      purchasedCredits,
      subscriptionPlanId: state.subscriptionPlanId ?? null,
      subscriptionPlanName: state.subscriptionPlanName ?? null,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const key = await getCanonicalKey(req);
  if (!key) {
    console.log("[credits][POST] no canonical key (session email missing)");
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as unknown;
  if (!isRecord(body)) return Response.json({ message: "Invalid payload" }, { status: 400 });
  // Never use body.userId for key — key is from session only.

  const next: CustomerState = {};
  if ("purchasedCredits" in body) next.purchasedCredits = clampCredits(body.purchasedCredits);
  if ("subscriptionPlanId" in body) next.subscriptionPlanId = body.subscriptionPlanId == null ? null : String(body.subscriptionPlanId);
  if ("subscriptionPlanName" in body) next.subscriptionPlanName = body.subscriptionPlanName == null ? null : String(body.subscriptionPlanName);

  const store = await readStore();
  const prev = store[key] ?? {};
  const merged: CustomerState = {
    ...prev,
    ...Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined)),
  };
  store[key] = merged;
  await writeStore(store);

  const purchasedCredits = clampCredits(merged.purchasedCredits) ?? 0;
  console.log("[credits][POST] canonical key", key, "[credits][session email]", key.replace(/^u:/, ""), "[credits][final returned value]", purchasedCredits);
  return Response.json(
    {
      success: true,
      purchasedCredits,
      subscriptionPlanId: merged.subscriptionPlanId ?? null,
      subscriptionPlanName: merged.subscriptionPlanName ?? null,
    },
    { status: 200 }
  );
}

