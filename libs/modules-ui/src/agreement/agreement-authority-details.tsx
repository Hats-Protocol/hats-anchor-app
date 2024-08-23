'use client';

import { Box, Icon, Tooltip } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { find, get, keys, map } from 'lodash';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { BsInfoCircle } from 'react-icons/bs';
import { ModuleDetailRole, ModuleDetails, SupportedChains } from 'types';
import { ipfsUrl } from 'utils';

const InlineHatCard = dynamic(() =>
  import('molecules').then((mod) => mod.InlineHatCard),
);

const AGREEMENT_ROLES: { [key: string]: ModuleDetailRole } = {
  owner: {
    param: 'Owner Hat', // param.label
    label: 'Agreement Admin',
    tooltip: 'The hat that can update the agreement',
  },
  arbitrator: {
    param: 'Arbitrator Hat', // param.label
    label: 'Agreement Arbitrator',
    tooltip:
      'The hat that can remove folks that have not adhered to the agreement',
  },
};

// TODO figure out how to get the agreement text
// TODO [2.9] handle indexed signers

export const AgreementEligibilityDetails = (
  moduleInfo: ModuleDetails,
  chainId: SupportedChains,
) => {
  const params = get(moduleInfo, 'liveParameters');

  const agreementTextUri = get(
    find(params, { label: 'Current Agreement' }),
    'value',
  ) as string;
  // const { data: agreementText } = useIpfsData(agreementTextUri);
  // console.log(agreementText);
  const truncatedHash = agreementTextUri.slice(0, 20) + '...';

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
