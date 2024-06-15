import {
  hatIdDecimalToHex,
  hatIdDecimalToIp,
  hatIdIpToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider, useOverlay } from 'contexts';
import { useMediaStyles } from 'hooks';
import { useRouter } from 'next/router';
import { TreePage, TreePageMobile } from 'pages';
import { useEffect } from 'react';
import { SupportedChains } from 'types';

const TreeDetails = () => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const { isMobile } = useMediaStyles();
  const router = useRouter();

  const treeId = Number(router.query.treeId as string);
  const chainId = Number(router.query.chainId as string) as SupportedChains;
  const hatId = router.query.hatId
    ? hatIdDecimalToHex(hatIdIpToDecimal(router.query.hatId as string))
    : null;

  const exists = true;

  useEffect(() => {
    if (!treeId || !chainId) return;

    // attempt to redirect to mobile tree page
    if (hatId && isMobile) {
      router.push(
        `/trees/${chainId}/${treeId}/${hatIdDecimalToIp(BigInt(hatId))}`,
      );
    }

    updateRecentlyVisitedTrees({
      treeId,
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId, isMobile]);

  return (
    <TreeFormContextProvider
      treeId={treeId}
      chainId={chainId}
      hatId={hatId || undefined}
    >
      {isMobile ? (
        <TreePageMobile exists={exists} />
      ) : (
        <TreePage exists={exists} hatId={hatId || undefined} />
      )}
    </TreeFormContextProvider>
  );
};

export default TreeDetails;
