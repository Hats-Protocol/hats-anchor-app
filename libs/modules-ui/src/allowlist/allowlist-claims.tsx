'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, includes, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { LabeledModules, ModuleDetails } from 'types';
import { Card, Link, MemberAvatar, Skeleton } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { useAccount } from 'wagmi';

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
    subheading: 'Contact the Council Managers to be selected',
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

export const AllowlistClaims = ({
  activeModule,
  labeledModules,
}: {
  activeModule: ModuleDetails;
  labeledModules: LabeledModules | undefined;
}) => {
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

  if (activeModule.instanceAddress === labeledModules?.selection) {
    copy = ALLOWLIST_COPY.selection;
  } else if (activeModule.instanceAddress === labeledModules?.criteria) {
    copy = ALLOWLIST_COPY.compliance;
  }

  return (
    <div className='flex flex-col gap-4'>
      <Card className='flex min-h-[500px] flex-col border-[#2D3748] px-8 py-6'>
        <div className='flex justify-between'>
          <h3 className='text-2xl font-bold'>{copy.heading}</h3>

          {isInAllowlist ? (
            <div className='flex items-center gap-1'>
              <p className='text-functional-success'>{copy.allowed}</p>
              <BsCheckSquareFill className='text-functional-success h-4 w-4' />
            </div>
          ) : (
            <div className='flex items-center gap-1'>
              <p className='text-destructive'>{copy.notAllowed}</p>
              <BsFillXOctagonFill className='text-destructive h-4 w-4' />
            </div>
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
      </Card>

      {isDev && (
        <div className='max-w-[300px]'>
          <DevInfo devInfos={devInfo} />
        </div>
      )}
    </div>
  );
};
