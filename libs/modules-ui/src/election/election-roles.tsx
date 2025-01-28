'use client';

import { CONFIG } from '@hatsprotocol/config';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { get } from 'lodash';
import { useAncillaryElection } from 'modules-hooks';
import { idToIp } from 'shared';
import { SupportedChains } from 'types';
import { Link } from 'ui';
import { eligibilityRuleToModuleDetails } from 'utils';

export const ElectionRoles = () => {
  const { selectedHat, activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const { data: electionsAuthority } = useAncillaryElection({
    chainId: selectedHat?.chainId as SupportedChains,
    id: moduleDetails?.instanceAddress,
  });

  const chainId = selectedHat?.chainId;
  const treeId = selectedHat ? hatIdToTreeId(BigInt(selectedHat?.id)) : undefined;
  const adminHatId = idToIp(get(electionsAuthority, 'adminHat[0].id'));
  const ballotBoxHatId = idToIp(get(electionsAuthority, 'ballotBoxHat.id'));

  return (
    <div className='space-y-4'>
      <h3 className='text-md'>Election Roles</h3>
      <div className='text-sm'>
        {adminHatId && (
          <p>
            Set up by Hat{' '}
            <Link
              href={`${CONFIG.APP_URL}/trees/${chainId}/${treeId}${adminHatId ? `?hatId=${adminHatId}` : ''}`}
              className='underline'
            >
              #{adminHatId}
            </Link>
          </p>
        )}
        {ballotBoxHatId && (
          <p>
            Results submitted by{' '}
            <Link
              href={`${CONFIG.APP_URL}/${chainId}/${treeId}${ballotBoxHatId ? `?hatId=${ballotBoxHatId}` : ''}`}
              className='underline'
            >
              #{ballotBoxHatId}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
