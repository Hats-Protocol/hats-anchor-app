import { type Meta, type StoryObj } from '@storybook/react';

import { Spinner } from './spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomClass: Story = {
  args: {
    className: 'size-20 text-blue-500',
  },
};
