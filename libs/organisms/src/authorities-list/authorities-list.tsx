'use client';

import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { combineAuthorities } from 'hats-utils';
import { useHatSnapshotRoles } from 'hooks';
import { get, isEmpty, map, size } from 'lodash';
import { useAncillaryModules } from 'modules-hooks';
import { useState } from 'react';
import { Authority, AuthorityType } from 'types';
import { Accordion, Skeleton } from 'ui';

import { AuthoritiesListCard } from './authorities-list-card';

const LOADING_COUNT = 2;
const LOADING_AUTHORITIES: Authority[] = Array(LOADING_COUNT).fill({
  label: 'Loading...',
  info: 'Loading...',
  type: AUTHORITY_TYPES.manual,
});

// TODO need to handle case for automated integrations when using plaintext details

const AuthoritiesList = () => {
  const { orgChartTree, snapshotData } = useTreeForm();
  const { chainId, selectedHat, selectedHatDetails, hatLoading } = useSelectedHat();
  const [openCards, setOpenCards] = useState<string[]>([]);

  const { modulesAuthorities, isLoading: ancillaryModulesLoading } = useAncillaryModules({
    id: selectedHat?.id,
    chainId,
    editMode: false,
    tree: orgChartTree,
  });

  // const { data: guildRoles, isLoading: guildsLoading } = useHatGuildRoles({
  //   hatId: selectedHat?.id,
  //   guildData,
  //   chainId,
  // });
  const { data: spaces, isLoading: spacesLoading } = useHatSnapshotRoles({
    spaces: snapshotData,
    hatId: selectedHat?.id,
    chainId,
  });
  const { data: combinedAuthorities } = combineAuthorities({
    authorities: get(selectedHatDetails, 'authorities'),
    guildRoles: [],
    spaces,
    modulesAuthorities: ancillaryModulesLoading ? undefined : modulesAuthorities,
  });
  const localAuthorities =
    !hatLoading && !ancillaryModulesLoading && !spacesLoading ? combinedAuthorities : LOADING_AUTHORITIES;
  const allLoaded = !hatLoading && !ancillaryModulesLoading && !spacesLoading;

  if ((allLoaded && isEmpty(combinedAuthorities)) || !selectedHatDetails) {
    return null;
    // return (
    //   <Flex px={{ base: 4, md: 10 }}>
    //     <Heading variant='medium' size='md'>
    //       No Authorities granted to Wearers
    //     </Heading>
    //   </Flex>
    // );
  }

  if (!allLoaded) {
    return (
      <div className='space-y-4 md:px-16'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
      </div>
    );
  }

  return (
    <Accordion className='px-0 md:px-16' type='multiple' value={openCards} onValueChange={setOpenCards}>
      <div className='space-y-2'>
        <h2 className='mx-4 font-medium md:mx-0'>
          {size(combinedAuthorities)} {size(combinedAuthorities) === 1 ? 'Authority' : 'Authorities'} granted by this
          Hat
        </h2>

        <div className='space-y-1'>
          {map(localAuthorities, (authority: Authority, index: number) => (
            <AuthoritiesListCard
              index={index}
              key={`${authority.label}-${index}`}
              openCards={openCards}
              authority={authority}
              type={authority.type as AuthorityType}
            />
          ))}
        </div>
      </div>
    </Accordion>
  );
};

export { AuthoritiesList };
