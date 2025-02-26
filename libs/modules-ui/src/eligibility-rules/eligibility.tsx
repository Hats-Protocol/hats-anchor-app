'use client';

import { CONFIG } from '@hatsprotocol/config';
import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { find, first, flatten, gt, includes, pick, size } from 'lodash';
import { useCurrentEligibility, useEligibilityRules } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { Skeleton } from 'ui';
import { eligibilityRuleToModuleDetails } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { CommunityHatEligibilityRule } from '../agreement';
import { ChainPanel } from './chain-panel';
import { ControllerWearer } from './controller-wearer';
import { KnownEligibilityModule } from './known-eligibility-module';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

const OVERRIDE_COMMUNITY_HAT = true;

// CURRENTLY REQUIRES TREE FORM context and SELECTED HAT context
export const Eligibility = ({ modalSuffix }: { modalSuffix?: string | undefined }) => {
  const { orgChartWearers } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();
  const { address } = useAccount();

  const { eligibility } = pick(selectedHat, ['eligibility']);
  const orgChartEligibility = find(orgChartWearers, { id: eligibility });
  const eligibilityData = orgChartEligibility || { id: eligibility as Hex };

  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { data: rawEligibilityRules, isLoading: loadingModuleDetails } = useEligibilityRules({
    address: eligibility,
    chainId,
    enabled: orgChartEligibility?.isContract, // ? is this reliable enough?
  });
  const { data: currentEligibility } = useCurrentEligibility({
    chainId,
    selectedHat,
    wearerAddress: address as Hex,
    eligibilityRules: rawEligibilityRules || undefined,
  });

  const ruleSets = !!rawEligibilityRules ? flatten(rawEligibilityRules) : undefined;
  const multipleModules = gt(size(ruleSets), 1);
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup

  if (loadingModuleDetails) {
    return <Skeleton className='mx-4 my-2 h-4' />;
  }

  if (multipleModules) {
    return (
      <ChainPanel
        ruleSets={rawEligibilityRules || undefined}
        chainId={chainId}
        selectedHat={selectedHat}
        modalSuffix={modalSuffix}
        currentEligibility={currentEligibility || undefined}
      />
    );
  }

  if (ruleSets) {
    const moduleDetails = eligibilityRuleToModuleDetails(first(ruleSets));

    return (
      <div className='mx-4'>
        <KnownEligibilityModule
          moduleDetails={moduleDetails}
          moduleParameters={moduleDetails?.liveParameters}
          selectedHat={selectedHat}
          wearer={address as Hex}
          chainId={chainId}
          modalSuffix={modalSuffix}
          wearerEligibility={currentEligibility || undefined}
          ruleSets={rawEligibilityRules || undefined}
        />
      </div>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow yet
    return (
      <div className='mx-4 my-2 flex justify-between md:mx-0'>
        <p>Another Hat can remove wearers</p>

        <div className='flex items-center gap-1'>
          <p>Hat ID</p>
          <HatIcon className='h-[14px] w-[14px] md:h-4 md:w-4' />
        </div>
      </div>
    );
  }

  if (OVERRIDE_COMMUNITY_HAT && selectedHat?.id === CONFIG.agreementV0.communityHatId) {
    return (
      <div className='mx-4'>
        <CommunityHatEligibilityRule selectedHat={selectedHat} wearer={address as Hex} chainId={chainId} />
      </div>
    );
  }

  return (
    <div className='mx-4 my-2 flex justify-between'>
      <p>{includes(NULL_ADDRESSES, eligibility) ? 'No addresses' : 'One address'} can remove Wearers</p>

      <ControllerWearer controllerData={eligibilityData} />
    </div>
  );
};
