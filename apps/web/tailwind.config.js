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
      boxShadow: {
        "subtle": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "card": "0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
        "card-hover": "0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 4px 8px -4px rgba(15, 23, 42, 0.03)",
        "modal": "0 24px 48px -12px rgba(15, 23, 42, 0.18), 0 12px 24px -8px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
