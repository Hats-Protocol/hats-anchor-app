import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import dynamic from 'next/dynamic';

import {
  toTreeStructure,
  prettyIdToId,
  decimalToTreeId,
  decimalId,
  urlIdToPrettyId,
  prettyIdToUrlId,
  prettyIdToIp,
  isTopHat,
} from '@/lib/hats';
import { chainsMap } from '@/lib/web3';
import Layout from '@/components/Layout';
import { fetchHatDetails, fetchTreeDetails } from '@/gql/helpers';
import useImageURIs from '@/hooks/useImageURIs';
import useWearerDetails from '@/hooks/useWearerDetails';
import HeadComponent from '@/components/HeadComponent';
import CONFIG from '@/constants';
import { Data } from '@/components/OrgChart';

const OrgChart = dynamic(() => import('@/components/OrgChart'), { ssr: false });

const TreeDetails = ({
  treeId,
  chainId,
  hatId,
  prettyHatId,
  treeData,
  linkedHatIds,
  hatData,
}: TreeDetailsProps) => {
  const chain = chainsMap(chainId);
  const [orgChartTree, setOrgChartTree] = useState<Data[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { address } = useAccount();
  const { data: wearerData } = useWearerDetails({
    wearerAddress: address,
    chainId,
  });

  const wearerHats = _.map(_.get(wearerData, 'currentHats', []), 'prettyId');
  console.log('wearerHats', wearerHats);
  const { data: imagesData, loading: imagesDataLoading } = useImageURIs(
    treeData?.hats?.map((hat: any) => hat.id).concat(linkedHatIds),
    chainId,
  );

  useEffect(() => {
    const fetchTreeAndSetState = async () => {
      const tree = await toTreeStructure(treeData, imagesData, chainId);
      setOrgChartTree(tree);
    };

    fetchTreeAndSetState();
  }, [treeData, imagesData, chainId]);

  // "Top Hat #21 or Hat #2.3.4"
  const title = `${isTopHat(hatData) ? 'Top ' : ''}Hat #${prettyIdToIp(
    _.get(hatData, 'prettyId'),
  )}`;

  return (
    <>
      <HeadComponent
        title={title}
        description={`Tree #${decimalId(treeId)} on ${chain?.name}`}
        url={`${CONFIG.url}/trees/${chainId}/${decimalId(
          treeId,
        )}/${prettyIdToUrlId(prettyHatId)}`}
        img={imagesData[hatId]}
      />

      <Layout>
        <OrgChart
          tree={orgChartTree}
          isLoading={imagesDataLoading}
          wearerHats={wearerHats}
          chainId={chainId}
          setSelectedNode={setSelectedNode}
          selectedNode={selectedNode}
        />
      </Layout>
    </>
  );
};

export const getStaticProps = async (context: any) => {
  const { treeId, chainId } = context.params;
  const treeHex = decimalToTreeId(treeId);
  const prettyHatId = urlIdToPrettyId(treeId);
  const hatIdHex = prettyIdToId(prettyHatId);
  const treeData = await fetchTreeDetails(treeHex, Number(chainId));
  const hatData = await fetchHatDetails(hatIdHex, Number(chainId));

  const { linkedToHat, parentOfTrees } = treeData || {
    linkedToHat: { id: null },
    parentOfTrees: [],
  };
  const linkedHatIds = [];
  if (linkedToHat?.id) {
    linkedHatIds.push(linkedToHat.id);
  }
  if (parentOfTrees) {
    linkedHatIds.push(
      ...parentOfTrees.map((tree: any) => prettyIdToId(tree.id)),
    );
  }

  return {
    props: {
      treeId: treeHex || null,
      chainId: _.toNumber(chainId),
      hatId: hatIdHex || null,
      prettyHatId: prettyHatId || null,
      treeData: treeData || null,
      linkedHatIds,
      hatData: hatData || null,
    },
    revalidate: 10,
  };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export default TreeDetails;

interface TreeDetailsProps {
  treeId: string;
  chainId: number;
  hatId: string;
  prettyHatId: string;
  treeData: any;
  linkedHatIds: string[];
  hatData: any;
}
