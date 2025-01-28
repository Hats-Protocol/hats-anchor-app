'use client';

import { useSelectedHat } from 'contexts';
import { get, isEmpty, map, size } from 'lodash';
import { DetailsItem } from 'types';
import { Accordion } from 'ui';

import { ResponsibilitiesListCard } from './responsibilities-list-card';

const LOADING_RESPONSIBILITIES: DetailsItem[] = Array(3).fill({
  label: 'Loading...',
  description: 'Loading...',
});

// TODO need to handle case for automated integrations when using plaintext details

const ResponsibilitiesList = () => {
  const { selectedHatDetails, hatLoading } = useSelectedHat();
  const responsibilities = get(selectedHatDetails, 'responsibilities');
  const localResponsibilities = responsibilities || LOADING_RESPONSIBILITIES;

  if ((!hatLoading && isEmpty(responsibilities)) || !selectedHatDetails) {
    return null;
    // return (
    //   <Flex px={{ base: 0, md: 10 }} py={4}>
    //     <Heading
    //       size='md'
    //       mx={{ base: 4, md: 0 }}
    //       variant='medium'
    //     >
    //       No Responsibilities expected of Wearers
    //     </Heading>
    //   </Flex>
    // );
  }

  return (
    <Accordion type='multiple' className='px-0 md:px-16'>
      <div>
        <p className='text-md mx-4 md:mx-0'>
          {size(responsibilities)} {size(responsibilities) > 1 ? 'Responsibilities' : 'Responsibility'} expected of Hat
          Wearers
        </p>

        <div className='space-y-1'>
          {map(localResponsibilities, (responsibility: DetailsItem, index: number) => (
            <ResponsibilitiesListCard key={`${responsibility.label}-${index}`} responsibility={responsibility} />
          ))}
        </div>
      </div>
    </Accordion>
  );
};

export { ResponsibilitiesList };
