'use client';

import { NULL_ADDRESSES } from '@hatsprotocol/constants';
import { useSelectedHat, useTreeForm } from 'contexts';
import { find, includes, pick } from 'lodash';
import { useEligibilityRules } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { Skeleton } from 'ui';
import { Hex } from 'viem';

import { ControllerWearer } from './controller-wearer';
import { KnownToggleModule } from './known-toggle-module';

const HatIcon = dynamic(() => import('icons').then((i) => i.HatIcon));

export const Toggle = () => {
  const { orgChartWearers, isLoading: treeLoading } = useTreeForm();
  const { selectedHat, chainId } = useSelectedHat();

  const { toggle } = pick(selectedHat, ['toggle']);
  const toggleData = find(orgChartWearers, { id: toggle }) || {
    id: toggle as Hex,
  };
  // TODO need a lookup if not NULL_ADDRESSES and not in orgChartWearers
  const { data: ruleSets, isLoading: moduleDetailsLoading } = useEligibilityRules({
    address: toggle,
    chainId,
    enabled: toggleData?.isContract, // ? is this reliable enough?
  });
  const isHatsAccount = false; // TODO enable with Hat ID reverse lookup (~2.9)

  if (moduleDetailsLoading || treeLoading) {
    return <Skeleton className='mx-4 my-2' />;
  }

  if (ruleSets) {
    return (
      <div className='mx-4'>
        <KnownToggleModule ruleSets={ruleSets} chainId={chainId} wearer={toggle} selectedHat={selectedHat} />
      </div>
    );
  }

  if (isHatsAccount) {
    // * shouldn't be hitting this flow yet
    return (
      <div className='mx-4 my-2 flex justify-between'>
        <p>Another Hat can remove wearers</p>
        <div className='flex items-center gap-1'>
          <p>Hat ID</p>
          <HatIcon className='h-[14px] w-[14px] md:h-4 md:w-4' />
        </div>
      </div>
    );
  }

  return (
    <div className='mx-4 my-2 flex justify-between'>
      <p>{includes(NULL_ADDRESSES, toggle) ? 'No addresses' : 'One address'} can deactivate this Hat</p>

      <ControllerWearer controllerData={toggleData} />
    </div>
  );
};
