import type { Meta, StoryObj } from '@storybook/react';
import { Terminal } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from './alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components and dependencies to your app using the cli.</AlertDescription>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <Terminal className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </>
    ),
  },
};

export const WithoutIcon: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>This is a simple alert without an icon.</AlertDescription>
      </>
    ),
  },
};
