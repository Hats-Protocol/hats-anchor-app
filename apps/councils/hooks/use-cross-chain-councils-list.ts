import { chainsList } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { gql, GraphQLClient } from 'graphql-request';
import { compact, concat, every, get, isEmpty, keys, map, reduce, toLower } from 'lodash';
import { useEffect, useMemo } from 'react';
import { logger, NETWORKS_PREFIX, stripSuffix } from 'utils';

const hatIdsVariables = (hatIdsByNetwork: NetworkAddressList) => {
  return map(keys(hatIdsByNetwork), (network) =>
    isEmpty(hatIdsByNetwork[network]) ? '' : gql`$${toLower(network)}HatIds: [ID!]`,
  ).join('\n');
};

const allowListEligibilities = (hatIdsByNetwork: NetworkAddressList) => {
  return map(keys(hatIdsByNetwork), (network) => {
    if (isEmpty(hatIdsByNetwork[network])) return '';
    return gql`
      ${network}_allowListEligibilities(
        where: { or: [{ arbitratorHat_: { id_in: $${toLower(network)}HatIds } }, { ownerHat_: { id_in: $${toLower(network)}HatIds } }] }
      ) {
        id
      }
    `;
  }).join('\n');
};

const agreementEligibilities = (hatIdsByNetwork: NetworkAddressList) => {
  return map(keys(hatIdsByNetwork), (network) => {
    if (isEmpty(hatIdsByNetwork[network])) return '';
    return gql`
      ${network}_agreementEligibilities(
        where: { or: [{ arbitratorHat_: { id_in: $${toLower(network)}HatIds } }, { ownerHat_: { id_in: $${toLower(network)}HatIds } }] }
      ) {
        id  
      }
    `;
  }).join('\n');
};

const CROSS_CHAIN_COUNCIL_MANAGERS_QUERY = (hatIdsByNetwork: NetworkAddressList) => gql`
    query getCrossChainCouncilManagers(
      ${hatIdsVariables(hatIdsByNetwork)}
  ) {
    # ALLOWLIST MANAGERS
    ${allowListEligibilities(hatIdsByNetwork)}

    # AGREEMENT MANAGERS
    ${agreementEligibilities(hatIdsByNetwork)}
  }
`;

const hsgOwnersSigners = (hatIdsByNetwork: NetworkAddressList) => {
  return map(keys(hatIdsByNetwork), (network) => {
    if (isEmpty(hatIdsByNetwork[network])) return '';
    return gql`
     ${network}_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $${toLower(network)}HatIds } }, { signerHats_: { id_in: $${toLower(network)}HatIds } }] }
    ) {
      # 1
      id
      safe
      thresholdType
      minThreshold
      targetThreshold
      signerHats {
        id
      }
      ownerHat {
        id
      }
    }
    `;
  }).join('\n');
};

const HSG_QUERY = (hatIdsByNetwork: NetworkAddressList) => gql`
  query getCrossChainHSGs(
    ${hatIdsVariables(hatIdsByNetwork)}
  ) {
    # HSG OWNERS AND SIGNERS
    ${hsgOwnersSigners(hatIdsByNetwork)}
  }
`;

const modulesByNetworkVariables = (modulesByNetwork: NetworkAddressList) => {
  return map(keys(modulesByNetwork), (network) =>
    isEmpty(modulesByNetwork[network]) ? '' : gql`$${toLower(network)}Modules: [String!]`,
  ).join('\n');
};

const moduleManagerHats = (modulesByNetwork: NetworkAddressList) => {
  return map(keys(modulesByNetwork), (network) => {
    if (isEmpty(modulesByNetwork[network])) return '';
    return gql`
      ${network}_hats(where: { eligibility_in: $${toLower(network)}Modules }) {
        id
      }
    `;
  }).join('\n');
};

const MODULE_MANAGER_HATS_QUERY = (modulesByNetwork: NetworkAddressList) => gql`
  query getCrossChainModuleManagerHats(
    ${modulesByNetworkVariables(modulesByNetwork)}
  ) {
    ${moduleManagerHats(modulesByNetwork)}
  }
`;

const meshClient = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);

