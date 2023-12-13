import { useQuery } from '@tanstack/react-query';
import { fetchAncillaryModules } from 'app-utils';
import { HatAuthority, SupportedChains } from 'hats-types';
import _ from 'lodash';
import { Hex } from 'viem';

import useModulesDetails from './useModulesDetails';

const useAncillaryModules = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['ancillaryModules', id],
    queryFn: () => fetchAncillaryModules(id),
    enabled: !!id,
  });

  const extractModuleIds = (hatAuthority: HatAuthority) => {
    return _.flatMap(_.values(hatAuthority), (items: { id: Hex }[]) =>
      items.map((item) => item.id),
    );
  };

  const moduleIds = data?.hatAuthority
    ? _.uniq(extractModuleIds(data.hatAuthority))
    : [];

  const { modulesDetails } = useModulesDetails({
    moduleIds,
    chainId,
  });

  return {
    hatAuthority: data?.hatAuthority,
    modulesDetails,
    error,
    isLoading,
  };
};

export default useAncillaryModules;
