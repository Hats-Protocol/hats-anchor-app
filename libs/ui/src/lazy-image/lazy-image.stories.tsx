import type { Meta, StoryObj } from '@storybook/react';

import { LazyImage } from './lazy-image';

// This helps TypeScript infer the correct types
const meta: Meta<typeof LazyImage> = {
  title: 'Components/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [(Story) => <div className='flex flex-col gap-4'>{Story()}</div>],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/seed/default/400/400',
    alt: 'Random placeholder image',
    containerClassName: 'w-[200px] h-[200px]',
  },
};

export const WithCustomStyles: Story = {
  args: {
    src: 'https://picsum.photos/seed/custom/600/400',
    alt: 'Styled placeholder image',
    containerClassName: 'w-[300px] h-[200px] rounded-lg overflow-hidden',
    imageClassName: 'rounded-lg scale-95 hover:scale-100 transition-transform duration-300',
  },
};

export const WithFallback: Story = {
  args: {
    src: '',
    alt: 'This should show the fallback state',
    containerClassName: 'w-[200px] h-[200px]',
  },
};

export const Loading: Story = {
  args: {
    src: 'https://picsum.photos/seed/loading-test/2000/2000',
    alt: 'This will show loading state initially',
    containerClassName: 'w-[200px] h-[200px] rounded-md overflow-hidden',
    skeletonClassName: 'w-[200px] h-[200px] bg-muted/80 animate-pulse rounded-md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates the loading state with a custom skeleton style. The component has a built-in 500ms delay and uses a large image to ensure we can see the loading state.',
      },
    },
  },
};
