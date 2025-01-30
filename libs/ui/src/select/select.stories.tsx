import { type Meta, type StoryObj } from '@storybook/react';

import { BaseSelect, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './select';

const meta: Meta<typeof BaseSelect> = {
  title: 'Components/Forms/Select',
  component: BaseSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BaseSelect>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select an option' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value='apple'>Apple</SelectItem>
          <SelectItem value='banana'>Banana</SelectItem>
          <SelectItem value='orange'>Orange</SelectItem>
        </SelectGroup>
      </SelectContent>
    </BaseSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <BaseSelect disabled>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select an option' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value='apple'>Apple</SelectItem>
          <SelectItem value='banana'>Banana</SelectItem>
          <SelectItem value='orange'>Orange</SelectItem>
        </SelectGroup>
      </SelectContent>
    </BaseSelect>
  ),
};

export const WithDisabledOption: Story = {
  render: () => (
    <BaseSelect>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select an option' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value='apple'>Apple</SelectItem>
          <SelectItem value='banana' disabled>
            Banana
          </SelectItem>
          <SelectItem value='orange'>Orange</SelectItem>
        </SelectGroup>
      </SelectContent>
    </BaseSelect>
  ),
};
