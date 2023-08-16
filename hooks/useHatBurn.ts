import _ from 'lodash';
import { useAccount, useChainId } from 'wagmi';

import useHatContractWrite from '@/hooks/useHatContractWrite';
import { hatIdToHex } from '@/lib/hats';
import { IHatWearer } from '@/types';

const useHatBurn = ({
  hatsAddress,
  chainId,
  hatId,
  wearers,
}: {
  hatsAddress?: `0x${string}`;
  chainId: number;
  hatId: string | null;
  wearers: IHatWearer[] | undefined;
}) => {
  const currentNetworkId = useChainId();
  const { address } = useAccount();
  const currentlyWearing = _.findKey(wearers, ['id', _.toLower(address)]);
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'renounceHat',
    args: [hatId],
    chainId,
    onSuccessToastData: {
      title: 'Hat removed!',
      description: 'Successfully removed hat',
    },
    queryKeys: [
      ['hatDetails', hatIdToHex(hatId)],
      ['treeDetails', hatIdToHex(hatId)],
    ],
    enabled:
      Boolean(hatsAddress) &&
      Boolean(hatId) &&
      chainId === currentNetworkId &&
      !!currentlyWearing,
  });

  return { writeAsync, isLoading };
};

export default useHatBurn;
