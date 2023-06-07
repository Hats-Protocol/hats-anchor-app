import _ from 'lodash';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { fetchTreeDetails } from '@/gql/helpers';
import useTreeDetails from '@/hooks/useTreeDetails';
import { decimalId, ipToPrettyId } from '@/lib/hats';

const TreeDetails = ({
  treeId,
  chainId,
  initialData,
}: {
  treeId: string;
  chainId: number;
  initialData: any;
}) => {
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

export const getStaticProps = async (context: any) => {
  const { treeId, chainId } = context.params;
  const initialData = await fetchTreeDetails(ipToPrettyId(treeId), chainId);

  return {
    props: {
      treeId,
      chainId,
      initialData,
    },
  };
};

export const getStaticPaths = async () => {
  // const paths = [];
  // const chains = [1, 5, 10, 100, 137, 42161];

  // _.forEach(chains, (chainId) => {
  //   _.forEach(_.range(1, 100), (treeId) => {
  //     paths.push({
  //       params: {
  //         chainId: _.toString(chainId),
  //         treeId: decimalId(treeId),
  //       },
  //     });
  //   });
  // });

  return {
    paths: [],
    fallback: true,
  };
};

export default TreeDetails;
