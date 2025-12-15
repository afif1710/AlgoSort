module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5'
        }
      }
    }
  },
  darkMode: ['class', '[data-theme="dark"]'],
  plugins: []
}
