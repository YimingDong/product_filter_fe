/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // 根据你的项目目录调整
  ],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        secondary: '#0E42C6',
        neutral: {
          100: '#F5F7FA',
          200: '#E5E6EB',
          300: '#C9CDD4',
          400: '#86909C',
          500: '#4E5969',
          600: '#272E3B',
          700: '#1D2129',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
        'hover': '0 8px 30px rgba(22, 93, 255, 0.15)',
      }
    },
  },
  plugins: [],
}