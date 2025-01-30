import { type Meta, type StoryObj } from '@storybook/react';

import { LazyImage } from './lazy-image';

const meta: Meta<typeof LazyImage> = {
  title: 'Components/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: '/icon.jpeg',
    alt: 'Default image',
    containerClassName: 'w-[200px] h-[200px]',
  },
};

export const WithCustomStyles: Story = {
  args: {
    src: '/icon.jpeg',
    alt: 'Styled image',
    containerClassName: 'w-[300px] h-[200px] rounded-lg',
    imageClassName: 'rounded-lg scale-95 hover:scale-100 transition-transform',
  },
};

export const WithFallback: Story = {
  args: {
    src: '',
    alt: 'Empty source to trigger fallback',
    containerClassName: 'w-[200px] h-[200px]',
  },
};

export const Loading: Story = {
  args: {
    src: '/icon.jpeg',
    alt: 'Loading state image',
    containerClassName: 'w-[200px] h-[200px]',
    skeletonClassName: 'bg-blue-100',
  },
};
