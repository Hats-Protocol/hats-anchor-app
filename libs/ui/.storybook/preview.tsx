import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '../src/styles/global.css';

import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import * as React from 'react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: (a, b) => (a.title === b.title ? 0 : a.title.localeCompare(b.title)),
    },
  },
  decorators: [
    // Theme decorator
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    // Portal/Radix UI decorator
    (Story) => (
      <div id='root' className='min-h-screen p-8'>
        <Story />
      </div>
    ),
  ],
};

export default preview;
