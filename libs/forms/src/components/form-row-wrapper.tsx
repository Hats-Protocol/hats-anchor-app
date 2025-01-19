'use client';

import { HStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

const FormRowWrapper = ({ noMargin, children }: FormRowWrapperProps) => {
  return (
    <HStack ml={noMargin ? 0 : -6} alignItems='flex-start'>
      {children}
    </HStack>
  );
};

interface FormRowWrapperProps {
  noMargin?: boolean;
  children: ReactNode;
}

export { FormRowWrapper, type FormRowWrapperProps };
