import { useEffect } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';

import useTreeDetails from '../../../../hooks/useTreeDetails';
import { fetchTreeDetails } from '../../../../gql/helpers';
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

export const getServerSideProps = async (context) => {
  const { treeId, chainId } = context.params;
  const initialData = await fetchTreeDetails(treeId, chainId);

  return {
    props: {
      treeId,
      chainId,
      initialData,
    },
  };
};

export default TreeDetails;
