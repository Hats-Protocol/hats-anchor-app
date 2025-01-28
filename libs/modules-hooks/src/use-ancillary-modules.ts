// import { HATS_ACCOUNT_1OFN_IMPLEMENTATION } from '@hatsprotocol/hats-account-sdk';
import { useQuery } from '@tanstack/react-query';
import {
  fetchModulesParameters,
  // populateHatsAccountsAuthorities,
  populateHatsGatesAuthorities,
} from 'hats-utils';
// import { useToast } from 'hooks';
import _ from 'lodash';
import { useMemo } from 'react';
import {
  AppHat,
  HatAuthority,
  ModuleDetails,
  // HatAuthorityResponse,
  SupportedChains,
} from 'types';
import { fetchAncillaryModules } from 'utils';
import { Hex } from 'viem';

import { populateModulesAuthorities } from './authorities';
// import useHatsAccounts from './useHatsAccounts';
import { useHatsSignerGatesMetadata } from './use-hats-signer-gates-metadata';
import { useModulesDetails } from './use-modules-details';

const extractModuleIds = (hatAuthorities: HatAuthority) => {
  const filteredAuthorities = _.omit(hatAuthorities, ['hsgOwner', 'hsgSigner', 'hatsAccount1ofN']);
  return _.flatMap(_.values(filteredAuthorities), (items: { id: Hex }[]) => _.map(items, 'id'));
};

const useAncillaryModules = ({
  id,
  chainId,
  editMode,
  tree,
}: {
  id?: Hex;
  chainId: SupportedChains | undefined;
  editMode?: boolean;
  tree?: AppHat[] | undefined;
}) => {
  // const toast = useToast();
  // const { predictedAddress, createAccount } = useHatsAccounts({
  //   hatId: id,
  //   chainId,
  // });

  const {
    data: ancillaryModules,
    error,
    isLoading: isHatAuthoritiesLoading,
    // status,
    // fetchStatus,
  } = useQuery({
    queryKey: ['ancillaryModules', id, chainId],
    queryFn: () => fetchAncillaryModules(id || 'none', chainId),
    enabled: !!id && id !== '0x' && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  const { gates } = useHatsSignerGatesMetadata({ chainId, editMode });

  const moduleIds = useMemo(
    () => (ancillaryModules?.hatAuthority ? _.uniq(extractModuleIds(ancillaryModules.hatAuthority)) : null),
    [ancillaryModules?.hatAuthority],
  );

  const { modulesDetails, isLoading: isModulesDetailsLoading } = useModulesDetails({
    moduleIds,
    chainId,
    editMode,
  });

  const activeModules = useMemo(() => {
    if (!modulesDetails) return [];
    if (!tree) return modulesDetails;
    const controllers = _.flatten(_.map(tree, (h: AppHat) => [h.toggle, h.eligibility]));
    return _.filter(modulesDetails, (m: ModuleDetails) => _.includes(controllers, m.id));
  }, [modulesDetails, tree]);

  const { data: modulesWithParameters, isLoading: modulesParametersLoading } = useQuery({
    queryKey: ['modulesWithParameters', activeModules, chainId],
    queryFn: () => fetchModulesParameters(activeModules, chainId),
    enabled: !!activeModules && !!chainId,
    staleTime: editMode ? Infinity : 1000 * 60 * 15, // 15 minutes
  });

  if (isHatAuthoritiesLoading || isModulesDetailsLoading || modulesParametersLoading || !modulesWithParameters) {
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

  // const hatsAccounts1ofN = populateHatsAccountsAuthorities({
  //   details: ancillaryModules?.hatAuthority.hatsAccount1ofN,
  //   hatId: id as Hex,
  //   chainId,
  //   predictedAddress,
  //   toast,
  //   deployFn: createAccount,
  // });

  const modulesAuthorities = populateModulesAuthorities({
    hatAuthorities: ancillaryModules?.hatAuthority,
    modulesDetails: modulesWithParameters,
    hatDetails: tree,
  });

  // const shouldIncludeHA = _.has(
  //   HATS_ACCOUNT_1OFN_IMPLEMENTATION,
  //   _.toString(chainId),
  // );

  // TODO can we cache this result better?
  return {
    modulesAuthorities: _.compact([
      ...modulesAuthorities,
      ...hatsOwnerGates,
      ...hatsSignerGates,
      // ...(shouldIncludeHA && predictedAddress ? hatsAccounts1ofN : []),
    ]),
    error,
    isLoading: false,
  };
};

export { useAncillaryModules };
