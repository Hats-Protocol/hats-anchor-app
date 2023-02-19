import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { ZERO_ADDRESS } from '../constants';
import abi from '../contracts/Hats.json';

// TODO rm
const fallbackAddress = '0x96bD657Fcc04c71B47f896a829E5728415cbcAa1';
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
  // const { address } = useAccount();
  const { config } = usePrepareContractWrite({
    address: hatsAddress || fallbackAddress,
    abi: JSON.stringify(abi),
    functionName: 'createHat',
    args: [
      admin || ZERO_ADDRESS,
      details || '',
      maxSupply || 1,
      eligibility || ZERO_ADDRESS,
      toggle || ZERO_ADDRESS,
      mutable || true,
      imageUrl || '',
    ],
    enabled: !!hatsAddress,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return { write, isLoading };
};

export default useHatCreate;
