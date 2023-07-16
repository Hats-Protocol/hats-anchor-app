import _ from 'lodash';
import { isAddress } from 'viem';

import useHatContractWrite from '@/hooks/useHatContractWrite';
import { prettyIdToIp } from '@/lib/hats';

interface UseHatUnlinkTreeProps {
  topHatPrettyId: string;
  wearer: string;
  chainId: number;
}

const useHatUnlinkTree = ({
  topHatPrettyId,
  wearer,
  chainId,
}: UseHatUnlinkTreeProps) => {
  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'unlinkTopHatFromTree',
    args: [topHatPrettyId, wearer],
    chainId,
    onSuccessToastData: {
      title: `Top Hat Unlinked!`,
      description: `Successfully unlinked top hat #${prettyIdToIp(
        topHatPrettyId,
      )}`,
    },
    onErrorToastData: {
      title: 'Error occurred!',
    },
    queryKeys: [['topHat', topHatPrettyId]],
    transactionTimeout: 4000,
    enabled: Boolean(topHatPrettyId) && Boolean(wearer) && isAddress(wearer),
  });

  return {
    writeAsync,
    isLoading,
  };
};

export default useHatUnlinkTree;
