/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        night: '#05070f',
        ink: '#B7C2D9',
        accent: '#7C9BFF',
        mirror: '#a78bfa',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,155,255,0.2), 0 8px 30px rgba(5,10,25,0.5)',
        'glow-purple': '0 0 0 1px rgba(167,139,250,0.3), 0 8px 30px rgba(5,10,25,0.6)',
      },
    },
  },
  plugins: [],
};
