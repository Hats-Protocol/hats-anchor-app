import { FALLBACK_ADDRESS } from '@hatsprotocol/constants';
import { useQueries } from '@tanstack/react-query';
import { compact, concat, eq, every, filter, first, flatten, get, map, reject, size, uniq } from 'lodash';
import { AppHat, HatWearer } from 'types';
import { checkAddressIsContract, viemPublicClient } from 'utils';
import { Hex, isAddress, zeroAddress } from 'viem';

// !! LIKELY DEPRECATED

const fetchWearerAndControllerDetails = async (wearer: Hex, chainId: number | undefined) => {
  if (!wearer || !chainId) return null;

  if (wearer === FALLBACK_ADDRESS || wearer === zeroAddress) {
    return {
      id: wearer,
      isContract: false,
      ensName: '',
    };
  }

  const data = await Promise.all([
    checkAddressIsContract(wearer, chainId),
    viemPublicClient(1).getEnsName({
      address: wearer,
    }),
  ]).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });

  if (!data) return null;

  const [isContract, ensName] = data as [boolean, string];

  return {
    id: wearer,
    isContract,
    ensName: ensName || '',
  };
};

const useWearersControllersDetails = ({
  hats,
  editMode,
  onchain = false,
}: {
  hats: AppHat[] | undefined;
  editMode?: boolean;
  onchain?: boolean;
}) => {
  const chainId = get(first(hats), 'chainId');
  // Don't spam the RPC with requests for wearers on individual hats. Handle OrgChart wearers + controllers
  const hatsWithIndividualWearers = filter(hats, (hat: AppHat) => eq(size(get(hat, 'wearers')), 1));

  const wAndCs = uniq(
    compact(
      reject(
        concat(
          map(flatten(map(hatsWithIndividualWearers, 'wearers')), 'id'),
          flatten(map(hats, 'toggle')), // not nested in objects here
          flatten(map(hats, 'eligibility')), // not nested in objects here
        ),
        zeroAddress || FALLBACK_ADDRESS,
      ),
    ),
  );

  // TODO separate queries by hat instead of by wearer
  const wearerAndControllerDetails = useQueries({
    queries: compact(
      map(wAndCs, (wearer: Hex) => ({
        queryKey: ['wearerAndControllerDetails', { wearer, chainId, onchain }],
        queryFn: () => fetchWearerAndControllerDetails(wearer, chainId),
        enabled: !!wearer && isAddress(wearer) && wearer !== zeroAddress && !!chainId,
        refetchInterval: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
        // ? any better way to type this?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any[],
    ),
  });
  const isLoaded = every(wearerAndControllerDetails, ['fetchStatus', 'idle']);

  if (!isLoaded || !eq(size(wearerAndControllerDetails), size(wAndCs))) return undefined;

  return compact(map(wearerAndControllerDetails, 'data')) as HatWearer[];
};

export { useWearersControllersDetails };
