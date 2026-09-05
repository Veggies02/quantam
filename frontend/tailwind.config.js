/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FFFFFF',
          panel: '#F5F8F7',
          muted: '#EBF1F0',
        },
        navy: {
          primary: '#0F1B2D',
          secondary: '#445059',
          muted: '#7C8B96',
          dark: '#080E18',
        },
        teal: {
          DEFAULT: '#0E7C7B',
          hover: '#0A6362',
          light: '#E6F3F3',
          dark: '#084C4B',
        },
        violet: {
          DEFAULT: '#463C77',
          hover: '#383060',
          light: '#ECEAF5',
          dark: '#2B244D',
        },
        amber: {
          DEFAULT: '#B9790A',
          hover: '#956006',
          light: '#FEF7E8',
          dark: '#714804',
        },
        success: {
          DEFAULT: '#0D8050',
          hover: '#0A633E',
          light: '#E6F5EE',
        },
        danger: {
          DEFAULT: '#C5221F',
          hover: '#9E1B18',
          light: '#FCE8E8',
        },
        quantum: {
          DEFAULT: '#00B4D8',
          glow: '#90E0EF',
          dark: '#0077B6',
          light: '#E0F7FA',
        },
        border: {
          DEFAULT: '#DCE4E1',
          subtle: '#E8EFEF',
          strong: '#B4C4C0',
        }
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(15, 27, 45, 0.06), 0 1px 4px -1px rgba(15, 27, 45, 0.04)',
        'card-hover': '0 8px 20px -4px rgba(15, 27, 45, 0.1), 0 2px 6px -1px rgba(15, 27, 45, 0.06)',
        'subtle': '0 1px 3px rgba(15, 27, 45, 0.05)',
        'modal': '0 20px 40px -15px rgba(15, 27, 45, 0.25)',
      },
      borderRadius: {
        'card': '10px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
