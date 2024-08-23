'use client';

import { Flex, Text } from '@chakra-ui/react';

const HatDeco = ({ height }: { height?: string | number }) => (
  <Flex minH={height || '150px'} justify='center' align='center'>
    <Text size='sm'>
      <span aria-label='Ball cap' role='img'>
        🧢
      </span>
      <span aria-label='Top hat' role='img'>
        🎩
      </span>
      <span aria-label='Hat with bow' role='img'>
        👒
      </span>
    </Text>
  </Flex>
);

export default HatDeco;
