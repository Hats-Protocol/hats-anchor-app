'use client';

import { Flex, Text } from '@chakra-ui/react';

const HatDeco = ({
  height,
  hideOnDesktop,
}: {
  height?: string | number;
  hideOnDesktop?: boolean;
}) => (
  <Flex
    minH={height || '150px'}
    justify='center'
    align='center'
    display={{ base: 'flex', md: hideOnDesktop ? 'none' : 'flex' }}
  >
    <Text size={{ base: 'sm', md: 'md' }}>
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
