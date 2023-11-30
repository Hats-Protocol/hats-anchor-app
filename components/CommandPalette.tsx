/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import 'react-cmdk/dist/cmdk.css';

import { Flex, Spinner } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import CmdkCommandPalette, {
  filterItems,
  getItemIndex,
  useHandleOpenCommandPalette,
} from 'react-cmdk';

import { Group, SearchResults } from '@/types';

import { useOverlay } from '../contexts/OverlayContext';
import useSearchResults from '../hooks/useSearchResults';
import ChakraNextLink from './atoms/ChakraNextLink';

const CommandPaletteInternalLink = ({
  href,
  setOpen,
  children,
}: {
  href: string;
  setOpen: (value: boolean) => void;
  children: React.ReactNode;
}) => (
  <ChakraNextLink href={href} onClick={() => setOpen(false)}>
    <Flex w='100%' justify='space-between' p={2}>
      {children}
    </Flex>
  </ChakraNextLink>
);

const CommandPalette = () => {
  const [page] = useState('root');
  const { commandPalette: isOpen, setCommandPalette: setOpen } = useOverlay();
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState<string | undefined>();
  const [localResults, setLocalResults] = useState<{
    trees: SearchResults[];
    hats: SearchResults[];
  } | null>(null);
  const { data: searchData } = useSearchResults({
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
        heading: 'Trees',
        id: 'trees',
        items: _.get(localResults, 'trees', []),
      },
      {
        heading: 'Hats',
        id: 'hats',
        items: _.get(localResults, 'hats', []),
      },
    ],
    search,
  );

  const filteredItems = filterItems(
    [
      {
        heading: 'Navigate',
        id: 'navigation',
        items: [
          {
            id: 'dashboard',
            children: 'Dashboard',
            icon: 'HomeIcon',
            href: '/',
          },
        ],
      },
    ],
    search,
  );

  return (
    <CmdkCommandPalette
      onChangeSearch={setSearchTimeout}
      onChangeOpen={handleClose}
      search={search}
      isOpen={isOpen}
      page={page}
    >
      <CmdkCommandPalette.Page id='root'>
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
                      setOpen={setOpen}
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
              {_.map(_.get(group, 'items'), ({ id, ...rest }: { id: any }) => (
                <CmdkCommandPalette.ListItem
                  key={id}
                  index={getItemIndex(searchResults, id)}
                  renderLink={({ href, children }) => (
                    <CommandPaletteInternalLink
                      href={href ?? ''}
                      setOpen={setOpen}
                    >
                      {children}
                    </CommandPaletteInternalLink>
                  )}
                  {...rest}
                />
              ))}
            </CmdkCommandPalette.List>
          ))
        ) : (
          <Flex justify='center' p={4}>
            <Spinner />
          </Flex>
        )}
      </CmdkCommandPalette.Page>
    </CmdkCommandPalette>
  );
};

export default CommandPalette;
