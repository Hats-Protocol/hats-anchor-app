import type { Meta, StoryObj } from '@storybook/react';
import { Bold } from 'lucide-react';

import { Toggle } from './toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Toggle bold',
    children: <Bold className='h-4 w-4' />,
  },
};

export const WithText: Story = {
  args: {
    'aria-label': 'Toggle bold',
    children: (
      <>
        <Bold className='h-4 w-4' />
        Bold
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    'aria-label': 'Toggle bold',
    size: 'sm',
    children: <Bold className='h-4 w-4' />,
  },
};

export const Large: Story = {
  args: {
    'aria-label': 'Toggle bold',
    size: 'lg',
    children: <Bold className='h-4 w-4' />,
  },
};

export const Outline: Story = {
  args: {
    'aria-label': 'Toggle bold',
    variant: 'outline',
    children: <Bold className='h-4 w-4' />,
  },
};
