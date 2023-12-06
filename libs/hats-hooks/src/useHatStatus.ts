import { CONFIG } from 'app-constants';
import { Hat, SupportedChains } from 'hats-types';
import { useContractRead } from 'wagmi';

const useHatStatus = ({
  selectedHat,
  chainId,
}: {
  selectedHat: Hat;
  chainId: SupportedChains | undefined;
}) => {
  const hatId = selectedHat?.id || 'none';

  const { data, isLoading } = useContractRead({
    address: CONFIG.hatsAddress,
    abi: CONFIG.hatsAbi,
    chainId,
    functionName: 'isActive',
    args: [hatId],
    enabled: Boolean(hatId) && Boolean(chainId),
  });

  return { data: data as unknown as boolean, isLoading };
};

export default useHatStatus;
