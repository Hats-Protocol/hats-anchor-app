'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { find, get, keys, map } from 'lodash';
import { InlineHatCard } from 'molecules';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';
import { Tooltip } from 'ui';

const STAKING_ROLES: { [key: string]: ModuleDetailRole } = {
  judge: {
    param: 'Judge Hat (Can Slash Wearers)', // param.label
    label: 'Arbitrates stakers completion of terms',
    tooltip: 'The hat that can slash stakers that have not completed their terms',
  },
  recipient: {
    param: 'Recipient Hat (Can Withdraw Slashed Stakes)', // param.label
    label: 'Receives slashed stakes',
    tooltip: 'The hat that receives the slashed stakes',
  },
};

// const STAKING_PARAMS = {
//   minimumStake: {
//     param: 'Minimum Stake', // param.label
//     label: 'Minimum Stake',
//     tooltip: 'The minimum amount of tokens that must be staked to claim the Hat',
//   },
//   token: {
//     param: 'Token', // param.label
//     label: 'Token',
//     tooltip: 'The token that can be staked',
//   },
//   coolDownPeriod: {
//     param: 'Cool Down Period', // param.label
//     label: 'Cool Down Period',
//     tooltip: 'The period after which a staker can withdraw their stake',
//   },
// };

// TODO fetch token data and handle params
// TODO [2.9] handle indexed stakers

export const StakingEligibilityDetails = (moduleInfo: ModuleDetails, chainId: SupportedChains) => {
  const params = get(moduleInfo, 'liveParameters');
  if (!params) return undefined;

  return (
    <div className='flex flex-col gap-2'>
      {map(keys(STAKING_ROLES), (role: string) => {
        const value = get(find(params, { label: STAKING_ROLES[role].param }), 'value') as bigint;

        if (!value) return null;

        return (
          <div className='flex justify-between' key={role}>
            <div className='flex items-center gap-2'>
              <div>{STAKING_ROLES[role].label}</div>

              <Tooltip label={STAKING_ROLES[role].tooltip}>
                <span className='relative'>
                  <BsInfoCircle className='absolute h-4 w-5' />
                </span>
              </Tooltip>
            </div>

            <InlineHatCard hatId={hatIdDecimalToHex(value)} chainId={chainId} />
          </div>
        );
      })}
    </div>
  );
};
