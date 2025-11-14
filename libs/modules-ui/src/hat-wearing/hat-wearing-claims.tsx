'use client';

import { useEligibility } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { filter, first, flatten, includes, isEmpty, map, size, toLower } from 'lodash';
import { useEligibilityRules, useHatWearingEligibility } from 'modules-hooks';
import { DevInfo } from 'molecules';
import { useMemo } from 'react';
import { BsCheckSquareFill, BsFillXOctagonFill } from 'react-icons/bs';
import { LabeledModules, ModuleDetails } from 'types';
import { Card, cn, Link, MemberAvatar, Skeleton } from 'ui';
import { explorerUrl, formatAddress, parseDetailsObject } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const HAT_WEARING_ELIGIBILITY_COPY = {
  compliance: {
    heading: 'Wear Required Hat for Compliance',
    subheading: 'You must wear the required hat to be eligible for compliance',
    allowedLabel: 'Current Hat Wearers',
    allowedSublabel: 'Members currently wearing the required hat',
    eligibilityInfo: 'Eligibility Requirements',
    eligibilityInfoLabel: 'Required hat and current stats',
    allowed: 'Hat wearer',
    notAllowed: 'Not holding role',
  },
  selection: {
    heading: 'Wear Required Hat for Selection',
    subheading: 'You must wear the required hat to be eligible for selection',
    allowedLabel: 'Current Hat Wearers',
    allowedSublabel: 'Members currently wearing the required hat',
    eligibilityInfo: 'Eligibility Requirements',
    eligibilityInfoLabel: 'Required hat and current stats',
    allowed: 'Hat wearer',
    notAllowed: 'Not holding role',
  },
  hatWearing: {
    heading: 'Wear Required Hat',
    subheading: 'You must wear the required hat to be eligible',
    allowedLabel: 'Current Hat Wearers',
    allowedSublabel: 'Members currently wearing the required hat',
    eligibilityInfo: 'Eligibility Requirements',
    eligibilityInfoLabel: 'Required hat and current stats',
    allowed: 'Hat wearer',
    notAllowed: 'Not holding role',
  },
};

interface RawHatWearingEligibilityData {
  address: string;
  eligible: boolean;
  badStanding: boolean;
}

interface HatWearingEligibilityClaimsProps {
  activeModule: ModuleDetails;
  labeledModules: LabeledModules | undefined;
  showOnMobile?: boolean;
  isMultiRole?: boolean;
}

