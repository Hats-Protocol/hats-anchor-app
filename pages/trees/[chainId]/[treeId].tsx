import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import { Hex } from 'viem';

import TreePage from '@/components/TreePage';
import { TreeFormContextProvider } from '@/contexts/TreeFormContext';
import { fetchTreeDetails } from '@/gql/helpers';
import { mapWithChainId } from '@/lib/general';
import { decimalToTreeId } from '@/lib/hats';
import { IHat, ITree } from '@/types';

const TreeDetails = ({
  treeId,
  chainId,
  initialTreeData,
}: // initialHats,
// linkedHats,
TreeDetailsProps) => {
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
    >
      <TreePage />
    </TreeFormContextProvider>
  );
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const treeIdParam = _.get(context, 'params.treeId');
  const chainIdParam = _.get(context, 'params.chainId');
  const treeId = _.isArray(treeIdParam) ? _.first(treeIdParam) : treeIdParam;
  const chainId = _.isArray(chainIdParam)
    ? _.toNumber(_.first(chainIdParam))
    : _.toNumber(chainIdParam);

  if (!treeId || !chainId) {
    return { props: {} };
  }

  const treeHex = decimalToTreeId(treeId);
  const treeData = await fetchTreeDetails(treeHex, Number(chainId));

  if (!treeData) {
    return { props: {} };
  }

  const { linkedToHat, parentOfTrees } = _.pick(treeData, [
    'linkedToHat',
    'parentOfTrees',
  ]);

  const linkedHats = [];
  if (linkedToHat) {
    linkedHats.push({ id: linkedToHat });
  }
  if (parentOfTrees) {
    _.forEach(parentOfTrees, (tree: Partial<ITree>) => {
      linkedHats.push({
        id: tree.id,
        admin: {
          id: tree.linkedToHat?.id,
        },
        tree: tree.id,
      });
    });
  }

  const extendedLinkedHats = mapWithChainId(linkedHats, chainId);

  return {
    props: {
      treeId: treeHex || null,
      chainId: _.toNumber(chainId),
      initialTreeData: treeData || null,
      initialHats: _.filter(
        _.concat(_.get(treeData, 'hats'), extendedLinkedHats),
        (x) => x,
      ) as IHat[],
      linkedHats: extendedLinkedHats || null,
    },
    revalidate: 5,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default TreeDetails;

interface TreeDetailsProps {
  treeId: Hex;
  chainId: number;
  initialTreeData: ITree;
  // initialHats: Partial<IHat>[];
  // linkedHats: IHat[];
}
