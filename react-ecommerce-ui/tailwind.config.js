/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f3",
          100: "#ffe9d7",
          500: "#ff6b2d",
          600: "#e85820",
          700: "#bf4316"
        }
      }
    }
  },
  plugins: []
};
