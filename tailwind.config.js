/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // La gama de Azul Océano y Azul Marino de Ezetu
        forest: {
          50: '#f0f7fc',
          100: '#e0effa',
          200: '#b9ddf5',
          300: '#7dc2ee',
          400: '#38a2e5',
          500: '#0284c7', // El azul vibrante del planeta del logo
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#0A2540', // El azul marino exacto de la cámara y las letras
          950: '#051324', // Medianoche profunda
        },
        // Toques cálidos para contrastes
        terracotta: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Neutros claros tipo hielo/nieve
        sand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
        // Fondos oscuros de noche profunda (estilo Apple / Atlas)
        slate2: {
          950: '#050f1a',
          900: '#091829',
          850: '#0d2138',
          800: '#122c4a',
          700: '#1b3b61',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 18px -4px rgba(15, 22, 32, 0.18)',
        lift: '0 18px 40px -12px rgba(15, 22, 32, 0.35)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        riseIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        popIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        heartbeat: { '0%,100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.22)' }, '70%': { transform: 'scale(0.92)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadeIn: 'fadeIn .4s ease both',
        riseIn: 'riseIn .5s cubic-bezier(.2,.7,.2,1) both',
        popIn: 'popIn .25s cubic-bezier(.2,.8,.2,1) both',
        heartbeat: 'heartbeat .45s ease',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
