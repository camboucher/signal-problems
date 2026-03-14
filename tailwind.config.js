/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // MTA subway line colors
        mta: {
          '1': '#EE352E',
          '2': '#EE352E',
          '3': '#EE352E',
          '4': '#00933C',
          '5': '#00933C',
          '6': '#00933C',
          '7': '#B933AD',
          'A': '#0039A6',
          'C': '#0039A6',
          'E': '#0039A6',
          'B': '#FF6319',
          'D': '#FF6319',
          'F': '#FF6319',
          'M': '#FF6319',
          'N': '#FCCC0A',
          'Q': '#FCCC0A',
          'R': '#FCCC0A',
          'W': '#FCCC0A',
          'G': '#6CBE45',
          'J': '#996633',
          'Z': '#996633',
          'L': '#A7A9AC',
          'S': '#808183',
          'SIR': '#0039A6',
        },
      },
    },
  },
  plugins: [],
}
