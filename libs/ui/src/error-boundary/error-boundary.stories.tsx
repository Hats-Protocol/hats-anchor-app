import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { ErrorBoundary } from './error-boundary';

const BuggyCounter = () => {
  const [count, setCount] = React.useState(0);

  if (count === 5) {
    throw new Error('I crashed!');
  }

  return (
    <div className='text-center'>
      <p className='mb-4'>Count: {count}</p>
      <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
    </div>
  );
};

const meta = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <BuggyCounter />,
  },
};
