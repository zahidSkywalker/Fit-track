/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#E8E0D8',
          'bg-light': '#F5EDE5',
          'bg-dark': '#C8BFB5',
          blue: '#7BA7CC',
          'blue-light': '#A3C4DE',
          'blue-dark': '#5A8DB8',
          peach: '#E8A87C',
          'peach-light': '#F0C4A4',
          'peach-dark': '#D4906A',
          green: '#8ECDA8',
          'green-light': '#B0DFC0',
          'green-dark': '#6BB88A',
          red: '#D4756B',
          'red-light': '#E29E96',
          'red-dark': '#C05A50',
          text: '#4A4240',
          'text-secondary': '#8A807A',
          'text-tertiary': '#B0A8A2',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        neu: '16px',
        'neu-lg': '24px',
        'neu-sm': '12px',
        'neu-xs': '8px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      boxShadow: {
        'neu-raised': '6px 6px 12px #C8BFB5, -6px -6px 12px #F5EDE5',
        'neu-raised-sm': '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
        'neu-raised-lg': '8px 8px 16px #C8BFB5, -8px -8px 16px #F5EDE5',
        'neu-pressed': 'inset 4px 4px 8px #C8BFB5, inset -4px -4px 8px #F5EDE5',
        'neu-pressed-sm': 'inset 2px 2px 4px #C8BFB5, inset -2px -2px 4px #F5EDE5',
        'neu-pressed-lg': 'inset 6px 6px 12px #C8BFB5, inset -6px -6px 12px #F5EDE5',
        'neu-flat': '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
