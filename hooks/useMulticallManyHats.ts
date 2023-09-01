/* eslint-disable no-restricted-syntax */
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import { FALLBACK_ADDRESS, MUTABILITY, TRIGGER_OPTIONS } from '@/constants';
import useToast from '@/hooks/useToast';
import { decimalId, getDefaultAdminId } from '@/lib/hats';
import { handleDetailsPin } from '@/lib/ipfs';
import { chainsMap, createHatsClient } from '@/lib/web3';
import { FormDataDetails, IHat } from '@/types';
import { useTreeForm } from '@/contexts/TreeFormContext';

export const hasDetailsChanged = ({
  name,
  description,
  guilds,
  responsibilities,
  authorities,
  isEligibilityManual,
  revocationsCriteria,
  isToggleManual,
  deactivationsCriteria,
}: Partial<FormDataDetails>) => {
  return (
    name ||
    description ||
    !_.isEmpty(guilds) ||
    !_.isEmpty(responsibilities) ||
    !_.isEmpty(authorities) ||
    isEligibilityManual ||
    !_.isEmpty(revocationsCriteria) ||
    isToggleManual ||
    !_.isEmpty(deactivationsCriteria)
  );
};

interface CallData {
  functionName: string;
  callData: Hex;
}

const useMulticallCallManyHats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const currentChain = useChainId();
  const {
    chainId,
    treeId,
    storedData,
    onchainHats,
    orgChartTree,
    setStoredData,
  } = useTreeForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { patchTree } = useTreeForm();

  const hatsClient = createHatsClient(chainId);

  const onSubmit = async () => {
    if (!chainId || !treeId || !address || !hatsClient || !storedData)
      return undefined;

    const calls = [] as CallData[];
    const proposedChanges = [] as any[];
    if (currentChain !== chainId) {
      toast.error({
        title: 'Wrong Chain',
        description: `Please change to ${chainsMap(chainId)?.name}`,
      });
      return;
    }

    for (const hat of storedData) {
      const {
        maxSupply,
        eligibility,
        toggle,
        mutable,
        imageUrl,
        isEligibilityManual,
        isToggleManual,
        revocationsCriteria,
        deactivationsCriteria,
        name,
        description,
        guilds,
        responsibilities,
        authorities,
        id: hatId,
        wearers,
      } = hat;

      const hatChanges = {
        id: hatId,
      } as any;
      if (!hatId) continue;

      let currentHat;
      if (_.includes(_.map(onchainHats, 'id'), hatId)) {
        currentHat = _.find(orgChartTree, ['id', hatId]);
      }
      const currentHatDetails = _.get(currentHat, 'detailsObject.data');

      const detailsData = {
        name: name || currentHatDetails?.name || '',
        description: description || currentHatDetails?.description || '',
        guilds: guilds || currentHatDetails?.guilds || [],
        responsibilities: responsibilities
          ? _.reject(responsibilities, ['label', ''])
          : _.reject(currentHatDetails?.responsibilities, ['label', '']),
        authorities: authorities
          ? _.reject(authorities, ['label', ''])
          : _.reject(currentHatDetails?.authorities, ['label', '']),
        eligibility: {
          manual: isToggleManual
            ? isEligibilityManual === TRIGGER_OPTIONS.MANUALLY
            : currentHatDetails?.eligibility?.manual,
          criteria: revocationsCriteria
            ? _.reject(revocationsCriteria, ['label', ''])
            : _.reject(currentHatDetails?.eligibility?.criteria, [
                'label',
                '',
              ]) || [],
        },
        toggle: {
          manual: isToggleManual
            ? isToggleManual === TRIGGER_OPTIONS.MANUALLY
            : currentHatDetails?.toggle?.manual,
          criteria: deactivationsCriteria
            ? _.reject(deactivationsCriteria, ['label', ''])
            : _.reject(currentHatDetails?.toggle?.criteria, ['label', '']) ||
              [],
        },
      };
      console.log(detailsData);

      if (!_.includes(_.map(onchainHats, 'id'), hatId)) {
        // eslint-disable-next-line no-await-in-loop
        const details = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
        });
        const newHat = {
          admin: BigInt(getDefaultAdminId(hatId)),
          details,
          maxSupply: _.toNumber(maxSupply) || 1,
          eligibility: eligibility || FALLBACK_ADDRESS,
          toggle: toggle || FALLBACK_ADDRESS,
          mutable: mutable === MUTABILITY.IMMUTABLE ? false : true,
          imageURI: imageUrl,
        };
        const newHatData = hatsClient.createHatCallData(newHat);

        calls.push(newHatData);
        proposedChanges.push({
          id: hatId,
          chainId,
          newHat,
        });

        if (_.eq(_.size(wearers), 1)) {
          const wearerAddress = _.get(_.first(wearers), 'address');
          if (wearerAddress) {
            const mintHatWearersData = hatsClient.mintHatCallData({
              hatId: decimalId(hatId) as unknown as bigint,
              wearer: wearerAddress,
            });

            if (mintHatWearersData) {
              calls.push(mintHatWearersData);
            }
          }
        } else {
          const batchMintHatWearersData = hatsClient.batchMintHatsCallData({
            hatIds: Array(_.size(wearers)).fill(
              decimalId(hatId),
            ) as unknown as bigint[],
            wearers: _.map(wearers, 'address'),
          });

          if (batchMintHatWearersData) {
            calls.push(batchMintHatWearersData);
          }
        }
        // eslint-disable-next-line no-continue
        continue;
      }

      if (
        hasDetailsChanged({
          name,
          description,
          guilds,
          responsibilities,
          authorities,
          isEligibilityManual,
          revocationsCriteria,
          isToggleManual,
          deactivationsCriteria,
        })
      ) {
        // eslint-disable-next-line no-await-in-loop
        const newCid = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
        });
        console.log(hatId, newCid);

        const changeHatDetailsData = hatsClient.changeHatDetailsCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newDetails: newCid,
        });

        if (changeHatDetailsData) {
          calls.push(changeHatDetailsData);
          hatChanges.details = newCid;
        }
      }

      if (maxSupply) {
        const changeHatMaxSupplyData = hatsClient.changeHatMaxSupplyCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newMaxSupply: parseInt(maxSupply, 10),
        });

        if (changeHatMaxSupplyData) {
          calls.push(changeHatMaxSupplyData);
          hatChanges.newMaxSupply = parseInt(maxSupply, 10);
        }
      }

      if (wearers) {
        if (_.eq(_.size(wearers), 1)) {
          const wearerAddress = _.get(_.first(wearers), 'address');
          if (wearerAddress) {
            const mintHatWearersData = hatsClient.mintHatCallData({
              hatId: decimalId(hatId) as unknown as bigint,
              wearer: wearerAddress,
            });

            if (mintHatWearersData) {
              calls.push(mintHatWearersData);
              hatChanges.wearer = wearerAddress;
            }
          }
        } else {
          const batchMintHatWearersData = hatsClient.batchMintHatsCallData({
            hatIds: Array(_.size(wearers)).fill(
              decimalId(hatId),
            ) as unknown as bigint[],
            wearers: _.map(wearers, 'address'),
          });

          if (batchMintHatWearersData) {
            calls.push(batchMintHatWearersData);
            hatChanges.wearers = _.map(wearers, 'address');
          }
        }
      }

      if (eligibility) {
        const changeHatEligibilityData =
          hatsClient.changeHatEligibilityCallData({
            hatId: decimalId(hatId) as unknown as bigint,
            newEligibility: eligibility,
          });

        if (changeHatEligibilityData) {
          calls.push(changeHatEligibilityData);
          hatChanges.eligibility = eligibility;
        }
      }

      if (toggle) {
        const changeHatToggleData = hatsClient.changeHatToggleCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newToggle: toggle,
        });

        if (changeHatToggleData) {
          calls.push(changeHatToggleData);
          hatChanges.toggle = toggle;
        }
      }

      if (mutable) {
        const makeHatImmutableData = hatsClient.makeHatImmutableCallData({
          hatId: decimalId(hatId) as unknown as bigint,
        });

        if (makeHatImmutableData) {
          calls.push(makeHatImmutableData);
          hatChanges.mutable = false;
        }
      }

      if (imageUrl) {
        const changeHatImageURIData = hatsClient.changeHatImageURICallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newImageURI: imageUrl,
        });

        if (changeHatImageURIData) {
          calls.push(changeHatImageURIData);
          hatChanges.imageUrl = imageUrl;
        }
      }

      proposedChanges.push(hatChanges);
    }
    console.log(calls);

    if (calls.length > 0) {
      setIsLoading(true);
      try {
        await hatsClient.multicall({
          account: address as Hex,
          calls,
        });

        // TODO handle optimistic image update
        const treeQueryKey = ['treeDetails', treeId, chainId];
        const orgChartTreeQueryKey = [
          'orgChartTree',
          { chainId, treeId },
          _.map(onchainHats, 'id'),
        ];
        queryClient.invalidateQueries(orgChartTreeQueryKey);
        queryClient.invalidateQueries(treeQueryKey);

        _.forEach(storedData, (hat) => {
          const hatId = _.get(hat, 'id');
          const hatDetailsField = _.get(hat, 'details');

          if (hatId && hatDetailsField) {
            queryClient.invalidateQueries(['hatDetailsField', hatDetailsField]);
            queryClient.invalidateQueries(['hatDetails', hatId, chainId]);
          }
        });

        setIsLoading(false);
        patchTree?.(proposedChanges);
        setStoredData?.([]);

        toast.success({
          title: 'Transaction successful',
          description: 'Hats were successfully updated',
        });
        return true;
      } catch (error: unknown) {
        console.log(error);
        // catch signature rejection error

        toast.error({
          title: 'Error occurred!',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });

        setIsLoading(false);
        return false;
      }
    }
    return false;
  };

  return { onSubmit, isLoading };
};

export default useMulticallCallManyHats;
