import type { Meta, StoryObj } from '@storybook/react';

import { Label } from '../label';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'Components/Forms/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue='comfortable'>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='default' id='r1' />
        <Label htmlFor='r1'>Default</Label>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='comfortable' id='r2' />
        <Label htmlFor='r2'>Comfortable</Label>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='compact' id='r3' />
        <Label htmlFor='r3'>Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue='default'>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='default' id='r4' />
        <Label htmlFor='r4'>Enabled</Label>
      </div>
      <div className='flex items-center space-x-2'>
        <RadioGroupItem value='disabled' id='r5' disabled />
        <Label htmlFor='r5'>Disabled</Label>
      </div>
    </RadioGroup>
  ),
};
