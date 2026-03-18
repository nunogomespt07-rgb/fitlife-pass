import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminApiAuth";
import { readReservations } from "@/lib/adminDataServer";

export async function GET(req: NextRequest) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const status = searchParams.get("status") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const sort = searchParams.get("sort") ?? "newest";

  let list = await readReservations();

  if (status) {
    list = list.filter((r) => r.status === status);
  }
  if (dateFrom) {
    list = list.filter((r) => r.date >= dateFrom);
  }
  if (dateTo) {
    list = list.filter((r) => r.date <= dateTo);
  }
  if (search) {
    list = list.filter(
      (r) =>
        r.userEmail?.toLowerCase().includes(search) ||
        r.customerName?.toLowerCase().includes(search) ||
        r.partnerName?.toLowerCase().includes(search) ||
        (r.activityTitle ?? "").toLowerCase().includes(search)
    );
  }

  if (sort === "oldest") {
    list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === "date") {
    list = [...list].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  } else {
    list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
