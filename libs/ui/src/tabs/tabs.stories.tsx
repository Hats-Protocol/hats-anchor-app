import { type Meta, type StoryObj } from '@storybook/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: () => (
    <Tabs defaultValue='tab1'>
      <TabsList>
        <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
        <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value='tab1' className='rounded-md bg-black/10 p-4 text-center'>
        Tab 1
      </TabsContent>
      <TabsContent value='tab2' className='rounded-md bg-black/10 p-4 text-center'>
        Tab 2
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
