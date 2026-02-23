import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        night: '#0B0618',
        ink: '#D8CCE8',
        accent: '#D4AF37',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(212,175,55,0.25), 0 12px 30px rgba(17,8,34,0.65)',
      },
    },
  },
  plugins: [],
};

export default config;
