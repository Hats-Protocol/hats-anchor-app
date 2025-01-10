import { useQuery } from '@tanstack/react-query';
import { compact, concat, find, get, map, toLower } from 'lodash';
import { AppHat, ExtendedHSGV2, HatSignerGateV2 } from 'types';
import { getCouncilData, getHatsDetails } from 'utils';

const fetchCouncilDetails = async ({
  chainId,
  address,
}: {
  chainId: number | undefined;
  address: string | undefined;
}): Promise<ExtendedHSGV2 | null> => {
  if (!address || !chainId) return Promise.resolve(null);
  const councilData = await getCouncilData({ id: toLower(address), chainId });
  const hatsIds = compact(concat(map(get(councilData, 'signerHats'), 'id'), [get(councilData, 'ownerHat.id')]));
  const hatsDetails = await getHatsDetails({
    ids: hatsIds,
    chainId,
  });
  const signerHats = compact(map(get(councilData, 'signerHats'), (hat) => find(hatsDetails, { id: get(hat, 'id') })));
  const ownerHat = find(hatsDetails, { id: get(councilData, 'ownerHat.id') });

  const safe = get(councilData, 'safe');
  if (!safe) return Promise.resolve(null);

  return Promise.resolve({
    ...(councilData as HatSignerGateV2),
    signerHats: signerHats as unknown as AppHat[],
    ownerHat: ownerHat as AppHat | undefined,
  });
};

const useCouncilDetails = ({ chainId, address }: { chainId: number | undefined; address: string | undefined }) => {
  return useQuery({
    queryKey: ['councilDetails', chainId, address],
    queryFn: () => fetchCouncilDetails({ chainId, address }),
  });
};

export default useCouncilDetails;
