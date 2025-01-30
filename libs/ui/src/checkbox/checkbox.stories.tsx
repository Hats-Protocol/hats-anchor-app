import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './checkbox';

const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithLabel: Story = {
  args: {
    id: 'terms',
  },
  decorators: [
    (Story) => (
      <div className='items-top flex space-x-2'>
        <Story />
        <div className='grid gap-1.5 leading-none'>
          <label
            htmlFor='terms'
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Accept terms and conditions
          </label>
          <p className='text-muted-foreground text-sm'>You agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
