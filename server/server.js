const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./src/routes/api");
const { requireAuth } = require("./src/middlewares/auth");
const generatorController = require("./src/controllers/generatorController");
const paymentsController = require("./src/controllers/paymentsController");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf ? buf.toString() : "";
    },
  }),
);

app.use("/api", apiRoutes);

app.post("/api/payments/webhook/risepay", paymentsController.handleRisePayWebhook);
app.post("/api/payments/webhook/rise-pay", paymentsController.handleRisePayWebhook);

app.post("/api/sites/publish", requireAuth, generatorController.publishSite);
app.get("/api/public/site/:subdomain", generatorController.getPublicSite);

app.listen(PORT, () => {
  console.log(`Boder AI Server rodando na porta ${PORT}`);
});
