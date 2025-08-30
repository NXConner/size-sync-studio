import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const refusalMessage = (
  "I can’t provide instructions for sexual techniques, enlargement, or pressure/time routines. " +
    "For safety, discuss goals with a licensed clinician. I can share general, non-graphic wellness guidance (sleep," +
    " stress, exercise, nutrition) and pointers to evidence-based sexual health resources."
);

function isDisallowed(query) {
  if (!query) return false;
  const text = String(query).toLowerCase();
  const disallowedKeywords = [
    "penis",
    "enlarg",
    "jelq",
    "pump",
    "tube",
    "clamp",
    "suction",
    "pressure",
    "routine",
    "time in tube",
    "cut",
    "scaping",
    "scapping",
    "sex technique",
    "seduct",
  ];
  return disallowedKeywords.some((k) => text.includes(k));
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body || {};
  if (isDisallowed(message)) {
    return res.json({
      reply: refusalMessage,
      safety: {
        refused: true,
        categories: ["sexual instruction"],
      },
    });
  }

  const safeReply =
    "Here’s general men’s health guidance (not medical advice). Focus on: " +
    "1) Sleep 7–9h; 2) Manage stress (breathing, CBT, time outdoors); 3) " +
    "Regular exercise (mix resistance + cardio); 4) Nutritious diet, minimize alcohol/smoking). " +
    "For sexual health concerns, consult a licensed clinician or urologist.";

  return res.json({ reply: safeReply, safety: { refused: false } });
});

// Safe Reddit retrieval: titles and links only from r/gettingbigger
app.get("/api/reddit/gettingbigger", async (_req, res) => {
  try {
    const url = "https://www.reddit.com/r/gettingbigger/top.json?limit=10&t=week";
    const response = await fetch(url, { headers: { "User-Agent": "SizeSeekerBot/1.0" } });
    if (!response.ok) {
      return res.status(502).json({ error: "Upstream error" });
    }
    const json = await response.json();
    const posts = (json?.data?.children || []).map((c) => {
      const d = c?.data || {};
      return {
        id: d.id,
        title: d.title,
        author: d.author,
        score: d.score,
        created_utc: d.created_utc,
        permalink: `https://www.reddit.com${d.permalink}`,
        url: d.url_overridden_by_dest || d.url,
      };
    });
    return res.json({
      disclaimer:
        "Community content may include unverified claims. For safety, avoid implementing routines or pressures. Consult licensed clinicians.",
      posts,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch subreddit" });
  }
});

// Simple SVG diagram endpoint (non-graphic): wellness routine schedule block
app.get("/api/image/schedule", (req, res) => {
  const width = 640;
  const height = 360;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#6ee7b7" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="#0b1220"/>
  <text x="20" y="40" fill="#e2e8f0" font-size="22" font-family="Inter, Arial, sans-serif">Weekly Wellness Plan</text>
  <g transform="translate(20,70)">
    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>
    <rect x="0" y="0" width="420" height="40" rx="8" fill="url(#g)"/>
    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Sleep 7–9h</text>
  </g>
  <g transform="translate(20,130)">
    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>
    <rect x="0" y="0" width="360" height="40" rx="8" fill="url(#g)"/>
    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Stress: 10m breathing</text>
  </g>
  <g transform="translate(20,190)">
    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>
    <rect x="0" y="0" width="440" height="40" rx="8" fill="url(#g)"/>
    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Exercise: 30–45m</text>
  </g>
  <g transform="translate(20,250)">
    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>
    <rect x="0" y="0" width="300" height="40" rx="8" fill="url(#g)"/>
    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Nutrition: whole foods</text>
  </g>
</svg>`;
  res.set("Content-Type", "image/svg+xml").send(svg);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});

