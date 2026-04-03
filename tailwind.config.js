/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terra:        '#D4654A',
        'terra-deep': '#B85042',
        'terra-light':'#E8876A',
        sage:         '#6DB87A',
        'sage-dark':  '#4A8C55',
        'sage-light': '#A8D4AE',
        bg:           '#0A0A0A',
        's1':         '#1C1C1E',
        's2':         '#2C2C2E',
        's3':         '#3A3A3C',
        's4':         '#48484A',
        't1':         '#FFFFFF',
        't2':         '#AEAEB2',
        't3':         '#6D6D72',
        amber:        '#FF9F0A',
        success:      '#30D158',
        danger:       '#FF453A',
      },
      fontFamily: {
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        toastIn: {
          '0%':   { transform: 'translateY(80px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        pageEnter: {
          '0%':   { transform: 'translateX(100%)', opacity: '0.8' },
          '100%': { transform: 'translateX(0)',     opacity: '1'   },
        },
        flashAmber: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '30%':      { backgroundColor: 'rgba(255,159,10,0.18)' },
        },
        typewriter: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up':    'slideUp 0.3s ease-out',
        'slide-down':  'slideDown 0.3s ease-in',
        'fade-in':     'fadeIn 0.3s ease-out',
        'toast-in':    'toastIn 0.25s ease-out',
        'page-enter':  'pageEnter 0.25s ease-out',
        'flash-amber': 'flashAmber 0.8s ease-out',
      },
    },
  },
  plugins: [],
}
