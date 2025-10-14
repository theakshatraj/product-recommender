/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#2563eb', // Blue 600 for brand actions and highlights
        },
        neutral: {
          900: '#0f172a', // Slate 900 for text
          700: '#334155', // Slate 700 for muted text
          100: '#f1f5f9', // Slate 100 for background
        },
        accent: {
          500: '#f59e0b', // Amber 500 for status highlights and badges
        }
      },
      fontFamily: {
        'heading': ['DM Sans', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',   // 12px - minimum readable size
        'sm': '0.875rem',  // 14px - minimum body text
        'base': '1rem',    // 16px
        'lg': '1.125rem',  // 18px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
      },
      lineHeight: {
        'relaxed': '1.6',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}
