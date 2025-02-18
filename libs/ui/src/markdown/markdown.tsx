'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '../button';

export interface MarkdownProps {
  /** The markdown content to render */
  children: string;
  /** Whether to use a smaller font size */
  smallFont?: boolean;
  /** Maximum height before collapsing content */
  maxHeight?: number;
  /** Whether to enable content collapsing */
  collapse?: boolean;
}

// TODO [med] handle formatting for links and paragraphs in small contexts (`smallFont`)

const Markdown = ({ children, smallFont, maxHeight = 100, collapse = false }: MarkdownProps) => {
  const [showMore, setShowMore] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentHeight = contentRef.current?.clientHeight || 0;
    setIsOverflowing(contentHeight > maxHeight);
  }, [children, maxHeight]);

  if (!collapse) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} className='prose'>
        {children}
      </ReactMarkdown>
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      <div
        ref={containerRef}
        className='transition-max-height overflow-hidden duration-300'
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          maxHeight: showMore ? `${contentRef.current?.clientHeight}px` : `${maxHeight}px`,
        }}
      >
        <div ref={contentRef}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className='prose'>
            {children}
          </ReactMarkdown>
        </div>
      </div>
      {isOverflowing && (
        <div className='flex justify-center'>
          <Button size='sm' onClick={() => setShowMore(!showMore)} variant='link'>
            {showMore ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      )}
    </div>
  );
};

export { Markdown };
