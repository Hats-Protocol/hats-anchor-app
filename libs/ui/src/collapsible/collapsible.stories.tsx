import { ChevronsUpDown } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <div className='flex items-center justify-between space-x-4 px-4'>
          <h4 className='text-sm font-semibold'>@peduarte starred 3 repositories</h4>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='sm'>
              <ChevronsUpDown className='h-4 w-4' />
              <span className='sr-only'>Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='space-y-2'>
          <div className='rounded-md border px-4 py-3 font-mono text-sm'>@radix-ui/primitives</div>
          <div className='rounded-md border px-4 py-3 font-mono text-sm'>@radix-ui/colors</div>
          <div className='rounded-md border px-4 py-3 font-mono text-sm'>@stitches/react</div>
        </CollapsibleContent>
      </>
    ),
    className: 'w-[350px] space-y-2',
  },
};
