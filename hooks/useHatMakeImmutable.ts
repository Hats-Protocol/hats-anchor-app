import _ from 'lodash';

import { decimalId, idToPrettyId, prettyIdToIp, toTreeId } from '@/lib/hats';

import useHatContractWrite from './useHatContractWrite';

const useHatMakeImmutable = ({
  hatsAddress,
  chainId,
  hatId,
  levelAtLocalTree,
  isAdminUser,
  mutable,
}: UseHatMakeImmutableProps) => {
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'makeHatImmutable',
    args: [decimalId(hatId)],
    chainId: Number(chainId),
    onSuccessToastData: {
      title: 'Hat Updated!',
      description: `Successfully made hat #${prettyIdToIp(
        idToPrettyId(hatId),
      )} immutable`,
    },
    queryKeys: [
      ['hatDetails', hatId],
      ['treeDetails', toTreeId(hatId)],
    ],
    enabled:
      Boolean(hatsAddress) &&
      Boolean(decimalId(hatId)) &&
      _.gt(levelAtLocalTree, 0) &&
      isAdminUser &&
      mutable,
  });

  return { writeAsync, isLoading };
};

export default useHatMakeImmutable;

interface UseHatMakeImmutableProps {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string;
  levelAtLocalTree: number;
  isAdminUser: boolean;
  mutable: boolean;
}
