/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
        },
        border: "var(--border)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        priority: {
          low: "#22c55e",
          medium: "#3b82f6",
          high: "#f97316",
          urgent: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "check-bounce": "check-bounce 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
      },
      keyframes: {
        "check-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "40%": { transform: "scale(0.85)" },
          "70%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
