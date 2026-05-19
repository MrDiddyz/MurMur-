import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070A12',
        foreground: '#EEF2FF',
        muted: '#93A4BC',
        panel: '#0D1424',
        line: '#1E2A40',
        accent: '#8FA7FF',
      },
      boxShadow: {
        soft: '0 20px 70px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
