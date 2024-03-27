import { Accordion, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useSelectedHat, useTreeForm } from 'contexts';
import { useAncillaryModules } from 'hats-hooks';
import { combineAuthorities } from 'hats-utils';
import { useHatGuildRoles, useHatSnapshotRoles } from 'hooks';
import _ from 'lodash';
import { Authority, AuthorityType } from 'types';

import AuthoritiesListCard from './AuthoritiesListCard';

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
  const { data: guildRoles } = useHatGuildRoles({
    hatId: selectedHat?.id,
    guildData,
    chainId,
  });
  const { data: spaces } = useHatSnapshotRoles({
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

  if (
    !hatLoading &&
    ancillaryModulesLoading &&
    _.isEmpty(combinedAuthorities)
  ) {
    return (
      <Flex px={{ base: 4, md: 10 }}>
        <Heading size={{ base: 'sm', md: 'md' }} variant='medium'>
          No Authorities granted to Wearers
        </Heading>
      </Flex>
    );
  }

  return (
    <Accordion px={{ base: 0, md: 10 }} allowMultiple>
      <Stack>
        <Heading
          size={{ base: 'sm', md: 'md' }}
          mx={{ base: 4, md: 0 }}
          variant={{ base: 'medium', md: 'default' }}
        >
          {_.size(combinedAuthorities)}{' '}
          {_.size(combinedAuthorities) > 1 ? 'Authorities' : 'Authority'}{' '}
          granted by this Hat
        </Heading>

        <Stack spacing={1}>
          {_.map(combinedAuthorities, (authority: Authority, index: number) => (
            <AuthoritiesListCard
              index={index}
              key={authority.label}
              authority={authority}
              type={authority.type as AuthorityType}
            />
          ))}
        </Stack>
        {_.isEmpty(combinedAuthorities) && (
          <Text variant='gray' size='sm'>
            None
          </Text>
        )}
      </Stack>
    </Accordion>
  );
};

export default AuthoritiesList;
