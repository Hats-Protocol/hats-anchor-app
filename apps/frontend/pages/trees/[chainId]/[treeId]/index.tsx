import {
  treeIdDecimalToHex,
  treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider, useOverlay } from 'contexts';
import { SupportedChains } from 'hats-types';
import { useMediaStyles } from 'hooks';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import { TreePage, TreePageMobile } from 'pages';
import { useEffect } from 'react';
import { Hex, hexToNumber } from 'viem';

const TreeDetails = ({ treeId, chainId, exists }: TreeDetailsProps) => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  const { isMobile } = useMediaStyles();
  const router = useRouter();
  const { hatId: hatIdParam } = router.query;
  let hatId: string | undefined;
  if (_.isArray(hatIdParam)) {
    hatId = _.first(hatIdParam);
  } else {
    hatId = hatIdParam as string;
  }

  useEffect(() => {
    if (!treeId || !chainId) return;

    if (hatId && isMobile) {
      router.push(`/trees/${chainId}/${hexToNumber(treeId)}/${hatId}`);
    }

    updateRecentlyVisitedTrees({
      treeId: treeIdHexToDecimal(treeId),
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId]);

  return (
    <TreeFormContextProvider treeId={treeId} chainId={chainId}>
      {isMobile ? (
        <TreePageMobile exists={exists} />
      ) : (
        <TreePage exists={exists} />
      )}
    </TreeFormContextProvider>
  );
};

const defaultProps = {
  treeId: null,
  chainId: null,
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const treeIdParam = _.get(context, 'params.treeId');
  const chainIdParam = _.get(context, 'params.chainId');
  const treeId = _.isArray(treeIdParam) ? _.first(treeIdParam) : treeIdParam;
  const chainId = _.isArray(chainIdParam)
    ? _.toNumber(_.first(chainIdParam))
    : _.toNumber(chainIdParam);

  if (!treeId || treeId === 'undefined' || !chainId) {
    return { props: defaultProps };
  }
  const treeHex = treeIdDecimalToHex(_.toNumber(treeId));

  return {
    props: {
      ...defaultProps,
      treeId: treeHex,
      chainId: _.toNumber(chainId),
    },
    revalidate: 5,
  };
};

export const getStaticPaths = async () => {
  // lookup trees for chain
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default TreeDetails;

interface TreeDetailsProps {
  treeId: Hex;
  chainId: SupportedChains;
  exists: boolean;
}
