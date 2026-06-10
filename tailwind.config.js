  tailwind.config = {
    theme: {
      extend: {
        colors: {
          plum: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#4c1d95' },
          lavender: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#3b0764' },
          lilac: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#4a044e' },
          cream: { 50: '#fefdfb', 100: '#fdf9f3', 200: '#faf3e9', 300: '#f5e6d3', 400: '#ead2b6' },
        },
        fontFamily: {
          display: ['"Playfair Display"', 'Georgia', 'serif'],
          body: ['"DM Sans"', 'system-ui', 'sans-serif'],
          mono: ['"DM Mono"', 'monospace'],
        },
        boxShadow: {
          soft: '0 4px 24px 0 rgba(147,51,234,0.10)',
          glow: '0 0 0 3px rgba(196,132,252,0.30)',
          card: '0 2px 16px 0 rgba(109,40,217,0.08)',
          inset: 'inset 0 2px 8px 0 rgba(147,51,234,0.08)',
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease both',
          'pop-in': 'popIn 0.4s cubic-bezier(.34,1.56,.64,1) both',
          'shimmer': 'shimmer 2s linear infinite',
        },
        keyframes: {
          fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          popIn: { '0%': { opacity: '0', transform: 'scale(0.88)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
          shimmer: { '0%': { backgroundPosition: '200% center' }, '100%': { backgroundPosition: '-200% center' } },
        }
      }
    }
  };tailwind.config = {
  theme: {
    extend: {
      colors: {
        plum: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87' },
        lilac: { 50: '#f8f4ff', 100: '#ede8fb', 200: '#d9cef7', 300: '#bfaaef', 400: '#a484e6', 500: '#8b61db', 600: '#7348c9', 700: '#5d35ab', 800: '#4b2b88', 900: '#3c2369' },
        cream: { 50: '#fffdf7', 100: '#fffaed', 200: '#fff3d0', 300: '#ffe8a8' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 24px 0 rgba(139,97,219,0.10)',
        'soft-lg': '0 8px 40px 0 rgba(139,97,219,0.16)',
        'soft-xl': '0 16px 64px 0 rgba(139,97,219,0.20)',
        'inner-soft': 'inset 0 2px 12px 0 rgba(139,97,219,0.08)',
      },
    }
  }
}