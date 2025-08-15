const express = require("express");
const { z } = require("zod");

const app = express();
app.use(express.json());

// --- EPC Calculator Endpoint ---
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

app.post("/calc-epc", (req, res) => {
  try {
    const { modules, bounties, bonuses, normalizeWeights } = EPCInputZ.parse(req.body);

    const weightSum = modules.reduce((s, m) => s + m.weight, 0);
    const wFactor = normalizeWeights && weightSum !== 0 ? 1 / weightSum : 1;

    const overallConv = modules.reduce((s, m) => s + (m.weight * wFactor) * m.conv, 0);
    const modulesEpc  = modules.reduce((s, m) => s + (m.weight * wFactor) * m.conv * m.aov * m.rate, 0);
    const bountiesEpc = bounties.reduce((s, b) => s + b.attach * b.payout, 0);
    const bonusPerOrder = bonuses.reduce((s, b) => s + b.order_share * b.payout, 0);
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
// --- End EPC Endpoint ---

// Optional: Root test route
app.get("/", (req, res) => {
  res.send("Service is running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});
