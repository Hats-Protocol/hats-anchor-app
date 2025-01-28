import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: '../../dist/libs/forms',
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'lodash',
    'react',
    'react-dom',
    '@uiw/react-md-editor',
    // internal packages
    'hooks',
    'hats-hooks',
    'hats-utils',
    'icons',
    'shared',
    'types',
    'utils',
    'ui',
  ],
});
