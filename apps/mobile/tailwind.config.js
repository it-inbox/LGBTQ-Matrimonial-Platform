/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        pride: {
          red: "#ef4444",
          orange: "#f97316",
          yellow: "#eab308",
          green: "#10b981",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          pink: "#ec4899",
        },
      },
    },
  },
  plugins: [],
};

