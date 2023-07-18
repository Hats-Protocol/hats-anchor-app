import { Box, Button, HStack, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { WriteContractResult } from '@wagmi/core';
import React from 'react';

import { MUTABILITY } from '@/constants';

type MutabilityInputProps = {
  mutable: boolean | undefined;
  isLoadingImmutable: boolean;
  writeAsyncImmutable: (() => Promise<WriteContractResult>) | undefined;
  onChange: (value: string) => void;
  isMutableDisabled: boolean;
};

const MutabilityInput: React.FC<MutabilityInputProps> = ({
  mutable,
  isLoadingImmutable,
  writeAsyncImmutable,
  onChange,
  isMutableDisabled,
}) => {
  return (
    <Box>
      <Text fontWeight={500} mb={2}>
        MUTABILITY
      </Text>
      <RadioGroup
        name='mutable'
        defaultValue={mutable ? MUTABILITY.MUTABLE : MUTABILITY.IMMUTABLE}
        onChange={onChange}
        isDisabled={!mutable}
      >
        <HStack spacing={4}>
          <Radio value={MUTABILITY.MUTABLE}>Mutable</Radio>
          <Radio value={MUTABILITY.IMMUTABLE}>Immutable</Radio>
        </HStack>
      </RadioGroup>
      <Button
        colorScheme='blue'
        isLoading={isLoadingImmutable}
        isDisabled={isMutableDisabled}
        onClick={() => writeAsyncImmutable?.()}
        mt={4}
      >
        Update Mutability
      </Button>
    </Box>
  );
};

export default MutabilityInput;
