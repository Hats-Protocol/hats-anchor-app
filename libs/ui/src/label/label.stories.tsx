import { type Meta, type StoryObj } from '@storybook/react';

import { Label } from './label';

const meta: Meta<typeof Label> = {
  title: 'Components/Forms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label Text',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Custom Label',
    className: 'text-blue-500',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Label',
    className: 'peer-disabled:opacity-70',
  },
};
