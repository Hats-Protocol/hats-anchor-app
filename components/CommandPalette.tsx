/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import 'react-cmdk/dist/cmdk.css';

import { Flex, Spinner } from '@chakra-ui/react';
import _ from 'lodash';
import { ReactNode, useEffect, useState } from 'react';
import CmdkCommandPalette, {
  filterItems,
  getItemIndex,
  useHandleOpenCommandPalette,
} from 'react-cmdk';

import ChakraNextLink from '@/components/atoms/ChakraNextLink';
import { useOverlay } from '@/contexts/OverlayContext';
import useSearchResults from '@/hooks/useSearchResults';
import { decimalIdToId, idToPrettyId, prettyIdToIp } from '@/lib/hats';

const CommandPaletteInternalLink = ({
  href,
  children,
  closePalette,
}: {
  href: string;
  children: ReactNode;
  closePalette: () => void;
}) => (
  <ChakraNextLink href={href} onClick={closePalette}>
    <Flex w='100%' justify='space-between' p={2}>
      {children}
    </Flex>
  </ChakraNextLink>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let timeout: any = null;

const CommandPalette = () => {
  const [page] = useState('root');
  const { commandPallet: isOpen, setCommandPallet: setOpen } = useOverlay();
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState<string | undefined>(
    undefined,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localResults, setLocalResults] = useState<any>({
    trees: [],
    hats: [],
  });
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

  const setSearchTimeout = (value: string) => {
    clearTimeout(timeout);
    setSearch(value);

    timeout = setTimeout(() => {
      setServerSearch(value);
    }, 500);
  };

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  useHandleOpenCommandPalette(setOpen);

  const searchResults = _.concat(
    filterItems(
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
    ),
    search.includes('0x')
      ? filterItems(
          [
            {
              heading: 'Hats',
              id: 'hats-pretty',
              items: _.get(localResults, 'hats', []),
            },
          ],
          prettyIdToIp(search),
        )
      : [],
    !search.includes('.')
      ? filterItems(
          [
            {
              heading: 'Hats',
              id: 'hats-decimal',
              items: _.get(localResults, 'hats', []),
            },
          ],
          prettyIdToIp(idToPrettyId(decimalIdToId(Number(search)))),
        )
      : [],
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
      placeholder='Pretty ID (0x0000001), IP ID (1.4.3) or Decimal ID (23124...)'
      onChangeSearch={setSearchTimeout}
      onChangeOpen={handleClose}
      search={search}
      isOpen={isOpen || false}
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
                      href={href as string}
                      closePalette={handleClose}
                    >
                      {children}
                    </CommandPaletteInternalLink>
                  )}
                  {...rest}
                />
              ))}
            </CmdkCommandPalette.List>
          ))
        ) : searchResults ? (
          _.map(searchResults, (group) => (
            <CmdkCommandPalette.List key={group.id} heading={group.heading}>
              {_.map(_.get(group, 'items'), ({ id, ...rest }) => (
                <CmdkCommandPalette.ListItem
                  key={id}
                  index={getItemIndex(searchResults, id)}
                  renderLink={({ href, children }) => (
                    <CommandPaletteInternalLink
                      href={href as string}
                      closePalette={handleClose}
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

      <CmdkCommandPalette.Page id='projects'>
        {/* Projects page */}
      </CmdkCommandPalette.Page>
    </CmdkCommandPalette>
  );
};

export default CommandPalette;
