module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 500ms ease-in',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 100 },
        },
      },
    },
  },
  plugins: [],
}
