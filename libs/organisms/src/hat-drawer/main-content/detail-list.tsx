'use client';

import { ReactNode } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { DetailsItem } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, cn, Link } from 'ui';
import { validateURL } from 'utils';

const AccordionWrap = ({
  title,
  children,
  inline = false,
}: {
  title?: string;
  children: ReactNode;
  inline?: boolean;
}) => {
  if (!title) return children; // check this? idk when it wouldn't have a title

  return (
    <Accordion type='single' className='px-4 md:px-10'>
      <AccordionItem value={title}>
        <AccordionTrigger className={cn(inline ? 'px-0' : undefined)}>
          <h3 className={cn('text-sm font-medium uppercase')}>{title || 'Qualifications'}</h3>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const DetailList = ({
  title,
  details,
  inline = false,
}: {
  title: string;
  details?: DetailsItem[];
  inline?: boolean;
}) => {
  const toggleOrEligibility = title === 'Eligibility Criteria' || title === 'Toggle Criteria';

  const renderDetails = () => (
    <div className='flex flex-col gap-2'>
      {!toggleOrEligibility && <h3 className={cn('text-sm font-medium uppercase')}>{title}</h3>}
      <ul>
        {details?.length ? (
          details.map(({ label, link }: DetailsItem) => (
            <li key={label}>
              <div className='flex justify-between'>
                {link && validateURL(link) ? (
                  <Link isExternal href={link}>
                    <p className='text-sm'>{label}</p>
                  </Link>
                ) : (
                  <p className='text-sm'>{label}</p>
                )}
                {link && validateURL(link) && (
                  <Link href={link} className='block' isExternal>
                    <FaExternalLinkAlt className='h-4 w-4 text-blue-500' />
                  </Link>
                )}
              </div>
            </li>
          ))
        ) : (
          <li>None</li>
        )}
      </ul>
    </div>
  );

  // TODO stable component render
  return toggleOrEligibility ? (
    <AccordionWrap title={title} inline={inline}>
      {renderDetails()}
    </AccordionWrap>
  ) : (
    renderDetails()
  );
};

export { DetailList };
