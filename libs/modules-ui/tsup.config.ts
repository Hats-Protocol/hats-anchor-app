import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: '../../dist/libs/modules-ui',
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    '@hatsprotocol/details-sdk',
    '@uiw/react-md-editor',
    '@privy-io/react-auth',
    'react',
    'react-dom',
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
