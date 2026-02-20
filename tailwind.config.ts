import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        night: '#070B14',
        ink: '#B7C2D9',
        accent: '#7C9BFF',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,155,255,0.2), 0 8px 30px rgba(5,10,25,0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
