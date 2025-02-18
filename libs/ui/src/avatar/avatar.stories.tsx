import type { Meta, StoryObj } from '@storybook/react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    children: (
      <>
        <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
        <AvatarFallback>CN</AvatarFallback>
      </>
    ),
  },
};

export const WithFallback: Story = {
  args: {
    children: (
      <>
        <AvatarImage src='/broken-image.jpg' alt='@shadcn' />
        <AvatarFallback>CN</AvatarFallback>
      </>
    ),
  },
};

export const CustomSize: Story = {
  args: {
    className: 'h-16 w-16',
    children: (
      <>
        <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
        <AvatarFallback>CN</AvatarFallback>
      </>
    ),
  },
};
