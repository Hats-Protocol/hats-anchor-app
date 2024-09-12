'use client';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
} from '@chakra-ui/react';
// import { HatDetailsChangedEvent } from '@hatsprotocol/sdk-v1-subgraph/dist/types';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useIpfsData } from 'hooks';
import { filter, get, has, map, toNumber } from 'lodash';
import Link from 'next/link';
import { Card, CardContent, Skeleton } from 'ui';
import { explorerUrl, formatDate } from 'utils';
const HatDetailsCard = ({ event }: { event: any }) => {
  const { chainId } = useTreeForm();
  const { data: fullDetails, isLoading } = useIpfsData(event.hatNewDetails);
  const details = get(fullDetails, 'data.data');

  const formattedDate = formatDate(toNumber(event.timestamp) * 1000);

  if (isLoading) {
    return <Skeleton className='h-10 w-full' />;
  }

  console.log(details);
  if (!details || !event.hatNewDetails) {
    return null;
  }

  return (
    <Card className='my-4'>
      <div className='pt-6' />
      <CardContent>
        <AccordionItem borderTop='none' borderBottom='none'>
          <AccordionButton>
            <div className='flex justify-between w-full'>
              <div className='flex gap-2 items-center'>
                <h2 className='font-mono font-medium bg-slate-600 text-white px-2 rounded-md'>
                  {event.hatNewDetails.slice(7, 10)}...
                  {event.hatNewDetails.slice(-10)}
                </h2>
                on
                <p className='text-sm text-slate-500'>{formattedDate}</p>
              </div>
              <AccordionIcon />
            </div>
          </AccordionButton>
          <AccordionPanel>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-4'>
                <Link
                  href={`https://ipfs.io/ipfs/${event.hatNewDetails.slice(7)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Button variant='outline' size='sm'>
                    View on IPFS
                  </Button>
                </Link>

                <Link
                  href={`${explorerUrl(chainId)}/tx/${event.transactionID}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Button variant='outline' size='sm'>
                    View Transaction
                  </Button>
                </Link>
              </div>

              <div className='bg-slate-700 text-white overflow-scroll px-2 max-h-[500px]'>
                <pre>{JSON.stringify(details, null, 2)}</pre>
              </div>
            </div>
          </AccordionPanel>
        </AccordionItem>
      </CardContent>
    </Card>
  );
};

const HatDetailsChanges = () => {
  const { selectedHat, selectedHatDetails } = useSelectedHat();
  const detailsChangesEvents = filter(get(selectedHat, 'events'), (event) =>
    has(event, 'hatNewDetails'),
  );

  console.log(detailsChangesEvents);

  return (
    <div className='flex flex-col justify-center gap-4 pt-32 w-[60%] mx-auto'>
      <h1 className='text-2xl font-bold'>
        {selectedHatDetails?.name} Details Changes
      </h1>

      <Accordion allowMultiple>
        {map(detailsChangesEvents, (event) => (
          <HatDetailsCard key={event.id} event={event} />
        ))}
      </Accordion>
    </div>
  );
};

export default HatDetailsChanges;
