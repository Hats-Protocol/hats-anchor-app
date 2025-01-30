import '../src/styles/global.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';

const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
];

const preview: Preview = {
  parameters: {
    // actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  // decorators,
};

export default preview;
