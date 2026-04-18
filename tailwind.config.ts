import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        calm: {
          50: "#f7fafc",
          100: "#edf2f7",
          500: "#4f6f83",
          700: "#2f4858"
        }
      }
    }
  },
  plugins: []
};

export default config;
