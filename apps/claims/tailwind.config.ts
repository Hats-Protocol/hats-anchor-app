// import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';
import type { Config } from 'tailwindcss';

// eslint-disable-next-line @nx/enforce-module-boundaries
import baseConfig from '../../libs/ui/tailwind.config';

const config: Config = {
  presets: [baseConfig],
  darkMode: ['class'],

  content: [
    join(__dirname, 'app/**/*.{ts,tsx,html}'),
    '../../libs/contexts/src/**/*.{ts,tsx,html}',
    '../../libs/forms/src/**/*.{ts,tsx,html}',
    '../../libs/modules-ui/src/**/*.{ts,tsx,html}',
    '../../libs/molecules/src/**/*.{ts,tsx,html}',
    '../../libs/organisms/src/**/*.{ts,tsx,html}',
    '../../libs/ui/src/**/*.{ts,tsx,html}',
  ],
  exclude: ['node_modules', 'dist', 'coverage', 'tmp', 'public', 'cypress'],
  theme: {
    extend: {},
  },
};

export default config;
