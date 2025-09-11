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

const AgreementStatusManager = ({
  rule,
  user,
  chainId,
  currentEligibility,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedHat,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  labeledModules,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isFirstInChain,
}: StatusManagerProps) => {
  const { address: userAddress } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setModals } = useOverlay();
  const queryClient = useQueryClient();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();

  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);

  const agreementManagerHatId = get(find(rule.liveParams, { label: 'Owner Hat' }), 'value') as bigint | undefined;
  const { data: agreementManagerHat } = useHatDetails({
    hatId: agreementManagerHatId ? hatIdDecimalToHex(agreementManagerHatId) : undefined,
    chainId: chainId as SupportedChains,
  });
  const { wearers: agreementManagerWearers } = useAllWearers({
    selectedHat: agreementManagerHat,
    chainId: chainId as SupportedChains,
  });
  const isAgreementManager = includes(map(agreementManagerWearers, 'id'), toLower(userAddress));

  const handleAgreementToggle = async () => {
    setIsLoading(true);
    const forgiveFunction = find(rule.module.writeFunctions, { functionName: 'forgive' });
    const revokeFunction = find(rule.module.writeFunctions, { functionName: 'revoke' });

    await callModuleFn({
      func: (isEligible ? revokeFunction : forgiveFunction) as ModuleFunction,
      args: { Wearer: user?.address },
      moduleId: rule.module.implementationAddress,
      instance: rule.address,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
        toast({
          title: 'Agreement compliance updated',
          description: `Updated agreement compliance status for ${formatAddress(user?.address)}`,
        });
        posthog.capture('Updated Agreement Compliance', {
          chainId,
          type: isEligible ? 'revoked' : 'forgiven',
          moduleAddress: rule.address,
          userAddress: user?.address,
        });
        setModals?.({});
        setIsLoading(false);
      },
      onDecline: () => {
        setIsLoading(false);
      },
    });
  };

  return (
    <div className='flex flex-col justify-between gap-2 md:flex-row md:items-center'>
      <div className='flex w-full flex-col gap-1 md:w-3/5'>
        <h4 className='font-medium'>Signed & Abides Agreement</h4>
        <p className='text-sm'>
          {isEligible ? 'This Member has signed and follows the Agreement' : 'This Member has not signed the Agreement'}
        </p>
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

      <div className='flex justify-end'>
        {isEligible &&
          (currentChainId === chainId ? (
            <Button
              variant='outline-red'
              rounded='full'
              disabled={!isAgreementManager || isLoading}
              onClick={handleAgreementToggle}
            >
              <BsXOctagon className='size-4' />
              {isLoading ? 'Updating...' : isEligible ? 'Violated the Agreement' : 'Re-instate'}
            </Button>
          ) : (
            <Button variant='outline' rounded='full' onClick={() => switchChain({ chainId })}>
              Switch to {chainsMap(chainId)?.name}
            </Button>
          ))}
      </div>
    </div>
  );
};

export { AgreementStatusManager };
