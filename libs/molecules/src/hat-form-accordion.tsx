'use client';

import { isEmpty } from 'lodash';
import posthog from 'posthog-js';
import React, { useState } from 'react';
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from 'react-icons/ai';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'ui';

const HatFormAccordion = ({ title, subtitle, dirtyFieldsList, open = false, children }: HatFormAccordionProps) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleToggle = () => {
    posthog.capture('Toggled Hat Form', {
      title,
      dirty_fields: dirtyFieldsList,
      is_open: !isOpen,
    });
    setIsOpen(!isOpen);
  };

  return (
    <Collapsible className='flex w-full flex-col' open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className='flex flex-col gap-2 hover:cursor-pointer' onClick={handleToggle}>
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            {isOpen ? <AiOutlineMinusSquare className='size-5' /> : <AiOutlinePlusSquare className='size-5' />}
            <h2 className='text-xl font-medium text-slate-900'>{title}</h2>
          </div>
        </div>
        <div className='flex'>{subtitle && <p className='ml-7 text-sm text-slate-500'>{subtitle}</p>}</div>
      </CollapsibleTrigger>

      {!isOpen && !isEmpty(dirtyFieldsList) && (
        <div className='ml-7 mt-2 text-sm text-cyan-600'>
          <p className='text-medium'>Edits:</p>
          {dirtyFieldsList?.map((field) => <p key={field}>- {field} changed</p>)}
        </div>
      )}

      <CollapsibleContent>
        <div className=''>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
};

interface HatFormAccordionProps {
  title: string;
  subtitle?: string;
  dirtyFieldsList?: string[];
  open?: boolean;
  children: React.ReactNode;
}

export { HatFormAccordion, type HatFormAccordionProps };
