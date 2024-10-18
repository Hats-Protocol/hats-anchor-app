import { useQueryClient } from '@tanstack/react-query';
import { useToast, useWaitForSubgraph } from 'hooks';
import { first, get, map, size } from 'lodash';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { HandlePendingTx } from 'types';
import { createHatsSignerGateClient, wagmiConfig } from 'utils';
import { Hex, maxUint256 } from 'viem';
import { getWalletClient } from 'wagmi/actions';

// type DeployType = 'hsgAndSafe' | 'mhsgAndSafe' | 'hsg' | 'mhsg';

const DEPLOY_TYPE = {
  hsgAndSafe: 'hsgAndSafe',
  mhsgAndSafe: 'mhsgAndSafe',
  hsg: 'hsg',
  mhsg: 'mhsg',
};

export const useHsgDeploy = ({
  chainId,
  afterSuccess,
  localForm,
  handlePendingTx,
  onError,
}: UseHsgDeployProps) => {
  const waitForSubgraph = useWaitForSubgraph({ chainId });
  const queryClient = useQueryClient();
  const toast = useToast();

  // Could pass through values individually if not used in a form
  const { watch } = localForm;

  const formValues = watch();
  const {
    owner,
    signers,
    minThreshold,
    targetThreshold,
    dynamicThreshold,
    maxSigners: formMaxSigners,
    safeAddress,
    defaultMaxSigners,
    safe: hasExistingSafe,
  } = formValues;
  const ownerCustom = formValues['owner-custom'];
  // TODO handle custom options for signers

  const deployType = useMemo(() => {
    if (size(signers) > 1) {
      if (hasExistingSafe === 'connect' && safeAddress) {
        return DEPLOY_TYPE.mhsg;
      }
      return DEPLOY_TYPE.mhsgAndSafe;
    }
    if (hasExistingSafe === 'connect' && safeAddress) {
      return DEPLOY_TYPE.hsg;
    }
    return DEPLOY_TYPE.hsgAndSafe;
  }, [safeAddress, signers, hasExistingSafe]);

  const ownerHatId = useMemo(() => {
    if (!owner) return BigInt(0);
    if (get(owner, 'value') === 'custom' && ownerCustom) {
      return BigInt(ownerCustom);
    }
    return BigInt(get(owner, 'value'));
  }, [owner, ownerCustom]);
  const signersHatIds = map(signers, (signer) => BigInt(signer.value));
  const maxSigners = useMemo(() => {
    if (defaultMaxSigners) return BigInt(maxUint256);

    if (!formMaxSigners) return BigInt(0);
    return BigInt(formMaxSigners);
  }, [formMaxSigners, defaultMaxSigners]);

  const thresholds = useMemo(() => {
    if (!targetThreshold || !minThreshold) {
      return { targetThreshold: BigInt(0), minThreshold: BigInt(0) };
    }
    let localTargetThreshold = BigInt(minThreshold);
    if (dynamicThreshold) {
      localTargetThreshold = BigInt(targetThreshold);
    }

    return {
      minThreshold: BigInt(minThreshold),
      targetThreshold: localTargetThreshold,
    };
  }, [targetThreshold, minThreshold, dynamicThreshold]);

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['treeDetails'] });
    queryClient.invalidateQueries({ queryKey: ['hatDetails'] });
    queryClient.invalidateQueries({ queryKey: ['ancillaryModules'] });

    afterSuccess();
  }, [afterSuccess, queryClient]);

  const handleError = useCallback(
    (error: Error) => {
      // eslint-disable-next-line no-console
      console.log(error);
      onError();
      if (
        (error.name === 'TransactionExecutionError' ||
          error.name === 'ContractFunctionExecutionError') &&
        error.message.includes('User rejected the request')
      ) {
        toast.error({
          title: 'Signature rejected!',
          description: 'Please accept the transaction in your wallet',
        });
      } else {
        toast.error({
          title: 'Error occurred!',
          description: 'An error occurred while processing the transaction.',
        });
      }
    },
    [onError, toast],
  );

  // DEPLOY FUNCTIONS

  const deployHsgAndSafe = useCallback(async () => {
    const client = await createHatsSignerGateClient(chainId);
    const walletClient = await getWalletClient(wagmiConfig);

    if (!client || !walletClient?.account) {
      // eslint-disable-next-line no-console
      console.log('No client or account found');
      return;
    }

    return client
      .deployHatsSignerGateAndSafe({
        account: walletClient.account,
        ownerHatId,
        signersHatId: first(signersHatIds) as bigint,
        ...thresholds,
        maxSigners,
      })
      .then((result) => {
        handlePendingTx?.({
          hash: result.transactionHash as Hex,
          txChainId: chainId,
          txDescription: 'Deployed Hats Signer Gate and Safe', // TODO add for hat, et al
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch(handleError);
  }, [
    chainId,
    ownerHatId,
    signersHatIds,
    thresholds,
    maxSigners,
    handlePendingTx,
    waitForSubgraph,
    onSuccess,
    handleError,
  ]);

  const deployHsgOnly = useCallback(async () => {
    const client = await createHatsSignerGateClient(chainId);
    const walletClient = await getWalletClient(wagmiConfig);

    if (!client || !walletClient?.account) {
      // eslint-disable-next-line no-console
      console.log('No client or address found');
      return;
    }

    return client
      .deployHatsSignerGate({
        account: walletClient.account,
        ownerHatId,
        signersHatId: first(signersHatIds) as bigint,
        ...thresholds,
        maxSigners,
        safe: safeAddress,
      })
      .then((result) => {
        handlePendingTx?.({
          hash: result.transactionHash as Hex,
          txChainId: chainId,
          txDescription: 'Deployed Hats Signer Gate', // TODO add for hat, et al
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch(handleError);
  }, [
    chainId,
    ownerHatId,
    signersHatIds,
    thresholds,
    maxSigners,
    handlePendingTx,
    waitForSubgraph,
    onSuccess,
    safeAddress,
    handleError,
  ]);

  const deployMhsgAndSafe = useCallback(async () => {
    const client = await createHatsSignerGateClient(chainId);
    const walletClient = await getWalletClient(wagmiConfig);

    if (!client || !walletClient?.account) {
      // eslint-disable-next-line no-console
      console.log('No client or address found');
      return;
    }
    return client
      .deployMultiHatsSignerGateAndSafe({
        account: walletClient.account,
        ownerHatId,
        signersHatIds,
        ...thresholds,
        maxSigners,
      })
      .then((result) => {
        handlePendingTx?.({
          hash: result.transactionHash as Hex,
          txChainId: chainId,
          txDescription: 'Deployed Multi-Hats Signer Gate and Safe', // TODO add for hat, et al
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch(handleError);
  }, [
    chainId,
    ownerHatId,
    signersHatIds,
    thresholds,
    maxSigners,
    handlePendingTx,
    waitForSubgraph,
    onSuccess,
    handleError,
  ]);

  const deployMhsgOnly = useCallback(async () => {
    const client = await createHatsSignerGateClient(chainId);
    const walletClient = await getWalletClient(wagmiConfig);

    if (!client || !walletClient?.account) {
      // eslint-disable-next-line no-console
      console.log('No client or address found');
      return;
    }
    return client
      .deployMultiHatsSignerGate({
        account: walletClient.account,
        ownerHatId,
        signersHatIds,
        ...thresholds,
        maxSigners,
        safe: safeAddress,
      })
      .then((result) => {
        handlePendingTx?.({
          hash: result.transactionHash as Hex,
          txChainId: chainId,
          txDescription: 'Deployed Multi-Hats Signer Gate', // TODO add for hat, et al
          waitForSubgraph,
          onSuccess,
        });
      })
      .catch(handleError);
  }, [
    chainId,
    ownerHatId,
    signersHatIds,
    thresholds,
    maxSigners,
    handlePendingTx,
    waitForSubgraph,
    onSuccess,
    safeAddress,
    handleError,
  ]);

  const deployHsg = async () => {
    if (!deployType) {
      // eslint-disable-next-line no-console
      console.log('No deploy type found');
      return;
    }
    if (deployType === DEPLOY_TYPE.hsgAndSafe) {
      deployHsgAndSafe();
    } else if (deployType === DEPLOY_TYPE.mhsgAndSafe) {
      deployMhsgAndSafe();
    } else if (deployType === DEPLOY_TYPE.hsg) {
      deployHsgOnly();
    } else if (deployType === DEPLOY_TYPE.mhsg) {
      deployMhsgOnly();
    }
  };

  return { deployHsg };
};

interface UseHsgDeployProps {
  chainId: number | undefined;
  afterSuccess: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localForm: UseFormReturn<any>;
  handlePendingTx: HandlePendingTx | undefined;
  onError: () => void;
}
