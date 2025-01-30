import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button variant='outline'>Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </>
    ),
    className: 'w-[380px]',
  },
};

export const Simple: Story = {
  args: {
    children: (
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
    ),
    className: 'w-[380px]',
  },
};
