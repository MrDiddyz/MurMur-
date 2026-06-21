import type { Request, Response, Router } from "express";
import { createCampaign } from "../services/campaignService.js";
import type { CampaignCreateInput } from "@murmur/types";

export function registerCampaignRoutes(router: Router): void {
  router.post("/campaigns", (req: Request, res: Response) => {
    const payload = req.body as Partial<CampaignCreateInput>;

    if (!payload.name || !payload.releasePlan || !payload.primaryGenre || !payload.channels) {
      res.status(400).json({
        error: "Missing required campaign fields: name, primaryGenre, releasePlan, channels"
      });
      return;
    }

    const response = createCampaign({
      name: payload.name,
      budgetUSD: payload.budgetUSD ?? 0,
      primaryGenre: payload.primaryGenre,
      releasePlan: payload.releasePlan,
      channels: payload.channels
    });

    res.status(201).json(response);
  });
}
