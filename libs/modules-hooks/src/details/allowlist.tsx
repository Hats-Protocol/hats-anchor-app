import { find, get, keys, map } from 'lodash';
import { ModuleDetails } from 'types';

import { InlineHatCard } from '../components';

interface ModuleDetailRole {
  param: string;
  label: string;
  tooltip: string;
}

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

export const AllowlistEligibilityDetails = (moduleInfo: ModuleDetails) => {
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
            <div>{ALLOWLIST_ROLES[role].label}</div>
            <InlineHatCard hatId={value} />
          </div>
        );
      })}
      {/* TODO add allowlist counts */}
    </div>
  );
};
