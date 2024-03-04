import { Box, Button, Center, Stack, Text } from '@chakra-ui/react';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import ChakraNextLink from './ChakraNextLink';

interface CustomLinkProps {
  href?: string;
  children: React.ReactNode | React.ReactNode[];
}

interface MarkdownProps {
  children: string;
  smallFont?: boolean;
  maxHeight?: number;
  collapse?: boolean;
}

const customComponents = (smallFont) => ({
  a: ({ href, children }: CustomLinkProps) => {
    if (!href) return null;
    return <ChakraNextLink href={href}>{children}</ChakraNextLink>;
  },
  p: ({ node, ...props }) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Text mb={2} fontSize={smallFont ? 'sm' : 'md'} {...props} />
  ),
});

const Markdown = ({
  children,
  smallFont,
  maxHeight = 100,
  collapse = false,
}: MarkdownProps) => {
  const [showMore, setShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentHeight = contentRef.current?.clientHeight || 0;
    setIsOverflowing(contentHeight > maxHeight);
  }, [children, maxHeight]);

  if (!collapse)
    return (
      <ReactMarkdown components={ChakraUIRenderer(customComponents(smallFont))}>
        {children}
      </ReactMarkdown>
    );

  return (
    <Stack>
      <Box
        ref={containerRef}
        sx={{
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          maxHeight: showMore
            ? `${contentRef.current?.clientHeight}px`
            : `${maxHeight}px`,
        }}
      >
        <Box ref={contentRef}>
          <ReactMarkdown
            components={ChakraUIRenderer(customComponents(smallFont))}
          >
            {children}
          </ReactMarkdown>
        </Box>
      </Box>
      {isOverflowing && (
        <Center>
          <Button
            size='xs'
            onClick={() => setShowMore(!showMore)}
            variant='link'
            fontWeight='normal'
          >
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
        </Center>
      )}
    </Stack>
  );
};

export default Markdown;
