const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');

// Rota POST: /api/generate - Gera site completo
router.post('/generate', generatorController.createSite);

// Rota GET: /api/user/:userId - Obtém dados do usuário
router.get('/user/:userId', generatorController.getUserData);

// Rota POST: /api/publish - Publica o site
router.post('/publish', generatorController.publishSite);

// Rota GET: /api/public/:subdomain - Obtém site publicado
router.get('/public/:subdomain', generatorController.getPublicSite);

module.exports = router;