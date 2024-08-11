'use client';

import { HStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

const FormRowWrapper = ({
  noMargin,
  children,
}: {
  noMargin?: boolean;
  children: ReactNode;
}) => {
  return (
    <HStack ml={noMargin ? 0 : -6} alignItems='flex-start'>
      {children}
    </HStack>
  );
};

export default FormRowWrapper;
