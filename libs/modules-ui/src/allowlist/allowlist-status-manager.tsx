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
import { useAccount } from 'wagmi';

const AllowlistStatusManager = ({
  rule,
  user,
  selectedHat,
  chainId,
  labeledModules,
  currentEligibility,
}: StatusManagerProps) => {
  const { address: userAddress } = useAccount();
  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });
  const { toast } = useToast();
  const { setModals } = useOverlay();
  const queryClient = useQueryClient();
  const isEligible =
    get(currentEligibility, `[${rule.address}].eligible`) && get(currentEligibility, `[${rule.address}].goodStanding`);
  console.log({ isEligible, currentEligibility });
  const { data: hatDetails } = useHatDetails({
    hatId: selectedHat?.id,
    chainId: chainId as SupportedChains,
  });
  const isWearing = !!find(get(hatDetails, 'wearers'), { id: toLower(user?.address) });
  console.log({ hatDetails, isWearing });

  const allowlistManagerHatId = get(find(rule.liveParams, { label: 'Owner Hat' }), 'value') as bigint | undefined;
  const { data: allowlistManagerHat } = useHatDetails({
    hatId: allowlistManagerHatId ? hatIdDecimalToHex(allowlistManagerHatId) : undefined,
    chainId: chainId as SupportedChains,
  });
  const isAllowlistManager = includes(map(get(allowlistManagerHat, 'wearers'), 'id'), toLower(userAddress));

  let label = 'Added to Allowlist';
  let sublabel = isEligible ? 'This account was added to the Allowlist' : 'This account is not on the Allowlist';
  let action = isEligible ? 'Remove from Allowlist' : 'Add to Allowlist';

  if (rule.address === labeledModules?.selection) {
    label = 'Appointed Council Member';
    sublabel = 'This account was appointed by a Council Manager';
    action = 'Revoke Appointment'; // re-adding is not handled via this flow
  }
  if (rule.address === labeledModules?.criteria) {
    label = 'Passed Compliance Check';
    sublabel = isEligible
      ? 'This Member has passed compliance checks'
      : 'This Member has not passed compliance checks, so they can not be on the Council right now';
    action = isEligible ? 'Revoke Compliance' : 'Mark Compliant';
  }

  const handleAllowlistUpdate = async () => {
    const addFunction = find(rule.module.writeFunctions, { functionName: 'addAccount' });
    const removeFunction = find(rule.module.writeFunctions, { functionName: 'removeAccount' });
    const removeAndBurnFunction = find(rule.module.writeFunctions, { functionName: 'removeAccountAndBurnHat' });

    const result = await callModuleFn({
      func: (isEligible ? (isWearing ? removeAndBurnFunction : removeFunction) : addFunction) as ModuleFunction,
      args: { Account: user?.address },
      moduleId: rule.module.implementationAddress,
      instance: rule.address,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currentEligibility'] });
        toast({
          title: 'Allowlist updated',
          description: `Added ${userAddress} to the allowlist`,
        });
        setModals?.({});
      },
    });

    console.log({ result });
  };

  return (
    <div className='flex items-center justify-between gap-8'>
      <div className='flex flex-col gap-1'>
        <h4 className='font-medium'>{label}</h4>
        <p className='text-sm'>{sublabel}</p>
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

      <Button
        variant={isEligible ? 'outline-red' : 'outline-green'}
        rounded='full'
        disabled={!isAllowlistManager}
        onClick={handleAllowlistUpdate}
      >
        {isEligible ? <BsXSquare className='size-4' /> : <BsCheckSquareFill className='size-4' />}
        {action}
      </Button>
    </div>
  );
};

export { AllowlistStatusManager };
