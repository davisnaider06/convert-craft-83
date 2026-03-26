const express = require("express");
const router = express.Router();
const generatorController = require("../controllers/generatorController");
const paymentsController = require("../controllers/paymentsController");
const { requireAuth } = require("../middlewares/auth");
const { requireAdmin } = require("../middlewares/admin");
const adminController = require("../controllers/adminController");
const fullstackController = require("../controllers/fullstackController");

router.post("/generate", requireAuth, generatorController.createSite);
router.get("/user/:userId", requireAuth, generatorController.getUserData);
router.get("/sites", requireAuth, generatorController.listSites);
router.get("/sites/:id", requireAuth, generatorController.getSiteById);
router.post("/sites/draft", requireAuth, generatorController.saveDraft);
router.delete("/sites/:id", requireAuth, generatorController.deleteSite);
router.post("/sites/:id/unpublish", requireAuth, requireAdmin, generatorController.unpublishSite);
router.patch("/sites/:id/domain", requireAuth, generatorController.updateSiteDomain);

router.get("/generations", requireAuth, generatorController.listGenerations);

router.get("/billing/overview", requireAuth, paymentsController.getBillingOverview);
router.get("/payments/installments", requireAuth, paymentsController.getInstallments);
router.post("/payments/checkout", requireAuth, paymentsController.createCheckout);
router.get("/payments/transactions/:externalId", requireAuth, paymentsController.getCheckoutStatus);
router.post("/payments/webhook/register", requireAuth, paymentsController.registerRisePayWebhook);

// Fullstack Engine (Next.js + Supabase)
router.post("/fullstack/generate", requireAuth, fullstackController.generate);

router.get("/admin/users", requireAuth, requireAdmin, adminController.listUsers);
router.post("/admin/users/:userId/plan", requireAuth, requireAdmin, adminController.updateUserPlan);
router.post("/admin/users/:userId/credits", requireAuth, requireAdmin, adminController.addUserCredits);
router.post("/admin/users/:userId/reset", requireAuth, requireAdmin, adminController.resetUserCredits);

router.get("/admin/sites", requireAuth, requireAdmin, adminController.listSites);
router.post("/admin/sites/:siteId/publish", requireAuth, requireAdmin, adminController.publishAdminSite);
router.post("/admin/sites/:siteId/unpublish", requireAuth, requireAdmin, adminController.unpublishAdminSite);
router.delete("/admin/sites/:siteId", requireAuth, requireAdmin, adminController.deleteAdminSite);

router.get("/admin/transactions", requireAuth, requireAdmin, adminController.listTransactions);
router.get("/admin/webhooks/logs", requireAuth, requireAdmin, adminController.listWebhookLogs);
router.get("/admin/overview", requireAuth, requireAdmin, adminController.getOverview);
router.get("/admin/analytics", requireAuth, requireAdmin, adminController.getAnalytics);

module.exports = router;
