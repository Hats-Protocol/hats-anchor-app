import _ from 'lodash';
import { GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import { Hex } from 'viem';

import TreePage from '@/components/TreePage';
import { TreeFormContextProvider } from '@/contexts/TreeFormContext';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import { decimalToTreeId, prettyIdToId } from '@/lib/hats';
import { Hat, Tree } from '@/types';

const TreeDetails = ({
  treeId,
  chainId,
  initialTreeData,
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
      // initialHatIds={initialHatIds}
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

  if (!treeId || treeId === 'undefined' || !chainId) {
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

  let fetchedParentOfTrees = [] as Hat[];

  if (parentOfTrees) {
    const promises = _.map(parentOfTrees, (parentTree) =>
      fetchHatDetails(prettyIdToId(parentTree?.id), chainId),
    );

    const hats = await Promise.all(promises);
    fetchedParentOfTrees = hats.filter(
      (hat) => hat !== null && hat !== undefined,
    ) as Hat[];
    treeData.parentOfHats = fetchedParentOfTrees;
  }

  if (linkedToHat) {
    const fetchedLinkedHat = await fetchHatDetails(
      prettyIdToId(linkedToHat?.id),
      chainId,
    );
    treeData.linkedToHat = fetchedLinkedHat;
  }

  const linkedHats = linkedToHat ? [linkedToHat?.id] : [];
  const parentOfHats = _.map(fetchedParentOfTrees, 'id');

  const initialHatIds = _.compact(
    _.concat(_.map(_.get(treeData, 'hats'), 'id'), linkedHats, parentOfHats),
  );

  return {
    props: {
      treeId: treeHex || null,
      chainId: _.toNumber(chainId),
      initialTreeData: treeData || null,
      initialHatIds: initialHatIds || null,
    },
    revalidate: 5,
  };
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
  // initialHatIds: Hex[];
}
