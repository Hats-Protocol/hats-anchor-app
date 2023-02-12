/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        128: "32rem",
        144: "36rem",
        160: "40rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
