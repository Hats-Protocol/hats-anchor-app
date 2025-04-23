import {
  HATS_MODULES_FACTORY_ABI,
  HATS_MODULES_FACTORY_ADDRESS,
  HSG_V2_ADDRESS,
  initialDeployMultiStatus,
  initialDeployStatus,
  MULTICALL3_ABI,
  MULTICALL3_ADDRESS,
  ZODIAC_MODULE_PROXY_FACTORY_ABI,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { hatIdToTreeId, HATS_ABI, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { getAccessToken } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { find, first, get } from 'lodash';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import { SetStateAction, useMemo } from 'react';
import { Dispatch } from 'react';
import { Call, CouncilFormData, DeployStatus, HandlePendingTx, ModulesAddresses } from 'types';
import {
  addCouncilForForm,
  chainIdToString,
  chainsMap,
  createHatsModulesClient,
  createOrganization,
  getCouncilsGraphqlClient,
  logger,
  ORGANIZATION_BY_NAME_QUERY,
  updateCouncilForm,
} from 'utils';
import { Hex, parseEventLogs, TransactionReceipt } from 'viem';
import { useAccount, useSimulateContract, useWalletClient } from 'wagmi';

import { useToast } from './use-toast';

interface OrganizationResponse {
  organizations: Array<{
    id: string;
    name: string;
  }>;
}

const useCouncilDeploy = ({
  formData,
  firstCouncil,
  calls,
  chainId,
  draftId,
  hatIds,
  hatsProtocolCallData,
  moduleArgs,
  hsgArgs,
  moduleAddresses,
  handlePendingTx,
  waitForSubgraph,
  setDeployStatus,
}: UseCouncilDeployProps) => {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const { toast } = useToast();

  const router = useRouter();

  // after accepted, included, indexed
  const onSuccess = async (data: TransactionReceipt | undefined) => {
    if (!data || !draftId) return;
    logger.info('Transaction successful', data);
    // TODO handle hat creation data
    const hatCreatedLogs = parseEventLogs({
      logs: data.logs,
      abi: HATS_ABI,
      eventName: 'HatCreated',
    });
    const hsgCreatedLogs = parseEventLogs({
      logs: data.logs,
      abi: ZODIAC_MODULE_PROXY_FACTORY_ABI,
      eventName: 'ModuleProxyCreation',
    });
    const hatsModulesClient = await createHatsModulesClient(chainId);
    if (!hatsModulesClient) {
      logger.error('Failed to create hats modules client');
      throw new Error('Failed to create hats modules client');
    }
    // logger.debug('relevant deploy logs', { hatCreatedLogs, hsgCreatedLogs });

    setDeployStatus((prev) => ({ ...prev, processTx: true }));

    // get hsg address
    const hsgAddress = get(
      find(hsgCreatedLogs, (log: { args: { masterCopy: string } }) => log.args.masterCopy === HSG_V2_ADDRESS),
      'args.proxy',
    );
    // on second + council the hat logs are separate from the final (hsg) tx result data
    const firstHatId = hatIds?.topHat || get(first(hatCreatedLogs), 'args.id');
    const treeId = firstHatId ? hatIdToTreeId(firstHatId) : undefined;

    // Check if organization already exists
    const accessToken = await getAccessToken();
    const orgName =
      typeof formData.organizationName === 'object' ? formData.organizationName.value : formData.organizationName;
    const existingOrg = await getCouncilsGraphqlClient(accessToken ?? undefined).request<OrganizationResponse>(
      ORGANIZATION_BY_NAME_QUERY,
      { name: orgName },
    );

    // get or create organization
    let organizationId;
    if (existingOrg.organizations && existingOrg.organizations.length > 0) {
      // Use existing organization
      organizationId = existingOrg.organizations[0].id;
    } else {
      // Create new organization
      const organization = await createOrganization({
        name: orgName,
        accessToken,
      });
      organizationId = get(organization, 'createOrganization.id');
    }

    logger.info('organization id', organizationId);
    // create council record
    const council = await addCouncilForForm({
      chainId,
      organizationId,
      hsgAddress,
      treeId, // get from hatId
      membersSelectionModule: moduleAddresses?.councilMemberAllowlist,
      membersCriteriaModule: moduleAddresses?.complianceAllowlist,
      deployed: true,
      accessToken,
    });
    logger.info('council created', council);
    const councilId = get(council, 'createCouncil.id');

    // update council form with council ID
    await updateCouncilForm({
      draftId,
      councilId,
      accessToken,
    });
    logger.debug('council form updated with council id:', councilId);

    setDeployStatus((prev) => ({ ...prev, updateMetadata: true }));

    posthog.capture('Council Deployed', {
      councilName: formData.councilName,
      organizationName: formData.organizationName,
      chain: chainsMap(chainId)?.name,
      hsgAddress,
    });

    // redirect without updating final `setDeployStatus`
    const redirectUrl = `/councils/${chainIdToString(chainId)}:${hsgAddress}/members`;
    logger.debug('redirecting to ', redirectUrl);
    router.push(redirectUrl);
  };

  const simulateFullMulticall = useSimulateContract({
    address: calls && firstCouncil ? MULTICALL3_ADDRESS : undefined,
    abi: MULTICALL3_ABI,
    functionName: 'aggregate3',
    args: calls && firstCouncil ? [calls as never[]] : undefined, // Call[] is not known by wagmi here
    chainId: chainId,
  });
  // console.log('simulate multicall', chainId, simulateFullMulticall);

  const deployMulticall = async () => {
    setDeployStatus((prev) => ({ ...prev, prepareTx: true }));
    const hash = await walletClient
      ?.writeContract({
        account: address,
        address: MULTICALL3_ADDRESS,
        abi: MULTICALL3_ABI,
        functionName: 'aggregate3',
        args: [calls as never[]], // Call[] is not known by wagmi here
        chain: chainsMap(chainId), // TODO should we use the expected `chainId` here?
      })
      .catch((err) => {
        logger.error('Failed to create transaction', {
          err,
          calls,
          address,
          MULTICALL3_ADDRESS,
        });

        toast({ title: 'Failed to create transaction', description: 'Please try again', variant: 'destructive' });
        // reset deploy status
        setDeployStatus(initialDeployStatus);
        return;
      });

    if (!hash) {
      logger.error('Failed to create transaction');
      throw new Error('Failed to create transaction');
    } else {
      logger.debug('hash', hash);
      setDeployStatus((prev) => ({ ...prev, deployTx: true }));
    }

    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: 'Deploying council',
      waitForSubgraph,
      onTxAccepted: () => {
        setDeployStatus((prev) => ({ ...prev, confirmTx: true }));
      },
      onTxIndexed: () => {
        setDeployStatus((prev) => ({ ...prev, indexTx: true }));
      },
      onSuccess,
      onError: (error) => {
        logger.error('Error deploying council:', error);
        throw error;
      },
    });
  };

  const simulateHats = useSimulateContract({
    account: address,
    address: hatsProtocolCallData && !firstCouncil ? HATS_V1 : undefined,
    abi: HATS_ABI,
    functionName: 'multicall',
    args: [[get(hatsProtocolCallData, 'callData')] as Hex[]],
    chainId,
  });
  // console.log('simulate hats', simulateHats);

  const deployHatsFn = async () => {
    setDeployStatus((prev) => ({ ...prev, prepareTx: true }));
    if (!hatsProtocolCallData) {
      logger.error('No hats protocol call data');
      throw new Error('No hats protocol call data');
    }

    const hash = await walletClient
      ?.writeContract({
        account: address,
        address: HATS_V1,
        abi: HATS_ABI,
        functionName: 'multicall',
        args: [[get(hatsProtocolCallData, 'callData')] as Hex[]],
        chain: chainsMap(chainId),
      })
      .catch((err) => {
        console.log('error', err);
        setDeployStatus(initialDeployMultiStatus); // reset the deploy screen, for reactivating
        // TODO toast
      });

    if (!hash) {
      setDeployStatus(initialDeployMultiStatus);
      logger.error('Failed to create transaction');
      throw new Error('Failed to create transaction');
    } else {
      logger.debug('hash', hash);
    }
    setDeployStatus((prev) => ({ ...prev, deployHatsTx: true }));

    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: 'Deploying council',
      waitForSubgraph,
      onTxAccepted: () => {
        setDeployStatus((prev) => ({ ...prev, confirmHatsTx: true }));
      },
      onTxIndexed: () => {
        setDeployStatus((prev) => ({ ...prev, indexHatsTx: true }));
      },
      onSuccess: () => {
        // TODO handle success
        // could trigger the next tx, use button as fallback
        deployModules();
        logger.debug('successfully deployed Hats updates');
      },
      onError: (error) => {
        logger.error('Error deploying council:', error);
        throw error;
      },
    });
  };

  const localModuleArgs = useMemo(() => {
    if (!moduleArgs) return undefined;
    return [
      moduleArgs.implementations,
      moduleArgs.moduleHatIds,
      moduleArgs.immutableArgs,
      moduleArgs?.initArgs,
      moduleArgs?.saltNonces,
    ] as [Hex[], bigint[], Hex[], Hex[], bigint[]];
  }, [moduleArgs]);

  const simulateModules = useSimulateContract({
    account: address,
    address: moduleArgs && !firstCouncil ? HATS_MODULES_FACTORY_ADDRESS : undefined,
    abi: HATS_MODULES_FACTORY_ABI,
    functionName: 'batchCreateHatsModule',
    args: localModuleArgs,
    chainId,
  });
  // console.log('simulate modules', simulateModules);

  const deployModulesFn = async () => {
    if (!moduleArgs) {
      logger.error('No module args');
      throw new Error('No module args');
    }

    const hash = await walletClient
      ?.writeContract({
        account: address,
        address: HATS_MODULES_FACTORY_ADDRESS,
        abi: HATS_MODULES_FACTORY_ABI,
        functionName: 'batchCreateHatsModule',
        args: [
          moduleArgs?.implementations,
          moduleArgs?.moduleHatIds,
          moduleArgs?.immutableArgs,
          moduleArgs?.initArgs,
          moduleArgs?.saltNonces,
        ],
        chain: chainsMap(chainId),
      })
      .catch((err) => {
        console.log('error', err);
        setDeployStatus(initialDeployMultiStatus); // reset the deploy screen, for reactivating
        // TODO toast
      });
    setDeployStatus((prev) => ({ ...prev, deployModulesTx: true }));

    if (!hash) {
      logger.error('Failed to create transaction');
      throw new Error('Failed to create transaction');
    } else {
      logger.debug('hash', hash);
    }

    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: 'Deploying modules',
      waitForSubgraph,
      onTxAccepted: () => {
        setDeployStatus((prev) => ({ ...prev, confirmModulesTx: true }));
      },
      onTxIndexed: () => {
        setDeployStatus((prev) => ({ ...prev, indexModulesTx: true }));
      },
      onSuccess: () => {
        deployHsg();
        logger.debug('successfully deployed modules');
      },
      onError: (error) => {
        logger.error('Error deploying modules:', error);
        throw error;
      },
    });
  };

  const localHsgArgs = useMemo(() => {
    if (!hsgArgs) return undefined;
    return [hsgArgs.address, hsgArgs.callData, hsgArgs.nonce] as [string, Hex, bigint];
  }, [hsgArgs]);

  const simulateHsg = useSimulateContract({
    account: address,
    address: hsgArgs && !firstCouncil ? ZODIAC_MODULE_PROXY_FACTORY_ADDRESS : undefined,
    abi: ZODIAC_MODULE_PROXY_FACTORY_ABI,
    functionName: 'deployModule',
    args: localHsgArgs,
    chainId,
  });
  // console.log('simulate hsg', simulateHsg);

  const deployHsgFn = async () => {
    if (!hsgArgs) {
      logger.error('No hsg args');
      throw new Error('No hsg args');
    }

    const hash = await walletClient
      ?.writeContract({
        account: address,
        address: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
        abi: ZODIAC_MODULE_PROXY_FACTORY_ABI,
        functionName: 'deployModule',
        args: [hsgArgs.address, hsgArgs.callData, hsgArgs.nonce],
      })
      .catch((err) => {
        console.log('error', err);
        setDeployStatus(initialDeployMultiStatus); // reset the deploy screen, for reactivating
        // TODO toast
      });
    setDeployStatus((prev) => ({ ...prev, deployHsgTx: true }));

    if (!hash) {
      logger.error('Failed to create transaction');
      throw new Error('Failed to create transaction');
    } else {
      logger.debug('hash', hash);
    }

    handlePendingTx?.({
      hash,
      txChainId: chainId,
      txDescription: 'Deploying hsg',
      waitForSubgraph,
      onTxAccepted: () => {
        setDeployStatus((prev) => ({ ...prev, confirmHsgTx: true }));
      },
      onTxIndexed: () => {
        setDeployStatus((prev) => ({ ...prev, indexHsgTx: true }));
      },
      onSuccess,
      onError: (error) => {
        logger.error('Error deploying hsg:', error);
        throw error;
      },
    });
  };

  const { mutateAsync, isPending: isLoading } = useMutation({
    mutationFn: deployMulticall,
  });

  const { mutateAsync: deployHats } = useMutation({
    mutationFn: deployHatsFn,
  });

  const { mutateAsync: deployModules } = useMutation({
    mutationFn: deployModulesFn,
  });

  const { mutateAsync: deployHsg } = useMutation({
    mutationFn: deployHsgFn,
  });

  return {
    deploy: mutateAsync,
    simulateCouncil: simulateFullMulticall,
    deployHats,
    deployModules,
    deployHsg,
    simulateHats,
    simulateModules,
    simulateHsg,
    isLoading,
  };
};

interface FnCallData {
  functionName: string;
  callData: string;
}

interface ModuleArgs {
  implementations: Hex[];
  moduleHatIds: bigint[];
  immutableArgs: Hex[];
  initArgs: Hex[];
  saltNonces: bigint[];
}

interface HsgArgs {
  address: string;
  callData: Hex;
  nonce: bigint;
}

type UseCouncilDeployProps = {
  formData: CouncilFormData;
  firstCouncil: boolean;
  calls: Call[] | undefined;
  chainId: number;
  draftId: string | null | undefined;
  hatIds: { [key: string]: bigint } | undefined;
  hatsProtocolCallData: FnCallData | undefined;
  moduleArgs: ModuleArgs | undefined;
  hsgArgs: HsgArgs | undefined;
  moduleAddresses: ModulesAddresses | undefined;
  handlePendingTx: HandlePendingTx | undefined;
  waitForSubgraph: any;
  setDeployStatus: Dispatch<SetStateAction<DeployStatus>>;
};

export { useCouncilDeploy };
