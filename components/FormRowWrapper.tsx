import { HStack } from '@chakra-ui/react';

const FormRowWrapper = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <HStack ml={-6} alignItems='baseline'>
      {children}
    </HStack>
  );
};

export default FormRowWrapper;
