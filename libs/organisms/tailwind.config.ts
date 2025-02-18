import { join } from 'path';
import { Config } from 'tailwindcss';

// eslint-disable-next-line @nx/enforce-module-boundaries
import baseConfig from '../ui/tailwind.config';

const config: Config = {
  presets: [baseConfig],
  darkMode: ['class'],

  content: [join(__dirname, 'src/**/*.{ts,tsx}')],
  exclude: ['node_modules', 'dist', 'coverage', 'tmp', 'public', 'cypress'],
  theme: {
    extend: {},
  },
};

export default config;
