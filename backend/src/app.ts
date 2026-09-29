import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";

import playlistRoutes from "./routes/playlistRoute";
import { videoRoutes } from "./routes/videoRoute";
import { youtubeRoutes } from "./routes/youtubeRoute";
import { categoriaRoutes } from "./routes/categoriaRoute";
import { canalRoutes } from "./routes/canalRoute";
import { resumoRoutes } from "./routes/resumoRoute";
import { recursoRoutes } from "./routes/recursoRoute";
import { userRoutes } from "./routes/userRoute";
import { fotoRoutes } from "./routes/fotoRoute";
import { quizRoutes } from "./routes/quizRoute";
import { trilhaProgressRoutes } from "./routes/trilhaProgressRoute";
import { recomendacaoRoutes } from "./routes/recomendacaoRoute";
import { authRoutes } from "./routes/authRoute";
import { neonWebhookRoute } from "./routes/neonWebhookRoute";

const app = express();

app.set("trust proxy", 1);

// ─── Caminho do frontend ───────────────────────────────────────────────
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
const assetsPath = path.join(frontendPath, "assets");

if (!fs.existsSync(frontendPath)) {
  throw new Error(`❌ frontend/dist não encontrado em ${frontendPath}`);
}
if (!fs.existsSync(path.join(frontendPath, "index.html"))) {
  throw new Error(`❌ index.html não encontrado em ${frontendPath}`);
}
if (!fs.existsSync(assetsPath)) {
  throw new Error(`❌ pasta assets não encontrada em ${assetsPath}`);
}

if (process.env.NODE_ENV !== "production") {
  console.log("✅ Frontend path:", frontendPath);
  console.log("✅ assets:", fs.readdirSync(assetsPath));
}

// ─── 1) ASSETS ESTÁTICOS ───────────────────────────────────────────────
app.use(
  "/assets",
  express.static(assetsPath, {
    maxAge: "1y",
    immutable: true,
    fallthrough: false,
  })
);

app.use(
  express.static(frontendPath, {
    maxAge: 0,
    etag: false,
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      }
    },
  })
);

// ─── 2) CORS ───────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://oportunizajovem.com.br",
  "https://www.oportunizajovem.com.br",
  "https://projeto-oportuniza-production.up.railway.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

// ─── 3) WEBHOOK DO NEON — ANTES do express.json() ─────────────────────
app.use("/api/neon-webhook", express.raw({ type: "application/json" }));
app.use("/api/neon-webhook", neonWebhookRoute);

// ─── 4) Parsers ────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── 5) Rotas de API ───────────────────────────────────────────────────
app.use("/playlist", playlistRoutes);
app.use("/videos", videoRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/canais", canalRoutes);
app.use("/api/resumo", resumoRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/recomendacoes", recomendacaoRoutes);
app.use("/recursos", recursoRoutes);
app.use("/user", userRoutes);
app.use("/user", fotoRoutes);
app.use("/api/trilhas", trilhaProgressRoutes);
app.use("/auth", authRoutes);

app.get("/health", (_, res) => res.json({ status: "OK" }));

// ─── 6) ERROR HANDLER GLOBAL (antes do fallback SPA) ──────────────────
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(`[ERRO] ${req.method} ${req.path} →`, err.message);
    console.error(err.stack);

    const status = err.status || err.statusCode || 500;
    const message =
      process.env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : err.message || "Erro interno do servidor";

    res.status(status).json({ error: message });
  }
);

// ─── 7) Fallback SPA (ÚLTIMO middleware) ──────────────────────────────
const apiPrefixes = [
  "/api/",
  "/playlist",
  "/videos",
  "/youtube",
  "/categorias",
  "/canais",
  "/recursos",
  "/user",
  "/health",
  "/auth",
];

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  if (apiPrefixes.some((p) => req.path === p || req.path.startsWith(p))) {
    return next();
  }

  if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
    return res.status(404).type("text/plain").send("Not found");
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;