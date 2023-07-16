/* eslint-disable jsx-a11y/label-has-associated-control */
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
  Input,
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
import { useForm } from 'react-hook-form';
import {
  FaCheck,
  FaInfoCircle,
  FaRegQuestionCircle,
  FaRegTrashAlt,
  FaUpload,
} from 'react-icons/fa';
import { isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import DropZone from '@/components/DropZone';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';
import useHatContractWrite from '@/hooks/useHatContractWrite';
import useHatIsInGoodStanding from '@/hooks/useHatIsInGoodStanding';
import { decimalId, toTreeId } from '@/lib/hats';
import { chainsMap } from '@/lib/web3';

const HatWearerForm = ({
  hatId,
  chainId,
  currentWearers,
  maxSupply,
  hatName,
}: HatWearerFormProps) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit } = localForm;
  const [wearers, setWearers] = useState<any[]>([]);
  const [isCurrentInputAddress, setIsCurrentInputAddress] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<any>();
  const [newWearers, setNewWearers] = useState<any[]>([]);

  const { data: isEligible, isLoading: isLoadingIsEligible } =
    useHatCheckEligibility({
      wearer: currentResolvedAddress,
      hatId,
      chainId,
    });

  const isAddressAlreadyAdded =
    wearers.some(
      (wearer) =>
        wearer.address === currentInput || wearer.ens === currentInput,
    ) || currentWearers.includes(currentResolvedAddress?.toLowerCase());

  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: currentInput.includes('.eth') ? currentInput : null,
    chainId: 1,
  });

  const { data: isInGoodStanding } = useHatIsInGoodStanding({
    wearer: currentResolvedAddress,
    hatId,
    chainId,
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

  useEffect(() => {
    const newW = wearers
      .map((wearer) => wearer.address)
      .concat(currentResolvedAddress ? [currentResolvedAddress] : []);
    setNewWearers(newW);
  }, [currentResolvedAddress, wearers]);

  const {
    writeAsync: writeAsyncBatchMintHats,
    isLoading: isLoadingBatchMintHats,
  } = useHatContractWrite({
    functionName: 'batchMintHats',
    args: [new Array(wearers.length + 1).fill(decimalId(hatId)), newWearers],
    chainId,
    onSuccessToastData: {
      title: `Hats Minted!`,
      description: `Successfully minted hats`,
    },
    queryKeys: [
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(decimalId(hatId)) &&
      newWearers.every((wearer) => isAddress(wearer)),
  });

  const { writeAsync: writeAsyncMintHat, isLoading: isLoadingMintHat } =
    useHatContractWrite({
      functionName: 'mintHat',
      args: [
        new Array(newWearers.length + 1).fill(decimalId(hatId)),
        newWearers,
      ],
      chainId,
      onSuccessToastData: {
        title: `Hat Minted!`,
        description: `Successfully minted hat`,
      },
      onErrorToastData: {
        title: 'Error occurred!',
      },
      queryKeys: [
        ['hatDetails', hatId],
        ['treeDetails', toTreeId(hatId)],
      ],
      transactionTimeout: 4000,
      enabled: Boolean(decimalId(hatId)) && isAddress(currentResolvedAddress),
    });

  const onSubmit = async () => {
    if (wearers.length === 0) {
      await writeAsyncMintHat?.();
    } else {
      await writeAsyncBatchMintHats?.();
    }
  };

  const handleAddWearer = () => {
    const address = isCurrentInputAddress ? currentInput : ensResolvedAddress;
    setWearers((prevWearers) => [
      ...prevWearers,
      { address, ens: isEnsAddress && currentInput },
    ]);
    setCurrentInput('');
  };

  const isNewWearerAddress = isCurrentInputAddress || ensResolvedAddress;
  const wouldExceedMaxSupply =
    currentWearers.length + wearers.length + 1 > maxSupply;
  const canAddWearer =
    isNewWearerAddress && !isAddressAlreadyAdded && !wouldExceedMaxSupply;

  const handleRemoveWearer = (index: number) => {
    setWearers(_.filter(wearers, (__, i) => i !== index));
  };
  const { isOpen, onToggle } = useDisclosure();

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      accept: { '.csv': [] },
      onDrop: (droppedFiles) => {
        const file = droppedFiles[0];
        if (!file) return;
        Papa.parse(file, {
          complete: (results: any) => {
            const csvAddresses = _.take(
              _.differenceWith(
                _.filter(_.flatten(results.data), isAddress),
                wearers,
                (csvAddress: any, wearer: any) => csvAddress === wearer.address,
              ),
              maxSupply - currentWearers.length - wearers.length,
            );
            setWearers([
              ...wearers,
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

  if (!isNewWearerAddress) {
    toolTip = 'Please input a valid address';
  } else if (isAddressAlreadyAdded) {
    toolTip = 'Address already added';
  } else if (wouldExceedMaxSupply) {
    toolTip = 'Would exceed max supply';
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Stack gap={0}>
          <HStack>
            <Text fontSize='sm'>WEARER ADDRESS</Text>
            <FaRegQuestionCircle />
          </HStack>
          <Text fontSize='sm' color='blackAlpha.700'>
            Address will receive a {hatName} Hat token on{' '}
            {chainsMap(chainId).name}
          </Text>
        </Stack>
        <VStack borderRadius={8} alignItems='start' spacing={3}>
          {wearers.map(({ address, ens }, index) => (
            <Box key={address} w='full'>
              <Flex align='center' w='full' justifyContent='space-between'>
                <InputGroup flexGrow={1}>
                  <InputLeftElement>
                    <Image src='/icons/wearers.svg' w={4} h={4} alt='Wearer' />
                  </InputLeftElement>
                  <Input
                    value={ens || address}
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
                <Image src='/icons/wearers.svg' w={4} h={4} alt='Wearer' />
              </InputLeftElement>
              <Input
                w='full'
                textOverflow='ellipsis'
                type='address'
                placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
                value={currentInput}
                isInvalid={currentResolvedAddress && !isInGoodStanding}
                onChange={(e) =>
                  setCurrentInput(e.target.value?.toLowerCase() ?? '')
                }
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

            {ensResolvedAddress && (
              <Text fontSize='sm' color='gray.500' textAlign='left' w='full'>
                {ensResolvedAddress}
              </Text>
            )}
          </Flex>

          {typeof isEligible === 'boolean' && !isEligible && (
            <Text fontSize='sm' color='red.500'>
              <Icon as={FaInfoCircle} mr={1} />
              This address is not eligible to mint a Hat
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
                  !isInGoodStanding
                }
                onClick={handleAddWearer}
                aria-label='Add Another Wallet'
              >
                <Image
                  src='/icons/wearers.svg'
                  w={4}
                  h={4}
                  alt='Wearer'
                  mr={3}
                  ml={-1}
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
                fontWeight={500}
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

        <Flex justify='flex-end'>
          <Button
            type='submit'
            isLoading={isLoadingMintHat || isLoadingBatchMintHats}
            colorScheme='blue'
            isDisabled={
              (!writeAsyncBatchMintHats && !writeAsyncMintHat) ||
              !isInGoodStanding ||
              isLoadingIsEligible ||
              isLoadingMintHat ||
              isLoadingBatchMintHats
            }
          >
            <Image src='/icons/mint.svg' w={4} h={4} alt='Mint' mr={2} /> Mint
            Hat{wearers.length > 0 && 's'}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
};

export default HatWearerForm;

interface HatWearerFormProps {
  hatId: string;
  chainId: number;
  currentWearers: string[];
  maxSupply: number;
  hatName: string;
}
