'use client';

import { CONFIG } from '@hatsprotocol/config';
import { SHOW_KEY } from '@hatsprotocol/constants';
import { capitalize } from 'lodash';
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
      {showKey === SHOW_KEY.all && address ? 'My' : 'All'} {capitalize(CONFIG.TERMS.trees)}
    </LinkButton>
  );
};

export { ShowTreesButton };
