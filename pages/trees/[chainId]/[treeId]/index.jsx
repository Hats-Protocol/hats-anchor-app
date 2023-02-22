import { useEffect } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';

import useTreeDetails from '../../../../hooks/useTreeDetails';
import { fetchAllTreeIds, fetchTreeDetails } from '../../../../gql/helpers';
import { decimalId } from '../../../../lib/hats';

const TreeDetails = ({ treeId, chainId, initialData }) => {
  const router = useRouter();

  const { data: treeData } = useTreeDetails({ treeId, chainId, initialData });
  const topHatId = _.get(treeData, 'hats[0].id');

  useEffect(() => {
    if (treeId && topHatId) {
      router.push(`/trees/${treeId}/${decimalId(topHatId)}`);
    }
  }, [router, treeId, topHatId]);

  return null;
};

// TODO don't hardcode chainId
const defaultChainId = 5;

export const getStaticPaths = async () => {
  // TODO handle multiple chains
  const result = await fetchAllTreeIds(defaultChainId);

  const paths = _.map(result, (tree) => ({
    params: { treeId: tree.id, chainId: defaultChainId },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (props) => {
  const { treeId, chainId } = props.params;
  const initialData = await fetchTreeDetails(treeId, chainId || defaultChainId);

  return {
    props: {
      treeId,
      chainId: chainId || defaultChainId,
      initialData,
    },
  };
};

export default TreeDetails;
