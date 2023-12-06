import { useQuery } from '@tanstack/react-query';
import { ContractData } from 'hats-types';
import { Hex } from 'viem';

const fetchContractData = async (
  chainId: number | undefined,
  address: Hex | undefined,
) => {
  try {
    const result = await fetch('/api/contract-name', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chainId,
        address,
      }),
    });

    const data = await result.json();
    return data as ContractData;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    return undefined;
  }
};

// TODO disable if not supported on chain

const useContractData = ({
  chainId,
  address,
  enabled = true,
  editMode = false,
}: {
  chainId: number | undefined;
  address: Hex | undefined;
  enabled?: boolean;
  editMode?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contractData', chainId, address],
    queryFn: () => fetchContractData(chainId, address),
    enabled: !!chainId && !!address && enabled,
    staleTime: editMode ? Infinity : 1000 * 60 * 60 * 24, // 24 hours
  });

  return { data, isLoading, error };
};

export default useContractData;
