'use client';

import { WriteFunction } from '@hatsprotocol/hsg-sdk';
import { Modal, useEligibility, useOverlay } from 'contexts';
import { ModuleArgsForm } from 'forms';
import { capitalize, filter, find, includes, isEmpty, map, pick, some } from 'lodash';
import { useAncillaryElection, useCallModuleFunction } from 'modules-hooks';
import { useMemo, useState } from 'react';
import { get, useForm } from 'react-hook-form';
import { SupportedChains } from 'types';
import { Button, Tooltip } from 'ui';
import { eligibilityRuleToModuleDetails, formatAddress, getDisabledReason, parsedSeconds } from 'utils';
import { useAccount, useChainId } from 'wagmi';

import { DateInfo } from './date-info';

export const UpcomingSeason = () => {
  const { controllerAddress, chainId, activeRule } = useEligibility();
  const moduleDetails = eligibilityRuleToModuleDetails(activeRule);

  const { data: electionsAuthority } = useAncillaryElection({
    chainId: chainId as SupportedChains,
    id: activeRule?.address,
  });

  const currentNetworkId = useChainId();
  const isSameChain = chainId === currentNetworkId;

  const currentTermEnd = find(get(moduleDetails, 'liveParameters'), {
    label: 'Current Term End',
  });
  const nextTermEnd = find(get(moduleDetails, 'liveParameters'), {
    label: 'Next Term End',
  });
  const currentTermEndDate = parsedSeconds(currentTermEnd?.value as bigint);
  const nextTermEndDate = parsedSeconds(nextTermEnd?.value as bigint);

  const [selectedFunction, setSelectedFunction] = useState(null);
  const localOverlay = useOverlay();
  const { address } = useAccount();
  const { setModals } = localOverlay;
  const formMethods = useForm({ mode: 'onChange' });
  const { formState, handleSubmit } = formMethods;
  const { isValid } = pick(formState, ['isValid']);
  const moduleActions: WriteFunction[] | undefined = get(moduleDetails, 'writeFunctions');

  const accessibleActions = useMemo(() => {
    return filter(moduleActions, (action: WriteFunction) => {
      if (
        action.functionName === 'setNextTerm' &&
        ((nextTermEnd?.value && nextTermEnd.value === BigInt(0)) || (nextTermEndDate && nextTermEndDate > new Date()))
      ) {
        return false;
      }

      const canElect =
        action.functionName === 'elect' &&
        // electionsAuthority.isWearingBallotBoxHat && // TODO is this working?
        !!nextTermEnd?.value;

      const canStartNextTerm =
        action.functionName === 'startNextTerm' &&
        currentTermEndDate &&
        new Date().getTime() > currentTermEndDate?.getTime() &&
        !!nextTermEnd?.value &&
        (nextTermEnd.value as bigint) > BigInt(0);

      return (
        some(
          action.roles,
          (role: string) => includes(electionsAuthority.userRoles, role) || (role === 'public' && canStartNextTerm),
        ) || canElect
      );
    });
  }, [moduleActions, electionsAuthority, nextTermEnd?.value, nextTermEndDate, currentTermEndDate]);

  const { mutateAsync: callModuleFunction } = useCallModuleFunction({
    chainId,
  });

  if (!moduleDetails || !controllerAddress) return null;

  const handleFunctionCall = (func: any) => {
    if (func.args && func.args.length > 0) {
      setSelectedFunction(func);
      setModals?.({ 'functionCall-module': true });
    } else {
      callModuleFunction({
        moduleId: moduleDetails.implementationAddress,
        instance: controllerAddress,
        func,
        args: [],
      });
    }
  };

  const onSubmit = async (values: any) => {
    if (!selectedFunction) return;
    await callModuleFunction({
      moduleId: moduleDetails.implementationAddress,
      instance: controllerAddress,
      func: selectedFunction,
      args: values,
    });
    setModals?.({});
  };

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-lg font-medium'>Upcoming Season</h2>
      <div className='w-full'>
        <DateInfo date={nextTermEndDate} label='Next Season End' />
      </div>

      {!isEmpty(accessibleActions) && (
        <div className='flex flex-wrap justify-center gap-2'>
          {map(accessibleActions, (action: WriteFunction) => (
            <Tooltip
              label={getDisabledReason({
                action: action.description,
                isNotConnected: !address,
                isOnWrongNetwork: !isSameChain,
              })}
              key={action.label}
            >
              <Button
                variant='outline'
                className='font-medium'
                size='sm'
                disabled={
                  !!getDisabledReason({
                    isNotConnected: !address,
                    isOnWrongNetwork: !isSameChain,
                  })
                }
                onClick={() => handleFunctionCall(action)}
              >
                {capitalize(action.label)}
              </Button>
            </Tooltip>
          ))}
        </div>
      )}

      <Modal
        name='functionCall-module'
        title={`Interact with ${moduleDetails?.name} (${formatAddress(controllerAddress)})`}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-4'>
            {get(selectedFunction, 'description') && <p>{get(selectedFunction, 'description')}</p>}
            <div className='flex flex-col gap-4'>
              <ModuleArgsForm
                selectedModuleArgs={get(selectedFunction, 'args', [])}
                localForm={formMethods}
                hideIcon
                noMargin
              />
            </div>
            <div className='flex justify-end'>
              <div className='flex gap-2'>
                <Button variant='outline' onClick={() => setModals?.({})}>
                  Cancel
                </Button>
                <Button type='submit' disabled={!isValid}>
                  {capitalize(get(selectedFunction, 'label'))}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
