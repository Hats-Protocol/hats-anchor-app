import { type Meta, type StoryObj } from '@storybook/react';

import { Button } from '../button';

// Mock component for Storybook only
const LinkButton = ({ href, icon, variant = 'default', children, isExternal }: any) => (
  <Button variant={variant} asChild>
    <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
      <div className='flex gap-3'>
        {icon}
        <p className='text-sm'>{children}</p>
      </div>
    </a>
  </Button>
);

const meta: Meta<typeof LinkButton> = {
  title: 'Components/LinkButton',
  component: LinkButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'https://example.com',
    children: 'Click me',
  },
};

export const WithIcon: Story = {
  args: {
    href: 'https://example.com',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M7 17l9.2-9.2M17 17V7H7' />
      </svg>
    ),
    children: 'External Link',
    isExternal: true,
  },
};

export const Secondary: Story = {
  args: {
    href: 'https://example.com',
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    href: 'https://example.com',
    variant: 'ghost',
    children: 'Ghost Button',
  },
};
