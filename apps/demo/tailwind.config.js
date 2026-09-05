/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyan: { DEFAULT: '#06B6D4' },
        indigo: { DEFAULT: '#6366F1' },
      },
    },
  },
  plugins: [],
};
