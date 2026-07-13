import { Router } from "express";
import { predictMatch } from "../services/predict.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const homeTeamId = req.query.homeTeamId as string | undefined;
    const awayTeamId = req.query.awayTeamId as string | undefined;
    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: "homeTeamId and awayTeamId are required" });
    }
    const prediction = await predictMatch(homeTeamId, awayTeamId);
    res.json(prediction);
  } catch (err) {
    const message = (err as Error).message || "Prediction failed";
    const status = /not found|different|club vs/i.test(message) ? 400 : 500;
    if (status === 500) console.error(err);
    res.status(status).json({ error: message });
  }
});

export default router;
