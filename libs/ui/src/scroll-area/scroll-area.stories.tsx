import type { Meta, StoryObj } from '@storybook/react';

import { ScrollArea } from './scroll-area';

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const LONG_TEXT = `
Once upon a time in a digital realm, there lived a curious developer who loved to create beautiful interfaces.
They spent their days crafting elegant components and their nights dreaming of perfect user experiences.
Each line of code they wrote was a step towards making the web a better place.
The scrollable content continued to grow, line by line, pixel by pixel.
Until one day, they realized that the best interfaces were the ones that felt natural and intuitive.
And so, they created components that worked just like users expected them to.
The end.
`.repeat(3);

export const Default: Story = {
  args: {
    className: 'h-[200px] w-[350px] rounded-md border p-4',
    children: LONG_TEXT,
  },
};

export const Horizontal: Story = {
  args: {
    className: 'w-[350px] rounded-md border',
    children: (
      <div className='flex w-max space-x-4 p-4'>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className='w-[200px] shrink-0 rounded-md border border-gray-200 p-4'>
            <div className='text-sm'>Horizontal Item {i + 1}</div>
            <div className='mt-2 text-sm text-gray-600'>
              This is a scrollable horizontal content area showing how ScrollArea handles horizontal overflow.
            </div>
          </div>
        ))}
      </div>
    ),
  },
};

export const Both: Story = {
  args: {
    className: 'h-[400px] w-[400px] rounded-md border',
    children: (
      <div className='w-[600px] p-4'>
        <h4 className='mb-4 text-sm font-medium leading-none'>Both Directions</h4>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className='mb-4'>
            <div className='text-sm'>Section {i + 1}</div>
            <div className='mt-2 text-sm text-gray-600'>{LONG_TEXT}</div>
          </div>
        ))}
      </div>
    ),
  },
};
