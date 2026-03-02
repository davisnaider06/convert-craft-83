const express = require("express");
const router = express.Router();
const generatorController = require("../controllers/generatorController");
const { requireAuth } = require("../middlewares/auth");

router.post("/generate", requireAuth, generatorController.createSite);
router.get("/user/:userId", requireAuth, generatorController.getUserData);
router.get("/sites", requireAuth, generatorController.listSites);
router.get("/sites/:id", requireAuth, generatorController.getSiteById);
router.post("/sites/draft", requireAuth, generatorController.saveDraft);
router.delete("/sites/:id", requireAuth, generatorController.deleteSite);

module.exports = router;
