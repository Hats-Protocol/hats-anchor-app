import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  HStack,
  Icon,
  IconButton,
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
  FaChevronDown,
  FaChevronUp,
  FaFileCsv,
  FaInfoCircle,
  FaRegQuestionCircle,
  FaTrash,
  FaUserPlus,
} from 'react-icons/fa';
import { isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import DropZone from '@/components/DropZone';
import CONFIG from '@/constants';
import useBatchMintHats from '@/hooks/useBatchMintHats';
import useHatCheckEligibility from '@/hooks/useHatCheckEligibility';

const HatWearerForm = ({
  hatId,
  chainId,
  currentWearers,
  maxSupply,
}: HatWearerFormProps) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit } = localForm;
  const [wearers, setWearers] = useState<any[]>([]);
  const [isCurrentInputAddress, setIsCurrentInputAddress] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<any>();

  const { data: isEligible, isLoading: isLoadingIsEligible } =
    useHatCheckEligibility({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInput]);

  const isAddressAlreadyAdded =
    wearers.some(
      (wearer) =>
        wearer.address === currentInput || wearer.ens === currentInput,
    ) || currentWearers.includes(currentResolvedAddress.toLowerCase());

  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: currentInput.includes('.eth') ? currentInput : null,
    chainId: 1,
  });

  const { writeAsync, isLoading } = useBatchMintHats({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
    newWearers: wearers
      .map((wearer) => wearer.address)
      .concat([currentResolvedAddress]),
  });

  const onSubmit = async () => {
    await writeAsync?.();
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
        <HStack>
          <Text>WEARER ADDRESS</Text>
          <FaRegQuestionCircle />
        </HStack>
        <Text color='gray.500'>
          The address will receive a Hat token and become a Wearer.
        </Text>
        <VStack borderRadius={8} alignItems='start' spacing={3}>
          <Flex w='full'>
            <InputGroup flexGrow={1}>
              <InputLeftElement>
                <Icon as={FaUserPlus} ml={2} />
              </InputLeftElement>
              <Input
                w='calc(100% - 1rem)'
                textOverflow='ellipsis'
                type='address'
                placeholder='0x1234, vitalik.eth'
                value={currentInput}
                onChange={(e) =>
                  setCurrentInput(e.target.value?.toLowerCase() ?? '')
                }
              />
              {ensResolvedAddress && (
                <InputRightElement right='2rem'>
                  <FaCheck color='green' />
                </InputRightElement>
              )}
            </InputGroup>
          </Flex>
          {typeof isEligible === 'boolean' && !isEligible && (
            <Text fontSize='sm' color='red.500'>
              <Icon as={FaInfoCircle} mr={1} />
              This address is not eligible to mint a Hat
            </Text>
          )}

          <Tooltip label={toolTip} shouldWrapChildren>
            <Button
              isDisabled={
                !canAddWearer || !isEligible || isLoading || isLoadingIsEligible
              }
              onClick={handleAddWearer}
              aria-label='Add Another Wallet'
            >
              <Icon as={FaUserPlus} mr={2} />
              Add Another Wallet
            </Button>
          </Tooltip>

          {wearers.map(({ address, ens }, index) => (
            <Box key={address} w='full'>
              <Flex align='center' w='full' justifyContent='space-between'>
                <Input value={ens || address} readOnly w='calc(100% - 5rem)' />
                <IconButton
                  type='button'
                  onClick={() => handleRemoveWearer(index)}
                  icon={<FaTrash />}
                  aria-label='Remove'
                  w={16}
                />
              </Flex>
              {ens && (
                <Text fontSize='sm' color='gray.500' mt={1}>
                  Resolved address: {address}
                </Text>
              )}
            </Box>
          ))}
        </VStack>
        <Box>
          <Button
            size='sm'
            aria-label='Toggle CSV Input'
            onClick={onToggle}
            variant='ghost'
            _hover={{
              bg: 'gray.100',
              transition: 'background-color 0.3s',
            }}
            leftIcon={<FaFileCsv />}
            rightIcon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
            color='gray.600'
          >
            <Text ml={2}>CSV Import</Text>
          </Button>
        </Box>

        <Collapse in={isOpen}>
          <FormControl id='csvFile'>
            <DropZone
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragAccept={isDragAccept}
              isDragReject={isDragReject}
            />
            <Text fontSize='sm' mt={1} color='blue.500'>
              <Icon as={FaInfoCircle} mr={1} />
              The CSV file must only contain Ethereum addresses, one per line.
              Any additional data will be ignored.
            </Text>
          </FormControl>
        </Collapse>

        <Flex justify='flex-end'>
          <Button type='submit' isDisabled={!writeAsync || isLoading}>
            Mint
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
}
