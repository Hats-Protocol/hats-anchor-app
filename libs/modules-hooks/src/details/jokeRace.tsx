import { find, get, keys, map } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';

import { InlineHatCard } from '../components';

export const JokeRaceEligibilityDetails = (
  moduleInfo: ModuleDetails,
  chainId: SupportedChains,
) => {
  const params = get(moduleInfo, 'liveParameters');
  console.log({ moduleInfo, params });
  if (!params) return undefined;
  const value = '';

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between'>
        <div>Owner</div>
        {/* <InlineHatCard hatId={value} chainId={chainId} /> */}
      </div>
    </div>
  );
};
