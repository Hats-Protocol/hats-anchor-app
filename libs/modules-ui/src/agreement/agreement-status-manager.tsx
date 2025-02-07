'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useToast } from 'hooks';
import { find, get, includes, map, toLower } from 'lodash';
import { useCallModuleFunction } from 'modules-hooks';
import { BsCheckSquareFill, BsXSquare, BsXSquareFill } from 'react-icons/bs';
import type { ModuleFunction, StatusManagerProps, SupportedChains } from 'types';
import { Button } from 'ui';
import { formatAddress } from 'utils';
import { useAccount } from 'wagmi';

const AgreementStatusManager = ({ rule, user, chainId, currentEligibility }: StatusManagerProps) => {
  const { address: userAddress } = useAccount();
  const { toast } = useToast();
  const { setModals } = useOverlay();
  const queryClient = useQueryClient();
  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);

  const agreementManagerHatId = get(find(rule.liveParams, { label: 'Owner Hat' }), 'value') as bigint | undefined;
  const { data: agreementManagerHat } = useHatDetails({
    hatId: agreementManagerHatId ? hatIdDecimalToHex(agreementManagerHatId) : undefined,
    chainId: chainId as SupportedChains,
  });
  const isAgreementManager = includes(map(get(agreementManagerHat, 'wearers'), 'id'), toLower(userAddress));

  const handleAgreementToggle = async () => {
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
        setModals?.({});
      },
    });
  };

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-col gap-1'>
        <h4 className='font-medium'>Signed & Abides Agreement</h4>
        <p className='text-sm'>This Member has signed and follows the Agreement</p>
        {isEligible ? (
          <div className='text-functional-success flex items-center gap-2'>
            <BsCheckSquareFill className='size-4' />
            <p>Yes</p>
          </div>
        ) : (
          <div className='text-destructive flex items-center gap-2'>
            <BsXSquareFill className='size-4' />
            <p>No</p>
          </div>
        )}
      </div>

      {isEligible && (
        <Button variant='outline-red' rounded='full' disabled={!isAgreementManager} onClick={handleAgreementToggle}>
          <BsXSquare className='size-4' />
          {isEligible ? 'Violated the agreement' : 'Re-instate'}
        </Button>
      )}
    </div>
  );
};

export { AgreementStatusManager };
