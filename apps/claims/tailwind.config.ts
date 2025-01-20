import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import type { Config } from 'tailwindcss';
import { baseConfig } from 'ui';

const config: Config = {
  presets: [baseConfig],
  darkMode: ['class'],

  content: [join(__dirname, 'app/**/*.{ts,tsx,html}'), ...createGlobPatternsForDependencies(__dirname)],
  exclude: ['node_modules', 'dist', 'coverage', 'tmp', 'public', 'cypress'],
  theme: {
    extend: {},
  },
};

export default config;
