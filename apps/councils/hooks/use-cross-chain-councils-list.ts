import { chainsList } from '@hatsprotocol/config';
import { useQuery } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { gql, GraphQLClient } from 'graphql-request';
import { compact, concat, every, get, isEmpty, keys, map } from 'lodash';
import { useEffect, useMemo } from 'react';
import { logger, NETWORKS_PREFIX, stripSuffix } from 'utils';

const CROSS_CHAIN_COUNCIL_MANAGERS_QUERY = gql`
  query getCrossChainCouncilManagers(
    $ethHatIds: [ID!]
    $baseHatIds: [ID!]
    $sepHatIds: [ID!]
    $opHatIds: [ID!]
    $gnoHatIds: [ID!]
    $arbHatIds: [ID!]
    $celoHatIds: [ID!]
    $polHatIds: [ID!]
    $baseSepHatIds: [ID!]
  ) {
    # ALLOWLIST MANAGERS
    Eth_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $ethHatIds } }, { ownerHat_: { id_in: $ethHatIds } }] }
    ) {
      id
    }
    Base_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $baseHatIds } }, { ownerHat_: { id_in: $baseHatIds } }] }
    ) {
      id
    }
    Sep_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $sepHatIds } }, { ownerHat_: { id_in: $sepHatIds } }] }
    ) {
      id
    }
    Op_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $opHatIds } }, { ownerHat_: { id_in: $opHatIds } }] }
    ) {
      id
    }
    Gno_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $gnoHatIds } }, { ownerHat_: { id_in: $gnoHatIds } }] }
    ) {
      id
    }
    Arb_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $arbHatIds } }, { ownerHat_: { id_in: $arbHatIds } }] }
    ) {
      id
    }
    Celo_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $celoHatIds } }, { ownerHat_: { id_in: $celoHatIds } }] }
    ) {
      id
    }
    Pol_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $polHatIds } }, { ownerHat_: { id_in: $polHatIds } }] }
    ) {
      id
    }
    BaseSep_allowListEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $baseSepHatIds } }, { ownerHat_: { id_in: $baseSepHatIds } }] }
    ) {
      id
    }

    # AGREEMENT MANAGERS
    Eth_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $ethHatIds } }, { ownerHat_: { id_in: $ethHatIds } }] }
    ) {
      id
    }
    Base_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $baseHatIds } }, { ownerHat_: { id_in: $baseHatIds } }] }
    ) {
      id
    }
    Op_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $opHatIds } }, { ownerHat_: { id_in: $opHatIds } }] }
    ) {
      id
    }
    Gno_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $gnoHatIds } }, { ownerHat_: { id_in: $gnoHatIds } }] }
    ) {
      id
    }
    Sep_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $sepHatIds } }, { ownerHat_: { id_in: $sepHatIds } }] }
    ) {
      id
    }
    Arb_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $arbHatIds } }, { ownerHat_: { id_in: $arbHatIds } }] }
    ) {
      id
    }
    Celo_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $celoHatIds } }, { ownerHat_: { id_in: $celoHatIds } }] }
    ) {
      id
    }
    Pol_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $polHatIds } }, { ownerHat_: { id_in: $polHatIds } }] }
    ) {
      id
    }
    BaseSep_agreementEligibilities(
      where: { or: [{ arbitratorHat_: { id_in: $baseSepHatIds } }, { ownerHat_: { id_in: $baseSepHatIds } }] }
    ) {
      id
    }
  }
`;

// const HSG_FRAGMENT = gql`
//   fragment HSG on HatSignerGateV2 {
//     id
//     safe
//     thresholdType
//     minThreshold
//     targetThreshold
//     signerHats {
//       id
//       maxSupply
//     }
//     ownerHat {
//       id
//     }
//   }
// `;

const HSG_QUERY = gql`
  query getCrossChainHSGs(
    $ethHatIds: [ID!]
    $baseHatIds: [ID!]
    $sepHatIds: [ID!]
    $opHatIds: [ID!]
    $gnoHatIds: [ID!]
    $arbHatIds: [ID!]
    $celoHatIds: [ID!]
    $polHatIds: [ID!]
    $baseSepHatIds: [ID!]
  ) {
    # HSG OWNERS
    Eth_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $ethHatIds } }, { signerHats_: { id_in: $ethHatIds } }] }
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
    Op_hatsSignerGateV2S(where: { or: [{ ownerHat_: { id_in: $opHatIds } }, { signerHats_: { id_in: $opHatIds } }] }) {
      # 10
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
    Gno_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $gnoHatIds } }, { signerHats_: { id_in: $gnoHatIds } }] }
    ) {
      # 100
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
    Pol_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $polHatIds } }, { signerHats_: { id_in: $polHatIds } }] }
    ) {
      # 137
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
    Base_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $baseHatIds } }, { signerHats_: { id_in: $baseHatIds } }] }
    ) {
      # 8453
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
    Arb_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $arbHatIds } }, { signerHats_: { id_in: $arbHatIds } }] }
    ) {
      # 42161
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
    Celo_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $celoHatIds } }, { signerHats_: { id_in: $celoHatIds } }] }
    ) {
      # 42220
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

    # testnets
    BaseSep_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $baseSepHatIds } }, { signerHats_: { id_in: $baseSepHatIds } }] }
    ) {
      # 84532
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
    Sep_hatsSignerGateV2S(
      where: { or: [{ ownerHat_: { id_in: $sepHatIds } }, { signerHats_: { id_in: $sepHatIds } }] }
    ) {
      # 11155111
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
  }
`;

