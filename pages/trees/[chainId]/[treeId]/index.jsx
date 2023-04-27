import { useEffect } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';

import useTreeDetails from '../../../../hooks/useTreeDetails';
import { fetchTreeDetails } from '../../../../gql/helpers';
import { decimalId, ipToPrettyId } from '../../../../lib/hats';

const TreeDetails = ({ treeId, chainId, initialData }) => {
  const router = useRouter();

  const { data: treeData } = useTreeDetails({ treeId, chainId, initialData });
  const topHatId = _.get(treeData, 'hats[0].id');

  useEffect(() => {
    if (treeId) {
      router.push(
        `/trees/${chainId}/${treeId}/${decimalId(topHatId) || treeId}`,
      );
    }
  }, [router, chainId, treeId, topHatId]);

  return null;
};

export const getServerSideProps = async (context) => {
  const { treeId, chainId } = context.params;
  const initialData = await fetchTreeDetails(ipToPrettyId(treeId), chainId);
  console.log(initialData);

  return {
    props: {
      treeId,
      chainId,
      initialData,
    },
  };
};

export default TreeDetails;
