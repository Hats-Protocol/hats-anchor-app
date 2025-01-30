import { type Meta, type StoryObj } from '@storybook/react';

import { HatDeco } from './hat-deco';

const meta: Meta<typeof HatDeco> = {
  title: 'Components/HatDeco',
  component: HatDeco,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomHeight: Story = {
  args: {
    height: '200px',
  },
};

export const HiddenOnDesktop: Story = {
  args: {
    hideOnDesktop: true,
  },
};
