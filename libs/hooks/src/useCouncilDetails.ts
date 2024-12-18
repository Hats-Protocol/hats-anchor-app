import { useQuery } from '@tanstack/react-query';
import { compact, concat, find, get, map, toLower } from 'lodash';
import { getCouncilData, getHatsDetails } from 'utils';

const fetchCouncilDetails = async ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: string | undefined;
}) => {
  if (!address || !chainId) return Promise.resolve(undefined);
  const councilData = await getCouncilData({ id: toLower(address) });
  const hatsIds = compact(
    concat(map(get(councilData, 'signerHats'), 'id'), [
      get(councilData, 'ownerHat.id'),
    ]),
  );
  const hatsDetails = await getHatsDetails({
    ids: hatsIds,
  });
  const signerHats = map(get(councilData, 'signerHats'), (hat) =>
    find(hatsDetails, { id: get(hat, 'id') }),
  );
  const ownerHat = find(hatsDetails, { id: get(councilData, 'ownerHat.id') });

  return Promise.resolve({
    signerHats,
    ownerHat,
    safe: get(councilData, 'safe'),
  });
};

const useCouncilDetails = ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: string | undefined;
}) => {
  return useQuery({
    queryKey: ['councilDetails', chainId, address],
    queryFn: () => fetchCouncilDetails({ chainId, address }),
  });
};

export default useCouncilDetails;
