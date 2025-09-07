import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import pinoHttp from "pino-http";
import { config, hasRedditCredentials } from "./config.js";
import * as Sentry from "@sentry/node";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./openapi.js";
import { z } from "zod";
import path from "node:path";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  const router = express.Router();

  if (config.SENTRY_DSN) {
    Sentry.init({ dsn: config.SENTRY_DSN, tracesSampleRate: 0.1 });
    app.use(Sentry.requestHandler());
    app.use(Sentry.tracingHandler());
  }
  app.set("trust proxy", 1);

  // Logging
  app.use(
    pinoHttp({
      autoLogging: true,
      redact: {
        paths: ["req.headers.authorization", "req.headers.cookie"],
        remove: true,
      },
    }),
  );

  const allowedOrigin = config.WEB_ORIGIN;
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!allowedOrigin) return callback(null, true);
        if (!origin) return callback(null, true);
        if (origin === allowedOrigin) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  const isProd = config.NODE_ENV === "production";
  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'wasm-unsafe-eval'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'"],
    workerSrc: ["'self'", "blob:"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
  };
  if (config.SENTRY_DSN) {
    try {
      const u = new URL(config.SENTRY_DSN);
      const host = u.host || "sentry.io";
      cspDirectives.connectSrc = Array.from(
        new Set([...(cspDirectives.connectSrc || []), `https://${host}`]),
      );
    } catch {}
  }
  app.use(
    helmet({
      contentSecurityPolicy: isProd ? { directives: cspDirectives } : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));

  // Global rate limit
  app.use(
    rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false }),
  );

  // Per-route stricter limits
  const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
  const redditLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

  // Swagger
  app.use(`${config.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.get(`${config.API_PREFIX}/openapi.json`, (_req, res) => {
    res.json(openapiSpec);
  });

  // In-memory caches
  const cache = {
    redditGettingBigger: { timestamp: 0, data: null },
    redditAuth: { token: null, expiresAt: 0 },
    feedback: [],
  };

  const refusalMessage =
    "I can’t provide instructions for sexual techniques, enlargement, or pressure/time routines. " +
    "For safety, discuss goals with a licensed clinician. I can share general, non-graphic wellness guidance (sleep," +
    " stress, exercise, nutrition) and pointers to evidence-based sexual health resources.";

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

  // Routes
  const ChatBody = z.object({ message: z.string().min(1).max(1000) });
  router.post(`/chat`, chatLimiter, async (req, res) => {
    const parsed = ChatBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body" });
    }
    const { message } = parsed.data;
    if (isDisallowed(message)) {
      return res.json({
        reply: refusalMessage,
        safety: { refused: true, categories: ["sexual instruction"] },
        sources: [
          { name: "NIDDK Sexual Health", url: "https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction" },
          { name: "NHLBI Sleep & Health", url: "https://www.nhlbi.nih.gov/health/sleep" },
        ],
      });
    }
    const safeReply =
      "Here’s general men’s health guidance (not medical advice). Focus on: " +
      "1) Sleep 7–9h; 2) Manage stress (breathing, CBT, time outdoors); 3) " +
      "Regular exercise (mix resistance + cardio); 4) Nutritious diet, minimize alcohol/smoking). " +
      "For sexual health concerns, consult a licensed clinician or urologist.";
    return res.json({
      reply: safeReply,
      safety: { refused: false },
      sources: [
        { name: "CDC Physical Activity", url: "https://www.cdc.gov/physicalactivity/" },
        { name: "NIH Nutrition Basics", url: "https://www.nutrition.gov/topics/basic-nutrition" },
      ],
    });
  });

  // Streaming chat (SSE)
  router.get(`/chat/stream`, async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const chunks = [
      "General wellness guidance: ",
      "prioritize consistent sleep, ",
      "manage stress daily, ",
      "exercise regularly, ",
      "and maintain balanced nutrition. ",
      "This is not medical advice.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= chunks.length) {
        res.write("data: [DONE]\n\n");
        clearInterval(interval);
        res.end();
        return;
      }
      res.write(`data: ${JSON.stringify({ token: chunks[i] })}\n\n`);
      i += 1;
    }, 250);
    req.on("close", () => {
      clearInterval(interval);
    });
  });

  // Reddit
  router.get(`/reddit/gettingbigger`, redditLimiter, async (_req, res) => {
    try {
      const now = Date.now();
      if (cache.redditGettingBigger.data && now - cache.redditGettingBigger.timestamp < 10 * 60 * 1000) {
        return res.json(cache.redditGettingBigger.data);
      }
      async function fetchWithOAuth() {
        const tokenValid = cache.redditAuth.token && cache.redditAuth.expiresAt > now + 5000;
        if (!tokenValid) {
          const basic = Buffer.from(`${config.REDDIT_CLIENT_ID}:${config.REDDIT_CLIENT_SECRET}`).toString("base64");
          const form = new URLSearchParams();
          form.set("grant_type", "password");
          form.set("username", String(config.REDDIT_USERNAME));
          form.set("password", String(config.REDDIT_PASSWORD));
          const tRes = await fetch("https://www.reddit.com/api/v1/access_token", {
            method: "POST",
            headers: {
              Authorization: `Basic ${basic}`,
              "User-Agent": "SizeSeekerBot/1.0",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form.toString(),
          });
          if (!tRes.ok) throw new Error("oauth token error");
          const tJson = await tRes.json();
          cache.redditAuth.token = tJson.access_token;
          cache.redditAuth.expiresAt = now + (tJson.expires_in ? tJson.expires_in * 1000 : 3600 * 1000);
        }
        const apiRes = await fetch("https://oauth.reddit.com/r/gettingbigger/top?limit=10&t=week", {
          headers: { Authorization: `Bearer ${cache.redditAuth.token}`, "User-Agent": "SizeSeekerBot/1.0" },
        });
        if (!apiRes.ok) throw new Error("oauth api error");
        return apiRes.json();
      }
      let json;
      if (hasRedditCredentials()) {
        try {
          json = await fetchWithOAuth();
        } catch {}
      }
      if (!json) {
        const url = "https://www.reddit.com/r/gettingbigger/top.json?limit=10&t=week";
        const response = await fetch(url, { headers: { "User-Agent": "SizeSeekerBot/1.0" } });
        if (!response.ok) {
          return res.status(502).json({ error: "Upstream error" });
        }
        json = await response.json();
      }
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
      const payload = {
        disclaimer:
          "Community content may include unverified claims. For safety, avoid implementing routines or pressures. Consult licensed clinicians.",
        posts,
        cachedAt: new Date().toISOString(),
      };
      // @ts-ignore - mutate local cache
      cache.redditGettingBigger = { timestamp: now, data: payload };
      return res.json(payload);
    } catch (e) {
      return res.status(500).json({ error: "Failed to fetch subreddit" });
    }
  });

  // SVG image
  router.get(`/image/schedule`, (_req, res) => {
    const width = 640;
    const height = 360;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">\n      <stop offset="0%" stop-color="#6ee7b7" />\n      <stop offset="100%" stop-color="#3b82f6" />\n    </linearGradient>\n  </defs>\n  <rect x="0" y="0" width="100%" height="100%" fill="#0b1220"/>\n  <text x="20" y="40" fill="#e2e8f0" font-size="22" font-family="Inter, Arial, sans-serif">Weekly Wellness Plan</text>\n  <g transform="translate(20,70)">\n    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>\n    <rect x="0" y="0" width="420" height="40" rx="8" fill="url(#g)"/>\n    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Sleep 7–9h</text>\n  </g>\n  <g transform="translate(20,130)">\n    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>\n    <rect x="0" y="0" width="360" height="40" rx="8" fill="url(#g)"/>\n    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Stress: 10m breathing</text>\n  </g>\n  <g transform="translate(20,190)">\n    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>\n    <rect x="0" y="0" width="440" height="40" rx="8" fill="url(#g)"/>\n    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Exercise: 30–45m</text>\n  </g>\n  <g transform="translate(20,250)">\n    <rect x="0" y="0" width="600" height="40" rx="8" fill="#1f2937"/>\n    <rect x="0" y="0" width="300" height="40" rx="8" fill="url(#g)"/>\n    <text x="12" y="26" fill="#0b1220" font-size="16" font-family="Inter, Arial">Nutrition: whole foods</text>\n  </g>\n</svg>`;
    res.set("Content-Type", "image/svg+xml").send(svg);
  });

  router.get(`/health`, (_req, res) => {
    res.json({ status: "ok" });
  });

  // Feedback
  const FeedbackBody = z.object({
    message: z.string().optional().default(""),
    reply: z.string().optional().default(""),
    rating: z.enum(["up", "down"]).optional().nullable(),
    reasons: z.array(z.string()).max(5).optional().default([]),
  });
  router.post(`/feedback`, (req, res) => {
    const parsed = FeedbackBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid body" });
    }
    const { message, reply, rating, reasons } = parsed.data;
    const entry = {
      id: String(Date.now()) + Math.random().toString(36).slice(2),
      ts: new Date().toISOString(),
      message,
      reply,
      rating: rating ?? null,
      reasons,
    };
    // @ts-ignore demo store
    cache.feedback.push(entry);
    // @ts-ignore
    if (cache.feedback.length > 500) cache.feedback.shift();
    res.json({ ok: true });
  });

  if (config.SENTRY_DSN) {
    app.use(Sentry.errorHandler());
  }

  app.use(config.API_PREFIX, router);

  // Serve Secret View Haven static app under /mediax
  try {
    const mediaxDir = path.resolve(process.cwd(), "secret-view-haven/dist");
    app.use("/mediax", express.static(mediaxDir));
    app.get("/mediax/*", (_req, res) => {
      res.sendFile(path.join(mediaxDir, "index.html"));
    });
  } catch {}

  return app;
}

export const app = createApp();

