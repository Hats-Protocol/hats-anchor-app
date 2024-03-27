import _ from 'lodash';
import { useRouter } from 'next/router';
import { ipToHatId } from 'shared';

const useHatParams = () => {
  const router = useRouter();
  // QUERY PARAMS
  const { hatId: initialHatIdParam, chainId: initialChainIdParam } =
    router.query;
  let initialHatId: string | undefined;
  if (_.isArray(initialHatIdParam)) initialHatId = _.first(initialHatId);
  else initialHatId = initialHatIdParam as string;

  const selectedHatId = ipToHatId(initialHatId as string) || undefined;

  return { selectedHatId, chainId: _.toNumber(initialChainIdParam) };
};

export default useHatParams;
