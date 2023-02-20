import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { hatsAddresses, ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';

// TODO rm
const defaultChainId = 5;
const fallbackAddress = hatsAddresses(defaultChainId);

const useHatCreate = ({
  hatsAddress,
  chainId,
  admin,
  details,
  maxSupply,
  eligibility,
  toggle,
  mutable,
  imageUrl,
}) => {
  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    chainId: chainId || defaultChainId,
    abi: JSON.stringify(abi),
    functionName: 'createHat',
    args: [
      admin || ZERO_ADDRESS, // not a valid fallback? throw instead?
      details || '',
      maxSupply || '1',
      eligibility || ZERO_ADDRESS,
      toggle || ZERO_ADDRESS,
      mutable === 'true',
      imageUrl || '',
    ],
    enabled: !!hatsAddress,
  });

  const { data, writeAsync } = useContractWrite(config);

  useWaitForTransaction({
    hash: data?.hash,
  });

  return { writeAsync };
};

export default useHatCreate;
