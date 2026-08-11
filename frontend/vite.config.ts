import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Oportuniza",
        short_name: "Oportuniza",
        description: "Trilhas de aprendizado gratuitas para o primeiro emprego",
        theme_color: "#1e293b",        // mesma cor do seu fundo dark
        background_color: "#1e293b",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",  // ícone adaptativo no Android
          },
        ],
      },
      workbox: {
        // cacheia JS/CSS/HTML gerados pelo Vite
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // rotas do React Router funcionam offline
        navigateFallback: "/index.html",
      },
    }),
  ],
});