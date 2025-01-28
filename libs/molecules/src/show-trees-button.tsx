'use client';

import { CONFIG } from '@hatsprotocol/config';
import { SHOW_KEY } from '@hatsprotocol/constants';
import { useSearchParams } from 'next/navigation';
import { LinkButton } from 'ui';
import { useAccount } from 'wagmi';

const ShowTreesButton = ({ chainId }: { chainId: number }) => {
  const queryParams = useSearchParams();
  const showKey = queryParams.get('show');

  const { address } = useAccount();

  if (!address) return null;

  return (
    <LinkButton
      href={showKey === SHOW_KEY.me || !showKey ? `/trees/${chainId}?show=all` : `/trees/${chainId}?show=me`}
      variant='outline-blue'
    >
      Show {showKey === SHOW_KEY.all && address ? 'my' : 'all'}
      <span className='hidden md:inline'> {CONFIG.TERMS.trees}</span>
    </LinkButton>
  );
};

export { ShowTreesButton };
