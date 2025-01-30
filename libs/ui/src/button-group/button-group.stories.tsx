import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { ButtonGroup } from './button-group';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Button variant='outline'>Previous</Button>
        <Button variant='outline'>Next</Button>
      </>
    ),
  },
};

export const WithVariants: Story = {
  args: {
    children: (
      <>
        <Button variant='default'>Save</Button>
        <Button variant='destructive'>Delete</Button>
        <Button variant='outline'>Cancel</Button>
      </>
    ),
  },
};
