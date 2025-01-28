import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: '../../dist/libs/organisms',
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'hooks',
    'hats-hooks',
    'hats-utils',
    'icons',
    'shared',
    'types',
    'utils',
    'ui',
    'molecules',
  ],
});
