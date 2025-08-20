/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",   // scan all components
    "./pages/**/*.{js,ts,jsx,tsx}", // if using pages dir
    "./app/**/*.{js,ts,jsx,tsx}"    // if using app dir
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

