import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#0A0A0F',
        'secondary-bg': '#13131A',
        'tertiary-bg': '#1C1C27',
        'border': '#2A2A3C',
        'accent': '#6366F1',
        'success': '#22C55E',
        'danger': '#EF4444',
        'warning': '#F59E0B',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-tertiary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
