import type { Meta, StoryObj } from '@storybook/react';

import { Markdown } from './markdown';

const meta = {
  title: 'Components/Markdown',
  component: Markdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Markdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMarkdown = `
# Heading 1
## Heading 2

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
  - Nested item
  - Another nested item
- List item 3

[A link](https://example.com)

\`\`\`typescript
const code = "example";
console.log(code);
\`\`\`
`;

const longMarkdown = `
# Long Content

${Array(5).fill(sampleMarkdown).join('\n\n')}
`;

export const Default: Story = {
  args: {
    children: sampleMarkdown,
  },
};

export const Collapsible: Story = {
  args: {
    children: longMarkdown,
    collapse: true,
    maxHeight: 300,
  },
};

export const SmallFont: Story = {
  args: {
    children: sampleMarkdown,
    smallFont: true,
  },
};
