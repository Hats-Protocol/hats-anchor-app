import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      // Prevent the docs page from rendering the component directly
      // as it might cause portal issues
      source: {
        type: 'code',
      },
    },
  },
  decorators: [
    (Story) => (
      // Ensure there's a proper mounting point for portals
      <div id='root'>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '4rem' }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Dimensions</h4>
            <p className='text-muted-foreground text-sm'>Set the dimensions for the layer.</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const LeftAligned: Story = {
  render: () => (
    <div style={{ padding: '4rem' }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline'>Left Aligned</Button>
        </PopoverTrigger>
        <PopoverContent align='start'>
          <div className='space-y-2'>
            <h4 className='font-medium leading-none'>Left Aligned</h4>
            <p className='text-muted-foreground text-sm'>This popover is aligned to the left of the trigger.</p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
