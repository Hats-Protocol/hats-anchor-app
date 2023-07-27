import { Box, Button } from '@chakra-ui/react';
import React from 'react';

import Input from '@/components/atoms/Input';

type MaxSupplyInputProps = {
  localForm: any;
  isTopHatOrMutable: boolean;
  isLoadingMaxSupply: boolean;
  isMaxSupplyDisabled: boolean;
};

const MaxSupplyInput: React.FC<MaxSupplyInputProps> = ({
  localForm,
  isTopHatOrMutable,
  isLoadingMaxSupply,
  isMaxSupplyDisabled,
}) => {
  return (
    <Box>
      <Input
        name='maxSupply'
        label='MAX SUPPLY'
        placeholder='10'
        isDisabled={!isTopHatOrMutable}
        localForm={localForm}
      />
      <Button
        colorScheme='blue'
        isLoading={isLoadingMaxSupply}
        isDisabled={isMaxSupplyDisabled}
        type='submit'
        mt={4}
      >
        Update Max Supply
      </Button>
    </Box>
  );
};

export default MaxSupplyInput;
