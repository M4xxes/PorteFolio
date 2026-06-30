/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Le mode sombre est géré via la classe 'dark' sur <html>
  darkMode: 'class',
  theme: {
    extend: {
      // Couleurs basées sur des variables CSS — le toggle dark/light
      // met à jour les variables dans :root vs .dark (voir index.css)
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        elevated: 'var(--elevated)',
        'c-border': 'var(--border)',
        'c-text': 'var(--text)',
        'c-muted': 'var(--muted)',
        accent: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          muted: 'rgba(139, 92, 246, 0.12)',
          glow: 'rgba(139, 92, 246, 0.25)',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin-reverse 18s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'draw-line': 'draw-line 1.2s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'draw-line': {
          from: { 'stroke-dashoffset': '1000' },
          to: { 'stroke-dashoffset': '0' },
        },
      },
      backgroundImage: {
        // Motif de points pour l'effet engraving subtil
        'dot-pattern': 'radial-gradient(circle, rgba(139,92,246,0.14) 1px, transparent 1px)',
        'grid-fine': 'linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        dot: '28px 28px',
        grid: '60px 60px',
      },
      boxShadow: {
        'accent-sm': '0 0 0 1px rgba(139, 92, 246, 0.3)',
        'accent-md': '0 0 20px rgba(139, 92, 246, 0.2)',
        'accent-lg': '0 0 40px rgba(139, 92, 246, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.5)',
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
}
