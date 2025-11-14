'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, useWaitForSubgraph } from 'hooks';
import { useForm } from 'react-hook-form';
import { SupportedChains } from 'types';
import { Button } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import { AddressInput, Form } from './components';

const CouncilTransferForm = ({ hatId, topHatWearerAddress, chainId }: CouncilTransferFormProps) => {
  const currentChainId = useChainId();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch } = localForm;
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();

  const newWearer = useDebounce<string>(watch('newWearer', null));

  const { data: newWearerResolvedAddress, isLoading: isLoadingNewWearerResolvedAddress } = useEnsAddress({
    name: newWearer,
    chainId: 1,
  });

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const newWearerAddress = newWearerResolvedAddress ?? newWearer;

  // const isTopHat = hatId && !includes(hatIdDecimalToIp(BigInt(hatId)), '.');

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'transferHat',
    args: [hatId, topHatWearerAddress, newWearerAddress],
    chainId,
    waitForSubgraphToastData: {
      title: 'Transaction confirmed. Waiting for indexing...',
      description: "We're waiting for the data to be indexed. Stay tuned.",
      duration: 8000,
    },
    successToastData: {
      title: `Council Transferred!`,
      description: hatId && `Successfully transferred Council to ${formatAddress(newWearerAddress)}`,
    },
    queryKeys: [['hatDetails'], ['treeDetails'], ['wearerDetails'], ['orgChartTree'], ['wearerAndControllerDetails']],
    waitForSubgraph,
    handlePendingTx,
    handleSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
      queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
    },
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  const isDisabled = !writeAsync || isLoading || isLoadingNewWearerResolvedAddress || chainId !== currentChainId;

  return (
    <Form {...localForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-4'>
          <p>Transfer the Council to another address</p>

          <AddressInput
            label='New Owner Address'
            subLabel='Will have total control over the Council, Admins and Safe'
            name='newWearer'
            localForm={localForm}
            chainId={chainId as SupportedChains}
            hideAddressButtons
          />

          <div className='flex justify-end pt-6'>
            <Button type='submit' disabled={isDisabled} variant='destructive'>
              Transfer
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

interface CouncilTransferFormProps {
  hatId: Hex | undefined;
  topHatWearerAddress: string | undefined;
  chainId: number | undefined;
}

export { CouncilTransferForm };
