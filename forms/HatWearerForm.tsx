/* eslint-disable no-nested-ternary */
import {
  Stack,
  Button,
  Flex,
  Tooltip,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  FormControl,
  VStack,
  Icon,
  useDisclosure,
  Collapse,
  Box,
} from '@chakra-ui/react';
import _ from 'lodash';
import Papa from 'papaparse';
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import {
  FaCheck,
  FaUserPlus,
  FaFileCsv,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaInfoCircle,
} from 'react-icons/fa';
import { isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import DropZone from '@/components/DropZone';
import CONFIG from '@/constants';
import useDebounce from '@/hooks/useDebounce';
import useHatMint from '@/hooks/useHatMint';

const HatWearerForm = ({
  hatId,
  chainId,
  currentWearers,
  maxSupply,
}: HatWearerFormProps) => {
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit } = localForm;
  const [wearers, setWearers] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [isNewAddress, setIsNewAddress] = useState(false);

  const newWearer = useDebounce(newAddress, CONFIG.debounce);
  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: newAddress.includes('.eth') ? newAddress : null,
    chainId: 1,
  });

  useEffect(() => {
    setIsNewAddress(isAddress(newAddress));
  }, [newAddress]);

  const isAddressAlreadyAdded =
    wearers.some(
      (wearer) => wearer.address === newAddress || wearer.ens === newAddress,
    ) || currentWearers.includes(newAddress);

  const { writeAsync, isLoading } = useHatMint({
    hatsAddress: CONFIG.hatsAddress,
    chainId,
    hatId,
    newWearers: wearers.map((wearer) => wearer.address),
  });

  const onSubmit = async () => {
    await writeAsync?.();
  };

  const isNewWearerAddress = isNewAddress || ensResolvedAddress;
  const wouldExceedMaxSupply =
    currentWearers.length + wearers.length + 1 > maxSupply;
  const canAddWearer =
    isNewWearerAddress && !isAddressAlreadyAdded && !wouldExceedMaxSupply;

  const handleAddWearer = () => {
    const address = isNewAddress ? newWearer : ensResolvedAddress;
    setWearers([...wearers, { address, ens: isEnsAddress && newWearer }]);
    setNewAddress('');
  };

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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <Text color='gray.500'>
          Mint this hat to multiple addresses at once!
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
                value={newAddress}
                onChange={(e) =>
                  setNewAddress(e.target.value?.toLowerCase() ?? '')
                }
              />
              {ensResolvedAddress && (
                <InputRightElement right='2rem'>
                  <FaCheck color='green' />
                </InputRightElement>
              )}
            </InputGroup>
            <Tooltip
              label={
                !canAddWearer
                  ? !isNewWearerAddress
                    ? 'Please input a valid address'
                    : isAddressAlreadyAdded
                    ? 'Address already added'
                    : wouldExceedMaxSupply
                    ? 'Max supply would be exceeded'
                    : ''
                  : ''
              }
              shouldWrapChildren
            >
              <IconButton
                isDisabled={!canAddWearer}
                onClick={handleAddWearer}
                icon={<FaCheck />}
                aria-label='Add'
                w={16}
              />
            </Tooltip>
          </Flex>

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
          <Button
            type='submit'
            isDisabled={!writeAsync || isLoading || wearers.length === 0}
          >
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