export const HatWearingEligibilityClaims = ({
  activeModule,
  labeledModules,
  showOnMobile = false,
  isMultiRole = false,
}: HatWearingEligibilityClaimsProps) => {
  const { chainId, isEligibilityRulesLoading, eligibilityRules } = useEligibility();
  const {
    data: hatWearingEligibilityData,
    isLoading: isHatWearingEligibilityLoading,
    criterionHatId,
  } = useHatWearingEligibility({
    id: activeModule.instanceAddress,
    chainId,
  }) as { data: RawHatWearingEligibilityData[] | null; isLoading: boolean; criterionHatId: string | undefined };

  // Transform the raw hat wearing eligibility data to HatWearer type
  const eligibleWearers = useMemo(() => {
    if (!hatWearingEligibilityData) return [];
    const eligibleAddresses = filter(hatWearingEligibilityData, (profile) => profile.eligible && !profile.badStanding);
    return map(eligibleAddresses, (profile) => ({
      id: profile.address as Hex,
    }));
  }, [hatWearingEligibilityData]);

  // Get criterion hat details for eligibility info
  const { data: criterionHatDetails } = useHatDetails({
    hatId: criterionHatId,
    chainId,
  });
  const localHatDetails = parseDetailsObject(criterionHatDetails);
  console.log('criterionHatDetails', criterionHatDetails);

  // Get eligibility rules for the criterion hat
  const { data: criterionEligibilityRules } = useEligibilityRules({
    address: criterionHatDetails?.eligibility as Hex,
    chainId,
  });

  const { address } = useAccount();
  const onlyModule = size(flatten(eligibilityRules)) === 1;
  const firstModuleIsHatWearing = first(flatten(eligibilityRules))?.module?.id.includes('hatWearingEligibility');

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

  const isWearingRequiredHat = includes(
    map(eligibleWearers || [], (wearer) => toLower(wearer?.id)),
    toLower(address),
  );
  const isDev = false;

  if (isEligibilityRulesLoading || isHatWearingEligibilityLoading) {
    return <Skeleton className='h-[500px] w-full' />;
  }

  // Create dynamic copy based on isMultiRole
  const dynamicSelectionCopy = {
    ...HAT_WEARING_ELIGIBILITY_COPY.selection,
    heading: isMultiRole ? 'Hold required role for current role' : 'Hold required role for Council',
    subheading: isMultiRole
      ? 'You must have the required role to be eligible for this role'
      : 'You must have the required role to be eligible for the council',
    allowedLabel: isMultiRole ? 'Role holders' : 'Council-Eligible role holders',
    allowedSublabel: isMultiRole
      ? 'Members have the role required for this role'
      : 'Members have the role required for the council',
    eligibilityInfo: 'Role Eligibility',
    eligibilityInfoLabel: 'Required role and eligibility stats',
  };

  let copy = HAT_WEARING_ELIGIBILITY_COPY.hatWearing;

  if (activeModule.instanceAddress === labeledModules?.selection) {
    copy = dynamicSelectionCopy;
  } else if (activeModule.instanceAddress === labeledModules?.criteria) {
    copy = HAT_WEARING_ELIGIBILITY_COPY.compliance;
  } else if (onlyModule || firstModuleIsHatWearing) {
    copy = dynamicSelectionCopy;
  }

  return (
    <div
      className={cn('flex flex-col gap-4', {
        'hidden md:flex': !showOnMobile,
        'flex md:flex': showOnMobile,
      })}
    >
      <Card className='flex flex-col justify-between gap-6 border-[#2D3748] bg-white px-8 pb-10 pt-6'>
        <div className='flex flex-col justify-between gap-2 md:flex-row'>
          <div>
            <h3 className='text-2xl font-bold'>{copy.heading}</h3>
            <p className='mt-2 text-sm text-gray-600'>{copy.subheading}</p>
          </div>

          {isWearingRequiredHat ? (
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

        {/* using pt-2 (8px) to accommodate the gap-6 (24px) above to be a distance of 32px total */}
        <div className='flex flex-col gap-8 pt-2'>
          {/* Current Hat Wearers Section */}
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <h4 className='text-xl font-bold'>{copy.allowedLabel}</h4>
              <p className='text-sm text-gray-600'>{copy.allowedSublabel}</p>
            </div>

            <div className='flex flex-col gap-2'>
              {!isEmpty(eligibleWearers) ? (
                map(eligibleWearers, (wearer) => {
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
                <p className='text-gray-600'>No hat wearers found</p>
              )}
            </div>
          </div>
          {/* Eligibility Information Section */}
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <h4 className='text-xl font-bold'>{copy.eligibilityInfo}</h4>
              <p className='text-sm text-gray-600'>{copy.eligibilityInfoLabel}</p>
            </div>

            <div className='flex flex-col gap-2'>
              {localHatDetails ? (
                <div className='rounded-lg bg-gray-50 p-3'>
                  <div className='flex gap-2'>
                    <p className='text-sm text-gray-600'>Required Role:</p>
                    <p className='text-sm font-medium'>{localHatDetails.detailsObject?.data.name || 'Unnamed Hat'}</p>
                  </div>
                  <div className='mt-2 flex gap-4 text-sm'>
                    {localHatDetails.maxSupply && (
                      <span className='text-sm text-gray-600'>
                        Max supply: <strong>{localHatDetails.maxSupply.toString()}</strong>
                      </span>
                    )}
                  </div>
                  <div className='mt-2 flex flex-col gap-2 text-sm'>
                    {criterionEligibilityRules && flatten(criterionEligibilityRules).length > 0 && (
                      <div className='flex flex-col gap-1'>
                        <span className='font-medium text-gray-600'>Eligibility requirements:</span>
                        <ul className='ml-2 space-y-1'>
                          {flatten(criterionEligibilityRules).map((rule, index) => (
                            <li key={index} className='flex items-center gap-2'>
                              <span className='h-1 w-1 rounded-full bg-gray-400'></span>
                              <span className='text-gray-700'>
                                {rule.module?.name || rule.module?.id || 'Unknown module'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className='text-sm text-gray-600'>Eligibility information not available</p>
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
