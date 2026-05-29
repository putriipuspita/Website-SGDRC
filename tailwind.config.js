/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#050B14', /* Nav & Base Dark */
        'brand-navy': '#0A1526', /* Cards */
        'brand-red': '#E40011', /* Red accents */
        'brand-blue': '#225AA1', /* Blue background glow */
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif', 'system-ui'],
        logo: ['"Barlow Condensed"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
