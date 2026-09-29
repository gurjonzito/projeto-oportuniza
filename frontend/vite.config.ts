import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",

      // ⚠️ Adicione todos os arquivos de ícone que estão em public/
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],

      manifest: {
        name: "Oportuniza",
        short_name: "Oportuniza",
        description: "Plataforma de trilhas de aprendizado gratuitas",
        theme_color: "#1E40AF",
        background_color: "#f0f7ff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",

        // ⚠️ Aqui ficam os ícones que o navegador vai usar
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/api/],
      },

      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});