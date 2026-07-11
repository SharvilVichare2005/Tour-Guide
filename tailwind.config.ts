import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5E4FE2",
          light: "#7A6EE6",
          dark: "#4A3ED1",
        },
        accent: {
          DEFAULT: "#FF6B6B",
          dark: "#FF5252",
        },
        secondary: "#F5F7FA",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        card: "0 8px 20px rgba(0, 0, 0, 0.06)",
        cardLg: "0 10px 30px rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        spin: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
