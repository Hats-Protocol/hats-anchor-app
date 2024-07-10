import { Box, Icon, Tooltip } from '@chakra-ui/react';
import { find, get, keys, map } from 'lodash';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';

import { InlineHatCard } from '../components';

const ALLOWLIST_ROLES: { [key: string]: ModuleDetailRole } = {
  owner: {
    param: 'Owner Hat',
    label: 'Allowlist Author',
    tooltip: 'The hat that can add or remove addresses from the allowlist',
  },
  arbitrator: {
    param: 'Arbitrator Hat',
    label: 'Allowlist Arbitrator',
    tooltip: 'The hat that can remove addresses from the allowlist',
  },
};

export const AllowlistEligibilityDetails = (
  moduleInfo: ModuleDetails,
  chainId: SupportedChains,
) => {
  const params = get(moduleInfo, 'liveParameters');
  if (!params) return undefined;

  return (
    <div className='flex flex-col gap-2'>
      {map(keys(ALLOWLIST_ROLES), (role: string) => {
        const value = get(
          find(params, { label: ALLOWLIST_ROLES[role].param }),
          'value',
        ) as bigint;
        return (
          <div className='flex justify-between' key={role}>
            <div className='flex gap-2 items-center'>
              <div>{ALLOWLIST_ROLES[role].label}</div>

              <Tooltip label={ALLOWLIST_ROLES[role].tooltip} placement='top'>
                <Box as='span' boxSize={4} position='relative'>
                  <Icon as={BsInfoCircle} position='absolute' />
                </Box>
              </Tooltip>
            </div>

            <InlineHatCard hatId={value} chainId={chainId} />
          </div>
        );
      })}
    </div>
  );
};
