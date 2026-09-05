import os

files = {}

files["frontend/package.json"] = """{
  "name": "navoptima-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-three/drei": "^9.106.0",
    "@react-three/fiber": "^8.16.8",
    "clsx": "^2.1.1",
    "lucide-react": "^0.395.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.3.0",
    "three": "^0.165.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.165.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.2.13"
  }
}
"""

files["frontend/tsconfig.json"] = """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
"""

files["frontend/tsconfig.node.json"] = """{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
"""

files["frontend/vite.config.ts"] = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  }
})
"""

files["frontend/postcss.config.js"] = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"""

files["frontend/tailwind.config.js"] = """/** @type {import('tailwindcss').Config} */
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
"""

files["frontend/index.html"] = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NavOptima - Maritime Fleet Management & Digital Twin Optimization</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-background text-navy-primary antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {path}")
