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

const app = express();

app.set("trust proxy", 1);

// ─── Caminho do frontend (definido ANTES, para servir static sem CORS) ─
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
const assetsPath = path.join(frontendPath, "assets");

// Validação dura no boot — se faltar arquivo, crasha e você vê no Railway
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

// ─── 1) ASSETS ESTÁTICOS PRIMEIRO (nunca passam por CORS) ──────────────
// Assets com hash (JS/CSS): cache de 1 ano — o hash muda a cada build
app.use(
  "/assets",
  express.static(assetsPath, {
    maxAge: "1y",
    immutable: true,
    fallthrough: false, // se não achar → 404 direto, nunca cai no fallback SPA
  })
);

// Arquivos raiz (favicon, pics, etc): sem cache. NÃO serve index.html auto.
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
      // Sem Origin (curl, same-origin, proxy) → permite
      if (!origin) return callback(null, true);
      // Origin conhecido → permite
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Origin desconhecido → NEGA CORS silenciosamente (não quebra a request)
      return callback(null, false);
    },
    credentials: true,
  })
);

// ─── 3) Parsers ────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ─── 4) Rotas de API ───────────────────────────────────────────────────
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

app.get("/health", (_, res) => res.json({ status: "OK" }));

// ─── 5) Fallback SPA (DEVE SER O ÚLTIMO middleware) ────────────────────
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
];

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  // Requisições de API → deixa passar (vão cair no 404 do Express se não existirem)
  if (apiPrefixes.some((p) => req.path === p || req.path.startsWith(p))) {
    return next();
  }

  // Se tem extensão de arquivo, é asset — não é rota de SPA.
  // (Já tentamos servir acima; se chegou aqui, é 404 real.)
  if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
    return res.status(404).type("text/plain").send("Not found");
  }

  // Rota de SPA → devolve index.html
  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;