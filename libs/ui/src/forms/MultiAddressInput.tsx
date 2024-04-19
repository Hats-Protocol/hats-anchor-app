import {
  Box,
  Button,
  Flex,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input as ChakraInput,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BsPersonBadge } from 'react-icons/bs';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FormWearer } from 'types';
import { Hex, isAddress } from 'viem';
import { useEnsAddress } from 'wagmi';

import AddressInput from './AddressInput';

// TODO add upload input/dropzone here

const MultiAddressInput = ({
  name,
  localForm,
  label,
  subLabel,
  placeholder,
}: {
  name: string;
  localForm: UseFormReturn<any>;
  label?: string;
  subLabel?: string;
  placeholder?: string;
}) => {
  const { setValue, watch } = localForm;
  const [isCurrentInputAddress, setIsCurrentInputAddress] = useState(false);
  const currentInput = watch(`${name}-currentAddress`) as Hex | string;
  const addresses = watch(name, []);
  const localWearers: FormWearer[] = watch(`${name}-wearers`, []);
  const currentWearerList = _.map(
    localWearers,
    ({ address }: { address: Hex }) => _.toLower(address),
  ) as Hex[];

  const [currentResolvedAddress, setCurrentResolvedAddress] = useState<Hex>();

  const { data: ensResolvedAddress, isSuccess: isEnsAddress } = useEnsAddress({
    name: currentInput,
    chainId: 1,
    enabled: !!currentInput && currentInput.includes('.eth'),
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

  useEffect(() => {
    let currentAddresses = _.map(localWearers, 'address');

    if (
      currentResolvedAddress &&
      isAddress(currentResolvedAddress) &&
      !_.includes(currentAddresses, currentResolvedAddress)
    ) {
      currentAddresses = _.concat(currentAddresses, currentResolvedAddress);
    }

    if (!_.isEqual(_.sortBy(currentAddresses), _.sortBy(addresses))) {
      setValue(name, currentAddresses);
    }
  }, [addresses, currentResolvedAddress, localWearers, name, setValue]);

  const handleAddWearer = () => {
    const address = isCurrentInputAddress
      ? (currentInput as Hex)
      : (ensResolvedAddress as Hex);
    if (
      !address ||
      _.includes(
        _.map(localWearers, 'address'),
        _.toLower(currentResolvedAddress),
      )
    )
      return;
    const newLocalWearers = localWearers;
    newLocalWearers.push({
      address,
      ens: isEnsAddress ? currentInput : '',
    });
    setValue(`${name}-wearers`, newLocalWearers);
    setCurrentResolvedAddress(undefined);
    setValue(`${name}-currentAddress`, '');
  };

  const handleRemoveWearer = (index: number) => {
    const updatedWearers = localWearers.filter((__, i) => i !== index);
    setValue(`${name}-wearers`, updatedWearers);

    if (updatedWearers.length === 0) {
      setValue(name, []);
    }
  };

  return (
    <VStack borderRadius={8} alignItems='start' spacing={3} w='full'>
      {label && (
        <FormLabel mb={0}>
          <HStack>
            <Text size='sm' textTransform='uppercase'>
              {label}
            </Text>
          </HStack>
        </FormLabel>
      )}
      {localWearers.map(({ address, ens }, index) => (
        <Box key={address} w='full'>
          <Flex align='center' w='full' justifyContent='space-between'>
            <InputGroup flexGrow={1}>
              <InputLeftElement>
                <Icon as={BsPersonBadge} w={4} h={4} color='gray.500' />
              </InputLeftElement>
              <ChakraInput
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
        </Box>
      ))}
      <AddressInput
        name={`${name}-currentAddress`}
        localForm={localForm}
        showResolvedAddress={Boolean(currentResolvedAddress)}
        resolvedAddress={String(currentResolvedAddress)}
        placeholder={placeholder}
        subLabel={subLabel}
      />
      <Button
        onClick={handleAddWearer}
        aria-label='Add Another Wallet'
        isDisabled={
          !currentResolvedAddress ||
          _.includes(currentWearerList, _.toLower(currentResolvedAddress))
        }
        colorScheme='blue'
      >
        <HStack>
          <Icon as={BsPersonBadge} w={4} h={4} />
          <Text>Add Another Wallet</Text>
        </HStack>
      </Button>
    </VStack>
  );
};

export default MultiAddressInput;
