import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  HStack,
  Icon,
  IconButton,
  Image,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { CONFIG, HATS_ABI } from 'app-constants';
import { useToast } from 'app-hooks';
import { chainsMap, formatAddress } from 'app-utils';
import {
  useHatContractWrite,
  useWearerEligibilityCheck,
  useWearerIsInGoodStanding,
} from 'hats-hooks';
import { FormWearer, HatWearer } from 'hats-types';
import { decimalId, isMutable, maxSupplyText } from 'hats-utils';
import _ from 'lodash';
import Papa from 'papaparse';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormReturn } from 'react-hook-form';
import { BsBarChart, BsPersonBadge } from 'react-icons/bs';
import { FaInfoCircle, FaRegTrashAlt, FaUpload } from 'react-icons/fa';
import { idToIp, toTreeId } from 'shared-utils';
import { DropZone, NumberInput } from 'ui';
import { createPublicClient, Hex, http, isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import AddressInput from '../components/AddressInput';
import FormRowWrapper from '../components/FormRowWrapper';
import { useHatForm } from '../contexts/HatFormContext';
import { useOverlay } from '../contexts/OverlayContext';
import { useTreeForm } from '../contexts/TreeFormContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HatWearerForm = ({ localForm }: { localForm?: UseFormReturn<any> }) => {
  const currentNetworkId = useChainId();
  const { handlePendingTx } = useOverlay();
  const {
    chainId,
    selectedHat,
    onchainHats,
    selectedOnchainHat,
    storedData,
    hatDisclosure,
    editMode,
  } = useTreeForm();
  const { localForm: hatForm } = useHatForm();
  const toast = useToast();
  const form = localForm || hatForm;
  const { handleSubmit, setValue, watch } = _.pick(form, [
    'handleSubmit',
    'setValue',
    'watch',
  ]);

  const [isCurrentInputAddress, setIsCurrentInputAddress] = useState(false);
  const currentInput = watch?.('currentAddress');
  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<
    Hex | undefined
  >();

  const localWearers: FormWearer[] = watch?.('wearers', []);
  const hatId = _.get(selectedHat, 'id');
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

  const { data: isEligible, isLoading: isLoadingIsEligible } =
    useWearerEligibilityCheck({
      wearer: currentResolvedAddress,
      selectedHat,
      chainId,
    });

  const isAddressAlreadyAdded =
    localWearers?.some(
      (wearer: FormWearer) =>
        wearer.address === currentInput ||
        (wearer.ens === currentInput && currentInput !== ''),
    ) ||
    // TODO dynamic check for current wearers in case of > 100 wearers
    _.includes(_.map(currentWearers, 'id'), _.toLower(currentResolvedAddress));

  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: currentInput,
    chainId: 1,
    enabled:
      !!currentInput && currentInput !== '' && currentInput.includes('.eth'),
  });

  const { data: isInGoodStanding } = useWearerIsInGoodStanding({
    wearer: currentResolvedAddress,
    selectedHat,
    chainId,
  });

  useEffect(() => {
    const localIsAddress = isAddress(currentInput);
    setIsCurrentInputAddress(localIsAddress);
    if (localIsAddress) {
      setCurrentResolvedAddress(currentInput);
    } else {
      setCurrentResolvedAddress(ensResolvedAddress || undefined);
    }
  }, [currentInput, isCurrentInputAddress, ensResolvedAddress]);

  const batchMintArgs = [
    new Array(localWearers.length).fill(decimalId(hatId)),
    _.map(localWearers, 'address'),
  ];
  if (isAddress(currentResolvedAddress)) {
    batchMintArgs[0].push(decimalId(hatId));
    batchMintArgs[1].push(currentResolvedAddress);
  }

  const txDescriptionBatch = `Minted hat ${idToIp(selectedHat.id)} to ${
    localWearers.length + (isAddress(currentResolvedAddress) ? 1 : 0)
  } wearers`;

  const {
    writeAsync: writeAsyncBatchMintHats,
    isLoading: isLoadingBatchMintHats,
  } = useHatContractWrite({
    functionName: 'batchMintHats',
    args: batchMintArgs,
    chainId,
    txDescription: txDescriptionBatch,
    onSuccessToastData: {
      title: `Hats Minted!`,
      description: txDescriptionBatch,
    },
    handlePendingTx,
    handleSuccess: () => {
      hatDisclosure?.onClose();
    },
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(decimalId(hatId)) &&
      _.includes(_.map(onchainHats, 'id'), hatId) &&
      !_.isEmpty(localWearers) &&
      _.toNumber(selectedOnchainHat?.maxSupply) >
        (currentWearerList.length + currentResolvedAddress ? 1 : 0) &&
      chainId === currentNetworkId,
  });

  const txDescriptionSingle = `Minted hat ${idToIp(selectedHat.id)} to ${
    isEnsAddress ? currentInput : formatAddress(currentResolvedAddress)
  }`;

  const { writeAsync: writeAsyncMintHat, isLoading: isLoadingMintHat } =
    useHatContractWrite({
      functionName: 'mintHat',
      args: [decimalId(hatId), currentResolvedAddress],
      chainId,
      txDescription: txDescriptionSingle,
      onSuccessToastData: {
        title: `Hat Minted!`,
        description: txDescriptionSingle,
      },
      handlePendingTx,
      handleSuccess: () => {
        hatDisclosure?.onClose();
      },
      queryKeys: [
        ['hatDetails', { id: hatId, chainId }],
        ['treeDetails', toTreeId(hatId)],
      ],
      enabled:
        Boolean(decimalId(hatId)) &&
        _.includes(_.map(onchainHats, 'id'), hatId) &&
        Boolean(currentResolvedAddress) &&
        _.toNumber(selectedOnchainHat?.maxSupply) > currentWearerList.length &&
        chainId === currentNetworkId,
    });

  const onSubmit = async () => {
    if (isAddress(currentResolvedAddress) && _.size(localWearers) === 0) {
      await writeAsyncMintHat?.();
    } else {
      await writeAsyncBatchMintHats?.();
    }
  };

  const isNewWearerAddress = isCurrentInputAddress || ensResolvedAddress;
  const wouldExceedMaxSupply =
    _.size(currentWearerList) + _.size(localWearers) >= _.toNumber(maxSupply);
  const disableAddWearer = isAddressAlreadyAdded || wouldExceedMaxSupply;

  const handleAddWearer = () => {
    const address = isCurrentInputAddress
      ? (currentInput as Hex)
      : (ensResolvedAddress as Hex);
    if (
      !address ||
      _.includes(currentWearerList, _.toLower(currentResolvedAddress)) ||
      _.includes(
        _.map(localWearers, 'address'),
        _.toLower(currentResolvedAddress),
      ) ||
      disableAddWearer ||
      !isEligible
    )
      return;
    const newLocalWearers = localWearers;
    newLocalWearers.push({
      address,
      ens: isEnsAddress ? currentInput : '',
    });
    setValue?.('wearers', newLocalWearers);
    setCurrentResolvedAddress(undefined);
    setValue?.('currentAddress', '');
  };

  const handleRemoveWearer = (index: number) => {
    const updateWearers = _.filter(
      localWearers,
      (__: unknown, i: string) => _.toNumber(i) !== index,
    );
    setValue?.('wearers', updateWearers);
  };
  const { isOpen, onToggle } = useDisclosure();

  const handleWearerImport = useCallback(
    async (results: { data: unknown[] }) => {
      const csvAddresses = _.take(
        _.differenceWith(
          _.filter(_.flatten(results.data), isAddress),
          localWearers,
          (csvAddress: unknown, wearer: unknown) =>
            csvAddress === _.get(wearer as HatWearer, 'address'),
        ),
        _.toNumber(maxSupply) -
          _.size(currentWearerList) -
          _.size(localWearers),
      );
      const publicClient = createPublicClient({
        chain: chainsMap(chainId),
        transport: http(),
      });
      const promises = _.map(csvAddresses, (a: Hex) =>
        publicClient.readContract({
          abi: HATS_ABI,
          address: CONFIG.hatsAddress,
          functionName: 'isEligible',
          args: [a, selectedHat?.id],
        }),
      );
      const eligibilityOfAddresses = await Promise.all(promises);
      const eligibleAddresses = _.filter(
        csvAddresses,
        (v: Hex, i: number) => eligibilityOfAddresses[i],
      );
      const ineligibleWearersCount = _.size(
        _.filter(eligibilityOfAddresses, (v: boolean) => !v),
      );
      const newWearers = _.map(eligibleAddresses, (address: unknown) => ({
        address,
        ens: '',
      }));
      if (ineligibleWearersCount > 0) {
        toast.info({
          title: `${ineligibleWearersCount} wearer${
            ineligibleWearersCount > 1 ? 's' : ''
          } ${
            ineligibleWearersCount > 1 ? 'were' : 'was'
          } not eligible to be added`,
          description:
            'Check the eligibility module to determine eligible wearers',
        });
      }

      setValue?.('wearers', [...localWearers, ...newWearers]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chainId, localWearers, currentWearerList, maxSupply, selectedHat?.id],
  );

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      accept: { 'text/csv': ['.csv'] },
      onDrop: (droppedFiles) => {
        const file = droppedFiles[0];
        if (!file) return;
        Papa.parse(file, {
          complete: (data) => handleWearerImport(data),
          error: (error: Error) => {
            // eslint-disable-next-line no-console
            console.error('Error parsing CSV file: ', error);
          },
        });
      },
    });

  let toolTip = '';

  if (wouldExceedMaxSupply) {
    toolTip = 'Would exceed max supply';
  } else if (isAddressAlreadyAdded) {
    toolTip = 'Address already added';
  } else if (!isNewWearerAddress) {
    toolTip = 'Please input a valid address';
  }

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
              customValidations={{
                validate: {
                  maxWearers: (v) =>
                    !_.gt(
                      _.add(_.size(currentWearerList), _.size(localWearers)),
                      _.toNumber(v),
                    ) || 'Max supply exceeded',
                },
              }}
              options={{
                min: Number(selectedHat.currentSupply),
              }}
              isDisabled={!isMutable(selectedHat)}
              placeholder='10'
            />
          </FormRowWrapper>
        )}
        <Flex justify='space-between' align='flex-end'>
          <Stack gap={0} maxW='60%'>
            <HStack>
              <Text fontSize='sm'>NEW WEARER ADDRESSES</Text>
            </HStack>
            <Text fontSize='sm' color='blackAlpha.700'>
              This address will receive a {hatName} hat token on{' '}
              {chainId && chainsMap(chainId).name}
            </Text>
          </Stack>
          {!editMode && (
            <Text fontSize='sm' color='blackAlpha.700'>
              {_.toNumber(currentSupply) + _.size(localWearers)} of{' '}
              {maxSupplyText(maxSupply)} wearers
            </Text>
          )}
        </Flex>
        <VStack borderRadius={8} alignItems='start' spacing={3}>
          {/* could be replaced with MultiAddressInput, but needs adjustments & additions */}
          {localWearers.map(({ address, ens }, index) => (
            <Box key={address} w='full'>
              <Flex align='center' w='full' justifyContent='space-between'>
                <InputGroup flexGrow={1}>
                  <InputLeftElement>
                    <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
                  </InputLeftElement>
                  <ChakraInput
                    value={ens !== '' ? ens : address}
                    readOnly
                    w='calc(100% - 2rem)'
                  />
                </InputGroup>
                <IconButton
                  type='button'
                  onClick={() => handleRemoveWearer(index)}
                  icon={<FaRegTrashAlt />}
                  aria-label='Remove'
                  bg='transparent'
                  border='1px solid #d6d6d6'
                  w={10}
                />
              </Flex>

              {ens && (
                <Text fontSize='sm' color='gray.500' mt={1}>
                  {address}
                </Text>
              )}
            </Box>
          ))}
          <Flex w='full' direction='column' gap={1}>
            <AddressInput
              name='currentAddress'
              localForm={form}
              showResolvedAddress={Boolean(currentResolvedAddress)}
              isDisabled={wouldExceedMaxSupply}
              resolvedAddress={String(currentResolvedAddress)}
            />

            {currentResolvedAddress && !isInGoodStanding && (
              <Text fontSize='sm' color='red.500'>
                <Icon as={FaInfoCircle} mr={1} />
                This address was set as in bad standing
              </Text>
            )}

            {isAddressAlreadyAdded && (
              <HStack align='center' spacing={1}>
                <Icon as={FaInfoCircle} mr={1} color='red.500' />
                <Text fontSize='sm' color='red.500'>
                  This address is already (pending) wearing this hat
                </Text>
              </HStack>
            )}
          </Flex>

          {typeof isEligible === 'boolean' && !isEligible && (
            <Text fontSize='sm' color='red.500'>
              <Icon as={FaInfoCircle} mr={1} />
              This address is not eligible to wear this hat
            </Text>
          )}

          {wouldExceedMaxSupply && (
            <Text fontSize='sm' color='yellow.500'>
              Max supply reached
            </Text>
          )}

          <HStack>
            <Tooltip label={toolTip} shouldWrapChildren>
              <Button
                isDisabled={
                  disableAddWearer ||
                  !isEligible ||
                  isLoadingIsEligible ||
                  isLoadingMintHat ||
                  isLoadingBatchMintHats ||
                  !isInGoodStanding ||
                  _.includes(
                    currentWearerList,
                    _.toLower(currentResolvedAddress),
                  )
                }
                onClick={handleAddWearer}
                aria-label='Add Another Wallet'
                variant='outlineMatch'
                colorScheme='gray.500'
              >
                <HStack>
                  <Icon as={BsPersonBadge} w={4} h={4} />
                  <Text>Add Another Wallet</Text>
                </HStack>
              </Button>
            </Tooltip>
            <Box>
              <Button
                aria-label='Toggle CSV Input'
                onClick={onToggle}
                variant='outlineMatch'
                colorScheme='blue.500'
              >
                <HStack>
                  <Icon as={FaUpload} w={3} h={3} />
                  <Text>Upload CSV</Text>
                </HStack>
              </Button>
            </Box>
          </HStack>
          <Collapse in={isOpen}>
            <FormControl id='csvFile'>
              <Text
                fontSize='sm'
                textTransform='uppercase'
                fontWeight='medium'
                mt={6}
              >
                Upload CSV
              </Text>
              <Text fontSize='md' mt={1} color='blackAlpha.700' mb={4}>
                The CSV file must only contain Ethereum addresses, one per line.
                ENS is currently not supported. Any additional data will be
                ignored.
              </Text>
              <DropZone
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                isFullWidth
              />
            </FormControl>
          </Collapse>
        </VStack>

        {!editMode && (
          <Flex justify='flex-end'>
            <Button
              type='submit'
              isLoading={isLoadingMintHat || isLoadingBatchMintHats}
              colorScheme='blue'
              isDisabled={
                (!writeAsyncBatchMintHats && !writeAsyncMintHat) ||
                (currentResolvedAddress &&
                  isAddress(currentResolvedAddress) &&
                  !isInGoodStanding) ||
                isLoadingIsEligible ||
                isLoadingMintHat ||
                isLoadingBatchMintHats
              }
            >
              <Image src='/icons/mint.svg' w={4} h={4} alt='Mint' mr={2} /> Mint
              Hat{localWearers.length > 0 && 's'}
            </Button>
          </Flex>
        )}
      </Stack>
    </form>
  );
};

export default HatWearerForm;
