import express from "express";

import cors from "cors";

import playlistRoutes from "./routes/playlistRoute";

import { videoRoutes } from "./routes/videoRoute";

const app = express();

/*
  CORS
*/

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173" || "https://oportunizajovem.vercel.app/",
  }),
);

/*
  JSON
*/

app.use(express.json());

/*
  ROTAS
*/

app.use("/playlist", playlistRoutes);

app.use("/videos", videoRoutes);

/*
  HEALTH CHECK
*/

app.get("/", (_, res) => {
  return res.json({
    status: "OK",
    message: "API Oportuniza funcionando",
  });
});

export default app;
