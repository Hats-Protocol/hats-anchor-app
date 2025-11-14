'use client';

import { CONFIG } from '@hatsprotocol/config';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { capitalize, get, includes, isNaN, keys, map, startsWith } from 'lodash';
import { usePathname } from 'next/navigation';
import { Button, cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Link } from 'ui';
import { containsUpperCase, getPathParams } from 'utils';
import { useAccount, useChainId } from 'wagmi';

const DEV_PAGES = {
  subgraphs: {
    link: '/subgraphs',
    label: 'Subgraphs',
  },
  chain: {
    link: '/buidl/chain',
    label: 'Chain Module Deploy',
  },
  active: {
    link: '/buidl/active',
    label: 'Deactivate Hats',
  },
};

const NavLinks = () => {
  const pathname = usePathname();
  const currentChainId = useChainId();
  const { address } = useAccount();
  const { chainId, treeId } = getPathParams(pathname);
  // ! breaks chainId on wearer page

  // Get the top hat name
  const { data: topHat, details } = useHatDetails({
    hatId: treeId && !isNaN(treeId) ? hatIdDecimalToHex(treeIdToTopHatId(treeId)) : undefined,
    chainId,
  });
  const textDetails = !startsWith(get(topHat, 'details'), 'ipfs://') ? get(topHat, 'details') : undefined;
  const tabName = get(details, 'name', textDetails);

  const devMode = false || process.env.NODE_ENV !== 'production';

  return (
    <>
      <Link href={`/${CONFIG.TERMS.trees}/${treeId ? chainId : currentChainId || 1}`} className='h-full'>
        <Button
          className={cn(
            'text-foreground/80 hover:text-foreground/80 hover:bg-functional-link-primary/10 min-h-full min-w-40 max-w-80 rounded-none bg-transparent px-6 hover:no-underline',
            includes(pathname, 'trees') && 'bg-functional-link-primary/10 border-b-2 border-black/80',
          )}
          variant='link'
        >
          {!tabName ? (
            <p className='text-lg font-medium'>{capitalize(CONFIG.TERMS.trees)}</p>
          ) : (
            <div className='flex flex-col items-start gap-2 px-8'>
              <p className='text-sm uppercase'>{CONFIG.TERMS.trees}</p>
              <p className='text-lg font-medium'>{containsUpperCase(tabName) ? tabName : capitalize(tabName)}</p>
            </div>
          )}
        </Button>
      </Link>

      {address && (
        <Link href={`/${CONFIG.TERMS.wearers}/${address}`} className='h-full'>
          <Button
            className={cn(
              'text-foreground/80 hover:text-foreground/80 hover:bg-functional-link-primary/10 min-h-full min-w-40 max-w-60 rounded-none bg-transparent hover:no-underline',
              includes(pathname, 'wearers') && 'bg-functional-link-primary/10 border-b-2 border-black/80',
            )}
            variant='link'
          >
            <p className='text-lg font-medium'>{`My ${capitalize(CONFIG.TERMS.hats)}`}</p>
          </Button>
        </Link>
      )}

      {devMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='link' className='text-foreground/80'>
              Dev
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='start'>
            {map(keys(DEV_PAGES), (page) => (
              <Link href={DEV_PAGES[page as keyof typeof DEV_PAGES].link} className='text-foreground/80' key={page}>
                <DropdownMenuItem>{DEV_PAGES[page as keyof typeof DEV_PAGES].label}</DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export { NavLinks };
