import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import playlistRoutes from "./routes/playlistRoute";
import { videoRoutes } from "./routes/videoRoute";
import { youtubeRoutes } from "./routes/youtubeRoute";
import { categoriaRoutes } from "./routes/categoriaRoute";
import { canalRoutes } from "./routes/canalRoute";
import { authRoutes } from "./routes/authRoute";
import { resumoRoutes } from "./routes/resumoRoute";
import { recursoRoutes } from "./routes/recursoRoute";
import { userRoutes } from "./routes/userRoute";
import { fotoRoutes } from "./routes/fotoRoute";

import { auth } from "./middleware/betterAuth";
import { toNodeHandler } from "better-auth/node";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
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

/*
 * Middlewares normais da aplicação
 */
app.use(express.json());
app.use(cookieParser());

app.all("/api/auth/*splat", toNodeHandler(auth));

/*
 * Rotas
 */
app.use("/auth", authRoutes);
app.use("/playlist", playlistRoutes);
app.use("/videos", videoRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/canais", canalRoutes);
app.use("/api/resumo", resumoRoutes);
app.use("/recursos", recursoRoutes);
app.use("/user", userRoutes);
app.use("/user", fotoRoutes);

app.get("/", (_, res) => {
  return res.json({
    status: "OK",
    message: "API Oportuniza funcionando",
  });
});

export default app;