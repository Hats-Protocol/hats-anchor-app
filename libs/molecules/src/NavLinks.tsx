'use client';

import { Button, Stack, Text } from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import _ from 'lodash';
import { usePathname } from 'next/navigation';
import { ChakraNextLink } from 'ui';
import { containsUpperCase, getPathParams } from 'utils';
import { useAccount, useChainId } from 'wagmi';

const NavLinks = () => {
  const pathname = usePathname();
  const currentChainId = useChainId();
  const { address } = useAccount();
  const { wearer, chainId, treeId } = getPathParams(pathname);
  // ! breaks chainId on wearer page

  // Get the top hat name
  const { data: topHat, details } = useHatDetails({
    hatId: treeId ? hatIdDecimalToHex(treeIdToTopHatId(treeId)) : undefined,
    chainId,
  });
  const textDetails = !_.startsWith(_.get(topHat, 'details'), 'ipfs://')
    ? _.get(topHat, 'details')
    : undefined;
  const tabName = _.get(details, 'name', textDetails);

  return (
    <>
      <ChakraNextLink
        href={`/${CONFIG.trees}/${
          wearer ? currentChainId : chainId || currentChainId || 1
        }`}
      >
        <Button
          h='75px'
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

      {address && (
        <ChakraNextLink href={`/${CONFIG.wearers}/${address}`}>
          <Button
            h='75px'
            minW='125px'
            variant='ghost'
            borderRadius={0}
            fontSize='lg'
            _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
            isActive={_.includes(_.toLower(pathname), _.toLower(address))}
          >
            {`My ${_.capitalize(CONFIG.hats)}`}
          </Button>
        </ChakraNextLink>
      )}
    </>
  );
};

export default NavLinks;
