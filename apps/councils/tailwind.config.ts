// import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import { Config } from 'tailwindcss';
import { baseConfig } from 'ui';

const config: Config = {
  presets: [baseConfig],
  darkMode: ['class'],

  // TODO do we still need glob for libs?
  content: [
    join(__dirname, 'app/**/*.{ts,tsx,html}'),
    join(__dirname, 'components/**/*.{ts,tsx,html}'),
    // ...createGlobPatternsForDependencies(__dirname),
  ],
  exclude: ['node_modules', 'dist', 'coverage', 'tmp', 'public', 'cypress'],
  theme: {
    extend: {},
  },
};

export default config;
