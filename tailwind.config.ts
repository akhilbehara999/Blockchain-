import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // Primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Status colors
        status: {
          valid: '#10b981',      // emerald-500
          warning: '#f59e0b',    // amber-500
          error: '#ef4444',      // red-500
          locked: '#6b7280',     // gray-500
          info: '#3b82f6',       // blue-500
          mining: '#8b5cf6',     // violet-500
        },
        // Surface colors (for cards, panels)
        surface: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          border: '#e2e8f0',
          hover: '#f1f5f9',
        },
        // Dark mode surfaces
        'surface-dark': {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
          border: '#475569',
          hover: '#334155',
        },
        // Legacy support (mapping to CSS variables for theme switching)
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'tertiary-bg': 'var(--tertiary-bg)',
        'border': 'var(--border)',
        'accent': '#6366f1', // mapped to brand-500
        'success': '#10b981', // mapped to status-valid
        'danger': '#ef4444', // mapped to status-error
        'warning': '#f59e0b', // mapped to status-warning
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        // Typographic scale (ratio: 1.25 — Major Third)
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.75rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.563rem', { lineHeight: '2rem' }],
        '3xl': ['1.953rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.441rem', { lineHeight: '2.5rem' }],
        '5xl': ['3.052rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.1)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.15)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        'panel': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'hash-scroll': 'hashScroll 20s linear infinite',
        'count-up': 'countUp 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'chain-connect': 'chainConnect 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(99,102,241,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(99,102,241,0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        hashScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        chainConnect: {
          '0%': { width: '0', opacity: '0' },
          '100%': { width: '100%', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
