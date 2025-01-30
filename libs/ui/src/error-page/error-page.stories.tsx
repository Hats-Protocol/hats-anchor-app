import type { Meta, StoryObj } from '@storybook/react';

import { ErrorPage } from './error-page';

const meta = {
  title: 'Components/ErrorPage',
  component: ErrorPage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
