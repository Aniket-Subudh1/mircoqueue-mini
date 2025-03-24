/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    important: '#root',
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#4caf50',
            main: '#2e7d32',
            dark: '#1b5e20',
            contrastText: '#ffffff',
          },
          secondary: {
            light: '#03a9f4',
            main: '#0288d1',
            dark: '#01579b',
            contrastText: '#ffffff',
          },
          error: {
            light: '#ef5350',
            main: '#d32f2f',
            dark: '#c62828',
            contrastText: '#ffffff',
          },
          warning: {
            light: '#ff9800',
            main: '#f57c00',
            dark: '#e65100',
            contrastText: '#ffffff',
          },
          info: {
            light: '#03a9f4',
            main: '#0288d1',
            dark: '#01579b',
            contrastText: '#ffffff',
          },
          success: {
            light: '#4caf50',
            main: '#388e3c',
            dark: '#1b5e20',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
          },
        },
        fontFamily: {
          sans: ['"Roboto"', 'sans-serif'],
        },
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
        },
        boxShadow: {
          card: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
        borderRadius: {
          'card': '16px',
        },
      },
    },
    plugins: [],
    corePlugins: {
     
      preflight: false,
    },
  }