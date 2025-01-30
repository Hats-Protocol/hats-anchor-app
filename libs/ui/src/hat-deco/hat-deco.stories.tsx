import { type Meta, type StoryObj } from '@storybook/react';

import { HatDeco } from './hat-deco';

const meta: Meta<typeof HatDeco> = {
  title: 'Components/HatDeco',
  component: HatDeco,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div className='w-full max-w-[500px] rounded-lg border border-dashed border-slate-200'>{Story()}</div>,
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Tall: Story = {
  args: {
    height: 300,
  },
};

export const Short: Story = {
  args: {
    height: 80,
  },
};

export const HiddenOnDesktop: Story = {
  args: {
    hideOnDesktop: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This variant will be hidden on desktop (>768px) screens. Resize your viewport to see the effect.',
      },
    },
  },
};
