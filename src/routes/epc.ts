// src/routes/epc.ts
import express, { Request, Response } from "express";
import { z } from "zod";

const router = express.Router();

// Schema definitions
const ModuleZ = z.object({
  name: z.string(),
  weight: z.number(),
  conv: z.number(),
  aov: z.number(),
  rate: z.number()
});

const BountyZ = z.object({
  name: z.string(),
  attach: z.number(),
  payout: z.number()
});

const BonusZ = z.object({
  name: z.string(),
  order_share: z.number(),
  payout: z.number()
});

const EPCInputZ = z.object({
  modules: z.array(ModuleZ).min(1),
  bounties: z.array(BountyZ).default([]),
  bonuses: z.array(BonusZ).default([]),
  normalizeWeights: z.boolean().default(true)
});

// Infer types from Zod schemas
type Module = z.infer<typeof ModuleZ>;
type Bounty = z.infer<typeof BountyZ>;
type Bonus = z.infer<typeof BonusZ>;


// POST /calc-epc
router.post("/calc-epc", (req: Request, res: Response) => {
  try {
    const { modules, bounties, bonuses, normalizeWeights } = EPCInputZ.parse(req.body);

    const weightSum = modules.reduce((s: number, m: Module) => s + m.weight, 0);
    const wFactor = normalizeWeights && weightSum !== 0 ? 1 / weightSum : 1;

    const overallConv = modules.reduce((s: number, m: Module) => s + (m.weight * wFactor) * m.conv, 0);
    const modulesEpc  = modules.reduce((s: number, m: Module) => s + (m.weight * wFactor) * m.conv * m.aov * m.rate, 0);
    const bountiesEpc = bounties.reduce((s: number, b: Bounty) => s + b.attach * b.payout, 0);
    const bonusPerOrder = bonuses.reduce((s: number, b: Bonus) => s + b.order_share * b.payout, 0);
    const bonusesEpc = overallConv * bonusPerOrder;

    res.json({
      weightSum,
      normalized: !!(normalizeWeights && Math.abs(weightSum - 1) > 1e-9),
      overallConv,
      modulesEpc,
      bountiesEpc,
      bonusesEpc,
      totalEpc: modulesEpc + bountiesEpc + bonusesEpc
    });

  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
