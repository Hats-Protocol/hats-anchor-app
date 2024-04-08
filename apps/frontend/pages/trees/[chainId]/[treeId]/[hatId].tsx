import {
  SelectedHatContextProvider,
  TreeFormContextProvider,
  useOverlay,
} from 'contexts';
import { useHatParams, useMediaStyles, useRudderStackAnalytics } from 'hooks';
import { useRouter } from 'next/router';
import { HatDrawer } from 'pages';
import { useEffect } from 'react';
import { SupportedChains } from 'types';
import { useAccount } from 'wagmi';

const HatDetails = () => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const router = useRouter();
  const { address } = useAccount();
  const analytics = useRudderStackAnalytics();
  const { isClient, isMobile } = useMediaStyles();

  const { selectedHatId: hatId, chainId, treeId } = useHatParams();

  useEffect(() => {
    if (!treeId || !chainId) return;

    updateRecentlyVisitedTrees({
      treeId,
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId]);

  useEffect(() => {
    if (analytics && chainId && treeId && hatId) {
      analytics.page('Auto Track', 'Hat Page', {
        chainId,
        treeId,
        hatId,
        isConnected: !!address,
        anonymousId: address || analytics.getAnonymousId(),
      });
    }
  }, [analytics, chainId, treeId, hatId, address]);

  if (!treeId || !chainId) return null; // chainId === '0x' hopefully this issue is resolved

  if (typeof isMobile !== 'undefined' && !isMobile) {
    router.push(`/trees/${chainId}/${treeId}?hatId=${hatId}`);
  }

  return (
    <TreeFormContextProvider
      treeId={treeId}
      chainId={chainId as SupportedChains}
    >
      <SelectedHatContextProvider
        treeId={treeId}
        chainId={chainId as SupportedChains}
        hatId={hatId}
      >
        {isClient && <HatDrawer />}
      </SelectedHatContextProvider>
    </TreeFormContextProvider>
  );
};

export default HatDetails;
