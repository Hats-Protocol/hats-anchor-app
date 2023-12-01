import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

import ChakraNextLink from './ChakraNextLink';

interface CustomLinkProps {
  href?: string;
  children: ReactNode | ReactNode[];
}

interface MarkdownProps {
  children: string;
  smallFont?: boolean;
}

const customComponents = {
  a: ({ href, children }: CustomLinkProps) => {
    if (!href) return undefined;
    return (
      <ChakraNextLink href={href} decoration>
        {children}
      </ChakraNextLink>
    );
  },
};

const Markdown = ({ children, smallFont }: MarkdownProps) => (
  <ReactMarkdown
    components={ChakraUIRenderer(customComponents)}
    className={smallFont ? 'small-font' : ''}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
