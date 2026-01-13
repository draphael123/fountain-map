/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fountain-trt': '#2DD4BF',
        'fountain-hrt': '#EC4899',
        'fountain-glp': '#7C6F9B',
        'fountain-planning': '#3B82F6',
        'fountain-inactive': '#D1D5DB',
        'fountain-dark': '#1E293B',
      },
      fontFamily: {
        'display': ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

