import type { Meta, StoryObj } from '@storybook/react';

import { DropZone } from './drop-zone';

const meta = {
  title: 'Components/DropZone',
  component: DropZone,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'w-[400px]',
  },
};

export const WithMaxSize: Story = {
  args: {
    maxSize: 5 * 1024 * 1024, // 5MB
    className: 'w-[400px]',
  },
};

export const WithAcceptedTypes: Story = {
  args: {
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    className: 'w-[400px]',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    className: 'w-[400px]',
  },
};
