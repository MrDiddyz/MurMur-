import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        graphite: '#111111',
        champagne: '#F4D58D',
        aureate: '#C9A24D',
        mercury: '#E8E2D6',
        smoke: '#8E8778'
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(244, 213, 141, 0.18), 0 24px 80px rgba(201, 162, 77, 0.10)',
        cinematic: '0 40px 120px rgba(0, 0, 0, 0.72)'
      },
      backgroundImage: {
        'gold-radial': 'radial-gradient(circle at top, rgba(244,213,141,0.22), transparent 34%)'
      }
    }
  },
  plugins: []
};

export default config;
