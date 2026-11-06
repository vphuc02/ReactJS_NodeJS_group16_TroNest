// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif']
      },
      colors: {
        brand: {
          50: '#FAF7F2',   // Warm Alabaster soft canvas
          100: '#F5EFE6',  // Warm Sand light tint
          200: '#E6DFD3',  // Delicate Sand border
          500: '#A67C52',  // Primary Warm Champagne Bronze
          600: '#8C6239',  // Hover / Deep Burnished Bronze
          700: '#6E4B26',  // Deep Espresso Bronze
          DEFAULT: '#A67C52',
          dark: '#8C6239',
          deep: '#6E4B26',
          forest: '#1C1B19', // Deep Charcoal / Obsidian
          charcoal: '#2A2825',
          taupe: '#6E6A63',
          light: '#F5EFE6',
          soft: '#FAF7F2',
          border: '#E6DFD3'
        }
      }
    }
  }
};
