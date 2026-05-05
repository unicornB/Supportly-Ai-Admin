/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F8FA",
        panel: "#FFFFFF",
        line: "#E5E7EB",
        ink: "#111827",
        muted: "#6B7280",
        brand: "#2563EB"
      },
      boxShadow: {
        panel: "0 1px 2px rgba(17, 24, 39, 0.06)"
      }
    }
  },
  plugins: []
};
