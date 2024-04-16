import { Accordion, Heading, Skeleton, Stack } from '@chakra-ui/react';
import { AUTHORITY_TYPES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useAncillaryModules } from 'hats-hooks';
import { combineAuthorities } from 'hats-utils';
import { useHatGuildRoles, useHatSnapshotRoles } from 'hooks';
import _ from 'lodash';
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
    authorities: _.get(selectedHatDetails, 'authorities'),
    guildRoles,
    spaces,
    modulesAuthorities,
  });
  const localAuthorities =
    !hatLoading && !ancillaryModulesLoading && !guildsLoading && !spacesLoading
      ? combinedAuthorities
      : LOADING_AUTHORITIES;

  if (
    (!hatLoading &&
      !ancillaryModulesLoading &&
      !guildsLoading &&
      !spacesLoading &&
      _.isEmpty(combinedAuthorities)) ||
    !selectedHatDetails
  ) {
    return null;
    // return (
    //   <Flex px={{ base: 4, md: 10 }}>
    //     <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
    //       No Authorities granted to Wearers
    //     </Heading>
    //   </Flex>
    // );
  }

  return (
    <Accordion px={{ base: 0, md: 16 }} allowMultiple>
      <Stack>
        <Skeleton
          isLoaded={
            !hatLoading &&
            !ancillaryModulesLoading &&
            !guildsLoading &&
            !spacesLoading
          }
        >
          <Heading
            size={{ base: 'sm', md: 'md' }}
            mx={{ base: 4, md: 0 }}
            variant={{ base: 'medium', md: 'default' }}
          >
            {_.size(combinedAuthorities)}{' '}
            {_.size(combinedAuthorities) === 1 ? 'Authority' : 'Authorities'}{' '}
            granted by this Hat
          </Heading>
        </Skeleton>

        <Stack spacing={!_.isEmpty(combinedAuthorities) ? 1 : 2}>
          {_.map(localAuthorities, (authority: Authority, index: number) => (
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