const MODULE_MANAGER_HATS_QUERY = gql`
  query getCrossChainModuleManagerHats(
    $ethModules: [String!]
    $baseModules: [String!]
    $sepModules: [String!]
    $opModules: [String!]
    $gnoModules: [String!]
    $arbModules: [String!]
    $celoModules: [String!]
    $polModules: [String!]
    $baseSepModules: [String!]
  ) {
    Eth_hats(where: { eligibility_in: $ethModules }) {
      id
    }
    Base_hats(where: { eligibility_in: $baseModules }) {
      id
    }
    Sep_hats(where: { eligibility_in: $sepModules }) {
      id
    }
    Op_hats(where: { eligibility_in: $opModules }) {
      id
    }
    Gno_hats(where: { eligibility_in: $gnoModules }) {
      id
    }
    Arb_hats(where: { eligibility_in: $arbModules }) {
      id
    }
    Celo_hats(where: { eligibility_in: $celoModules }) {
      id
    }
    Pol_hats(where: { eligibility_in: $polModules }) {
      id
    }
    BaseSep_hats(where: { eligibility_in: $baseSepModules }) {
      id
    }
  }
`;

const meshClient = new GraphQLClient(`${process.env.NEXT_PUBLIC_MESH_API}/graphql` as string);

const getCrossChainCouncilManagers = async (hatIdsByNetwork: NetworkAddressList | undefined) => {
  if (!hatIdsByNetwork || every(hatIdsByNetwork, isEmpty)) return null;

  return meshClient
    .request(CROSS_CHAIN_COUNCIL_MANAGERS_QUERY, {
      ethHatIds: hatIdsByNetwork.Eth || [],
      baseHatIds: hatIdsByNetwork.Base || [],
      sepHatIds: hatIdsByNetwork.Sep || [],
      opHatIds: hatIdsByNetwork.Op || [],
      gnoHatIds: hatIdsByNetwork.Gno || [],
      arbHatIds: hatIdsByNetwork.Arb || [],
      celoHatIds: hatIdsByNetwork.Celo || [],
      polHatIds: hatIdsByNetwork.Pol || [],
      baseSepHatIds: hatIdsByNetwork.BaseSep || [],
    })
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

  const response = await meshClient.request(MODULE_MANAGER_HATS_QUERY, {
    ethModules: modulesByNetwork.Eth || [],
    baseModules: modulesByNetwork.Base || [],
    sepModules: modulesByNetwork.Sep || [],
    opModules: modulesByNetwork.Op || [],
    gnoModules: modulesByNetwork.Gno || [],
    arbModules: modulesByNetwork.Arb || [],
    celoModules: modulesByNetwork.Celo || [],
    polModules: modulesByNetwork.Pol || [],
    baseSepModules: modulesByNetwork.BaseSep || [],
  });

  return stripSuffix({
    object: response as Record<string, unknown[]>,
    mapFn: (hat) => get(hat, 'id', ''),
  });
};

const getCrossChainHSG = async (hatIdsByNetwork: Record<string, string[]> | undefined) => {
  if (!hatIdsByNetwork || every(hatIdsByNetwork, isEmpty)) return null;

  const response = await meshClient.request(HSG_QUERY, {
    ethHatIds: hatIdsByNetwork.Eth || [],
    baseHatIds: hatIdsByNetwork.Base || [],
    sepHatIds: hatIdsByNetwork.Sep || [],
    opHatIds: hatIdsByNetwork.Op || [],
    gnoHatIds: hatIdsByNetwork.Gno || [],
    arbHatIds: hatIdsByNetwork.Arb || [],
    celoHatIds: hatIdsByNetwork.Celo || [],
    polHatIds: hatIdsByNetwork.Pol || [],
    baseSepHatIds: hatIdsByNetwork.BaseSep || [],
  });

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

    if (moduleManagersError) {
      setBanner({
        message: 'Error fetching cross-chain councils list',
        variant: 'error',
        error: moduleManagersError,
      });
      return;
    }
    if (moduleManagerHatsError) {
      setBanner({
        message: 'Error fetching cross-chain module managers',
        variant: 'error',
        error: moduleManagerHatsError,
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
