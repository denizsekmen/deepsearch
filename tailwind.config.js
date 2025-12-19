/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          greenHover: '#1ed760',
          black: '#000000',
          dark: '#121212',
          darkGray: '#181818',
          card: '#1a1a1a',
          cardHover: '#2a2a2a',
          text: '#FFFFFF',
          textSecondary: '#B3B3B3',
          textMuted: '#6a6a6a',
        },
      },
    },
  },
  plugins: [],
};
