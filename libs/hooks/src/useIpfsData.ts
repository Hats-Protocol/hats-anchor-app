import { useQuery } from '@tanstack/react-query';
import { fetchIpfs } from 'utils';

const useIpfsData = (ipfsUri: string) => {
  return useQuery({
    queryKey: ['ipfs', ipfsUri],
    queryFn: () => fetchIpfs(ipfsUri),
    enabled: !!ipfsUri,
  });
};

export default useIpfsData;
