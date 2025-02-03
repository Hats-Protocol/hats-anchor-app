import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.stories.tsx'],
  outDir: '../../dist/libs/ui',
  format: ['cjs', 'esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'hooks',
    'icons',
    'shared',
    'types',
    'utils',
    '@uiw/react-md-editor',
    '@rainbow-me/rainbowkit',
    '@fontsource-variable/inter',
    '@fontsource-variable/jetbrains-mono',
  ],
  tsconfig: 'tsconfig.lib.json',
});
