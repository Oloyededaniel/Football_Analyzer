import "dotenv/config";
import express from "express";
import cors from "cors";
import teamsRouter from "./routes/teams.js";
import playersRouter from "./routes/players.js";
import matchesRouter from "./routes/matches.js";
import analyticsRouter from "./routes/analytics.js";
import predictionsRouter from "./routes/predictions.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "football-analyzer-api" });
});

app.use("/api/teams", teamsRouter);
app.use("/api/players", playersRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/predictions", predictionsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
