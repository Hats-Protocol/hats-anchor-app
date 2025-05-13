import { FALLBACK_ADDRESS } from '@hatsprotocol/sdk-v1-core';
import { useQuery } from '@tanstack/react-query';
import { GraphQLClient } from 'graphql-request';
import { fetchModulesParameters, populateHatsGatesAuthorities } from 'hats-utils';
// import { useToast } from 'hooks';
import {
  compact,
  concat,
  filter,
  flatMap,
  flatten,
  get,
  includes,
  isEmpty,
  map,
  omit,
  reject,
  uniq,
  values,
} from 'lodash';
import { useMemo } from 'react';
import {
  AppHat,
  HatAuthority,
  ModuleDetails,
  // HatAuthorityResponse,
  SupportedChains,
} from 'types';
import { fetchAncillaryModules, NETWORKS_PREFIX } from 'utils';
import { Hex, zeroAddress } from 'viem';

import { populateModulesAuthorities } from './authorities';
import { useHatsSignerGatesMetadata } from './use-hats-signer-gates-metadata';
import { useModulesDetails } from './use-modules-details';

const extractModuleIds = (hatAuthorities: HatAuthority) => {
  const filteredAuthorities = omit(hatAuthorities, ['hsgOwner', 'hsgSigner', 'hatsAccount1ofN']);
  return flatMap(values(filteredAuthorities), (items: { id: Hex }[]) => map(items, 'id'));
};

const MESH_API = process.env.NEXT_PUBLIC_MESH_API;

const GET_CHAINED_MODULES = (chainId: SupportedChains) => `
  query GetChainedModules($controllers: [ID!]) {
    ${NETWORKS_PREFIX[chainId]}_hatsEligibilitiesChains(where: { id_in: $controllers }) {
      id
      moduleAddresses
    }
  }
`;

const fetchChainedModules = async (controllers: Hex[] | undefined, chainId: SupportedChains | undefined) => {
  if (!MESH_API || !chainId || !controllers || isEmpty(controllers)) return null;
  const client = new GraphQLClient(`${MESH_API}/graphql`);
  const modules = await client.request(GET_CHAINED_MODULES(chainId), {
    controllers,
    chainId,
  });
  return get(modules, `${NETWORKS_PREFIX[chainId]}_hatsEligibilitiesChains`, []);
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
    () => (ancillaryModules?.hatAuthority ? uniq(extractModuleIds(ancillaryModules.hatAuthority)) : null),
    [ancillaryModules?.hatAuthority],
  );

  const { modulesDetails, isLoading: isModulesDetailsLoading } = useModulesDetails({
    moduleIds: moduleIds as Hex[],
    chainId,
    editMode,
  });

  const activeControllers = useMemo(() => {
    const EXCLUDED_CONTROLLERS = [zeroAddress, FALLBACK_ADDRESS];
    if (!tree) return [];
    const controllerList = flatten(map(tree, (h: AppHat) => [h.toggle, h.eligibility]));
    const uniqueControllers = uniq(controllerList);
    // TODO theoretically we could exclude controllers that are not contracts
    const filteredControllers = reject(uniqueControllers, (c: Hex) => EXCLUDED_CONTROLLERS.includes(c));
    return filteredControllers as Hex[];
  }, [tree]);

  const { data: chainedModules } = useQuery({
    queryKey: ['chainedModules', activeControllers, chainId],
    queryFn: () => fetchChainedModules(activeControllers as Hex[], chainId),
    enabled: !!activeControllers && !!chainId,
  });

  const combinedModulesList = useMemo(() => {
    if (!chainedModules || !activeControllers) return [];
    return concat(compact(flatten(map(chainedModules, 'moduleAddresses'))), activeControllers);
  }, [chainedModules, activeControllers]);

  const activeModules = useMemo(() => {
    if (!modulesDetails) return [];
    if (!tree) return modulesDetails;
    return filter(modulesDetails, (m: ModuleDetails) => includes(combinedModulesList, m.id));
  }, [modulesDetails, tree, combinedModulesList]);

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

  const hatsOwnerGatesV2 = populateHatsGatesAuthorities({
    details: ancillaryModules?.hatAuthority.hsgV2Owner,
    gates,
    role: 'hsgOwner',
    chainId,
    hatId: id as Hex,
  });

  const hatsSignerGatesV2 = populateHatsGatesAuthorities({
    details: ancillaryModules?.hatAuthority.hsgV2Signer,
    gates,
    role: 'hsgSigner',
    chainId,
    hatId: id as Hex,
  });

  const modulesAuthorities = populateModulesAuthorities({
    hatAuthorities: ancillaryModules?.hatAuthority,
    modulesDetails: modulesWithParameters,
    hatDetails: tree,
  });

  // TODO can we cache this result better?
  return {
    modulesAuthorities: compact([
      ...hatsOwnerGatesV2,
      ...hatsSignerGatesV2,
      ...modulesAuthorities,
      ...hatsOwnerGates,
      ...hatsSignerGates,
    ]),
    error,
    isLoading: false,
  };
};

export { useAncillaryModules };
