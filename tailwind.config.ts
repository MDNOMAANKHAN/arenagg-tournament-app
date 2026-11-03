import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { ink: '#0B1220', paper: '#F5F7FB', line: '#E3E8F2', acc: '#2563EB', accd: '#1D4ED8', muted: '#5B6780' },
    fontFamily: { sans: ['var(--font)', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
} satisfies Config;
