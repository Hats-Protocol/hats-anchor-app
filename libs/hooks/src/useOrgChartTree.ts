/* eslint-disable import/extensions */
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { DetailsData, toTreeStructure } from 'hats-utils';
import _ from 'lodash';
import { useState } from 'react';
import { AppHat, HatWearer, SupportedChains } from 'types';
import { Hex } from 'viem';

import useDeepCompareEffect from './useDeepCompareEffect';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore next-line
import { sha256 } from './utils/sha256.js';

// hooks
const useOrgChartTree = ({
  treeData,
  hatsData,
  detailsData,
  imagesData,
  draftHats,
  orgChartWearers,
  imagesLoaded,
  detailsLoaded,
  initialHatIds,
  chainId,
  editMode,
  onchain = false,
}: UseOrgChartTreeProps) => {
  const [detailsHashes, setDetailsHashes] = useState<unknown[]>();
  const [hatsHashes, setHatsHashes] = useState<unknown[]>();

  useDeepCompareEffect(() => {
    setDetailsHashes(
      _.map(_.reject(detailsData, ['events', 'admin']), (d: any) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [detailsData]);

  useDeepCompareEffect(() => {
    setHatsHashes(
      _.map(_.reject(hatsData, ['events', 'admin']), (d: any) =>
        sha256(JSON.stringify(d)),
      ),
    );
  }, [hatsData]);

  const fetchTree = async () => {
    if (
      !chainId ||
      !hatsData ||
      !detailsData ||
      !imagesData ||
      !orgChartWearers
    ) {
      return null;
    }

    const tree = await toTreeStructure({
      treeData,
      hatsData,
      detailsData,
      imagesData,
      draftHats,
      orgChartWearers,
      chainId,
      initialHatIds,
    });

    return tree;
  };

  const { data: orgChartTree, isLoading } = useQuery({
    queryKey: [
      'orgChartTree',
      { chainId, treeId: treeData?.id },
      hatsHashes,
      detailsHashes,
      _.map(imagesData, (h: AppHat) =>
        _.pick(h, ['id', 'details', 'imageUri']),
      ),
      _.map(draftHats, (h: AppHat) => _.pick(h, ['id', 'details', 'imageUri'])),
      { onchain },
    ],
    queryFn: fetchTree,
    enabled:
      !!treeData?.id &&
      !!chainId &&
      !!hatsData &&
      !!detailsData &&
      !!imagesData &&
      !!orgChartWearers &&
      imagesLoaded &&
      detailsLoaded,
    refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
    // refetchOnWindowFocus: process.env.NODE_ENV !== 'development',
  });

  return { orgChartTree, isLoading };
};

export default useOrgChartTree;

interface UseOrgChartTreeProps {
  treeData: Tree | null | undefined;
  hatsData: AppHat[] | undefined;
  detailsData: { id: string; detailsObject: DetailsData }[] | undefined;
  imagesData: AppHat[] | undefined;
  draftHats: AppHat[] | undefined;
  orgChartWearers?: HatWearer[] | undefined;
  imagesLoaded: boolean;
  detailsLoaded: boolean;
  initialHatIds: Hex[];
  chainId: SupportedChains;
  editMode: boolean;
  onchain?: boolean;
}
