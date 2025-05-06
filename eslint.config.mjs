import nx from '@nx/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import eslintPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.{ts,js,mjs,cjs,jsx,tsx}'],
  ignores: ['**/dist', '**/node_modules'],
  extends: [
    nx.configs['flat/base'],
    nx.configs['flat/typescript'],
    nx.configs['flat/javascript'],
    pluginQuery.configs['flat/recommended'],
    eslintPrettierRecommended,
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-console': 'warn',

    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
        depConstraints: [
          {
            sourceTag: '*',
            onlyDependOnLibsWithTags: ['*'],
          },
        ],
      },
    ],

    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  plugins: {
    '@nx': nx,
    '@tanstack/eslint-plugin-query': pluginQuery,
    'simple-import-sort': simpleImportSort,
  },
});
