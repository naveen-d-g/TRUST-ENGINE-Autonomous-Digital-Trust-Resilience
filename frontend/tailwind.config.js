/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "#0B1220",
        bgSecondary: "#111827",
        bgCard: "#1A2332",
        neonBlue: "#3B82F6",
        neonGreen: "#22C55E",
        neonOrange: "#F59E0B",
        neonRed: "#EF4444",
        neonPurple: "#A855F7",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(59, 130, 246, 0.5)',
        'neon-green': '0 0 10px rgba(34, 197, 94, 0.5)',
        'neon-red': '0 0 10px rgba(239, 68, 68, 0.5)',
      },
    },
  },
  plugins: [],
}
