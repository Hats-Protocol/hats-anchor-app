'use client';

import { useTreeForm } from 'contexts';
import { includes } from 'lodash';
import { useState } from 'react';
import { cn, ScrollArea } from 'ui';

import { BottomMenu } from './bottom-menu';
import { MainContent } from './main-content';
import { TopMenu } from './top-menu';

const TreeDrawer = () => {
  const [accordionIndex, setAccordionIndex] = useState<string[]>([]);
  const isExpanded = includes(accordionIndex, 'bottom-menu');
  const { editMode } = useTreeForm();

  return (
    <div
      className={cn(
        'fixed right-0 z-[12] h-full w-full border-l border-gray-200',
        editMode ? 'bg-cyan-50' : 'bg-gray-200',
      )}
    >
      <TopMenu />

      <ScrollArea className='h-[calc(100vh-125px)]'>
        <MainContent isExpanded={isExpanded} />
      </ScrollArea>

      <BottomMenu isExpanded={isExpanded} setAccordionIndex={setAccordionIndex} />
    </div>
  );
};

export { TreeDrawer };
