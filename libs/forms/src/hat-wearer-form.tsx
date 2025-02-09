'use client';

import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { isMutable } from 'hats-utils';
import { useWaitForSubgraph } from 'hooks';
import { add, find, get, gt, map, pick, size, toNumber } from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsBarChart } from 'react-icons/bs';
import { idToIp, toTreeId } from 'shared';
import { Button, cn } from 'ui';
import { chainsMap, formatAddress, formatScientificWhole } from 'utils';
import { isAddress } from 'viem';

import { Form, FormRowWrapper, MultiAddressInput, NumberInput } from './components';

const BoxArrowUpRightIn = dynamic(() => import('icons').then((i) => i.BoxArrowUpRightIn));

type HatWearerFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm?: UseFormReturn<any>;
};

// TODO edge case when user added to list but only wanted to single mint
// TODO reset form state on unmount?

const HatWearerForm = ({ localForm }: HatWearerFormProps) => {
  const { handlePendingTx } = useOverlay();
  const { chainId, storedData, editMode, onCloseHatDrawer } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const { localForm: hatForm } = useHatForm();
  const form = localForm || hatForm;
  const { handleSubmit, watch, formState } = pick(form, ['handleSubmit', 'watch', 'formState']);
  const { errors } = pick(formState, ['errors']);

  const hatId = get(selectedHat, 'id');
  const hatIdDecimal = hatId && hatIdHexToDecimal(hatId);
  const detailsObject = get(selectedHat, 'detailsObject');
  const currentSupply = get(selectedHat, 'currentSupply');
  // TODO handle more than 100 wearers
  const currentWearers = get(selectedHat, 'wearers');
  let hatName = selectedHat?.details;
  if (detailsObject?.data) {
    hatName = detailsObject.data.name;
  }

  const currentMaxSupply = watch?.('maxSupply');
  const maxSupply = useMemo(() => {
    if (currentMaxSupply) {
      return currentMaxSupply;
    }
    const storedHat = find(storedData, { id: hatId });
    if (get(storedHat, 'maxSupply')) {
      return get(storedHat, 'maxSupply');
    }
    return get(selectedHat, 'maxSupply');
  }, [selectedHat, storedData, currentMaxSupply, hatId]);

  const currentWearerList = map(currentWearers, 'id');
  const localWearers = watch?.('wearers', []);
  const currentInput = watch?.('wearers-currentAddress-input');
  const currentResolvedAddress = watch?.('wearers-currentAddress');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batchMintArgs: any[] = [new Array(localWearers.length).fill(hatIdDecimal), map(localWearers, 'address')];
  if (currentResolvedAddress && hatId && isAddress(currentResolvedAddress)) {
    batchMintArgs[0].push(hatIdDecimal);
    batchMintArgs[1].push(currentResolvedAddress);
  }

  const txDescriptionBatch =
    currentResolvedAddress &&
    `Minted hat ${idToIp(selectedHat?.id)} to ${
      size(localWearers) + (isAddress(currentResolvedAddress) ? 1 : 0)
    } wearers`;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync: writeAsyncBatchMintHats, isLoading: isLoadingBatchMintHats } = useHatContractWrite({
    functionName: 'batchMintHats',
    args: batchMintArgs,
    chainId,
    txDescription: txDescriptionBatch,
    successToastData: {
      title: `Hats Minted!`,
      description: txDescriptionBatch,
    },
    handlePendingTx,
    waitForSubgraph,
    handleSuccess: () => {
      onCloseHatDrawer?.();
    },
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
  });

  const txDescriptionSingle = `Minted hat ${idToIp(selectedHat?.id)} to ${
    !isAddress(currentInput) ? currentInput : formatAddress(currentResolvedAddress)
  }`;

  const { writeAsync: writeAsyncMintHat, isLoading: isLoadingMintHat } = useHatContractWrite({
    functionName: 'mintHat',
    args: [hatIdDecimal, currentResolvedAddress || currentInput],
    chainId,
    txDescription: txDescriptionSingle,
    successToastData: {
      title: `Hat Minted!`,
      description: txDescriptionSingle,
    },
    handlePendingTx,
    waitForSubgraph,
    handleSuccess: () => {
      onCloseHatDrawer?.();
    },
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
  });

  const onSubmit = async () => {
    // eslint-disable-next-line no-console
    console.log(currentResolvedAddress, localWearers);
    if (currentResolvedAddress && isAddress(currentResolvedAddress) && size(localWearers) === 0) {
      await writeAsyncMintHat?.();
    } else {
      await writeAsyncBatchMintHats?.();
    }
  };

  if (!form) return null;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit?.(onSubmit)}>
        <div className={cn(editMode ? 'space-y-4' : 'space-y-2')}>
          {editMode && (
            <FormRowWrapper noMargin>
              <BsBarChart className='absolute -ml-8 mt-1 size-4' />

              <NumberInput
                name='maxSupply'
                label='MAX WEARERS'
                subLabel='Total number of addresses that can wear this hat at the same time.'
                localForm={form}
                options={{
                  min: toNumber(selectedHat?.currentSupply),
                  validate: {
                    maxWearers: (v) =>
                      !gt(add(size(currentWearerList), size(localWearers)), toNumber(v)) || 'Max supply exceeded',
                  },
                }}
                isDisabled={!isMutable(selectedHat)}
                placeholder='10'
              />
            </FormRowWrapper>
          )}
          <div className='flex items-end justify-between'>
            <div className='space-y-0'>
              <div className='flex items-center'>
                <p className='text-sm uppercase'>New Wearer Addresses</p>
              </div>
              <p className='text-sm text-gray-600'>
                This address will receive a {hatName} hat token on {chainId && chainsMap(chainId).name}
              </p>
            </div>
            {!editMode && (
              <p className='text-sm text-gray-600'>
                {toNumber(currentSupply) + size(localWearers)} of {formatScientificWhole(maxSupply)} wearers
              </p>
            )}
          </div>
          <div>
            <MultiAddressInput name='wearers' localForm={form} holdOnAdd={!editMode} />
          </div>

          {!editMode && (
            <div className='flex justify-end'>
              <Button
                type='submit'
                // isLoading={isLoadingMintHat || isLoadingBatchMintHats}
                variant='default'
                disabled={
                  (!writeAsyncBatchMintHats && !writeAsyncMintHat) ||
                  isLoadingMintHat ||
                  isLoadingBatchMintHats ||
                  !!errors?.[`wearers-currentAddress`]
                }
              >
                <BoxArrowUpRightIn className='h-4 w-4' />
                Mint Hat{size(localWearers) > 0 && 's'}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export { HatWearerForm };
