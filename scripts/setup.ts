import { existsSync, copyFileSync } from 'node:fs';

if (!existsSync('.env.local')) {
  copyFileSync('.env.example', '.env.local');
  console.log('Created .env.local from .env.example');
} else {
  console.log('.env.local already exists');
}

console.log('Next steps: fill Supabase values, run npm install, then npm run dev.');
