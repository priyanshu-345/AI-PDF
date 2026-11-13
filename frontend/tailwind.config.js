/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF2F4',
          100: '#F8D0D6',
          200: '#F2AAB6',
          300: '#E6758A',
          400: '#D54460',
          500: '#B8203F',
          600: '#9B1532',
          700: '#800020', // Brand Primary Maroon
          800: '#6B0F1A',
          900: '#520B13',
          950: '#33040A',
        },
        surface: {
          50: '#FAF9F9',
          100: '#F5F3F3',
          200: '#EBE7E7',
          300: '#DCD6D6',
          card: '#FFFFFF',
          border: '#E8E2E2',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(128, 0, 32, 0.05)',
        'maroon': '0 4px 14px 0 rgba(128, 0, 32, 0.25)',
      },
    },
  },
  plugins: [],
}

