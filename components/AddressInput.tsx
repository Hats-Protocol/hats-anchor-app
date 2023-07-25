import { Box, FormControl, Text } from '@chakra-ui/react';
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
  isDisabled: boolean;
  resolvedAddress: string;
};

const AddressInput: React.FC<AddressInputProps> = ({
  name,
  label,
  docsLink,

  localForm,
  showResolvedAddress,
  isDisabled,
  resolvedAddress,
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
        isDisabled={isDisabled}
      />
      {showResolvedAddress && (
        <Text fontSize='sm' color='gray.500' mt={1}>
          Resolved address: {resolvedAddress}
        </Text>
      )}
    </Box>
  </FormControl>
);

export default AddressInput;
