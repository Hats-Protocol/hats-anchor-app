import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Hex } from 'viem';

import { hash } from '@/lib/general';
import { toTreeStructure } from '@/lib/tree';
import { HatDetails, IHat, IHatWearer, ITree } from '@/types';

const useOrgChartTree = ({
  treeData,
  hatsData,
  detailsData,
  wearersAndControllers,
  imagesData,
  draftHats,
  imagesLoaded,
  detailsLoaded,
  initialHatIds,
  chainId,
}: UseOrgChartTreeProps) => {
  const [detailsHashes, setDetailsHashes] = useState<string[]>();

  useEffect(() => {
    const handleDetailsHashes = async () => {
      const promiseHashes = _.map(detailsData, (d) => hash(JSON.stringify(d)));
      const result = await Promise.all(promiseHashes).then((hashes) => hashes);
      setDetailsHashes(result);
    };

    if (!_.isEmpty(detailsData) && !detailsHashes) {
      handleDetailsHashes();
    }
  }, [detailsData, detailsHashes]);

  const fetchTree = async () => {
    if (
      !chainId ||
      !hatsData ||
      !detailsData ||
      !wearersAndControllers ||
      !imagesData
    ) {
      return undefined;
    }

    const tree = await toTreeStructure({
      treeData,
      hatsData,
      detailsData,
      wearersAndControllers,
      imagesData,
      draftHats,
      chainId,
      initialHatIds,
    });

    return tree;
  };
  // console.log(
  //   'useOrgChartTree',
  //   _.find(imagesData, [
  //     'id',
  //     '0x0000000100030000000000000000000000000000000000000000000000000000',
  //   ]),
  // );

  const { data: orgChartTree, isLoading } = useQuery({
    queryKey: [
      'orgChartTree',
      { chainId, treeId: treeData?.id },
      detailsHashes,
      _.map(imagesData, (h) => _.pick(h, ['id', 'details', 'imageUri'])),
      _.map(draftHats, (h) => _.pick(h, ['id', 'details', 'imageUri'])),
    ],
    queryFn: fetchTree,
    enabled:
      !!treeData?.id &&
      !!chainId &&
      !!hatsData &&
      !!detailsData &&
      !!wearersAndControllers &&
      !!imagesData &&
      imagesLoaded &&
      detailsLoaded,
  });

  return { orgChartTree, isLoading };
};

export default useOrgChartTree;

interface UseOrgChartTreeProps {
  treeData: ITree | null | undefined;
  hatsData: IHat[] | undefined;
  detailsData:
    | { id: string; detailsObject: { type: string; data: HatDetails } }[]
    | undefined;
  wearersAndControllers: IHatWearer[] | undefined;
  imagesData: IHat[] | undefined;
  draftHats: IHat[] | undefined;
  imagesLoaded: boolean;
  detailsLoaded: boolean;
  initialHatIds: Hex[];
  chainId: number;
}
