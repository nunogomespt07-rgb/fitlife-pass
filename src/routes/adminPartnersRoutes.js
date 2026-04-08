const express = require("express");
const router = express.Router();
const adminPartnersController = require("../controllers/adminPartnersController");


// List all partners
router.get("/", adminPartnersController.listPartners);
// Get single partner
router.get("/:id", adminPartnersController.getPartner);
// Create partner
router.post("/", adminPartnersController.createPartner);
// Update partner
router.put("/:id", adminPartnersController.updatePartner);
// Delete partner
router.delete("/:id", adminPartnersController.deletePartner);

module.exports = router;
