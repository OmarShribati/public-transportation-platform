/** @type {import('tailwindcss').Config} */
module.exports = {
  // هذا السطر يخبر تيلوند أين يبحث عن الكلاسات
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};