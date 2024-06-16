'use client';

import { Button, Stack, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { containsUpperCase } from 'utils';

import { ChakraNextLink } from '../atoms';

const TreeLink = ({
  tabName,
  chainId,
}: {
  tabName: string;
  chainId?: number;
}) => {
  const pathname = usePathname();

  return (
    <ChakraNextLink href={`/${CONFIG.trees}/${chainId || 1}`}>
      <Button
        h='80px'
        minW='125px'
        maxW='200px'
        variant='ghost'
        borderRadius={0}
        _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
        isActive={_.includes(pathname, CONFIG.trees)}
      >
        {!tabName ? (
          <Text size='lg'>{_.capitalize(CONFIG.trees)}</Text>
        ) : (
          <Stack align='start' w='90%' mx={2}>
            <Text size='sm' textTransform='uppercase'>
              {CONFIG.trees}
            </Text>
            <Text size='lg' variant='gray' maxW='170px' isTruncated>
              {containsUpperCase(tabName) ? tabName : _.capitalize(tabName)}
            </Text>
          </Stack>
        )}
      </Button>
    </ChakraNextLink>
  );
};

export default TreeLink;
