'use client';

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CONFIG } from '@hatsprotocol/constants';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { capitalize, get, includes, isNaN, startsWith, toLower } from 'lodash';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { ChakraNextLink } from 'ui';
import { containsUpperCase, getPathParams } from 'utils';
import { useAccount, useChainId } from 'wagmi';

const NavLinks = () => {
  const pathname = usePathname();
  const currentChainId = useChainId();
  const { address } = useAccount();
  const { chainId, treeId } = getPathParams(pathname);
  // ! breaks chainId on wearer page

  // Get the top hat name
  const { data: topHat, details } = useHatDetails({
    hatId:
      treeId && !isNaN(treeId)
        ? hatIdDecimalToHex(treeIdToTopHatId(treeId))
        : undefined,
    chainId,
  });
  const textDetails = !startsWith(get(topHat, 'details'), 'ipfs://')
    ? get(topHat, 'details')
    : undefined;
  const tabName = get(details, 'name', textDetails);

  const devMode =
    posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  return (
    <>
      <ChakraNextLink
        href={`/${CONFIG.TERMS.trees}/${treeId ? chainId : currentChainId || 1}`}
      >
        <Button
          h='75px'
          minW='125px'
          maxW='200px'
          borderRadius={0}
          background='transparent'
          _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
          isActive={includes(pathname, CONFIG.TERMS.trees)}
        >
          {!tabName ? (
            <Text size='lg'>{capitalize(CONFIG.TERMS.trees)}</Text>
          ) : (
            <Stack align='start' w='90%' mx={2}>
              <Text size='sm' textTransform='uppercase'>
                {CONFIG.TERMS.trees}
              </Text>
              <Text size='lg' variant='gray' maxW='170px' isTruncated>
                {containsUpperCase(tabName) ? tabName : capitalize(tabName)}
              </Text>
            </Stack>
          )}
        </Button>
      </ChakraNextLink>

      {address && (
        <ChakraNextLink href={`/${CONFIG.TERMS.wearers}/${address}`}>
          <Button
            h='75px'
            minW='125px'
            borderRadius={0}
            fontSize='lg'
            background='transparent'
            _active={{ borderBottom: '2px solid', bg: 'gray.100' }}
            isActive={includes(toLower(pathname), toLower(address))}
          >
            {`My ${capitalize(CONFIG.TERMS.hats)}`}
          </Button>
        </ChakraNextLink>
      )}

      {devMode && (
        <Menu>
          <MenuButton>Dev</MenuButton>
          <MenuList>
            <Link href='/subgraphs' passHref>
              <MenuItem>Subgraphs</MenuItem>
            </Link>

            <Link href='/buidl/chain' passHref>
              <MenuItem>Chain Module Deploy</MenuItem>
            </Link>

            <Link href='/buidl/active' passHref>
              <MenuItem>Deactivate Hats</MenuItem>
            </Link>
          </MenuList>
        </Menu>
      )}
    </>
  );
};

export default NavLinks;
