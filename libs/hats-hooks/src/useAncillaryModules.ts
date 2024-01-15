import { useQuery } from '@tanstack/react-query';
import { fetchAncillaryModules } from 'app-utils';
import { HatAuthority, SupportedChains } from 'hats-types';
import {
  populateHatsGatesAuthorities,
  populateModulesAuthorities,
} from 'hats-utils';
import _ from 'lodash';
import { Hex } from 'viem';

import useHatsSignerGatesMetadata from './useHatsSignerGatesMetadata';
import useModulesDetails from './useModulesDetails';

const useAncillaryModules = ({
  id,
  chainId,
}: {
  id?: string;
  chainId: SupportedChains;
}) => {
  const {
    data: ancillaryModules,
    error,
    isLoading: isHatAuthoritiesLoading,
  } = useQuery({
    queryKey: ['ancillaryModules', id, chainId],
    queryFn: () => fetchAncillaryModules(id || 'none', chainId),
    enabled: !!id && !!chainId,
  });

  const { gates } = useHatsSignerGatesMetadata({ chainId });

  const extractModuleIds = (hatAuthorities: HatAuthority) => {
    const filteredAuthorities = _.omit(hatAuthorities, [
      'hsgOwner',
      'hsgSigner',
    ]);
    return _.flatMap(_.values(filteredAuthorities), (items: { id: Hex }[]) =>
      _.map(items, 'id'),
    );
  };

  const moduleIds = ancillaryModules?.hatAuthority
    ? _.uniq(extractModuleIds(ancillaryModules.hatAuthority))
    : null;

  const { modulesDetails, isLoading: isModulesDetailsLoading } =
    useModulesDetails({
      moduleIds,
      chainId,
    });

  if (isHatAuthoritiesLoading || isModulesDetailsLoading) {
    return {
      modulesAuthorities: [],
      error,
      isLoading: true,
    };
  }

  const hatsOwnerGates = populateHatsGatesAuthorities({
    details: ancillaryModules?.hatAuthority.hsgOwner,
    gates,
    role: 'hsgOwner',
    chainId,
    hatId: id as Hex,
  });

  const hatsSignerGates = populateHatsGatesAuthorities({
    details: ancillaryModules?.hatAuthority.hsgSigner,
    gates,
    role: 'hsgSigner',
    chainId,
    hatId: id as Hex,
  });

  const modulesAuthorities = populateModulesAuthorities({
    hatAuthorities: ancillaryModules?.hatAuthority,
    modulesDetails,
  });

  return {
    modulesAuthorities: [
      ...modulesAuthorities,
      ...hatsOwnerGates,
      ...hatsSignerGates,
    ],
    error,
    isLoading: false,
  };
};

export default useAncillaryModules;
