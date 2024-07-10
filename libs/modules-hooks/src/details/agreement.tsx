import { Box, Icon, Tooltip } from '@chakra-ui/react';
import { find, get, keys, map } from 'lodash';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';

import { InlineHatCard } from '../components';

const AGREEMENT_ROLES: { [key: string]: ModuleDetailRole } = {
  owner: {
    param: 'Owner Hat',
    label: 'Agreement Admin',
    tooltip: 'The hat that can update the agreement',
  },
  arbitrator: {
    param: 'Arbitrator Hat',
    label: 'Agreement Arbitrator',
    tooltip: 'The hat that can resolve disputes',
  },
};

export const AgreementEligibilityDetails = (
  moduleInfo: ModuleDetails,
  chainId: SupportedChains,
) => {
  const params = get(moduleInfo, 'liveParameters');
  if (!params) return undefined;

  return (
    <div className='flex flex-col gap-2'>
      {map(keys(AGREEMENT_ROLES), (role: string) => {
        const value = get(
          find(params, { label: AGREEMENT_ROLES[role].param }),
          'value',
        ) as bigint;
        return (
          <div className='flex justify-between' key={role}>
            <div className='flex gap-2 items-center'>
              <div>{AGREEMENT_ROLES[role].label}</div>

              <Tooltip label={AGREEMENT_ROLES[role].tooltip} placement='top'>
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
