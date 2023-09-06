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
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UseFormReturn } from 'react-hook-form';
import { BsBarChart, BsPersonBadge } from 'react-icons/bs';
import { FaCheck, FaInfoCircle, FaRegTrashAlt, FaUpload } from 'react-icons/fa';
import { isAddress } from 'viem';
import { useChainId, useEnsAddress } from 'wagmi';

import DropZone from '@/components/atoms/DropZone';
import Input from '@/components/atoms/Input';
import FormRowWrapper from '@/components/FormRowWrapper';
import { useTreeForm } from '@/contexts/TreeFormContext';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useWearerEligibilityCheck from '@/hooks/useWearerEligibilityCheck';
import useWearerIsInGoodStanding from '@/hooks/useWearerIsInGoodStanding';
import { decimalId, isMutable, toTreeId } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';

interface FormWearer {
  address: string;
  ens: string;
}

const HatWearerForm = ({ localForm, setUnsavedData }: HatWearerFormProps) => {
  const currentNetworkId = useChainId();

  const { handleSubmit, setValue, watch } = localForm;
  const { chainId, selectedHat } = useTreeForm();

  const [isCurrentInputAddress, setIsCurrentInputAddress] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<any>();

  const localWearers: FormWearer[] = watch('wearers', []);
  const editMode = _.gt(_.size(_.keys(watch())), 1);

  const hatId = _.get(selectedHat, 'id');
  const maxSupply = _.get(selectedHat, 'maxSupply');
  const detailsObject = _.get(selectedHat, 'detailsObject');
  const currentWearers = _.get(selectedHat, 'extendedWearers');
  let hatName = selectedHat?.details;
  if (detailsObject?.data) {
    hatName = detailsObject.data.name;
  }

  const currentWearerList = _.map(currentWearers, 'id');

  const { data: isEligible, isLoading: isLoadingIsEligible } =
    useWearerEligibilityCheck({
      wearer: currentResolvedAddress,
    });

  const isAddressAlreadyAdded =
    localWearers?.some(
      (wearer: FormWearer) =>
        wearer.address === currentInput || wearer.ens === currentInput,
    ) || currentWearers?.includes(currentResolvedAddress?.toLowerCase());

  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: currentInput,
    chainId: 1,
    enabled: currentInput.includes('.eth'),
  });

  const { data: isInGoodStanding } = useWearerIsInGoodStanding({
    wearer: currentResolvedAddress,
  });

  useEffect(() => {
    setIsCurrentInputAddress(isAddress(currentInput));
    setCurrentResolvedAddress(
      // eslint-disable-next-line no-nested-ternary
      (isCurrentInputAddress ? currentInput : ensResolvedAddress)
        ? isCurrentInputAddress
          ? currentInput
          : ensResolvedAddress
        : '',
    );
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
    queryKeys: [
      ['hatDetails', hatId || 'none'],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(decimalId(hatId)) &&
      !_.isEmpty(localWearers) &&
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
      queryKeys: [
        ['hatDetails', hatId || 'none'],
        ['treeDetails', toTreeId(hatId)],
      ],
      enabled:
        Boolean(decimalId(hatId)) &&
        _.eq(_.size(localWearers), 1) &&
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
    _.size(currentWearerList) + _.size(localWearers) + 1 >
    _.toNumber(maxSupply);
  const canAddWearer = !isAddressAlreadyAdded && !wouldExceedMaxSupply;

  const handleAddWearer = () => {
    const address = isCurrentInputAddress ? currentInput : ensResolvedAddress;
    if (
      !address ||
      _.includes(currentWearerList, _.toLower(currentResolvedAddress)) ||
      !canAddWearer
    )
      return;
    const newLocalWearers = localWearers;
    newLocalWearers.push({
      address,
      ens: isEnsAddress ? currentInput : '',
    });
    setValue('wearers', newLocalWearers);
    setUnsavedData?.((prevState: any) => ({
      ...prevState,
      wearers: newLocalWearers,
    }));
    setCurrentInput('');
  };

  const handleRemoveWearer = (index: number) => {
    const updateWearers = _.filter(
      localWearers,
      (__, i) => _.toNumber(i) !== index,
    );
    setValue('wearers', updateWearers);
    setUnsavedData?.((prevState: any) => ({
      ...prevState,
      wearers: updateWearers,
    }));
  };
  const { isOpen, onToggle } = useDisclosure();

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      accept: { 'text/csv': ['.csv'] },
      onDrop: (droppedFiles) => {
        const file = droppedFiles[0];
        if (!file) return;
        Papa.parse(file, {
          complete: (results: any) => {
            const csvAddresses = _.take(
              _.differenceWith(
                _.filter(_.flatten(results.data), isAddress),
                localWearers,
                (csvAddress: any, wearer: any) => csvAddress === wearer.address,
              ),
              _.toNumber(maxSupply) -
                _.size(currentWearerList) -
                _.size(localWearers),
            );
            setValue('wearers', [
              ...localWearers,
              ...csvAddresses.map((address: any) => ({ address })),
            ]);
          },
          error: (error: any) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        {editMode && (
          <FormRowWrapper>
            <Icon as={BsBarChart} boxSize={4} mt='2px' />
            <Input
              name='maxSupply'
              label='MAX WEARERS'
              subLabel='Total number of addresses that can wear this hat at the same time.'
              placeholder='10'
              isDisabled={!isMutable(selectedHat)}
              localForm={localForm}
            />
          </FormRowWrapper>
        )}
        <Flex justify='space-between' align='flex-end'>
          <Stack gap={0}>
            <HStack>
              <Text fontSize='sm'>NEW WEARER ADDRESS</Text>
            </HStack>
            <Text fontSize='sm' color='blackAlpha.700'>
              This address will receive a {hatName} hat token on{' '}
              {chainId && chainsMap(chainId).name}
            </Text>
          </Stack>
          {!editMode && (
            <Text fontSize='sm' color='blackAlpha.700'>
              {_.size(currentWearerList) + _.size(localWearers)} of {maxSupply}{' '}
              wearers
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
                  currentWearerList.includes(
                    currentResolvedAddress?.toLowerCase(),
                  )
                }
                isDisabled={!canAddWearer}
                onChange={(e) => {
                  setCurrentInput(e.target.value?.toLowerCase() ?? '');
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

            {_.includes(
              currentWearerList,
              _.toLower(currentResolvedAddress),
            ) && (
              <HStack align='center' spacing={1}>
                <Icon as={FaInfoCircle} mr={1} color='red.500' />
                <Text fontSize='sm' color='red.500'>
                  This address is already wearing this hat
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
                  !canAddWearer ||
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
                borderColor='blackAlpha.300'
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
                (isAddress(currentResolvedAddress) && !isInGoodStanding) ||
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

interface HatWearerFormProps {
  localForm: UseFormReturn<any>;
  setUnsavedData?: (data: any) => void;
}
