'use client';

import { useSelectedHat, useTreeForm } from 'contexts';
import { Form } from 'forms';
import { getAllParents } from 'hats-utils';
import { filter, toNumber } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { prettyIdToIp } from 'shared';
import { AppHat } from 'types';

import { ModuleDetailsForm } from './module-details-form';
import { PermissionlessClaimingForm } from './permissionless-claiming-form';

const HatFormAccordion = dynamic(() => import('molecules').then((mod) => mod.HatFormAccordion));

const MainContent = ({
  localForm,
  title,
  isStandaloneHatterDeploy,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  title: string;
  isStandaloneHatterDeploy?: boolean;
}) => {
  const { onchainHats, treeToDisplay, topHat, topHatDetails, chainId, storedData, editMode } = useTreeForm();
  const { selectedHat, selectedHatDetails } = useSelectedHat();

  const eligibleParentHats = useMemo(() => {
    const parents = getAllParents(selectedHat?.id, treeToDisplay);
    // not top hat and (immutable with supply or mutable)
    return filter(
      parents,
      (parent: AppHat) =>
        parent.id !== topHat?.id &&
        parent.id !== selectedHat?.id && // not top hat or selected hat
        (parent.mutable || toNumber(parent.maxSupply) > toNumber(parent.currentSupply)),
    ) as AppHat[];
  }, [selectedHat, treeToDisplay, topHat]);

  const { claimableHats } = useMultiClaimsHatterCheck({
    chainId,
    selectedHat,
    onchainHats,
    storedData,
    editMode,
  });

  const hatTitle = `${prettyIdToIp(selectedHat?.prettyId)} (${selectedHatDetails?.name})`;

  if (!onchainHats || !treeToDisplay) return null;

  return (
    <div className='relative h-[calc(100%-75px)] w-full space-y-10 overflow-scroll p-10 pb-[400px] pt-8'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-medium'>
          {isStandaloneHatterDeploy
            ? `Deploy a Claims Hatter contract to make hat ${hatTitle} claimable`
            : `Create a new Accountability Module for hat ${hatTitle}`}
        </h2>
        {topHatDetails?.description && <p className='text-sm text-gray-500'>{topHatDetails?.description}</p>}
      </div>

      <Form {...localForm}>
        {!isStandaloneHatterDeploy && (
          <HatFormAccordion
            title='Module Basics'
            subtitle='The fundamentals of the module, including type and details.'
            open
          >
            <ModuleDetailsForm localForm={localForm} title={title} />
          </HatFormAccordion>
        )}
        {claimableHats && title !== 'toggle' && (
          <HatFormAccordion
            title='Permissionless Claiming'
            subtitle='Make this hat claimable by deploying a new hatter contract.'
            open
          >
            <PermissionlessClaimingForm localForm={localForm} parentHats={eligibleParentHats} />
          </HatFormAccordion>
        )}
      </Form>
    </div>
  );
};

export { MainContent };
