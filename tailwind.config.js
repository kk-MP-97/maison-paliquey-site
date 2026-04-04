/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'mp-navy': '#1B2A4A',
        'mp-sand': '#C4A882',
        'mp-ivory': '#F4EFE8',
        'mp-white': '#FDFAF6',
        'mp-gray': '#6B7280',
        'mp-light': '#E5DDD3',
        'mp-green': '#2D6A4F',
        'mp-blue': '#1B5E8E',
        'mp-purple': '#6B4F9E',
        'mp-orange': '#C96A1B',
        'mp-dark': '#374151',
        'mp-red': '#B91C1C',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'Jost', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['1.25rem', { lineHeight: '1.4' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'xs': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2.5rem',
        '2xl': '4rem',
        '3xl': '6rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(27,42,74,0.08)',
        'hover': '0 8px 32px rgba(27,42,74,0.14)',
        'modal': '0 24px 64px rgba(27,42,74,0.18)',
      },
      transitionDuration: {
        'smooth': '200ms',
        'slow': '400ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
