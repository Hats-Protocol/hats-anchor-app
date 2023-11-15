import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import { Hex } from 'viem';

import TreePage from '@/components/TreePage';
import { TreeFormContextProvider } from '@/contexts/TreeFormContext';
import { fetchTreeDetails } from '@/gql/helpers';
import { decimalToTreeId } from '@/lib/hats';
import { Tree } from '@/types';

const TreeDetails = ({
  treeId,
  chainId,
  initialTreeData,
  linkedHatIds,
}: TreeDetailsProps) => {
  const router = useRouter();
  let { hatId } = router.query;
  if (_.isArray(hatId)) {
    hatId = _.first(hatId);
  }

  return (
    <TreeFormContextProvider
      treeId={treeId}
      chainId={chainId}
      initialHatId={hatId}
      initialTreeData={initialTreeData}
      linkedHatIds={linkedHatIds}
    >
      <TreePage />
    </TreeFormContextProvider>
  );
};

const defaultProps = {
  treeId: null,
  chainId: null,
  initialTreeData: null,
  linkedHatIds: null,
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
  const treeHex = decimalToTreeId(treeId);

  try {
    const treeData = await fetchTreeDetails(treeHex, Number(chainId));

    if (!treeData) {
      return { props: defaultProps };
    }

    const { linkedToHat, parentOfTrees } = _.pick(treeData, [
      'linkedToHat',
      'parentOfTrees',
    ]);
    const linkedHatIds = _.compact(
      _.concat(_.map(parentOfTrees, 'hats[0].id'), _.get(linkedToHat, 'id')),
    );

    const hatsWithoutEvents = _.map(treeData.hats, (hat) =>
      _.omit(hat, ['events']),
    );

    return {
      props: {
        ...defaultProps,
        treeId: treeHex,
        chainId: _.toNumber(chainId),
        initialTreeData: {
          ..._.omit(treeData, ['events']),
          hats: hatsWithoutEvents,
        },
        linkedHatIds,
      },
      revalidate: 5,
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return {
      props: {
        ...defaultProps,
        treeId: treeHex,
        chainId: _.toNumber(chainId),
      },
    };
  }
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: false,
  };
};

export default TreeDetails;

interface TreeDetailsProps {
  treeId: Hex;
  chainId: number;
  initialTreeData: Tree;
  linkedHatIds: Hex[];
}
