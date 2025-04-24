import {
  HATS_MODULES_FACTORY_ADDRESS,
  MULTICALL3_ADDRESS,
  ZODIAC_MODULE_PROXY_FACTORY_ADDRESS,
} from '@hatsprotocol/constants';
import { FALLBACK_ADDRESS, hatIdDecimalToIp, HATS_V1 } from '@hatsprotocol/sdk-v1-core';
import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { useQuery } from '@tanstack/react-query';
import { mapValues, pick, toNumber } from 'lodash';
import showdown from 'showdown';
import { CouncilFormData } from 'types';
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

  const computeCalldata = async () => {
    logger.debug('compiling calldata for council deployment');

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
    logger.debug(
      'COMPUTED HAT IDs',
      mapValues(computedHatIds, (id) => hatIdDecimalToIp(id)),
    );

    const pinningKey = await fetchToken(20);

    let agreementCid = '';
    if (formData.agreement) {
      const agreementMarkdown = converter.makeMarkdown(formData.agreement || '');
      // pin agreement file to ipfs
      agreementCid = await pinFileToIpfs({
        file: agreementMarkdown,
        fileName: `agreement_${formData.organizationName}_${formData.councilName}_${chainId}`,
        token: pinningKey as string,
      });
    }
    logger.debug('AGREEMENT CID', agreementCid);

    // TODO check optional steps before compiling the remaining calldata

    // compile modules data
    return compileModuleData({
      formData,
      hatIds: computedHatIds,
      agreementCid,
    })
      .then(async ({ callData: modulesCalldata, addresses: moduleAddresses, moduleArgs }) => {
        logger.debug('MODULES CALLLDATA', modulesCalldata, moduleAddresses);

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
            const { hatsProtocolCalls } = pick(result, ['hatsProtocolCalls']);
            logger.debug('HATS PROTOCOL CALLS', hatsProtocolCalls);
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

                return Promise.resolve({
                  modulesCalldata,
                  hatsProtocolCallData,
                  transferTopHatCallData,
                  hsgV2Calldata,
                  calls,
                  moduleArgs,
                  hsgArgs,
                  hatIds: computedHatIds,
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
    queryKey: ['council-deploy-calldata', formData, tree],
    queryFn: computeCalldata,
    enabled: !!formData,
  });
  // TODO: handle this
  // @ts-expect-error handle missing keys
  const { hatsProtocolCallData, calls, moduleArgs, hsgArgs, hatIds } = pick(data, [
    'calls', // multicall calldata
    // separate calls
    'hatsProtocolCallData',
    'moduleArgs',
    'hsgArgs',
    // computed hat IDs
    'hatIds',
  ]);

  return {
    hatsProtocolCallData,
    calls,
    moduleArgs,
    hsgArgs,
    hatIds,
    isLoading,
    error,
  };
};

export { useCouncilDeployCalldata };
