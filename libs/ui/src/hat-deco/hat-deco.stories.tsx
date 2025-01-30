import type { Meta, StoryObj } from '@storybook/react';

import { HatDeco } from './hat-deco';

const meta = {
  title: 'Components/HatDeco',
  component: HatDeco,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HatDeco>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomHeight: Story = {
  args: {
    height: '300px',
  },
};

export const HiddenOnDesktop: Story = {
  args: {
    hideOnDesktop: true,
  },
};
