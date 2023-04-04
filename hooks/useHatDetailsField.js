import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useHatDetailsField = (detailsField) => {
  const isIpfs = detailsField.startsWith('ipfs://');

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetailsField', detailsField],
    queryFn: () => fetchDetailsIpfs(detailsField),
    enabled: isIpfs,
  });

  return { data, isLoading, error, isIpfs };
};

const fetchDetailsIpfs = async (detailsField) => {
  const url = 'https://ipfs.io/ipfs/' + detailsField.slice(7);

  const { data } = await axios.get(url);
  return data;
};

export default useHatDetailsField;
