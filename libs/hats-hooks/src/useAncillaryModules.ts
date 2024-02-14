import { useQuery } from '@tanstack/react-query';
import { useToast } from 'app-hooks';
import { fetchAncillaryModules } from 'app-utils';
import { HatAuthority, SupportedChains } from 'hats-types';
import {
  populateHatsAccountsAuthorities,
  populateHatsGatesAuthorities,
  populateModulesAuthorities,
} from 'hats-utils';
import _ from 'lodash';
import { Hex } from 'viem';

import useHatsAccounts from './useHatsAccounts';
import useHatsSignerGatesMetadata from './useHatsSignerGatesMetadata';
import useModulesDetails from './useModulesDetails';

const extractModuleIds = (hatAuthorities: HatAuthority) => {
  const filteredAuthorities = _.omit(hatAuthorities, [
    'hsgOwner',
    'hsgSigner',
    'hatsAccount1ofN',
  ]);
  return _.flatMap(_.values(filteredAuthorities), (items: { id: Hex }[]) =>
    _.map(items, 'id'),
  );
};

const useAncillaryModules = ({
  id,
  chainId,
  editMode,
}: {
  id?: string;
  chainId: SupportedChains;
  editMode?: boolean;
}) => {
  const toast = useToast();
  const { predictedAddress, createAccount } = useHatsAccounts({ id, chainId });

  const {
    data: ancillaryModules,
    error,
    isLoading: isHatAuthoritiesLoading,
  } = useQuery({
    queryKey: ['ancillaryModules', id, chainId],
    queryFn: () => fetchAncillaryModules(id || 'none', chainId),
    enabled: !!id && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const { gates } = useHatsSignerGatesMetadata({ chainId, editMode });

  const moduleIds = ancillaryModules?.hatAuthority
    ? _.uniq(extractModuleIds(ancillaryModules.hatAuthority))
    : null;

  const { modulesDetails, isLoading: isModulesDetailsLoading } =
    useModulesDetails({
      moduleIds,
      chainId,
      editMode,
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

  const hatsAccounts1ofN = populateHatsAccountsAuthorities({
    details: ancillaryModules?.hatAuthority.hatsAccount1ofN,
    hatId: id as Hex,
    predictedAddress,
    toast,
    deployFn: createAccount,
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
      ...hatsAccounts1ofN,
    ],
    error,
    isLoading: false,
  };
};

export default useAncillaryModules;
