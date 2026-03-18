import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import { readReservations } from "@/lib/adminDataServer";
import { partnerPayoutFromTotal, revenueFromCredits } from "@/lib/adminFinanceConfig";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const visibility = searchParams.get("visibility") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "name";

  const partners = getAllPartnersWithCategory();
  const reservations = await readReservations();

  const resCountByPartner: Record<string, number> = {};
  const revenueByPartner: Record<string, number> = {};
  for (const r of reservations) {
    resCountByPartner[r.partnerId] = (resCountByPartner[r.partnerId] ?? 0) + 1;
    const rev = revenueFromCredits(r.creditsUsed ?? 0);
    revenueByPartner[r.partnerId] = (revenueByPartner[r.partnerId] ?? 0) + rev;
  }

  let list = partners.map((p) => ({
    partnerId: p.id,
    partnerName: p.name,
    category: p.categoryLabel,
    categorySlug: p.categorySlug,
    city: p.city ?? p.location ?? "",
    visible: p.isActive !== false,
    totalActivities: p.activitiesCount ?? 0,
    totalReservations: resCountByPartner[p.id] ?? 0,
    totalRevenue: revenueByPartner[p.id] ?? 0,
    payoutEstimate: partnerPayoutFromTotal(revenueByPartner[p.id] ?? 0),
    createdAt: null as string | null,
  }));

  if (search) {
    list = list.filter(
      (p) =>
        p.partnerName.toLowerCase().includes(search) ||
        (p.city ?? "").toLowerCase().includes(search) ||
        (p.category ?? "").toLowerCase().includes(search)
    );
  }
  if (visibility === "visible") list = list.filter((p) => p.visible);
  if (visibility === "hidden") list = list.filter((p) => !p.visible);
  if (category) list = list.filter((p) => p.categorySlug === category || (p.category ?? "").toLowerCase().includes(category.toLowerCase()));

  if (sort === "newest") {
    list = [...list].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  } else if (sort === "reservations") {
    list = [...list].sort((a, b) => b.totalReservations - a.totalReservations);
  } else if (sort === "revenue") {
    list = [...list].sort((a, b) => b.totalRevenue - a.totalRevenue);
  } else {
    list = [...list].sort((a, b) => a.partnerName.localeCompare(b.partnerName));
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);

  return Response.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
