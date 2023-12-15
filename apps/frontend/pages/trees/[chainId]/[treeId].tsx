import { treeIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { SupportedChains } from 'hats-types';
import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
// import { useRouter } from 'next/router';
import { Hex } from 'viem';

import TreePage from '../../../components/TreePage';
import { TreeFormContextProvider } from '../../../contexts/TreeFormContext';

const TreeDetails = ({ treeId, chainId, exists }: TreeDetailsProps) => {
  // const router = useRouter();
  // const { hatId: hatIdParam } = router.query;
  // let hatId: string | undefined;
  // if (_.isArray(hatIdParam)) {
  //   hatId = _.first(hatIdParam);
  // } else {
  //   hatId = hatIdParam;
  // }

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
  chainId: SupportedChains;
  exists: boolean;
}
