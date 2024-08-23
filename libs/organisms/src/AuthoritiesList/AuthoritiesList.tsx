'use client';

import { Accordion, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { combineAuthorities } from 'hats-utils';
import { useHatGuildRoles, useHatSnapshotRoles } from 'hooks';
import { get, isEmpty, map, size } from 'lodash';
import { useAncillaryModules } from 'modules-hooks';
import { Authority, AuthorityType } from 'types';

import AuthoritiesListCard from './AuthoritiesListCard';

const LOADING_COUNT = 2;
const LOADING_AUTHORITIES: Authority[] = Array(LOADING_COUNT).fill({
  label: 'Loading...',
  info: 'Loading...',
  type: AUTHORITY_TYPES.manual,
});

// TODO need to handle case for automated integrations when using plaintext details

const AuthoritiesList = () => {
  const { orgChartTree, guildData, snapshotData } = useTreeForm();
  const { chainId, selectedHat, selectedHatDetails, hatLoading } =
    useSelectedHat();

  const { modulesAuthorities, isLoading: ancillaryModulesLoading } =
    useAncillaryModules({
      id: selectedHat?.id,
      chainId,
      editMode: false,
      tree: orgChartTree,
    });

  const { data: guildRoles, isLoading: guildsLoading } = useHatGuildRoles({
    hatId: selectedHat?.id,
    guildData,
    chainId,
  });
  const { data: spaces, isLoading: spacesLoading } = useHatSnapshotRoles({
    spaces: snapshotData,
    hatId: selectedHat?.id,
    chainId,
  });
  const { data: combinedAuthorities } = combineAuthorities({
    authorities: get(selectedHatDetails, 'authorities'),
    guildRoles,
    spaces,
    modulesAuthorities: ancillaryModulesLoading
      ? undefined
      : modulesAuthorities,
  });
  const localAuthorities =
    !hatLoading && !ancillaryModulesLoading && !guildsLoading && !spacesLoading
      ? combinedAuthorities
      : LOADING_AUTHORITIES;
  const allLoaded =
    !hatLoading && !ancillaryModulesLoading && !guildsLoading && !spacesLoading;

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

  return (
    <Accordion px={{ base: 0, md: 16 }} allowMultiple>
      <Stack>
        <Skeleton isLoaded={allLoaded}>
          <Heading
            size='md'
            mx={{ base: 4, md: 0 }}
            variant={{ base: 'medium', md: 'default' }}
          >
            {size(combinedAuthorities)}{' '}
            {size(combinedAuthorities) === 1 ? 'Authority' : 'Authorities'}{' '}
            granted by this Hat
          </Heading>
        </Skeleton>

        <Stack spacing={allLoaded && !isEmpty(localAuthorities) ? 1 : 2}>
          {map(localAuthorities, (authority: Authority, index: number) => (
            <AuthoritiesListCard
              index={index}
              key={`${authority.label}-${index}`}
              authority={authority}
              type={authority.type as AuthorityType}
            />
          ))}
        </Stack>
      </Stack>
    </Accordion>
  );
};

export default AuthoritiesList;
