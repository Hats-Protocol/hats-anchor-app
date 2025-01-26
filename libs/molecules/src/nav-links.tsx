'use client';

import { CONFIG } from '@hatsprotocol/config';
import { hatIdDecimalToHex, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { capitalize, get, includes, isNaN, startsWith, toLower } from 'lodash';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { Button, DropdownMenu, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger, Link } from 'ui';
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
    hatId: treeId && !isNaN(treeId) ? hatIdDecimalToHex(treeIdToTopHatId(treeId)) : undefined,
    chainId,
  });
  const textDetails = !startsWith(get(topHat, 'details'), 'ipfs://') ? get(topHat, 'details') : undefined;
  const tabName = get(details, 'name', textDetails);

  const devMode = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV === 'development';

  return (
    <>
      <Link href={`/${CONFIG.TERMS.trees}/${treeId ? chainId : currentChainId || 1}`}>
        <Button
          className='h-16 min-w-40 max-w-60 rounded-none bg-transparent active:border-b-2 active:bg-gray-100'
          data-active={includes(pathname, CONFIG.TERMS.trees)}
        >
          {!tabName ? (
            <p className='text-lg'>{capitalize(CONFIG.TERMS.trees)}</p>
          ) : (
            <div className='flex flex-col gap-2'>
              <p className='text-sm uppercase'>{CONFIG.TERMS.trees}</p>
              <p className='text-lg'>{containsUpperCase(tabName) ? tabName : capitalize(tabName)}</p>
            </div>
          )}
        </Button>
      </Link>

      {address && (
        <Link href={`/${CONFIG.TERMS.wearers}/${address}`}>
          <Button
            className='h-16 min-w-40 max-w-60 rounded-none bg-transparent active:border-b-2 active:bg-gray-100'
            data-active={includes(toLower(pathname), toLower(address))}
          >
            {`My ${capitalize(CONFIG.TERMS.hats)}`}
          </Button>
        </Link>
      )}

      {devMode && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button>Dev</Button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuItem asChild>
              <Link href='/subgraphs'>Subgraphs</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href='/buidl/chain'>
                <p>Chain Module Deploy</p>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href='/buidl/active'>
                <p>Deactivate Hats</p>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuPortal>
        </DropdownMenu>
      )}
    </>
  );
};

export { NavLinks };
