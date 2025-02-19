'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useAllWearers, useHatDetails } from 'hats-hooks';
import { useToast } from 'hooks';
import { find, get, includes, map, toLower } from 'lodash';
import { useCallModuleFunction } from 'modules-hooks';
import posthog from 'posthog-js';
import { useState } from 'react';
import { BsCheckSquareFill, BsXOctagon, BsXOctagonFill } from 'react-icons/bs';
import type { ModuleFunction, StatusManagerProps, SupportedChains } from 'types';
import { Button } from 'ui';
import { chainsMap, formatAddress } from 'utils';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const AllowlistStatusManager = ({
  rule,
  user,
  selectedHat,
  chainId,
  labeledModules,
  currentEligibility,
}: StatusManagerProps) => {
  const { address: userAddress } = useAccount();
  const currentChainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });
  const { toast } = useToast();
  const { setModals } = useOverlay();
  const queryClient = useQueryClient();
  const { switchChain } = useSwitchChain();
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);
  const { data: hatDetails } = useHatDetails({
    hatId: selectedHat?.id,
    chainId: chainId as SupportedChains,
  });
  const isWearing = !!find(get(hatDetails, 'wearers'), { id: toLower(user?.address) });

  const allowlistManagerHatId = get(find(rule.liveParams, { label: 'Owner Hat' }), 'value') as bigint | undefined;
  const { data: allowlistManagerHat } = useHatDetails({
    hatId: allowlistManagerHatId ? hatIdDecimalToHex(allowlistManagerHatId) : undefined,
    chainId: chainId as SupportedChains,
  });
  const { wearers: allowlistManagerWearers } = useAllWearers({
    selectedHat: allowlistManagerHat,
    chainId: chainId as SupportedChains,
  });
  const isAllowlistManager = includes(map(allowlistManagerWearers, 'id'), toLower(userAddress));

  let label = 'Added to Allowlist';
  let sublabel = isEligible ? 'This account was added to the Allowlist' : 'This account is not on the Allowlist';
  let action = isEligible ? 'Remove from Allowlist' : 'Add to Allowlist';

  if (rule.address === labeledModules?.selection) {
    label = 'Appointed Council Member';
    sublabel = isEligible
      ? 'This account was appointed by a Council Manager'
      : 'This account was previously a Council Member';
    action = isEligible ? 'Revoke Appointment' : 'Appoint Member'; // re-adding is available in dev mode
  }
  if (rule.address === labeledModules?.criteria) {
    label = 'Passed Compliance Check';
    sublabel = isEligible
      ? 'This Member has passed compliance checks'
      : 'This Member has not passed compliance checks, so they can not be on the Council right now';
    action = isEligible ? 'Revoke Compliance' : 'Mark Compliant';
  }

  const handleAllowlistUpdate = async () => {
    setIsLoading(true);
    const addFunction = find(rule.module.writeFunctions, { functionName: 'addAccount' });
    const removeFunction = find(rule.module.writeFunctions, { functionName: 'removeAccount' });
    const removeAndBurnFunction = find(rule.module.writeFunctions, { functionName: 'removeAccountAndBurnHat' });

    await callModuleFn({
      func: (isEligible ? (isWearing ? removeAndBurnFunction : removeFunction) : addFunction) as ModuleFunction,
      args: { Account: user?.address },
      moduleId: rule.module.implementationAddress,
      instance: rule.address,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
        toast({
          title: 'Allowlist updated',
          description: `${isEligible ? 'Removed' : 'Added'} ${formatAddress(user?.address)} ${
            isEligible ? 'from' : 'to'
          } the allowlist`,
        });
        posthog.capture('Updated Allowlist', {
          chainId,
          type: isEligible ? 'removeFromAllowlist' : 'addToAllowlist',
          moduleAddress: rule.address,
          userAddress: user?.address,
        });
        setModals?.({});
        setIsLoading(false);
      },
      onDecline: () => {
        setIsLoading(false);
      },
      // onError: () => {
      //   setIsLoading(false);
      // },
    });
  };

  if (isLoading) {
    action = 'Updating...';
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex w-3/5 flex-col gap-1'>
        <h4 className='font-medium'>{label}</h4>
        <p className='text-sm'>{sublabel}</p>
        {isEligible ? (
          <div className='text-functional-success flex items-center gap-2'>
            <BsCheckSquareFill className='size-4' />
            <p>Yes</p>
          </div>
        ) : (
          <div className='text-destructive flex items-center gap-2'>
            <BsXOctagonFill className='size-4' />
            <p>No</p>
          </div>
        )}
      </div>

      {currentChainId === chainId ? (
        <Button
          variant={isEligible ? 'outline-red' : 'outline-green'}
          rounded='full'
          disabled={!isAllowlistManager || isLoading}
          onClick={handleAllowlistUpdate}
        >
          {isLoading ? null : isEligible ? ( // <Spinner className='size-4' />
            <BsXOctagon className='size-4' />
          ) : (
            <BsCheckSquareFill className='size-4' />
          )}
          {action}
        </Button>
      ) : (
        <Button variant='outline' rounded='full' onClick={() => switchChain({ chainId })}>
          Switch to {chainsMap(chainId)?.name}
        </Button>
      )}
    </div>
  );
};

export { AllowlistStatusManager };
