const User = require("../models/User");
const SportBooking = require("../models/SportBooking");

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toIso(d) {
  if (!d) return null;
  try {
    return new Date(d).toISOString();
  } catch {
    return null;
  }
}

/**
 * GET /admin/customers
 * Query: search, city, plan (with|without), status (active|inactive|blocked), page, limit|pageSize, sort
 */
exports.listCustomers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit || req.query.pageSize || "20", 10))
    );
    const search = (req.query.search || "").trim();
    const cityQ = (req.query.city || "").trim();
    const countryQ = (req.query.country || "").trim();
    const planFilter = req.query.plan || "";
    const statusFilter = (req.query.status || "").trim();
    const sort = req.query.sort || "newest";
    const dateFrom = (req.query.dateFrom || "").trim();
    const dateTo = (req.query.dateTo || "").trim();
    const creditsMin =
      req.query.creditsMin !== undefined && req.query.creditsMin !== ""
        ? parseInt(String(req.query.creditsMin), 10)
        : null;
    const creditsMax =
      req.query.creditsMax !== undefined && req.query.creditsMax !== ""
        ? parseInt(String(req.query.creditsMax), 10)
        : null;
    const reservationsMin =
      req.query.reservationsMin !== undefined && req.query.reservationsMin !== ""
        ? parseInt(String(req.query.reservationsMin), 10)
        : null;
    const activityFilter = (req.query.activity || "").trim();

    const filter = {};
    const andParts = [];

    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      andParts.push({ $or: [{ email: rx }, { name: rx }, { phone: rx }] });
    }
    if (cityQ) {
      filter.city = new RegExp(escapeRegex(cityQ), "i");
    }
    if (countryQ) {
      filter.country = new RegExp(escapeRegex(countryQ), "i");
    }
    if (planFilter === "with") {
      andParts.push({ plan: { $nin: [null, ""] } });
    } else if (planFilter === "without") {
      andParts.push({
        $or: [{ plan: null }, { plan: "" }, { plan: { $exists: false } }],
      });
    }
    if (andParts.length > 0) {
      filter.$and = andParts;
    }

    const allUsers = await User.find(filter).lean();

    const bookingAgg = await SportBooking.aggregate([
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
          lastDate: { $max: "$scheduledAt" },
        },
      },
    ]);

    const statsByUserId = new Map();
    for (const b of bookingAgg) {
      statsByUserId.set(String(b._id), {
        count: b.count,
        lastDate: b.lastDate || null,
      });
    }

    let rows = allUsers.map((u) => {
      const st = statsByUserId.get(String(u._id)) || { count: 0, lastDate: null };
      const lastActivity = st.lastDate ? new Date(st.lastDate).toISOString().slice(0, 10) : null;
      const blocked = !!u.blocked;
      const totalReservations = st.count;
      const status = blocked ? "blocked" : totalReservations > 0 ? "active" : "inactive";
      const email = (u.email || "").trim();
      const credits = typeof u.credits === "number" ? Math.max(0, Math.floor(u.credits)) : 0;

      return {
        id: String(u._id),
        name: u.name ?? null,
        email,
        phone: u.phone ?? null,
        city: u.city ?? null,
        country: u.country ?? null,
        credits,
        plan: u.plan ?? null,
        createdAt: toIso(u.createdAt),
        updatedAt: toIso(u.updatedAt),
        fullName: u.name ?? null,
        userEmail: email,
        currentPlan: u.plan ?? null,
        purchasedCredits: credits,
        totalReservations,
        lastActivity,
        status,
        blocked,
      };
    });

    if (statusFilter === "active") {
      rows = rows.filter((r) => r.status === "active");
    } else if (statusFilter === "inactive") {
      rows = rows.filter((r) => r.status === "inactive");
    } else if (statusFilter === "blocked") {
      rows = rows.filter((r) => r.status === "blocked");
    }

    if (dateFrom) {
      rows = rows.filter((r) => r.createdAt && r.createdAt.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      rows = rows.filter((r) => r.createdAt && r.createdAt.slice(0, 10) <= dateTo);
    }
    if (creditsMin !== null && !Number.isNaN(creditsMin)) {
      rows = rows.filter((r) => r.purchasedCredits >= creditsMin);
    }
    if (creditsMax !== null && !Number.isNaN(creditsMax)) {
      rows = rows.filter((r) => r.purchasedCredits <= creditsMax);
    }
    if (reservationsMin !== null && !Number.isNaN(reservationsMin)) {
      rows = rows.filter((r) => r.totalReservations >= reservationsMin);
    }
    if (activityFilter === "with") {
      rows = rows.filter(
        (r) => r.totalReservations > 0 || (r.lastActivity != null && r.lastActivity !== "")
      );
    } else if (activityFilter === "without") {
      rows = rows.filter(
        (r) => r.totalReservations === 0 && (r.lastActivity == null || r.lastActivity === "")
      );
    }

    if (sort === "oldest") {
      rows.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
    } else if (sort === "email") {
      rows.sort((a, b) => a.email.localeCompare(b.email));
    } else if (sort === "reservations") {
      rows.sort((a, b) => b.totalReservations - a.totalReservations);
    } else {
      rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    const total = rows.length;
    const start = (page - 1) * limit;
    const pageItems = rows.slice(start, start + limit);
    const pages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      customers: pageItems,
      items: pageItems,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
      page,
      pageSize: limit,
      totalPages: pages,
      total,
    });
  } catch (err) {
    console.error("listCustomers error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Erro ao listar clientes",
    });
  }
};

/**
 * GET /admin/customers/metrics
 */
exports.customerMetrics = async (_req, res) => {
  try {
    const users = await User.find({}).lean();
    const now = new Date();
    const todayStart = now.toISOString().slice(0, 10);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const monthStart = now.toISOString().slice(0, 7);

    let newToday = 0;
    let newWeek = 0;
    let newMonth = 0;
    let withPlan = 0;
    let withoutPlan = 0;

    for (const u of users) {
      const createdStr = u.createdAt ? new Date(u.createdAt).toISOString() : "";
      if (createdStr) {
        const d = createdStr.slice(0, 10);
        if (d >= todayStart) newToday++;
        if (d >= weekStartStr) newWeek++;
        if (createdStr.slice(0, 7) >= monthStart) newMonth++;
      } else {
        newMonth++;
      }
      if (u.plan && String(u.plan).trim() !== "") withPlan++;
      else withoutPlan++;
    }

    const metrics = {
      totalUsers: users.length,
      newToday,
      newWeek,
      newMonth,
      withPlan,
      withoutPlan,
      activeUsers: users.length,
    };
    return res.json({
      success: true,
      metrics,
      totalUsers: metrics.totalUsers,
      newToday: metrics.newToday,
      newWeek: metrics.newWeek,
      newMonth: metrics.newMonth,
      withPlan: metrics.withPlan,
      withoutPlan: metrics.withoutPlan,
      activeUsers: metrics.activeUsers,
    });
  } catch (err) {
    console.error("customerMetrics error:", err);
    return res.status(500).json({
      success: false,
      totalUsers: 0,
      newToday: 0,
      newWeek: 0,
      newMonth: 0,
      withPlan: 0,
      withoutPlan: 0,
      activeUsers: 0,
      message: err?.message || "Erro",
    });
  }
};
