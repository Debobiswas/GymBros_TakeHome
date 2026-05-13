/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:      '#242c3b',
        'card-mid':   '#2b3445',
        'card-deep':  '#1c2130',
        'sheet-top':  '#353f54',
        'sheet-bot':  '#222834',
        'accent-a':   '#34C8E8',
        'accent-b':   '#4E4AF2',
        'price-blue': '#3d9cea',
        'text-hi':    'rgba(255,255,255,0.87)',
        'text-lo':    'rgba(255,255,255,0.6)',
        separator:    'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        'poppins':          ['Poppins_400Regular'],
        'poppins-medium':   ['Poppins_500Medium'],
        'poppins-semibold': ['Poppins_600SemiBold'],
        'poppins-bold':     ['Poppins_700Bold'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '30px',
        '4xl': '40px',
      },
    },
  },
  plugins: [],
};
