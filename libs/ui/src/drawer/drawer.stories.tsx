import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <DrawerTrigger asChild>
          <Button variant='outline'>Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 pb-0'>
            <p className='text-muted-foreground text-sm'>
              This will permanently delete your account and remove your data from our servers.
            </p>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <Button variant='outline'>Cancel</Button>
          </DrawerFooter>
        </DrawerContent>
      </>
    ),
  },
};
