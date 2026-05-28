/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16181d",
        slate: "#5f6777",
        fog: "#edf1f6",
        cream: "#fff8ef",
        ember: "#f97316",
        pine: "#0f766e",
        gold: "#f5b942",
        sky: "#3b82f6",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(22, 24, 29, 0.12)",
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
