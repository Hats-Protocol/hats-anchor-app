import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { hatsAddresses } from '../constants';
import abi from '../contracts/Hats.json';

// const functionNames = ['changeHatToggle', 'changeHatEligibility'];

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatCreate = ({ hatsAddress, chainId, hatId, newAddress }) => {
  // const { address } = useAccount();
  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: chainId || defaultChainId,
    abi: JSON.stringify(abi),
    functionName: 'changeHatToggle',
    args: [hatId, newAddress],
    enabled: !!hatsAddress,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return { write, isLoading };
};

export default useHatCreate;
