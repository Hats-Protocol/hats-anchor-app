'use client';

import { HSG_V2_ABI } from '@hatsprotocol/constants';
import { hatIdHexToDecimal, HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { Form, SignerThresholdSubForm } from 'forms';
import { useWaitForSubgraph } from 'hooks';
import { get, size, toNumber, toString } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppHat, HatSignerGateV2 } from 'types';
import { Button } from 'ui';
import { logger } from 'utils';
import { useAccount, useWriteContract } from 'wagmi';

type ThresholdType = 'ABSOLUTE' | 'RELATIVE';

type SignerThresholdData = {
  thresholdType: ThresholdType;
  // Min must be at least 1
  min: number;
  // Target should be greater than min
  target: number; // is a percentage when thresholdType is RELATIVE out of 10_000 = 100%
  maxMembers: number; // "Max" isn't recognized on HSGv2, generally set on the Hat
};

// Theoretically we'd like to bundle updating HSG params and Hat details in a single transaction
// But until 7702 is available, it has to be done as two separate transactions for EOAs

function SignerThresholdModal({ signer, signerHat, chainId }: SignerThresholdModalProps) {
  const localForm = useForm<SignerThresholdData>();
  const [isLoading, setIsLoading] = useState(false);
  const { handlePendingTx, setModals } = useOverlay();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { reset, handleSubmit, watch } = localForm;
  const { thresholdType, min, target, maxMembers } = watch();
  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeContractAsync } = useWriteContract();

  const hasHsgChanges = useMemo(() => {
    if (!signer) return false;
    return (
      thresholdType !== signer?.thresholdType ||
      toNumber(min) !== toNumber(signer?.minThreshold) ||
      toNumber(target) !== toNumber(signer?.targetThreshold)
    );
  }, [signer, thresholdType, min, target]);

  useEffect(() => {
    if (!signer) return;

    reset({
      thresholdType: (signer?.thresholdType as 'ABSOLUTE' | 'RELATIVE') || 'ABSOLUTE',
      min: toNumber(signer.minThreshold),
      target:
        signer?.thresholdType === 'RELATIVE'
          ? toNumber(signer.targetThreshold) / 100
          : toNumber(signer.targetThreshold),
      maxMembers: toNumber(get(signerHat, 'maxSupply')),
    });
  }, [signer, signerHat, reset]);

  useEffect(() => {
    if (!thresholdType) return;

    if (thresholdType === 'ABSOLUTE') {
      // Target becomes min
      reset({
        thresholdType: 'ABSOLUTE',
        min,
        target: min,
        maxMembers,
      });
    } else {
      // Min used to calculate relative target
      const targetRaw = Math.floor((min / maxMembers) * 100);
      const roundedTarget = size(toString(targetRaw)) > 1 ? toNumber(`${toString(targetRaw).slice(0, 1)}0`) : targetRaw;
      reset({
        thresholdType: 'RELATIVE',
        min,
        target: roundedTarget,
        maxMembers,
      });
    }
  }, [thresholdType]);

  const onSubmit = (data: SignerThresholdData) => {
    setIsLoading(true);
    if (!signer) return;

    const { thresholdType, min, target } = data;

    const actualTarget = thresholdType === 'ABSOLUTE' ? min : target * 100; // TODO current implementation doesn't support dynamic absolute threshold

    return writeContractAsync({
      address: signer.id,
      abi: HSG_V2_ABI,
      functionName: 'setThresholdConfig',
      args: [{ thresholdType: thresholdType === 'ABSOLUTE' ? 0 : 1, min: BigInt(min), target: BigInt(actualTarget) }],
    })
      .then((hash) => {
        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: 'Updated threshold',
          waitForSubgraph,
          onSuccess: () => {
            // invalidate queries
            queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
            setIsLoading(false);
            setModals?.({});
          },
        });
      })
      .catch((error) => {
        logger.error(error);
      });
  };

  const setMaxMembers = async () => {
    if (!signerHat?.id) return;

    return writeContractAsync({
      address: HATS_V1,
      abi: HATS_ABI,
      functionName: 'changeHatMaxSupply',
      args: [hatIdHexToDecimal(signerHat.id), maxMembers],
    })
      .then((hash) => {
        handlePendingTx?.({
          hash,
          txChainId: chainId,
          txDescription: 'Updated max members',
          waitForSubgraph,
          onSuccess: () => {
            // invalidate queries
            queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
          },
        });
      })
      .catch((error) => {
        logger.error(error);
      });
  };

  if (!signer) return null;

  return (
    <Modal name='hsgThreshold' title='Signer Threshold'>
      <Form {...localForm}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-4'>
            <SignerThresholdSubForm form={localForm} />
          </div>

          <div className='flex justify-end py-6'>
            <div className='flex gap-2'>
              {!!signerHat?.maxSupply && toNumber(maxMembers) !== toNumber(signerHat?.maxSupply) && (
                <Button variant='outline-blue' rounded='full' onClick={setMaxMembers}>
                  Set max members
                </Button>
              )}
              <Button type='submit' rounded='full' disabled={!hasHsgChanges || !address || isLoading}>
                {isLoading ? 'Updating...' : 'Update Threshold'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

interface SignerThresholdModalProps {
  signer: HatSignerGateV2 | undefined;
  signerHat: AppHat | undefined;
  chainId: number | undefined;
}

export { SignerThresholdModal };
