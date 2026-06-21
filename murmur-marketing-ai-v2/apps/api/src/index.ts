import express from "express";
import cors from "cors";
import { loadRuntimeConfig } from "@murmur/config";
import { registerHealthRoute } from "./routes/health.js";
import { registerCampaignRoutes } from "./routes/campaigns.js";

const config = loadRuntimeConfig();
const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();
registerHealthRoute(router);
registerCampaignRoutes(router);

app.use("/api", router);

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
