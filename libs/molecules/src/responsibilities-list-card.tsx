'use client';

import { useMediaStyles } from 'hooks';
import { pick } from 'lodash';
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import { useEffect, useRef, useState } from 'react';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { DetailsItem } from 'types';
import { AccordionContent, AccordionItem, AccordionTrigger, Button, cn, Link, Markdown, Tooltip } from 'ui';
import { getHostnameFromURL } from 'utils';

import { ResponsibilityHeader } from './responsibility-header';

const Collapse = dynamic(() => import('icons').then((mod) => mod.Collapse));

const ResponsibilitiesListCard = ({ responsibility }: { responsibility?: DetailsItem }) => {
  const { label, description, link, imageUrl } = pick(responsibility, ['label', 'description', 'link', 'imageUrl']);
  const { isMobile } = useMediaStyles();
  const hostname = getHostnameFromURL(link);
  const [expanded, setExpanded] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!link && !description) {
    return (
      <div className='flex px-4 py-2 md:px-0'>
        <ResponsibilityHeader label={label} link={link} imageUrl={imageUrl} />
      </div>
    );
  }

  const handleToggle = () => {
    posthog.capture('Toggled Responsibility', {
      label,
      description,
      link,
      image_url: imageUrl,
      is_open: expanded,
    });
    setExpanded(!expanded);
  };

  return (
    <AccordionItem
      value={`${label}-${link}`}
      className={cn(
        'ml-[-16px] w-full border-none md:w-[calc(100%+32px)] md:rounded-md',
        expanded ? 'box-shadow-md' : undefined,
      )}
      onClick={handleToggle}
    >
      <AccordionTrigger
        className={cn(
          'relative rounded-none border-t border-none border-transparent hover:border-t-gray-100 hover:bg-white focus:border-transparent md:rounded-md',
          !expanded ? 'hover:border-blue-300' : 'hover:border-t-gray-100',
          expanded && 'rounded-none border-t-gray-100 bg-white pb-0 md:rounded-t-md',
        )}
      >
        <div className='flex-1 text-left'>
          <ResponsibilityHeader label={label} imageUrl={imageUrl} link={link} isExpanded={expanded} />
        </div>
        {/* {isMobile && <AccordionIcon mr={isExpanded ? 1 : 0} color='blackAlpha.600' />} */}
        {expanded && !isMobile && <Collapse className='absolute bottom-[-2px] right-4 h-4 w-4' />}
      </AccordionTrigger>
      <AccordionContent
        className={cn(
          'p-0',
          expanded ? 'shadow-expanded-accordion rounded-b-md border-b-2 border-b-gray-100 bg-white' : undefined,
        )}
      >
        <div className='flex flex-col gap-2 px-4'>
          {link && (
            <div>
              <Link href={link} isExternal>
                <Tooltip label={hostname}>
                  <Button
                    className='bg-blue-500'
                    onClick={() => {
                      posthog.capture('Clicked Responsibility Link', {
                        authority: label,
                        link,
                        label: hostname,
                      });
                    }}
                    size='sm'
                  >
                    <p className='size-sm'>{hostname}</p>
                    <BsBoxArrowUpRight className='ml-1 size-4' />
                  </Button>
                </Tooltip>
              </Link>
            </div>
          )}

          <div>
            {description && (
              <div>
                <Markdown>{description}</Markdown>
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export { ResponsibilitiesListCard };
