'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useEligibility } from 'contexts';
import { useAllWearers, useHatDetails } from 'hats-hooks';
import { filter, find, get, includes, isEmpty, map, toLower } from 'lodash';
import { useAllowlist } from 'modules-hooks';
import { DevInfo } from 'molecules';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { LabeledModules, ModuleDetails } from 'types';
import { Card, cn, Link, MemberAvatar, Skeleton } from 'ui';
import { explorerUrl, formatAddress } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const ALLOWLIST_COPY = {
  compliance: {
    heading: 'Pass Compliance Checks',
    subheading: "Contact the Compliance Manager to confirm you're compliant",
    allowedLabel: 'Compliant Members',
    allowedSublabel: 'Members who have passed compliance checks',
    admin: 'Compliance Manager',
    adminLabel: 'Conducts compliance checks on Council Members',
    allowed: 'Compliant',
    notAllowed: 'Not compliant',
  },
  selection: {
    heading: 'Be appointed to the council',
    subheading: 'Contact the Council Managers to be selected',
    allowedLabel: 'Council Members',
    allowedSublabel: 'Members who have been appointed to the council',
    admin: 'Council Manager',
    adminLabel: 'Manages the council',
    allowed: 'Selected',
    notAllowed: 'Not selected',
  },
  allowlist: {
    heading: 'Be added to the allowlist',
    subheading: 'Contact the allowlist manager to be added',
    allowedLabel: 'Allowlist Members',
    allowedSublabel: 'Members who have been added to the allowlist',
    admin: 'Allowlist Manager',
    adminLabel: 'Manages the allowlist',
    allowed: 'Allowed',
    notAllowed: 'Not allowed',
  },
};

interface RawAllowlistData {
  address: string;
  eligible: boolean;
  badStanding: boolean;
}

interface AllowlistClaimsProps {
  activeModule: ModuleDetails;
  labeledModules: LabeledModules | undefined;
  showOnMobile?: boolean;
}

export const AllowlistClaims = ({ activeModule, labeledModules, showOnMobile = false }: AllowlistClaimsProps) => {
  const { chainId, isEligibilityRulesLoading } = useEligibility();
  const { data: allowlistData, isLoading: isAllowlistLoading } = useAllowlist({
    id: activeModule.instanceAddress,
    chainId,
  }) as { data: RawAllowlistData[] | null; isLoading: boolean };

  // Transform the raw allowlist data to HatWearer type
  const allowlist = useMemo(() => {
    if (!allowlistData) return [];
    const eligibleAddresses = filter(allowlistData, (profile) => profile.eligible && !profile.badStanding);
    return map(eligibleAddresses, (profile) => ({
      id: profile.address as Hex,
    }));
  }, [allowlistData]);

  const ownerHatId = get(find(get(activeModule, 'liveParameters'), { label: 'Owner Hat' }), 'value') as
    | bigint
    | undefined;

  const { data: ownerHatDetails } = useHatDetails({
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
    chainId,
  });
  const { wearers: ownerHatWearers } = useAllWearers({
    selectedHat: ownerHatDetails,
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

  const isInAllowlist = includes(
    map(allowlist || [], (wearer) => toLower(wearer?.id)),
    toLower(address),
  );
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
    <div
      className={cn('flex flex-col gap-4', {
        'hidden md:flex': !showOnMobile,
        'flex md:flex': showOnMobile,
      })}
    >
      <Card className='flex flex-col justify-between gap-6 border-[#2D3748] bg-white px-8 pb-10 pt-6'>
        <div className='flex justify-between'>
          <div>
            <h3 className='text-2xl font-bold'>{copy.heading}</h3>
            <p className='mt-2 text-sm text-gray-600'>{copy.subheading}</p>
          </div>

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

        {/* using pt-2 (8px) to accomodate the gap-6 (24px) above to be a distance of 32px total */}
        <div className='flex flex-col gap-8 pt-2'>
          {/* Council Members Section */}
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <h4 className='text-xl font-bold'>{copy.allowedLabel}</h4>
              <p className='text-sm text-gray-600'>{copy.allowedSublabel}</p>
            </div>

            <div className='flex flex-col gap-2'>
              {!isEmpty(allowlist) ? (
                map(allowlist, (wearer) => {
                  const isCurrentUser = toLower(wearer?.id) === toLower(address || '');
                  return (
                    <div key={wearer.id}>
                      <div className={`inline-block rounded-lg p-1 ${isCurrentUser ? 'bg-[#22C55E]/10' : ''}`}>
                        <MemberAvatar member={wearer} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className='text-gray-600'>None added yet</p>
              )}
            </div>
          </div>
          {/* Council Managers Section */}
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <h4 className='text-xl font-bold'>{copy.admin}</h4>
              <p className='text-sm text-gray-600'>{copy.adminLabel}</p>
            </div>

            <div className='flex flex-col gap-4'>
              {!isEmpty(ownerHatWearers) ? (
                map(ownerHatWearers, (wearer) => <MemberAvatar member={wearer} key={wearer.id} />)
              ) : (
                <p className='text-sm text-gray-600'>None added yet</p>
              )}
            </div>
          </div>
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
