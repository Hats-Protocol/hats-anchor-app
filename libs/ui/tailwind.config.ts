import { join } from 'path';
import type { Config } from 'tailwindcss';
import { fontFamily, screens } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [join(__dirname, 'src/**/*.{ts,tsx}')],
  exclude: ['node_modules', 'dist', 'coverage', 'tmp', 'public', 'cypress'],
  theme: {
    extend: {
      screens: {
        xs: '384px',
        ...screens,
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'edit-bg': '#C4F1F9',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // INFORMATIVE
        'informative-human': 'var(--informative-human)',
        'informative-code': 'var(--informative-code)',
        // FUNCTIONAL
        'functional-success': 'var(--functional-success)',
        'functional-error': 'var(--functional-error)',
        'functional-link-primary': 'var(--functional-link-primary)',
        'functional-link-secondary': 'var(--functional-link-secondary)',
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        'jb-mono': ['JetBrains Mono Variable', ...fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      shadow: {
        'accordion-trigger': '0px 1px 3px 0px rgba(0, 0, 0, 0.10), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
        'expanded-accordion': '0px 10px 6px -6px rgba(0, 0, 0, 0.10)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      gridTemplateColumns: {
        16: 'repeat(16, minmax(0, 1fr))',
        20: 'repeat(20, minmax(0, 1fr))',
      },
      gridColumnStart: {
        12: '12',
        13: '13',
        14: '14',
        15: '15',
        16: '16',
        17: '17',
        18: '18',
        19: '19',
        20: '20',
      },
    },
  },
  // eslint-disable-next-line global-require
  plugins: [require('tailwindcss-animate')],
};

export default config;
