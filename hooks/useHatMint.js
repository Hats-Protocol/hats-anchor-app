import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { BigNumber } from 'ethers';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';

const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatMint = ({ hatsAddress, hatId, chainId, newWearer }) => {
  const decimalId = BigNumber.from(hatId).toString();
  // TODO check wearer is valid address

  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: chainId || defaultChainId,
    abi: JSON.stringify(abi),
    functionName: 'mintHat',
    args: [decimalId, newWearer || ZERO_ADDRESS],
    enabled: Boolean(hatsAddress) && Boolean(decimalId) && Boolean(newWearer),
  });

  const { data, writeAsync } = useContractWrite({
    ...config,
    onSuccess: () => {
      console.log('success');
    },
    onError: () => {
      console.log('error');
      // TODO handle rejected
    },
  });

  useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      console.log('success');
      // TODO handle toast
    },
  });

  return { writeAsync, tx: data?.hash };
};

export default useHatMint;
