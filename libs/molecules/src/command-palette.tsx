'use client';

import 'react-cmdk/dist/cmdk.css'; // TODO why isn't this being found?

import { useOverlay } from 'contexts';
import { useSearchResults } from 'hooks';
import { compact, get, map } from 'lodash';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import CmdkCommandPalette, { filterItems, getItemIndex, useHandleOpenCommandPalette } from 'react-cmdk';
import { FaSitemap } from 'react-icons/fa';
import { Group, SearchResults } from 'types';
import { Link, Skeleton } from 'ui';
import { chainsMap } from 'utils';
import { useAccount } from 'wagmi';

const CommandPaletteInternalLink = ({
  href,
  children,
  handleClose,
}: {
  href: string;
  children: React.ReactNode;
  handleClose?: () => void;
}) => (
  <Link href={href} onClick={handleClose}>
    <div className='flex w-full justify-between p-2'>{children}</div>
  </Link>
);

const CommandPalette = () => {
  const { address } = useAccount();
  const [page] = useState('root');
  const { commandPalette: isOpen, setCommandPalette: setOpen, recentlyVisitedTrees } = useOverlay();
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
      setLocalResults(
        searchData as {
          trees: SearchResults[];
          hats: SearchResults[];
        },
      );
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

  // masking this to handle tracking
  useHandleOpenCommandPalette(setOpen as Dispatch<SetStateAction<boolean>>);

  const searchResults = filterItems(
    [
      {
        heading: 'Trees',
        id: 'trees',
        items: get(localResults, 'trees', []),
      },
      {
        heading: 'Hats',
        id: 'hats',
        items: get(localResults, 'hats', []),
      },
    ],
    searchKey || '',
  );

  const filteredItems = filterItems(
    [
      {
        heading: 'Navigate',
        id: 'navigation',
        items: compact([
          {
            id: 'dashboard',
            children: 'Dashboard',
            icon: 'HomeIcon',
            href: '/',
          },
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

  // TODO should be filterable also
  const recentlyVisitedTreesItems = useMemo(
    () =>
      map(compact(recentlyVisitedTrees), ({ treeId, chainId }: { treeId: number; chainId: number }) => ({
        id: `recent-${treeId}-${chainId}`,
        children: `Tree #${treeId} on ${chainsMap(chainId)?.name}`,
        href: `/trees/${chainId}/${treeId}`,
        icon: FaSitemap,
      })),
    [recentlyVisitedTrees],
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
        {!isEmpty(recentlyVisitedTrees) && (
          <CmdkCommandPalette.List heading='Recently Visited Trees'>
            {map(recentlyVisitedTreesItems, ({ id, ...rest }: any, index: number) => (
              <CmdkCommandPalette.ListItem
                key={id}
                index={index}
                renderLink={({ href, children }) => (
                  <CommandPaletteInternalLink href={href ?? ''} handleClose={handleClose}>
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
                    <CommandPaletteInternalLink href={href ?? ''} handleClose={handleClose}>
                      {children}
                    </CommandPaletteInternalLink>
                  )}
                  {...rest}
                />
              ))}
            </CmdkCommandPalette.List>
          ))
        ) : localResults ? (
          map(searchResults, (group: Group) => (
            <CmdkCommandPalette.List key={group.id} heading={group.heading}>
              {map(get(group, 'items'), ({ id, ...rest }: { id: string }) => (
                <CmdkCommandPalette.ListItem
                  key={id}
                  index={getItemIndex(searchResults, id)}
                  renderLink={({ href, children }) => (
                    <CommandPaletteInternalLink href={href ?? ''} handleClose={handleClose}>
                      {children}
                    </CommandPaletteInternalLink>
                  )}
                  {...rest}
                />
              ))}
            </CmdkCommandPalette.List>
          ))
        ) : isValid ? (
          <div className='flex justify-center p-4'>
            <Skeleton className='h-10 w-10' />
          </div>
        ) : (
          <div className='flex justify-center p-4'>
            <div className='text-whiteAlpha-600 flex flex-col items-center'>
              <h3 className='text-whiteAlpha-700 text-xl'>Unsupported query!</h3>

              <div className='flex flex-col gap-1 text-center'>
                <p className='text-sm'>Try using the Hat or Tree ID to search</p>

                <p className='font-mono text-sm'>(e.g. 1, 3.1, 0x123..., 5674234...)</p>
              </div>
            </div>
          </div>
        )}
      </CmdkCommandPalette.Page>
    </CmdkCommandPalette>
  );
};

export { CommandPalette };
