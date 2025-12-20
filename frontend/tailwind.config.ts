import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vscode: {
          dark: "#1e1e1e",
          sidebar: "#252526",
          editor: "#1e1e1e",
          blue: "#007acc",
          teal: "#4ECDC4",
          green: "#4EC1A0",
          yellow: "#dcdcaa",
          red: "#f44747",
          purple: "#c586c0",
          orange: "#ce9178",
          text: "#cccccc",
          "text-secondary": "#858585",
        },
      },
      fontFamily: {
        mono: ["Cascadia Code", "Fira Code", "Consolas", "monospace"],
        ui: ["Segoe UI", "-apple-system", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: "13px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

