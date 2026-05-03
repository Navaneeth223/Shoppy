/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0B',
        surface: '#111113',
        'surface-2': '#1A1A1E',
        border: 'rgba(255,255,255,0.08)',
        'accent-gold': '#C9A84C',
        'accent-cyan': '#00E5FF',
        'accent-emerald': '#00C896',
        'text-primary': '#F2F2F3',
        'text-secondary': '#8A8A95',
        'text-muted': '#4A4A52',
        error: '#FF4D6D',
        success: '#00C896',
        warning: '#FFB800',
      },
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        5: '20px',
        8: '32px',
        13: '52px',
        21: '84px',
        34: '136px',
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
        xl: '32px',
        full: '9999px',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.1)',
        'cyan-glow': '0 0 20px rgba(0,229,255,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)',
        'modal': '0 24px 80px rgba(0,0,0,0.6)',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        fadeInUp: 'fadeInUp 0.5s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        heartBeat: 'heartBeat 0.3s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        countUp: 'countUp 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #C9A84C, #E8C56A)',
        'gradient-dark': 'linear-gradient(135deg, #111113 0%, #1A1A1E 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      zIndex: {
        base: '0',
        raised: '10',
        dropdown: '100',
        sticky: '200',
        overlay: '300',
        modal: '400',
        toast: '500',
        cursor: '600',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
