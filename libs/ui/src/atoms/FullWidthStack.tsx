'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { Stack, StackProps } from '@chakra-ui/react';

interface FullWidthStackProps extends StackProps {
  children: React.ReactNode;
}

const FullWidthStack = ({ children, ...props }: FullWidthStackProps) => {
  return (
    <Stack width='100%' {...props}>
      {children}
    </Stack>
  );
};

export default FullWidthStack;
