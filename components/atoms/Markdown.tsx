import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

import ChakraNextLink from './ChakraNextLink';

interface CustomLinkProps {
  href?: string;
  children: ReactNode | ReactNode[];
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

const Markdown = ({ children }: { children: string }) => (
  <ReactMarkdown components={ChakraUIRenderer(customComponents)}>
    {children}
  </ReactMarkdown>
);

export default Markdown;
