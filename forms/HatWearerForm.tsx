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
  InputRightElement,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import _ from 'lodash';
import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormReturn } from 'react-hook-form';
import { BsBarChart, BsPersonBadge } from 'react-icons/bs';
import { FaCheck, FaInfoCircle, FaRegTrashAlt, FaUpload } from 'react-icons/fa';
import { Hex, isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import FormRowWrapper from '@/components/FormRowWrapper';
import { useHatForm } from '@/contexts/HatFormContext';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import useWearerIsInGoodStanding from '@/hooks/useWearerIsInGoodStanding';
import { chainsMap } from '@/lib/chains';
import { decimalId, isMutable, toTreeId } from '@/lib/hats';
import { maxSupplyText } from '@/lib/wearers';
import { FormWearer, HatWearer } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HatWearerForm = ({ localForm }: { localForm?: UseFormReturn<any> }) => {
  const currentNetworkId = useChainId();

  const {
    chainId,
    selectedHat,
    onchainHats,
    selectedOnchainHat,
    storedData,
    hatDisclosure,
  } = useTreeForm();
  const { localForm: hatForm } = useHatForm();
  const form = localForm || hatForm;
  const { handleSubmit, setValue, watch } = _.pick(form, [
    'handleSubmit',
    'setValue',
    'watch',
  ]);

  const [isCurrentInputAddress, setIsCurrentInputAddress] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<
    Hex | undefined
  >();

  const localWearers: FormWearer[] = watch?.('wearers', []);
  const editMode = _.gt(_.size(_.keys(watch?.())), 1);

  const hatId = _.get(selectedHat, 'id');
  const detailsObject = _.get(selectedHat, 'detailsObject');
  const currentSupply = _.get(selectedHat, 'currentSupply');
  // TODO handle more than 100 wearers
  const currentWearers = _.get(selectedHat, 'extendedWearers');
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
    if (storedHat) {
      return _.get(storedHat, 'maxSupply');
    }
    return _.get(selectedHat, 'maxSupply');
  }, [selectedHat, storedData, currentMaxSupply, hatId]);

  const currentWearerList = _.map(currentWearers, 'id');

  const { data: isEligible, isLoading: isLoadingIsEligible } =
    useWearerEligibilityCheck({
      wearer: currentResolvedAddress,
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

  const {
    writeAsync: writeAsyncBatchMintHats,
    isLoading: isLoadingBatchMintHats,
  } = useHatContractWrite({
    functionName: 'batchMintHats',
    args: [
      new Array(localWearers.length).fill(decimalId(hatId)),
      _.map(localWearers, 'address'),
    ],
    chainId,
    onSuccessToastData: {
      title: `Hats Minted!`,
      description: `Successfully minted hats`,
    },
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
      _.toNumber(selectedOnchainHat?.maxSupply) > currentWearerList.length &&
      chainId === currentNetworkId,
  });

  const { writeAsync: writeAsyncMintHat, isLoading: isLoadingMintHat } =
    useHatContractWrite({
      functionName: 'mintHat',
      args: [decimalId(hatId), _.get(_.first(localWearers), 'address')],
      chainId,
      onSuccessToastData: {
        title: `Hat Minted!`,
        description: `Successfully minted hat`,
      },
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
        _.eq(_.size(localWearers), 1) &&
        _.toNumber(selectedOnchainHat?.maxSupply) > currentWearerList.length &&
        chainId === currentNetworkId,
    });

  const onSubmit = async () => {
    if (_.eq(_.size(localWearers), 1)) {
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
    setCurrentInput('');
    setCurrentResolvedAddress(undefined);
  };

  const handleRemoveWearer = (index: number) => {
    const updateWearers = _.filter(
      localWearers,
      (__, i) => _.toNumber(i) !== index,
    );
    setValue?.('wearers', updateWearers);
  };
  const { isOpen, onToggle } = useDisclosure();

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      accept: { 'text/csv': ['.csv'] },
      onDrop: (droppedFiles) => {
        const file = droppedFiles[0];
        if (!file) return;
        Papa.parse(file, {
          complete: (results: { data: unknown[] }) => {
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
            setValue?.('wearers', [
              ...localWearers,
              ...csvAddresses.map((address: unknown) => ({ address, ens: '' })),
            ]);
          },
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
            <Input
              name='maxSupply'
              label='MAX WEARERS'
              subLabel='Total number of addresses that can wear this hat at the same time.'
              placeholder='10'
              options={{
                validate: {
                  maxWearers: (v) =>
                    !_.gt(
                      _.add(_.size(currentWearerList), _.size(localWearers)),
                      _.toNumber(v),
                    ) || 'Max supply exceeded',
                },
              }}
              isDisabled={!isMutable(selectedHat)}
              localForm={form}
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
            <InputGroup flexGrow={1}>
              <InputLeftElement>
                <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
              </InputLeftElement>
              <ChakraInput
                w='full'
                textOverflow='ellipsis'
                type='address'
                placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                value={currentInput}
                isInvalid={
                  (currentResolvedAddress && !isInGoodStanding) ||
                  _.includes(
                    currentWearerList,
                    _.toLower(currentResolvedAddress),
                  ) ||
                  isAddressAlreadyAdded
                }
                isDisabled={wouldExceedMaxSupply}
                onChange={(e) => {
                  setCurrentInput(_.toLower(e.target.value) ?? '');
                }}
                onBlur={handleAddWearer}
              />
              {ensResolvedAddress && (
                <InputRightElement right='1rem'>
                  <FaCheck color='green' />
                </InputRightElement>
              )}
            </InputGroup>

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

            {ensResolvedAddress && (
              <Text fontSize='sm' color='gray.500' textAlign='left' w='full'>
                {ensResolvedAddress}
              </Text>
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
                variant='outline'
              >
                <Icon
                  as={BsPersonBadge}
                  ml={-1}
                  mr={3}
                  w={4}
                  h={4}
                  color='gray.500'
                />
                Add Another Wallet
              </Button>
            </Tooltip>
            <Box>
              <Button
                aria-label='Toggle CSV Input'
                onClick={onToggle}
                bg='white'
                border='1px solid #e8e8e8'
              >
                <Icon
                  as={FaUpload}
                  mr={2}
                  color='gray.500'
                  _hover={{ color: 'gray.600' }}
                  w={3}
                  h={3}
                />
                Upload CSV
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
