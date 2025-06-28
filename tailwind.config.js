/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'f5f5f5': '#f5f5f5',
      },
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};