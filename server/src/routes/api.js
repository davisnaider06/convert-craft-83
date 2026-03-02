const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');
const { requireAuth } = require("../middlewares/auth");

<<<<<<< HEAD
// Rota POST: /api/generate - Gera site completo
router.post('/generate', generatorController.createSite);

// Rota GET: /api/user/:userId - Obtém dados do usuário
router.get('/user/:userId', generatorController.getUserData);

// Rota POST: /api/publish - Publica o site
router.post('/publish', generatorController.publishSite);

// Rota GET: /api/public/:subdomain - Obtém site publicado
router.get('/public/:subdomain', generatorController.getPublicSite);

module.exports = router;
=======
// Rota POST: /api/generate
router.post('/generate', requireAuth, generatorController.createSite);
router.get('/user/:userId', requireAuth, generatorController.getUserData);
router.get("/sites", requireAuth, generatorController.listSites);
router.get("/sites/:id", requireAuth, generatorController.getSiteById);
router.post("/sites/draft", requireAuth, generatorController.saveDraft);
router.delete("/sites/:id", requireAuth, generatorController.deleteSite);

module.exports = router;
>>>>>>> a27c719 (ajuste na criação dos sites)
