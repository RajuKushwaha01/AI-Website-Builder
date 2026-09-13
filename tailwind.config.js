/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        secondary: "#00C2FF",
        accent: "#FF4ECD",
        success: "#22C55E",
        warning: "#F59E0B",
        bg: "#080B18",
        surface: "#11162A",
        card: "#151B32",
        text: "#F8FAFC",
        muted: "#94A3B8"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"]
      },
      backgroundImage: {
        "aurora-gradient": "linear-gradient(135deg, #6C5CE7 0%, #00C2FF 50%, #FF4ECD 100%)"
      },
      borderRadius: {
        card: "20px"
      }
    }
  },
  plugins: []
};