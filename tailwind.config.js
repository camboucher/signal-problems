/** Reads a "-rgb" CSS custom property (e.g. --sp-accent-rgb: 145 132 217) so
 *  Tailwind's opacity modifiers (bg-sp-accent/10) work against theme vars. */
function spColor(name) {
  return ({ opacityValue }) =>
    opacityValue === undefined
      ? `rgb(var(--sp-${name}-rgb))`
      : `rgb(var(--sp-${name}-rgb) / ${opacityValue})`
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // Signal board theme tokens (see src/index.css for values, both themes).
        // Existing gray/white/black utilities are remapped to these same
        // tokens below, so most of the app re-themes without per-class edits.
        sp: {
          bg: spColor('bg'),
          panel: spColor('panel'),
          panel2: spColor('panel2'),
          edge: 'var(--sp-edge)', // already translucent — no opacity variants needed
          text: spColor('text'),
          dim: spColor('dim'),
          accent: spColor('accent'),
          led: spColor('led'),
          on: spColor('on'),
          late: spColor('late'),
          very: spColor('very'),
          sign: spColor('sign'),
        },
        white: 'var(--sp-panel)',
        gray: {
          50: 'var(--sp-panel2)',
          100: 'var(--sp-edge)',
          200: 'var(--sp-edge)',
          300: 'var(--sp-dim)',
          400: 'var(--sp-dim)',
          500: 'var(--sp-dim)',
          600: 'var(--sp-text)',
          700: 'var(--sp-text)',
          800: 'var(--sp-text)',
          900: 'var(--sp-text)',
          950: 'var(--sp-text)',
        },
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
