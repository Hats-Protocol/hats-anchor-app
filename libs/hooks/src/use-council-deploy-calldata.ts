import {
  HATS_MODULES_FACTORY_ADDRESS,
  MULTICALL3_ADDRESS,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { FALLBACK_ADDRESS, hatIdDecimalToHex, HATS_V1, treeIdToTopHatId } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { pick, toNumber } from 'lodash';
import { useMultiClaimsHatterCheck } from 'modules-hooks';
import showdown from 'showdown';
import { CouncilFormData, SupportedChains } from 'types';
import {
  compileHatCreationData,
  compileHatIds,
  compileHatMintCallData,
  compileHsgV2CallData,
  compileModuleData,
  createHatsClient,
  fetchToken,
  logger,
  pinFileToIpfs,
  simulateSafeAddress,
} from 'utils';
import { hexToNumber } from 'viem';

import { useToast } from './use-toast';

const converter = new showdown.Converter();

type UseCouncilDeployCalldataProps = {
  formData: CouncilFormData;
  tree: Tree | null | undefined;
};

const useCouncilDeployCalldata = ({ formData, tree }: UseCouncilDeployCalldataProps) => {
  const { toast } = useToast();

  // assembling module list and removing if they already exist, but we need to know better if they exist
  // object notation for the requirements may make this easier

  const {
    instanceAddress,
    claimableHats,
    isLoading: isLoadingMultiClaimsHatterCheck,
  } = useMultiClaimsHatterCheck({
    chainId: toNumber(formData.chain?.value) as SupportedChains,
    selectedHatId: tree?.id ? hatIdDecimalToHex(treeIdToTopHatId(hexToNumber(tree.id))) : undefined,
    onchainHats: tree?.hats,
  });
  console.log('instanceAddress', instanceAddress, claimableHats, tree?.hats);

  const computeCalldata = async () => {
    // logger.debug('compiling calldata for council deployment');

    const chainId = toNumber(formData.chain?.value);

    // Create hats client
    const hatsClient = await createHatsClient(chainId).catch((err) =>
      logger.error('Failed to create hats client', err),
    );
    if (!hatsClient) {
      throw new Error('Failed to create hats client');
    }

    // compute hat ids
    const currentTreeCount = await hatsClient.getTreesCount();
    const computedHatIds = compileHatIds({ treeData: tree, formData: formData, treesCount: currentTreeCount });
    // logger.debug(
    //   'COMPUTED HAT IDs',
    //   mapValues(computedHatIds, (id) => hatIdDecimalToIp(id)),
    // );

    const pinningKey = await fetchToken(20);

    let agreementCid = '';
    if (formData.eligibilityRequirements?.agreement?.content) {
      const agreementMarkdown = converter.makeMarkdown(formData.eligibilityRequirements.agreement.content || '');
      // pin agreement file to ipfs
      agreementCid = await pinFileToIpfs({
        file: agreementMarkdown,
        fileName: `agreement_${formData.organizationName}_${formData.councilName}_${chainId}`,
        token: pinningKey as string,
      });
    }
    // logger.debug('AGREEMENT CID', agreementCid);

    // TODO check optional steps before compiling the remaining calldata

    // compile modules data
    return compileModuleData({
      formData,
      hatIds: computedHatIds,
      agreementCid,
      existingMch: instanceAddress,
    })
      .then(async ({ callData: modulesCalldata, addresses: moduleAddresses, moduleArgs, mchArgs, mchCallData }) => {
        // logger.debug('MODULES CALLLDATA', !!modulesCalldata, moduleAddresses);
        console.log('mch args', mchArgs);

        // compile create hats data
        return compileHatCreationData({
          formData,
          tree,
          hatIds: computedHatIds,
          pinningKey,
          moduleAddresses,
          hatsClient,
        })
          .then(async (result) => {
            const { hatsProtocolCalls, hatsToCreate } = pick(result, ['hatsProtocolCalls', 'hatsToCreate']);
            // logger.debug('HATS PROTOCOL CALLS', hatsProtocolCalls);
            if (!hatsProtocolCalls) return; // TODO: handle this

            // compile mint hats call data
            const { hatsProtocolCalls: mintHatsCallData } = compileHatMintCallData({
              hatsProtocolCalls,
              formData,
              computedHatIds,
              tree,
              moduleAddresses,
              hatsClient,
            });
            const { hsgV2Calldata, hsgArgs } = compileHsgV2CallData({
              formData,
              computedHatIds,
            });

            // simulate safe address
            return simulateSafeAddress({
              chainId,
              hsgV2Calldata,
              toast,
            })
              .then(({ safeProxyAddress }) => {
                // logger.debug('SAFE PROXY ADDRESS', safeProxyAddress);
                if (!safeProxyAddress) return {};
                // mint hats
                const mintCouncilHatCallData = hatsClient.mintHatCallData({
                  hatId: computedHatIds.council,
                  wearer: safeProxyAddress as `0x${string}`,
                });
                mintHatsCallData.push(mintCouncilHatCallData.callData);

                // create hats protocol multicall call data
                const hatsProtocolCallData = hatsClient.multicallCallData(mintHatsCallData);

                // create transfer top hat call data
                const transferTopHatCallData = hatsClient.transferHatCallData({
                  hatId: computedHatIds.topHat,
                  from: MULTICALL3_ADDRESS,
                  to: formData.admins?.[0]?.address || FALLBACK_ADDRESS, // TODO creator? or should it be deployer/current user?
                });

                // assemble the multicall calldata
                const hatsProtocolCall = {
                  target: HATS_V1 as `0x${string}`,
                  allowFailure: false,
                  callData: hatsProtocolCallData.callData,
                };

                const modulesCall = {
                  target: HATS_MODULES_FACTORY_ADDRESS,
                  allowFailure: false,
                  callData: modulesCalldata,
                };

                const hsgV2Call = {
                  target: ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
                  allowFailure: false,
                  callData: hsgV2Calldata,
                };

                const transferTopHatCall = {
                  target: HATS_V1 as `0x${string}`,
                  allowFailure: false,
                  callData: transferTopHatCallData.callData,
                };

                const calls = [hatsProtocolCall, modulesCall, hsgV2Call, transferTopHatCall];
                // logger.debug('CALLS', calls);

                return Promise.resolve({
                  modulesCalldata,
                  mchArgs,
                  hatsProtocolCallData,
                  transferTopHatCallData,
                  hsgV2Calldata,
                  calls,
                  moduleArgs,
                  mchCallData,
                  hsgArgs,
                  hatIds: computedHatIds,
                  moduleAddresses,
                  hatsToCreate,
                });
              })
              .catch((err) => {
                logger.error('Failed to compile calldata', err);
                throw err;
              });
          })
          .catch((err) => {
            logger.error('Failed to compile calldata', err);
            throw err;
          });
      })
      .catch((err) => {
        logger.error('Failed to compile calldata', err);
        throw err;
      });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['council-deploy-calldata', formData, tree, instanceAddress],
    queryFn: computeCalldata,
    enabled: !!formData && !!tree && !isLoadingMultiClaimsHatterCheck,
  });

  // TODO: handle this
  const {
    hatsProtocolCallData,
    calls,
    moduleArgs,
    hsgArgs,
    hatIds,
    moduleAddresses,
    hatsToCreate,
    mchArgs,
    mchCallData,
  } = pick(data as any, [
    'calls', // multicall calldata
    // separate calls
    'hatsProtocolCallData',
    'moduleArgs',
    'hsgArgs',
    'mchArgs',
    'mchCallData',
    // computed hat IDs and module addresses
    'hatIds',
    'moduleAddresses',
    'hatsToCreate',
  ]);

  return {
    hatsProtocolCallData,
    calls,
    moduleArgs,
    hsgArgs,
    mchArgs,
    mchCallData,
    hatIds,
    moduleAddresses,
    hatsToCreate,
    isLoading,
    error,
  };
};

export { useCouncilDeployCalldata };
