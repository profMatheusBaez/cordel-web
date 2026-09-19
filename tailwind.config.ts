import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0b0d12",
        panel: "#12151c",
        panel2: "#1a1e28",
        border: "#262b38",
        accent: "#7cf29c",
        accent2: "#5ec8ff",
        warn: "#ffb454",
        danger: "#ff6b6b",
        muted: "#8b92a5",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        ui: ["Space Grotesk", "Nunito", "sans-serif"],
        body: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
