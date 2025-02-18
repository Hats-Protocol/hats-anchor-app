import type { Meta, StoryObj } from '@storybook/react';
import { addDays } from 'date-fns';

import { Calendar } from './calendar';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Selected: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
  },
};

export const WithRange: Story = {
  args: {
    mode: 'range',
    selected: {
      from: new Date(),
      to: addDays(new Date(), 7),
    },
  },
};
