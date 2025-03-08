'use client';

import { HatsEvent } from '@hatsprotocol/sdk-v1-subgraph';
import { useSelectedHat, useTreeForm } from 'contexts';
import { formatDistanceToNow } from 'date-fns';
import { useMediaStyles } from 'hooks';
import { Etherscan } from 'icons';
import { first, get, last, map, take } from 'lodash';
import { useState } from 'react';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { Button, LinkButton } from 'ui';
import { explorerUrl, parseEventName } from 'utils';

const EventHistory = ({ type, count }: { type: 'tree' | 'hat'; count?: number }) => {
  const { chainId, treeEvents } = useTreeForm();
  const { selectedHat } = useSelectedHat();
  const { isClient } = useMediaStyles();
  const [isOpen, setIsOpen] = useState(false);

  let events = type === 'tree' ? treeEvents : selectedHat?.events;
  if (count) {
    events = take(events, count);
  }

  if (!events || !isClient) {
    return null;
  }

  const shouldCollapse = events.length > 5 && type === 'hat';
  let displayedEvents = events;
  let lastEvent = last(events);
  if (shouldCollapse) {
    if (!isOpen) {
      displayedEvents = take(events, 4);
    } else {
      lastEvent = undefined;
    }
  }

  return (
    <div>
      {map(displayedEvents, (event: HatsEvent) => (
        <Event key={`${event.transactionID}-${event.id}`} event={event} chainId={chainId} />
      ))}

      {shouldCollapse && !isOpen && (
        <div className='flex w-10 justify-center'>
          <IoEllipsisVerticalSharp className='h-4 w-4' />
        </div>
      )}

      {shouldCollapse && lastEvent && !isOpen && <Event event={lastEvent} chainId={chainId} />}

      {shouldCollapse && (
        <Button onClick={() => setIsOpen(!isOpen)} size='sm' variant='outline'>
          {isOpen ? 'Show Less' : `Show All (${events.length - 1})`}
        </Button>
      )}
    </div>
  );
};

const Event = ({ event, chainId }: { event: HatsEvent; chainId?: number }) => {
  const eventName = first(get(event, 'id')?.split('-'));

  if (!eventName) return null;
  const eventDisplayName = parseEventName(eventName);

  return (
    <div className='flex items-center justify-between py-2 text-base' key={`${event.transactionID}-${event.id}`}>
      <p className='text-slate-800'>{eventDisplayName}</p>

      <LinkButton
        href={`${chainId && explorerUrl(chainId)}/tx/${event.transactionID}`}
        variant='link'
        className='block'
        textClassName='text-base font-light'
        isExternal
        rightIcon={<Etherscan className='size-4' />}
      >
        {`${formatDistanceToNow(new Date(Number(event.timestamp) * 1000))} ago`}
      </LinkButton>
    </div>
  );
};

export { EventHistory };
