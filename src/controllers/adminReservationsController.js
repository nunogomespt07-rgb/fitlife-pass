const SportBooking = require("../models/SportBooking");

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(d) {
  if (!d) return "00:00";
  const x = new Date(d);
  return `${pad2(x.getHours())}:${pad2(x.getMinutes())}`;
}

function uiStatusFromBooking(b, now) {
  if (b.status === "cancelled") return "cancelled";
  const start = b.scheduledAt ? new Date(b.scheduledAt) : null;
  if (!start || Number.isNaN(start.getTime())) return "confirmed";
  if (start.getTime() >= now.getTime()) return "confirmed";
  return "completed";
}

/**
 * GET /admin/reservations/metrics
 */
exports.metrics = async (req, res) => {
  try {
    const bookings = await SportBooking.find().lean();
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;

    for (const b of bookings) {
      if (b.status === "cancelled") {
        cancelled += 1;
        continue;
      }
      const d = b.scheduledAt ? new Date(b.scheduledAt) : null;
      const dateStr = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";
      if (dateStr >= today && b.status === "booked") upcoming += 1;
      else if (b.status === "booked") completed += 1;
    }

    const byPartner = {};
    const byActivity = {};
    const byDay = {};
    const byWeek = {};
    const byMonth = {};

    const populated = await SportBooking.find()
      .populate("activity")
      .populate("user", "email name")
      .lean();

    for (const r of populated) {
      const act = r.activity;
      const title = act && act.title ? act.title : "";
      const partnerName =
        act && act.partnerClientSlug ? act.partnerClientSlug : r.partner ? String(r.partner) : "—";

      const d = r.scheduledAt ? new Date(r.scheduledAt) : null;
      const dateStr = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : today;

      byPartner[partnerName] = (byPartner[partnerName] ?? 0) + 1;
      const actKey = title || partnerName;
      byActivity[actKey] = (byActivity[actKey] ?? 0) + 1;
      byDay[dateStr] = (byDay[dateStr] ?? 0) + 1;
      const dd = new Date(dateStr + "T12:00:00");
      const weekStart = new Date(dd);
      weekStart.setDate(dd.getDate() - dd.getDay());
      const weekKey = weekStart.toISOString().slice(0, 10);
      byWeek[weekKey] = (byWeek[weekKey] ?? 0) + 1;
      const monthKey = dateStr.slice(0, 7);
      byMonth[monthKey] = (byMonth[monthKey] ?? 0) + 1;
    }

    return res.json({
      total: bookings.length,
      upcoming,
      completed,
      cancelled,
      noShow: 0,
      byPartner,
      byActivity,
      byDay,
      byWeek,
      byMonth,
    });
  } catch (err) {
    console.error("admin reservations metrics:", err);
    return res.status(500).json({ message: "Erro ao calcular métricas" });
  }
};

/**
 * GET /admin/reservations
 * Query: page, pageSize, status, dateFrom, dateTo, search, sort
 */
exports.listReservations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || "20", 10)));
    const statusFilter = (req.query.status || "").trim();
    const dateFrom = (req.query.dateFrom || "").trim();
    const dateTo = (req.query.dateTo || "").trim();
    const search = (req.query.search || "").trim().toLowerCase();
    const sort = req.query.sort || "newest";

    const rows = await SportBooking.find()
      .populate("activity")
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();

    let list = rows.map((r) => {
      const u = r.user;
      const act = r.activity;
      const d = r.scheduledAt ? new Date(r.scheduledAt) : null;
      const dateStr = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";
      const timeStr = formatTime(d);
      const partnerId =
        act && act.partnerClientSlug
          ? act.partnerClientSlug
          : r.partner
            ? String(r.partner)
            : "";
      const partnerName = act && act.partnerClientSlug ? act.partnerClientSlug : partnerId || "—";
      const uiStatus = uiStatusFromBooking(r, now);

      return {
        id: String(r._id),
        userEmail: (u && u.email) || "",
        customerName: u && u.name ? u.name : null,
        partnerId,
        partnerName,
        activityId: act ? String(act._id) : null,
        activityTitle: act && act.title ? act.title : null,
        type: "activity",
        date: dateStr,
        time: timeStr,
        status: uiStatus,
        creditsUsed: r.creditsUsed || 0,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      };
    });

    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter);
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
          r.userEmail.toLowerCase().includes(search) ||
          (r.customerName || "").toLowerCase().includes(search) ||
          r.partnerName.toLowerCase().includes(search) ||
          (r.activityTitle || "").toLowerCase().includes(search)
      );
    }

    if (sort === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === "date") {
      list = [...list].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return res.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  } catch (err) {
    console.error("admin listReservations:", err);
    return res.status(500).json({ message: "Erro ao listar reservas" });
  }
};
