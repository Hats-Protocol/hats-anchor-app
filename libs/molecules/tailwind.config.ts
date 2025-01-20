import { join } from 'path';
import { Config } from 'tailwindcss';
import { baseConfig } from 'ui';

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
