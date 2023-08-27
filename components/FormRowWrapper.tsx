import { HStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

const FormRowWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <HStack ml={-6} alignItems='baseline'>
      {children}
    </HStack>
  );
};

export default FormRowWrapper;
