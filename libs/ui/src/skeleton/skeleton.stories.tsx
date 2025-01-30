import { Meta, StoryObj } from '@storybook/react';

import { Skeleton } from '../skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className='bg-background p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-4 w-[250px]' />
      <Skeleton className='h-4 w-[200px]' />
    </div>
  ),
};

export const Circle: Story = {
  render: () => <Skeleton className='h-12 w-12 rounded-full' />,
};

export const Card: Story = {
  render: () => (
    <div className='space-y-5'>
      <Skeleton className='h-12 w-12 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  ),
};

export const CardWithImage: Story = {
  render: () => (
    <div className='flex flex-col space-y-3'>
      <Skeleton className='h-[200px] w-[400px] rounded-xl' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[250px]' />
        <Skeleton className='h-4 w-[200px]' />
      </div>
    </div>
  ),
};
