/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import 'react-cmdk/dist/cmdk.css';

import { Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { useSearchResults } from 'app-hooks';
import { chainsMap } from 'app-utils';
import { Group, SearchResults } from 'hats-types';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import CmdkCommandPalette, {
  filterItems,
  getItemIndex,
  useHandleOpenCommandPalette,
} from 'react-cmdk';
import { FaSitemap } from 'react-icons/fa';
import { idToIp } from 'shared';
import { ChakraNextLink } from 'ui';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { useOverlay } from '../contexts/OverlayContext';

const CommandPaletteInternalLink = ({
  href,
  children,
  handleClose,
}: {
  href: string;
  children: React.ReactNode;
  handleClose?: () => void;
}) => (
  <ChakraNextLink href={href} onClick={handleClose}>
    <Flex w='100%' justify='space-between' p={2}>
      {children}
    </Flex>
  </ChakraNextLink>
);

const CommandPalette = () => {
  const { address } = useAccount();
  const [page] = useState('root');
  const {
    commandPalette: isOpen,
    setCommandPalette: setOpen,
    recentlyVisitedHats,
  } = useOverlay();
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState<string | undefined>();
  const [localResults, setLocalResults] = useState<{
    trees: SearchResults[];
    hats: SearchResults[];
  } | null>(null);
  const {
    data: searchData,
    searchKey,
    isValid,
  } = useSearchResults({
    search: serverSearch,
  });

  useEffect(() => {
    if (serverSearch && searchData) {
      setLocalResults(searchData);
    } else {
      setLocalResults(null);
    }
  }, [serverSearch, searchData]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchTimeout = (value: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSearch(value);

    timeoutRef.current = setTimeout(() => {
      setServerSearch(value);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClose = () => {
    if (isOpen) {
      setOpen?.(false);
      setTimeout(() => {
        setServerSearch(undefined);
        setSearch('');
      }, 250);
    } else {
      setOpen?.(true);
    }
  };

  useHandleOpenCommandPalette(setOpen);

  const searchResults = filterItems(
    [
      {
        heading: 'Hats',
        id: 'hats',
        items: _.get(localResults, 'hats', []),
      },
    ],
    searchKey || '',
  );

  const filteredItems = filterItems(
    [
      {
        heading: 'Navigate',
        id: 'navigation',
        items: _.compact([
          address && {
            id: 'wearer',
            children: 'My Hats',
            icon: 'UserIcon',
            href: `/wearers/${address}`,
          },
        ]),
      },
    ],
    searchKey || '',
  );

  const recentlyVisitedHatsItems = useMemo(
    () =>
      _.map(
        _.compact(recentlyVisitedHats),
        ({ hatId, chainId }: { hatId: Hex; chainId: number }) => ({
          id: `recent-${hatId}-${chainId}`,
          children: `Hat #${idToIp(hatId)} on ${chainsMap(chainId)?.name}`,
          href: `/${chainId}/${hatId}`,
          icon: FaSitemap,
        }),
      ),
    [recentlyVisitedHats],
  );

  return (
    <CmdkCommandPalette
      placeholder='Search by Hat ID or Tree ID (e.g. 1, 3.1, 0x123..., 5674234...)'
      onChangeSearch={setSearchTimeout}
      onChangeOpen={handleClose}
      search={search}
      isOpen={isOpen}
      page={page}
    >
      <CmdkCommandPalette.Page id='root'>
        {!_.isEmpty(recentlyVisitedHats) && (
          <CmdkCommandPalette.List heading='Recently Visited Hats'>
            {_.map(recentlyVisitedHatsItems, ({ id, ...rest }, index) => (
              <CmdkCommandPalette.ListItem
                key={id}
                index={index}
                renderLink={({ href, children }) => (
                  <CommandPaletteInternalLink
                    href={href ?? ''}
                    handleClose={handleClose}
                  >
                    {children}
                  </CommandPaletteInternalLink>
                )}
                {...rest}
              />
            ))}
          </CmdkCommandPalette.List>
        )}
        {filteredItems.length ? (
          filteredItems.map((list) => (
            <CmdkCommandPalette.List key={list.id} heading={list.heading}>
              {list.items.map(({ id, ...rest }) => (
                <CmdkCommandPalette.ListItem
                  key={id}
                  index={getItemIndex(filteredItems, id)}
                  renderLink={({ href, children }) => (
                    <CommandPaletteInternalLink
                      href={href ?? ''}
                      handleClose={handleClose}
                    >
                      {children}
                    </CommandPaletteInternalLink>
                  )}
                  {...rest}
                />
              ))}
            </CmdkCommandPalette.List>
          ))
        ) : localResults ? (
          _.map(searchResults, (group: Group) => (
            <CmdkCommandPalette.List key={group.id} heading={group.heading}>
              {_.map(
                _.get(group, 'items'),
                ({ id, ...rest }: { id: string }) => (
                  <CmdkCommandPalette.ListItem
                    key={id}
                    index={getItemIndex(searchResults, id)}
                    renderLink={({ href, children }) => (
                      <CommandPaletteInternalLink
                        href={href ?? ''}
                        handleClose={handleClose}
                      >
                        {children}
                      </CommandPaletteInternalLink>
                    )}
                    {...rest}
                  />
                ),
              )}
            </CmdkCommandPalette.List>
          ))
        ) : isValid ? (
          <Flex justify='center' p={4}>
            <Spinner />
          </Flex>
        ) : (
          <Flex justify='center' p={4}>
            <Stack align='center' color='whiteAlpha.600'>
              <Text fontSize='xl' fontWeight={700} color='whiteAlpha.700'>
                Unsupported query!
              </Text>
              <Stack spacing='2px' textAlign='center'>
                <Text fontSize='sm'>
                  Try using the Hat or Tree ID to search
                </Text>
                <Text fontSize='sm' fontFamily='monospace'>
                  (e.g. 1, 3.1, 0x123..., 5674234...)
                </Text>
              </Stack>
            </Stack>
          </Flex>
        )}
      </CmdkCommandPalette.Page>
    </CmdkCommandPalette>
  );
};

export default CommandPalette;
