import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import { Hex } from 'viem';

import TreePage from '../../../components/TreePage';
import { TreeFormContextProvider } from '../../../contexts/TreeFormContext';

const TreeDetails = ({ treeId, chainId, exists }: TreeDetailsProps) => {
  const router = useRouter();
  let { hatId } = router.query;
  if (_.isArray(hatId)) {
    hatId = _.first(hatId);
  }

  return (
    <TreeFormContextProvider treeId={treeId} chainId={chainId}>
      <TreePage exists={exists} />
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

export default TreeDetails;

interface TreeDetailsProps {
  treeId: Hex;
  chainId: number;
  exists: boolean;
}
