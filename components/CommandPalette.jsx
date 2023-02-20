/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
// TODO fix
import { useEffect, useState } from 'react';
import CmdkCommandPalette, {
  filterItems,
  getItemIndex,
  useHandleOpenCommandPalette,
} from 'react-cmdk';
import _ from 'lodash';
import { Flex, Spinner } from '@chakra-ui/react';
import 'react-cmdk/dist/cmdk.css';

import useSearchResults from '../hooks/useSearchResults';
import ChakraNextLink from './ChakraNextLink';
import { useOverlay } from '../contexts/OverlayContext';

const CommandPaletteInternalLink = ({ href, children }) => (
  <ChakraNextLink href={href}>
    <Flex w='100%' justify='space-between' p={2}>
      {children}
    </Flex>
  </ChakraNextLink>
);

let timeout = null;

const CommandPalette = () => {
  const [page] = useState('root');
  const { commandPallet: isOpen, setCommandPallet: setOpen } = useOverlay();
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState(null);
  const [localResults, setLocalResults] = useState(null);
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

  const setSearchTimeout = (value) => {
    clearTimeout(timeout);
    setSearch(value);

    timeout = setTimeout(() => {
      setServerSearch(value);
    }, 500);
  };

  const handleClose = () => {
    if (isOpen) {
      setOpen(false);
      setTimeout(() => {
        setServerSearch(null);
        setSearch('');
      }, 250);
    } else {
      setOpen(true);
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
                    <CommandPaletteInternalLink href={href}>
                      {children}
                    </CommandPaletteInternalLink>
                  )}
                  {...rest}
                />
              ))}
            </CmdkCommandPalette.List>
          ))
        ) : localResults ? (
          _.map(searchResults, (group) => (
            <CmdkCommandPalette.List key={group.id} heading={group.heading}>
              {_.map(_.get(group, 'items'), ({ id, ...rest }) => (
                <CmdkCommandPalette.ListItem
                  key={id}
                  index={getItemIndex(searchResults, id)}
                  renderLink={({ href, children }) => (
                    <CommandPaletteInternalLink href={href}>
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

      <CmdkCommandPalette.Page id='projects'>
        {/* Projects page */}
      </CmdkCommandPalette.Page>
    </CmdkCommandPalette>
  );
};

export default CommandPalette;
