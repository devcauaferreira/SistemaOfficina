export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--app-primary-rgb) / <alpha-value>)',
        'primary-hover': 'rgb(var(--app-primary-hover-rgb) / <alpha-value>)',
        secondary: '#0284C7',
        success: '#16A34A',
        warning: '#F97316',
        danger: '#EF4444'
      }
    }
  },
  plugins: []
};
