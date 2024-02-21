import {
  treeIdDecimalToHex,
  treeIdHexToDecimal,
} from '@hatsprotocol/sdk-v1-core';
import { TreeFormContextProvider, useOverlay } from 'contexts';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { HatDetailsMobile } from 'pages';
import { useEffect } from 'react';
// import { useRouter } from 'next/router';
import { Hex } from 'viem';

const HatDetails = ({ chainId, treeId, hatId }: HatDetailsProps) => {
  const { updateRecentlyVisitedTrees } = useOverlay();
  // const router = useRouter();
  // const { hatId: hatIdParam } = router.query;
  // let hatId: string | undefined;
  // if (_.isArray(hatIdParam)) {
  //   hatId = _.first(hatIdParam);
  // } else {
  //   hatId = hatIdParam;
  // }

  useEffect(() => {
    if (!treeId || !chainId) return;

    updateRecentlyVisitedTrees({
      treeId: treeIdHexToDecimal(treeId),
      chainId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId, chainId]);

  return (
    <TreeFormContextProvider treeId={treeId} chainId={chainId}>
      <HatDetailsMobile />
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
  const hatIdParam = _.get(context, 'params.hatId');
  const treeId = _.isArray(treeIdParam) ? _.first(treeIdParam) : treeIdParam;
  const chainId = _.isArray(chainIdParam)
    ? _.toNumber(_.first(chainIdParam))
    : _.toNumber(chainIdParam);

  if (!treeId || treeId === 'undefined' || !chainId) {
    return { props: defaultProps };
  }
  const treeHex = treeIdDecimalToHex(_.toNumber(treeId));
  const hatIdHex = _.isArray(hatIdParam) ? _.first(hatIdParam) : hatIdParam;

  return {
    props: {
      ...defaultProps,
      treeId: treeHex,
      chainId: _.toNumber(chainId),
      hatId: hatIdHex,
      // initialTreeData: {
      //   ..._.omit(treeData, ['events']),
      //   hats: hatsWithoutEvents,
      // },
      // linkedHatIds,
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

export default HatDetails;

interface HatDetailsProps {
  treeId: Hex;
  chainId: SupportedChains;
  hatId: boolean;
}
