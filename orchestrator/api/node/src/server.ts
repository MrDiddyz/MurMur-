import express from "express";

import { router } from "./routes";

const app = express();
app.use(express.json());
app.use("/v1", router);

app.listen(8001, () => {
  console.log("Node API listening on :8001");
});
