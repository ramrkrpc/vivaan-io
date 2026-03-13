/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1c1c3b',
        'sidebar-hover': '#2a2a4a',
        'sidebar-active': '#2e2e50',
        vyapar: {
          red: '#d32f2f',
          'red-hover': '#b71c1c',
          blue: '#1976d2',
          'blue-light': '#e3f2fd',
          gold: '#f5a623',
          green: '#388e3c',
        },
      },
    },
  },
  plugins: [],
}

