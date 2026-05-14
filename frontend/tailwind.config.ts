import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // ativa dark mode via classe 'dark'
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        lightBg: '#f8fafc',
        darkBg: '#252B42',
        lightText: '#1f2937',
        darkText: '#f3f4f6',
      },
    },
  },
  plugins: [],
} satisfies Config;