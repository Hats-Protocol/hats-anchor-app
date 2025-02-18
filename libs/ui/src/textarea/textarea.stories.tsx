import { type Meta, type StoryObj } from '@storybook/react';

import { BaseTextarea } from './textarea';

const meta: Meta<typeof BaseTextarea> = {
  title: 'Components/Forms/Textarea',
  component: BaseTextarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'This is some example text that was entered in the textarea.',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
  },
};

export const CustomHeight: Story = {
  args: {
    placeholder: 'This textarea has custom height',
    className: 'min-h-[120px]',
  },
};
