'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, includes, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { ModuleDetails } from 'types';
import { Button, Link, MemberAvatar, Skeleton } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { useAccount } from 'wagmi';

// TODO hardcode
const selectionModule = '0x8250a44405C4068430D3B3737721D47bB614E7D2';
const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const DevInfo = dynamic(() => import('molecules').then((mod) => mod.DevInfo));

const ALLOWLIST_COPY = {
  compliance: {
    heading: 'Pass Compliance Checks',
    subheading: "Contact the Compliance Manager to confirm you're compliant",
    admin: 'Compliance Manager',
    adminLabel: 'Conducts compliance checks on Council Members',
    allowed: 'Compliant',
    notAllowed: 'Not compliant',
  },
  selection: {
    heading: 'Be appointed to the council',
    subheading: 'Contact the Council Managers to be appointed',
    admin: 'Council Manager',
    adminLabel: 'Manages the council',
    allowed: 'Selected',
    notAllowed: 'Not selected',
  },
  allowlist: {
    heading: 'Be added to the allowlist',
    subheading: 'Contact the allowlist manager to be added',
    admin: 'Allowlist Manager',
    adminLabel: 'Manages the allowlist',
    allowed: 'Allowed',
    notAllowed: 'Not allowed',
  },
};

export const AllowlistClaims = ({ activeModule }: { activeModule: ModuleDetails }) => {
  const { chainId, isEligibilityRulesLoading } = useEligibility();
  const { data: allowlist, isLoading: isAllowlistLoading } = useAllowlist({
    id: activeModule.instanceAddress,
    chainId,
  });

  const ownerHatId = get(find(get(activeModule, 'liveParameters'), { label: 'Owner Hat' }), 'value') as
    | bigint
    | undefined;

  const { data: ownerHatDetails } = useHatDetails({
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
    chainId,
  });

  const { address } = useAccount();

  const devInfo = useMemo(() => {
    return [
      {
        label: 'Module Address',
        descriptor: (
          <Link href={`${explorerUrl(chainId)}/address/${activeModule.instanceAddress}`} isExternal>
            {formatAddress(activeModule.instanceAddress)}
          </Link>
        ),
      },
    ];
  }, [activeModule.instanceAddress, chainId]);

  const isInAllowlist = includes(map(allowlist, 'address'), toLower(address));
  const isDev = true;

  if (isEligibilityRulesLoading || isAllowlistLoading) {
    return <Skeleton className='h-[500px] w-full' />;
  }
  let copy = ALLOWLIST_COPY.allowlist;

  if (activeModule.instanceAddress === selectionModule) {
    copy = ALLOWLIST_COPY.selection;
  } else if (activeModule.instanceAddress === criteriaModule) {
    copy = ALLOWLIST_COPY.compliance;
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex min-h-[500px] items-center justify-between rounded-lg border border-gray-200 bg-white p-4'>
        <h3 className='text-2xl font-bold'>{copy.heading}</h3>

        {isInAllowlist ? (
          <div className='flex items-center gap-1'>
            <p className='text-green-500'>{copy.allowed}</p>
            <BsCheckSquareFill className='h-4 w-4 text-green-500' />
          </div>
        ) : (
          <Button variant='link'>
            <div className='flex items-center gap-1'>
              <p className='text-destructive'>{copy.notAllowed}</p>
              <BsFillXOctagonFill className='text-destructive h-4 w-4' />
            </div>
          </Button>
        )}
      </div>

      <div className='flex flex-col gap-4 pt-10'>
        <h4 className='text-xl font-bold'>{copy.subheading}</h4>

        <div className='flex flex-col gap-1'>
          <p className='font-bold'>{copy.admin}</p>

          <p className='text-sm'>{copy.adminLabel}</p>
        </div>

        {map(get(ownerHatDetails, 'wearers'), (wearer) => (
          <MemberAvatar member={wearer} key={wearer.id} />
        ))}
      </div>

      {isDev && (
        <div className='max-w-[300px]'>
          <DevInfo devInfos={devInfo} />
        </div>
      )}
    </div>
  );
};
