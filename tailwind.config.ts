/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html", 
    "./src/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./features/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Colores shadcn/ui (mantener para compatibilidad)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // ===== PALETA DOCENTE PRO =====
        
        // Azules principales (Profesional y Confianza) - #004e98, #3a6ea5
        'dp-blue': {
          50: '#e6f0f9',   // Muy claro para fondos
          100: '#cce2f3',  // Claro para hovers
          200: '#99c5e7',  // 
          300: '#66a8db',  // 
          400: '#3a6ea5',  // Color secundario principal
          500: '#004e98',  // Color primario principal (CONFIANZA)
          600: '#00468a',  // Hover de botones
          700: '#003d7b',  // Botones presionados
          800: '#00356d',  // Textos oscuros
          900: '#002c5e',  // Muy oscuro
          950: '#001a38',  // Casi negro
        },

        // Grises neutros - #c0c0c0, #ebebeb
        'dp-gray': {
          50: '#fafafa',   // Blanco casi puro
          100: '#ebebeb',  // Fondo claro principal
          200: '#e0e0e0',  // Bordes suaves
          300: '#c0c0c0',  // Gris medio principal
          400: '#a8a8a8',  // Texto deshabilitado
          500: '#909090',  // Iconos inactivos
          600: '#787878',  // Texto secundario
          700: '#606060',  // Texto terciario
          800: '#484848',  // Texto oscuro
          900: '#303030',  // Casi negro
          950: '#181818',  // Negro profundo
        },

        // Naranja (Acción y Energía) - #ff6700
        'dp-orange': {
          50: '#fff3eb',   // Muy claro para fondos
          100: '#ffe7d6',  // Claro para notificaciones
          200: '#ffcfad',  // 
          300: '#ffb885',  // 
          400: '#ffa05c',  // Hover
          500: '#ff6700',  // Principal (ACCIÓN)
          600: '#e65d00',  // Hover de botones
          700: '#cc5400',  // Botones presionados
          800: '#b34a00',  // 
          900: '#994100',  // Muy oscuro
          950: '#662b00',  // Casi negro
        },

        // Colores semánticos
        'dp-success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },

        'dp-warning': {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },

        'dp-error': {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },

        'dp-info': {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },

        // Textos según jerarquía
        'dp-text': {
          title: '#001a38',        // dp-blue-950
          subtitle: '#002c5e',     // dp-blue-900
          body: '#00356d',         // dp-blue-800
          secondary: '#606060',    // dp-gray-700
          tertiary: '#909090',     // dp-gray-500
          disabled: '#a8a8a8',     // dp-gray-400
        },

        // Fondos
        'dp-bg': {
          primary: '#ffffff',      // Blanco puro
          secondary: '#fafafa',    // dp-gray-50
          tertiary: '#ebebeb',     // dp-gray-100
          card: '#ffffff',         // Blanco para cards
          hover: '#f5f5f5',        // Hover sutil
          disabled: '#e0e0e0',     // dp-gray-200
        },

        // Bordes
        'dp-border': {
          light: '#ebebeb',        // dp-gray-100
          medium: '#c0c0c0',       // dp-gray-300
          dark: '#a8a8a8',         // dp-gray-400
        },

        // Sidebar (mantener para compatibilidad shadcn)
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
};
