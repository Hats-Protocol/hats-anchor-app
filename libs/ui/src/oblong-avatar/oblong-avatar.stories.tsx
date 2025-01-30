import type { Meta, StoryObj } from '@storybook/react';

import { OblongAvatar } from './oblong-avatar';

const meta = {
  title: 'Components/OblongAvatar',
  component: OblongAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OblongAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/124599?v=4',
  },
};

export const CustomSize: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/124599?v=4',
    className: 'h-24 w-16',
  },
};