const getCrossChainCouncilManagers = async (hatIdsByNetwork: NetworkAddressList | undefined) => {
  if (!hatIdsByNetwork || every(hatIdsByNetwork, isEmpty)) return null;

  const managersQuery = CROSS_CHAIN_COUNCIL_MANAGERS_QUERY(hatIdsByNetwork);

  const variables = reduce(
    hatIdsByNetwork,
    (acc, value, key) => {
      if (isEmpty(value)) return acc;
      acc[`${key}HatIds`] = value;
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return meshClient
    .request(managersQuery, variables)
    .then((response) => {
      const returnObj: NetworkAddressList = {};
      // consolidate allowListEligibilities and agreementEligibilities by network
      for (const chainId of keys(chainsList)) {
        const prefix = NETWORKS_PREFIX[chainId];
        returnObj[prefix] = concat(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map((response as any)[`${prefix}_allowListEligibilities`], 'id'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map((response as any)[`${prefix}_agreementEligibilities`], 'id'),
        );
      }

      // suffix is already removed above
      return Promise.resolve(returnObj);
    })
    .catch((error) => {
      logger.error(error);
      return Promise.reject(error);
    });
};

type NetworkAddressList = Record<string, string[]>;

const getCrossChainModuleManagerHats = async (modulesByNetwork: NetworkAddressList | undefined) => {
  if (!modulesByNetwork || every(modulesByNetwork, isEmpty)) return null;

  const modulesQuery = MODULE_MANAGER_HATS_QUERY(modulesByNetwork);
  const variables = reduce(
    modulesByNetwork,
    (acc, value, key) => {
      if (isEmpty(value)) return acc;
      acc[`${toLower(key)}Modules`] = value;
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const response = await meshClient.request(modulesQuery, variables);

  return stripSuffix({
    object: response as Record<string, unknown[]>,
    mapFn: (hat) => get(hat, 'id', ''),
  });
};

const getCrossChainHSG = async (hatIdsByNetwork: Record<string, string[]> | undefined) => {
  if (!hatIdsByNetwork || every(hatIdsByNetwork, isEmpty)) return null;

  const hsgQuery = HSG_QUERY(hatIdsByNetwork);

  const variables = reduce(
    hatIdsByNetwork,
    (acc, value, key) => {
      if (isEmpty(value)) return acc;
      acc[`${toLower(key)}HatIds`] = value;
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const response = await meshClient.request(hsgQuery, variables);

  return stripSuffix({ object: response as Record<string, string[]> });
};

const useCrossChainCouncilsList = ({ hatIdsByNetwork }: { hatIdsByNetwork: Record<string, string[]> }) => {
  const { setBanner } = useOverlay();

  // Get the module managers for each network
  const {
    data: modulesByNetwork,
    isLoading: isModuleManagersLoading,
    error: moduleManagersError,
  } = useQuery({
    queryKey: ['cross-chain-council-managers', hatIdsByNetwork],
    queryFn: () => getCrossChainCouncilManagers(hatIdsByNetwork),
    enabled: !!hatIdsByNetwork && !every(hatIdsByNetwork, isEmpty),
    refetchOnMount: true,
    staleTime: 0,
  });

  // Get the associated hats for each module manager
  const {
    data: moduleManagerHats,
    isLoading: isModuleManagerHatsLoading,
    error: moduleManagerHatsError,
  } = useQuery({
    queryKey: ['cross-chain-module-manager-hats', modulesByNetwork],
    queryFn: () => getCrossChainModuleManagerHats(modulesByNetwork || undefined),
    enabled: !!modulesByNetwork && !isModuleManagersLoading && !every(modulesByNetwork, isEmpty),
    refetchOnMount: true,
    staleTime: 0,
  });

  // Consolidate the hat ids for each network
  const consolidatedHatIds = useMemo(() => {
    if (!moduleManagerHats || !hatIdsByNetwork) return undefined;

    const newObj: Record<string, string[]> = {};
    for (const key of keys(moduleManagerHats)) {
      newObj[key] = compact(concat(moduleManagerHats[key] as string[], hatIdsByNetwork[key] as string[]));
    }
    return newObj;
  }, [moduleManagerHats, hatIdsByNetwork]);

  // Get the HSG owners for Hat IDs on each network
  const {
    data: councilsList,
    isLoading: isHSGLoading,
    error: councilsListError,
  } = useQuery({
    queryKey: ['cross-chain-councils-list', consolidatedHatIds],
    queryFn: () => getCrossChainHSG(consolidatedHatIds),
    enabled: !!consolidatedHatIds && !isModuleManagersLoading && !isModuleManagerHatsLoading,
    refetchOnMount: true,
    staleTime: 0,
  });

  useEffect(() => {
    if (!moduleManagersError && !moduleManagerHatsError && !councilsListError) {
      setBanner(null);
      return;
    }

    if (moduleManagersError || moduleManagerHatsError) {
      setBanner({
        message: 'Error fetching cross-chain manager lists or roles',
        variant: 'error',
        error: moduleManagersError || moduleManagerHatsError || undefined,
      });
      return;
    }
    if (councilsListError) {
      setBanner({
        message: 'Error fetching cross-chain councils list',
        variant: 'error',
        error: councilsListError,
      });
      return;
    }
  }, [moduleManagersError, moduleManagerHatsError, councilsListError, setBanner]);

  return {
    councilsList,
    isLoading: isModuleManagersLoading || isModuleManagerHatsLoading || isHSGLoading,
  };
};

export { useCrossChainCouncilsList };
