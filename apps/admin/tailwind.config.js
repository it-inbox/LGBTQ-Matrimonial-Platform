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
        },
        pride: {
          red: "#E40303",
          orange: "#FF8C00",
          yellow: "#FFED00",
          green: "#008026",
          blue: "#24408E",
          purple: "#732982",
          pink: "#FF80BF",
          cyan: "#55CDFC",
        },
      },
    },
  },
  plugins: [],
};

