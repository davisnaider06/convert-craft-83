const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
const { requireAuth } = require("./src/middlewares/auth");

const generatorController = require("./src/controllers/generatorController");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Usa as rotas
app.use('/api', apiRoutes);

// Rota para publicar (Protegida/Privada)
app.post("/api/sites/publish", requireAuth, generatorController.publishSite);

// Rota pública (Para quem acessa o subdomínio)
app.get("/api/public/site/:subdomain", generatorController.getPublicSite);

app.listen(PORT, () => {
    console.log(`🚀 Boder AI Server (MVC) rodando na porta ${PORT}`);
});
