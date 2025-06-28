/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'f5f5f5': '#f5f5f5',
        'gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        'serif': ['Crimson Text', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['Source Sans Pro', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '0.9', fontWeight: '300' }],
        'display-2': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1', fontWeight: '300' }],
        'heading-1': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', fontWeight: '500' }],
        'heading-2': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.2', fontWeight: '500' }],
        'body-large': ['clamp(1.125rem, 2vw, 1.375rem)', { lineHeight: '1.6', fontWeight: '400' }],
        'body-medium': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        'mckinsey-xs': '0.5rem',
        'mckinsey-sm': '1rem',
        'mckinsey-md': '1.5rem',
        'mckinsey-lg': '2.5rem',
        'mckinsey-xl': '4rem',
        'mckinsey-2xl': '6rem',
      },
      boxShadow: {
        'mckinsey-soft': '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'mckinsey-medium': '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.15)',
        'mckinsey-strong': '0 16px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'mckinsey-fade-in': 'mckinsey-fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'mckinsey-slide-in': 'mckinsey-slide-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
      keyframes: {
        'mckinsey-fade-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'mckinsey-slide-in': {
          'from': {
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        }
      }
    },
  },
  plugins: [],
};