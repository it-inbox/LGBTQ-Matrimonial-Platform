/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        pride: {
          red: "#ef4444",
          orange: "#f97316",
          yellow: "#eab308",
          green: "#22c55e",
          blue: "#3b82f6",
          purple: "#a855f7",
          pink: "#ec4899",
        },
      },
    },
  },
  plugins: [],
};
