import { Box, Button, FormControl, Text } from '@chakra-ui/react';
import { WriteContractResult } from '@wagmi/core';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';

import Input from '@/components/atoms/Input';

import ChakraNextLink from './atoms/ChakraNextLink';

type AddressInputProps = {
  name: string;
  label: string;
  docsLink: string;
  localForm: UseFormReturn<any>;
  showResolvedAddress: boolean;
  mutable: boolean | undefined;
  resolvedAddress: string;
  isDisabled: boolean;
  isLoading: boolean;
  writeAsync: (() => Promise<WriteContractResult>) | undefined;
};

const AddressInput: React.FC<AddressInputProps> = ({
  name,
  label,
  docsLink,

  localForm,
  showResolvedAddress,
  mutable,
  resolvedAddress,
  isDisabled,
  isLoading,
  writeAsync,
}) => (
  <FormControl>
    <Box>
      <Input
        name={name}
        label={label}
        tip={
          <Text size='xs' color='gray.500'>
            See{' '}
            <ChakraNextLink href={docsLink} decoration isExternal>
              docs.hatsprotocol.xyz
            </ChakraNextLink>{' '}
            for details
          </Text>
        }
        placeholder='Enter Wallet Address (0x…) or ENS (.eth)'
        rightElement={showResolvedAddress && <FaCheck color='green' />}
        localForm={localForm}
        isDisabled={!mutable}
      />
      {showResolvedAddress && (
        <Text fontSize='sm' color='gray.500' mt={1}>
          Resolved address: {resolvedAddress}
        </Text>
      )}
    </Box>
    <Button
      colorScheme='blue'
      isLoading={isLoading}
      isDisabled={isDisabled}
      onClick={() => writeAsync?.()}
      mt={4}
    >
      Update {label}
    </Button>
  </FormControl>
);

export default AddressInput;
