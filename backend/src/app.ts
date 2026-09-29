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

const allowedOrigins = [
  "http://localhost:5173",
  "https://oportunizajovem.com.br",
  "https://www.oportunizajovem.com.br",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ─── Rotas de API ──────────────────────────────────────────────────────
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

// ─── Servir o frontend buildado ────────────────────────────────────────
const frontendPath = path.join(__dirname, "../../frontend/dist");

// Debug — remover após confirmar
console.log("📁 Frontend path:", frontendPath);
console.log("📁 Existe:", fs.existsSync(frontendPath));
if (fs.existsSync(frontendPath)) {
  console.log("📁 Conteúdo:", fs.readdirSync(frontendPath));
} else {
  console.log("📁 Conteúdo de /app:", fs.readdirSync("/app"));
}

// Assets com hash (JS/CSS): cache de 1 ano — o hash muda a cada build
app.use("/assets", express.static(path.join(frontendPath, "assets"), {
  maxAge: "1y",
  immutable: true,
}));

// index.html e outros arquivos raiz: nunca cachear
app.use(express.static(frontendPath, {
  maxAge: 0,
  etag: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    }
  },
}));

app.use(express.static(frontendPath));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  if (
    req.path.startsWith("/api/") ||
    req.path.startsWith("/playlist") ||
    req.path.startsWith("/videos") ||
    req.path.startsWith("/youtube") ||
    req.path.startsWith("/categorias") ||
    req.path.startsWith("/canais") ||
    req.path.startsWith("/recursos") ||
    req.path.startsWith("/user") ||
    req.path.startsWith("/health")
  ) {
    return next();
  }

  // Só serve index.html se o path parece uma rota do SPA (sem extensão de arquivo)
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(req.path);
  if (hasFileExtension) {
    return res.status(404).send("Not found");
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;