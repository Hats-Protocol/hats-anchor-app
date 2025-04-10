import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';

import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  reactPlugin.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: { ...globals.serviceworker, ...globals.browser },
    },
    ...reactPlugin.configs.flat.recommended,

    rules: {
      'react/jsx-filename-extension': [2, { extensions: ['.tsx'] }],
      'react/function-component-definition': [2, { namedComponents: ['arrow-function', 'function-declaration'] }],
      'react/require-default-props': 'off',
      'react/destructuring-assignment': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
