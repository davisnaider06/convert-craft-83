const path = require("path");
const dotenv = require("dotenv");
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');
const { requireAuth } = require("./src/middlewares/auth");

const generatorController = require("./src/controllers/generatorController");
const paymentsController = require("./src/controllers/paymentsController");

// Carrega variaveis de ambiente locais tanto de `server/.env` quanto da raiz.
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf ? buf.toString() : "";
    },
  })
);

// Usa as rotas
app.use('/api', apiRoutes);

// Rota para publicar (Protegida/Privada)
app.post("/api/sites/publish", requireAuth, generatorController.publishSite);

// Rota pública (Para quem acessa o subdomínio)
app.get("/api/public/site/:subdomain", generatorController.getPublicSite);
app.post("/api/payments/webhook/rise-pay", paymentsController.webhook);

app.listen(PORT, () => {
    console.log(`🚀 Boder AI Server (MVC) rodando na porta ${PORT}`);
});


