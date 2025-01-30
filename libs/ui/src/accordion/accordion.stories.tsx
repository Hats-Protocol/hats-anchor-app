import type { Meta, StoryObj } from '@storybook/react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: 'single',
    collapsible: true,
    children: [
      <AccordionItem key='item-1' value='item-1'>
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>,
      <AccordionItem key='item-2' value='item-2'>
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>,
      <AccordionItem key='item-3' value='item-3'>
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>,
    ],
  },
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    children: [
      <AccordionItem key='item-1' value='item-1'>
        <AccordionTrigger>First Section</AccordionTrigger>
        <AccordionContent>This is the first section content.</AccordionContent>
      </AccordionItem>,
      <AccordionItem key='item-2' value='item-2'>
        <AccordionTrigger>Second Section</AccordionTrigger>
        <AccordionContent>This is the second section content.</AccordionContent>
      </AccordionItem>,
    ],
  },
};
