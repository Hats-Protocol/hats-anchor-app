import { hatIdDecimalToHex, hatIdIpToDecimal } from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider, useOverlay } from 'contexts';
import { useMediaStyles, useRudderStackAnalytics } from 'hooks';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { TreePage, TreePageMobile } from 'pages';
import { useEffect } from 'react';
import { SupportedChains } from 'types';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

const TreeDetails = ({ treeId, chainId, hatId, exists }: TreeDetailsProps) => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const { address } = useAccount();
  const analytics = useRudderStackAnalytics();
  const { isMobile } = useMediaStyles();
  const router = useRouter();

  useEffect(() => {
    if (!treeId || !chainId) return;

    // attempt to redirect to mobile tree page
    if (hatId && isMobile) {
      router.push(`/trees/${chainId}/${treeId}/${hatId}`);
    }

    updateRecentlyVisitedTrees({
      treeId,
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId, isMobile]);

  useEffect(() => {
    if (analytics && treeId && chainId) {
      analytics.page('Auto Track', 'Tree Page', {
        chainId,
        treeId,
        hatId,
        isConnected: !!address,
        anonymousId: address || analytics.getAnonymousId(),
      });
    }
  }, [analytics, treeId, hatId, chainId, address]);

  return (
    <TreeFormContextProvider treeId={treeId} chainId={chainId}>
      {isMobile ? (
        <TreePageMobile exists={exists} />
      ) : (
        <TreePage exists={exists} hatId={hatId} />
      )}
    </TreeFormContextProvider>
  );
};

const defaultProps = {
  treeId: null,
  chainId: null,
};

const getQueryParams = (context: GetServerSidePropsContext) => {
  const {
    treeId: treeIdParam,
    chainId: chainIdParam,
    hatId: hatIdParam,
  } = _.pick(_.get(context, 'query'), ['treeId', 'chainId', 'hatId']);
  const localTreeId = _.isArray(treeIdParam)
    ? _.first(treeIdParam)
    : treeIdParam;
  const treeId = localTreeId ? _.toNumber(localTreeId) : null;
  const chainId = _.isArray(chainIdParam)
    ? _.toNumber(_.first(chainIdParam))
    : _.toNumber(chainIdParam) || null;
  const hatId = hatIdParam
    ? hatIdDecimalToHex(hatIdIpToDecimal(hatIdParam))
    : null;

  return { treeId, chainId, hatId };
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { treeId, chainId, hatId } = getQueryParams(context);

  return {
    props: {
      ...defaultProps,
      treeId,
      hatId,
      chainId,
    },
  };
};

export default TreeDetails;

interface TreeDetailsProps {
  treeId: number;
  chainId: SupportedChains;
  hatId: Hex;
  exists: boolean;
}
