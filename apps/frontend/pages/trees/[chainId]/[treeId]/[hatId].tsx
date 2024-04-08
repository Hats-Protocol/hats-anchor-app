import {
  SelectedHatContextProvider,
  TreeFormContextProvider,
  useOverlay,
} from 'contexts';
import { useHatParams, useMediaStyles } from 'hooks';
import { useRouter } from 'next/router';
import { HatDrawer } from 'pages';
import { useEffect } from 'react';
import { SupportedChains } from 'types';

const HatDetails = () => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const router = useRouter();
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
