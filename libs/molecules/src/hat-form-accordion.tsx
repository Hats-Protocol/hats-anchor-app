'use client';

// TODO chakra
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
      <CollapsibleTrigger className='flex flex-col hover:cursor-pointer' onClick={handleToggle}>
        <div className='flex items-center'>
          <div className='flex items-center'>
            {isOpen ? <AiOutlineMinusSquare className='h-5 w-5' /> : <AiOutlinePlusSquare className='h-5 w-5' />}
            <h2 className='text-lg font-medium text-slate-900'>{title}</h2>
          </div>
        </div>
        <div className='flex flex-col'>{subtitle && <p className='ml-7 text-sm text-slate-500'>{subtitle}</p>}</div>
      </CollapsibleTrigger>

      {!isOpen && dirtyFieldsList && dirtyFieldsList.length > 0 && (
        <div className='font-sm ml-7 mt-2 text-cyan-900'>
          <p className='text-medium'>Edits:</p>
          {dirtyFieldsList?.map((field) => <p key={field}>- {field} changed</p>)}
        </div>
      )}

      <CollapsibleContent>
        <div className='mr-0 mt-8 pb-0 pl-7 pr-0'>{children}</div>
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
