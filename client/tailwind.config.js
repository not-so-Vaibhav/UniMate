/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F1F3F6',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#263B5A', // primary
          900: '#1E304A', // primary-hover
          950: '#172033', // text-primary
        },
        slate: {
          text: '#667085', // text-secondary
          border: '#E4E7EC', // border
        },
        accent: {
          DEFAULT: '#648579',
          hover: '#547267',
        },
        state: {
          success: '#287A57',
          warning: '#A66B20',
          danger: '#B54747',
          focus: '#6B8DB8',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
