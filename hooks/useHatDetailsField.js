import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const useHatDetailsField = (detailsField) => {
  const isIpfs = detailsField.startsWith('ipfs://');

  const { data, isLoading, error } = useQuery({
    queryKey: ['hatDetailsField', detailsField],
    queryFn: () => fetchDetailsIpfs(detailsField),
    enabled: isIpfs,
  });

  let schemaType;
  //console.log('data:', data.headers['content-type']);
  if (!!data && data.headers['content-type'] == 'application/json') {
    let schemaTypeField = data.data.type;
    // schema validation
    switch (schemaTypeField) {
      case '1.0':
        if ('name' in data.data.data && 'description' in data.data.data) {
          schemaType = schemaTypeField;
        }
    }
  }

  return { data, isLoading, error, schemaType };
};

const fetchDetailsIpfs = async (detailsField) => {
  const url = 'https://ipfs.io/ipfs/' + detailsField.slice(7);

  const res = await axios.get(url);
  console.log('ipfs fetch result:', res);
  return res;
};

export default useHatDetailsField;
