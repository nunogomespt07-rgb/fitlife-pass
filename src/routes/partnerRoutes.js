const express = require("express");
const router = express.Router();
const Partner = require("../models/Partner");

/**
 * GET /partners
 * Lista todos os parceiros
 */
router.get("/", async (req, res) => {
  try {
    const partners = await Partner.find().lean();

    return res.json(partners);
  } catch (err) {
    console.error("Erro ao buscar partners:", err);
    return res.status(500).json({
      message: "Erro interno",
      error: err.message || String(err),
    });
  }
});

/**
 * GET /partners/with-category
 * Lista parceiros com categoryLabel (para frontend)
 */
router.get("/with-category", async (req, res) => {
  try {
    const partners = await Partner.find().lean();

    const mapped = partners.map((p) => ({
      _id: p._id,
      id: p._id, // fallback
      name: p.name,
      slug: p.slug,
      location: p.location,
      city: p.city || "",
      categorySlug: p.categorySlug || "fitness",
      categoryLabel: p.categoryLabel || "Fitness",
      image: p.image || p.imageSrc || "",
    }));

    return res.json(mapped);
  } catch (err) {
    console.error("Erro ao buscar partners com categoria:", err);
    return res.status(500).json({
      message: "Erro interno",
      error: err.message || String(err),
    });
  }
});

/**
 * GET /partners/:id
 * Buscar partner por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).lean();

    if (!partner) {
      return res.status(404).json({ message: "Partner não encontrado" });
    }

    return res.json(partner);
  } catch (err) {
    console.error("Erro ao buscar partner:", err);
    return res.status(500).json({
      message: "Erro interno",
      error: err.message || String(err),
    });
  }
});

/**
 * GET /partners/:slug/:id
 * (rota usada no frontend tipo /atividades/... )
 */
router.get("/:slug/:id", async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).lean();

    if (!partner) {
      return res.status(404).json({ message: "Partner não encontrado" });
    }

    return res.json(partner);
  } catch (err) {
    console.error("Erro ao buscar partner por slug/id:", err);
    return res.status(500).json({
      message: "Erro interno",
      error: err.message || String(err),
    });
  }
});

module.exports = router;
