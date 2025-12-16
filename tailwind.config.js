/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Override default colors with RGB values for PDF compatibility
        primary: {
          50: '#e6f4fc',
          100: '#cce9f9',
          200: '#99d3f3',
          300: '#66bded',
          400: '#33a7e7',
          500: '#1990C8',  // Main primary color
          600: '#1478a6',
          700: '#0f5a7d',
          800: '#0a3c54',
          900: '#051e2a',
        },
      }
    },
  },
  plugins: [],
}
