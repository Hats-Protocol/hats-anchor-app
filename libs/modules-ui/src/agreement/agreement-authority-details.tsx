'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { find, get, keys, map } from 'lodash';
import { InlineHatCard } from 'molecules';
import Link from 'next/link';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';
import { Tooltip } from 'ui';
import { ipfsUrl } from 'utils';

const AGREEMENT_ROLES: { [key: string]: ModuleDetailRole } = {
  owner: {
    param: 'Owner Hat', // param.label
    label: 'Agreement Admin',
    tooltip: 'The hat that can update the agreement',
  },
  arbitrator: {
    param: 'Arbitrator Hat', // param.label
    label: 'Agreement Arbitrator',
    tooltip: 'The hat that can remove folks that have not adhered to the agreement',
  },
};

// TODO figure out how to get the agreement text
// TODO [2.9] handle indexed signers

export const AgreementEligibilityDetails = (moduleInfo: ModuleDetails, chainId: SupportedChains) => {
  const params = get(moduleInfo, 'liveParameters');

  const agreementTextUri = get(find(params, { label: 'Current Agreement' }), 'value') as string;
  // const { data: agreementText } = useIpfsData(agreementTextUri);
  // console.log(agreementText);
  const truncatedHash = agreementTextUri.slice(0, 20) + '...';

  if (!params) return undefined;

  return (
    <div className='flex flex-col gap-2'>
      {map(keys(AGREEMENT_ROLES), (role: string) => {
        const value = get(find(params, { label: AGREEMENT_ROLES[role].param }), 'value') as bigint;
        return (
          <div className='flex justify-between' key={role}>
            <div className='flex items-center gap-2'>
              <div>{AGREEMENT_ROLES[role].label}</div>

              <Tooltip label={AGREEMENT_ROLES[role].tooltip}>
                <span className='relative'>
                  <BsInfoCircle className='absolute h-4 w-4' />
                </span>
              </Tooltip>
            </div>

            <InlineHatCard hatId={hatIdDecimalToHex(value)} chainId={chainId} />
          </div>
        );
      })}

      <div className='flex justify-between'>
        <div>Agreement Link</div>

        <Link href={ipfsUrl(agreementTextUri, true)}>{truncatedHash}</Link>
      </div>
    </div>
  );
};
