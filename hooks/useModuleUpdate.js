import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { hatsAddresses, MODULE_TYPES } from '../constants';
import abi from '../contracts/Hats.json';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useModuleUpdate = ({
  hatsAddress,
  chainId,
  hatId,
  moduleType,
  newAddress,
}) => {
  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: chainId || defaultChainId,
    abi: JSON.stringify(abi),
    functionName:
      moduleType === MODULE_TYPES.eligibility
        ? 'changeHatEligibility'
        : 'changeHatToggle',
    args: [hatId, newAddress],
    enabled: !!hatsAddress,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return { write, isLoading };
};

export default useModuleUpdate;
