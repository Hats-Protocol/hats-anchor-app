import { type Meta, type StoryObj } from '@storybook/react';

import { Toast, ToastAction, ToastProvider, ToastViewport } from './toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a toast message',
  },
};

export const WithAction: Story = {
  args: {
    children: (
      <div className='flex gap-2'>
        <div>This is a toast with an action</div>
        <ToastAction altText='Try again' onClick={() => console.log('Action clicked')}>
          Try again
        </ToastAction>
      </div>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Something went wrong!',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
};
