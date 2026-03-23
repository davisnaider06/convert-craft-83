const express = require("express");
const router = express.Router();
const generatorController = require("../controllers/generatorController");
const paymentsController = require("../controllers/paymentsController");
const { requireAuth } = require("../middlewares/auth");

router.post("/generate", requireAuth, generatorController.createSite);
router.get("/user/:userId", requireAuth, generatorController.getUserData);
router.get("/sites", requireAuth, generatorController.listSites);
router.get("/sites/:id", requireAuth, generatorController.getSiteById);
router.post("/sites/draft", requireAuth, generatorController.saveDraft);
router.delete("/sites/:id", requireAuth, generatorController.deleteSite);

router.get("/billing/overview", requireAuth, paymentsController.getBillingOverview);
router.get("/payments/installments", requireAuth, paymentsController.getInstallments);
router.post("/payments/checkout", requireAuth, paymentsController.createCheckout);
router.get("/payments/transactions/:externalId", requireAuth, paymentsController.getCheckoutStatus);
router.post("/payments/webhook/register", requireAuth, paymentsController.registerRisePayWebhook);

module.exports = router;
