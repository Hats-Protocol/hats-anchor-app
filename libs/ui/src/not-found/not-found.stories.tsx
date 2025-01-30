import type { Meta, StoryObj } from '@storybook/react';

import { NotFound } from './not-found';

const meta = {
  title: 'Components/NotFound',
  component: NotFound,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof NotFound>;

export const Default: Story = {
  args: {
    homeUrl: '#',
  },
};
