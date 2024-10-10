'use client';

import {
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import { useHatForm, useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { isMutable } from 'hats-utils';
import { useWaitForSubgraph } from 'hooks';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsBarChart } from 'react-icons/bs';
import { idToIp, toTreeId } from 'shared';
import { chainsMap, formatAddress, formatScientificWhole } from 'utils';
import { isAddress } from 'viem';

import { FormRowWrapper, MultiAddressInput, NumberInput } from './components';

const BoxArrowUpRightIn = dynamic(() =>
  import('icons').then((i) => i.BoxArrowUpRightIn),
);

type HatWearerFormProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm?: UseFormReturn<any>;
};

// !currently experiencing an issue where the prepare hook is running when enabled is false
// TODO after migrating to wagmi v2 look into `enabled` not working on `batchMintHats`
// TODO edge case when user added to list but only wanted to single mint
// TODO reset form state on unmount?

const HatWearerForm = ({ localForm }: HatWearerFormProps) => {
  const { handlePendingTx } = useOverlay();
  const { chainId, storedData, editMode, onCloseHatDrawer } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const { localForm: hatForm } = useHatForm();
  const form = localForm || hatForm;
  const { handleSubmit, watch, formState } = _.pick(form, [
    'handleSubmit',
    'watch',
    'formState',
  ]);
  const { errors } = _.pick(formState, ['errors']);

  const hatId = _.get(selectedHat, 'id');
  const hatIdDecimal = hatId && hatIdHexToDecimal(hatId);
  const detailsObject = _.get(selectedHat, 'detailsObject');
  const currentSupply = _.get(selectedHat, 'currentSupply');
  // TODO handle more than 100 wearers
  const currentWearers = _.get(selectedHat, 'wearers');
  let hatName = selectedHat?.details;
  if (detailsObject?.data) {
    hatName = detailsObject.data.name;
  }

  const currentMaxSupply = watch?.('maxSupply');
  const maxSupply = useMemo(() => {
    if (currentMaxSupply) {
      return currentMaxSupply;
    }
    const storedHat = _.find(storedData, { id: hatId });
    if (_.get(storedHat, 'maxSupply')) {
      return _.get(storedHat, 'maxSupply');
    }
    return _.get(selectedHat, 'maxSupply');
  }, [selectedHat, storedData, currentMaxSupply, hatId]);

  const currentWearerList = _.map(currentWearers, 'id');
  const localWearers = watch?.('wearers', []);
  const currentInput = watch?.('wearers-currentAddress-input');
  const currentResolvedAddress = watch?.('wearers-currentAddress');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const batchMintArgs: any[] = [
    new Array(localWearers.length).fill(hatIdDecimal),
    _.map(localWearers, 'address'),
  ];
  if (currentResolvedAddress && hatId && isAddress(currentResolvedAddress)) {
    batchMintArgs[0].push(hatIdDecimal);
    batchMintArgs[1].push(currentResolvedAddress);
  }

  const txDescriptionBatch =
    currentResolvedAddress &&
    `Minted hat ${idToIp(selectedHat?.id)} to ${
      _.size(localWearers) + (isAddress(currentResolvedAddress) ? 1 : 0)
    } wearers`;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const {
    writeAsync: writeAsyncBatchMintHats,
    isLoading: isLoadingBatchMintHats,
  } = useHatContractWrite({
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
    !isAddress(currentInput)
      ? currentInput
      : formatAddress(currentResolvedAddress)
  }`;

  const { writeAsync: writeAsyncMintHat, isLoading: isLoadingMintHat } =
    useHatContractWrite({
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
    if (
      currentResolvedAddress &&
      isAddress(currentResolvedAddress) &&
      _.size(localWearers) === 0
    ) {
      await writeAsyncMintHat?.();
    } else {
      await writeAsyncBatchMintHats?.();
    }
  };

  if (!form) return null;

  return (
    <form onSubmit={handleSubmit?.(onSubmit)}>
      <Stack spacing={editMode ? 4 : 2}>
        {editMode && (
          <FormRowWrapper>
            <Icon as={BsBarChart} boxSize={4} mt='2px' />
            <NumberInput
              name='maxSupply'
              label='MAX WEARERS'
              subLabel='Total number of addresses that can wear this hat at the same time.'
              localForm={form}
              options={{
                min: _.toNumber(selectedHat?.currentSupply),
                validate: {
                  maxWearers: (v) =>
                    !_.gt(
                      _.add(_.size(currentWearerList), _.size(localWearers)),
                      _.toNumber(v),
                    ) || 'Max supply exceeded',
                },
              }}
              isDisabled={!isMutable(selectedHat)}
              placeholder='10'
            />
          </FormRowWrapper>
        )}
        <Flex justify='space-between' align='flex-end'>
          <Stack gap={0}>
            <HStack>
              <Text size='sm' textTransform='uppercase'>
                New Wearer Addresses
              </Text>
            </HStack>
            <Text size='sm' variant='light'>
              This address will receive a {hatName} hat token on{' '}
              {chainId && chainsMap(chainId).name}
            </Text>
          </Stack>
          {!editMode && (
            <Text size='sm' variant='light'>
              {_.toNumber(currentSupply) + _.size(localWearers)} of{' '}
              {formatScientificWhole(maxSupply)} wearers
            </Text>
          )}
        </Flex>
        <VStack borderRadius={8} alignItems='start' spacing={3}>
          <MultiAddressInput
            name='wearers'
            localForm={form}
            holdOnAdd={!editMode}
          />
        </VStack>

        {!editMode && (
          <Flex justify='flex-end'>
            <Button
              type='submit'
              isLoading={isLoadingMintHat || isLoadingBatchMintHats}
              colorScheme='blue'
              isDisabled={
                (!writeAsyncBatchMintHats && !writeAsyncMintHat) ||
                isLoadingMintHat ||
                isLoadingBatchMintHats ||
                !!errors?.[`wearers-currentAddress`]
              }
              leftIcon={<Icon as={BoxArrowUpRightIn} boxSize={4} mr={2} />}
            >
              Mint Hat{_.size(localWearers) > 0 && 's'}
            </Button>
          </Flex>
        )}
      </Stack>
    </form>
  );
};

export default HatWearerForm;
