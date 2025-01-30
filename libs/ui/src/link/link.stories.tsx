import { type Meta, type StoryObj } from '@storybook/react';

import { cn } from '../lib/utils';

// Mock component for Storybook only
const Link = ({ href, children, className, isExternal = false }: any) => (
  <a
    href={href}
    className={cn('text-functional-link-primary', className)}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noopener noreferrer' : undefined}
  >
    {children}
  </a>
);

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'https://hatsprotocol.xyz',
    children: 'Click me',
  },
};

export const External: Story = {
  args: {
    href: 'https://hatsprotocol.xyz',
    children: 'External Link',
    isExternal: true,
  },
};

export const CustomStyle: Story = {
  args: {
    href: 'https://hatsprotocol.xyz',
    children: 'Custom Styled Link',
    className: 'text-blue-500 hover:text-blue-700 underline',
  },
};
