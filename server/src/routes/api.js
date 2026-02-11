const express = require('express');
const router = express.Router();
const generatorController = require('../controllers/generatorController');

// Rota POST: /api/generate
router.post('/generate', generatorController.createSite);
router.get('/user/:userId', generatorController.getUserData);

module.exports = router;