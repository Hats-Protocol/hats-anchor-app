import { type Meta, type StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const NoLabel: Story = {
  args: {
    label: undefined,
    children: <Button>No tooltip</Button>,
  },
};

export const LongContent: Story = {
  args: {
    label: 'This is a tooltip with a very long description that should wrap onto multiple lines',
    children: <Button>Hover for long tooltip</Button>,
  },
};
