// /profiles/:artistId/style endpoint for style profile retrieval.
import { Router } from "express";
import { db } from "../core/store.js";

export const profilesRouter = Router();

profilesRouter.get("/:artistId/style", (req, res) => {
  const profile = db.styleProfiles.get(req.params.artistId) ?? {
    styleDNA: "experimental",
    exaggeration: 0.6,
    smoothness: 0.7
  };
  db.styleProfiles.set(req.params.artistId, profile);
  res.json(profile);
});
