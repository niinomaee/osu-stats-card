import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchOsuStats } from "../lib/osu";
import { renderOsuCard } from "../lib/render-osu-card";
import { isRateLimited } from "../lib/rate-limit";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    res.status(429).send("Too many requests, please slow down.");
    return;
  }

  const username = req.query.user as string | undefined;
  if (!username) {
    res.status(400).send("Missing ?user= query param");
    return;
  }

  if (!/^[a-zA-Z0-9 _\-\[\]]{1,20}$/.test(username)) {
    res.status(400).send("Invalid username format");
    return;
  }

  const mode =
    (req.query.mode as "osu" | "taiko" | "fruits" | "mania" | undefined) || "osu";
  const validModes = ["osu", "taiko", "fruits", "mania"];
  if (!validModes.includes(mode)) {
    res.status(400).send("Invalid mode. Use: osu, taiko, fruits, or mania");
    return;
  }

  try {
    const stats = await fetchOsuStats(username, mode);
    const svg = renderOsuCard(stats);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.status(200).send(svg);
  } catch (err) {
    res.status(500).send(`Error: ${(err as Error).message}`);
  }
}