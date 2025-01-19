import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import type { Config } from 'tailwindcss';

// eslint-disable-next-line @nx/enforce-module-boundaries
import baseConfig from '../../libs/ui/tailwind.config';

const config: Config = {
  presets: [baseConfig],
  darkMode: ['class'],

  // TODO do we still need glob for libs?
  content: [join(__dirname, '**/*.{ts,tsx,html}'), ...createGlobPatternsForDependencies(__dirname)],
  exclude: ['node_modules', 'dist', 'coverage', 'tmp', 'public', 'cypress'],
  theme: {
    extend: {},
  },
};

export default config;
