import "dotenv/config";
import express from "express";
import cors from "cors";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import teamsRouter from "./routes/teams.js";
import playersRouter from "./routes/players.js";
import matchesRouter from "./routes/matches.js";
import analyticsRouter from "./routes/analytics.js";
import predictionsRouter from "./routes/predictions.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDist = join(__dirname, "../../client/dist");

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

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(clientDist, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
  if (existsSync(clientDist)) {
    console.log(`Serving UI from ${clientDist}`);
  }
});
