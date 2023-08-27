/* eslint-disable no-restricted-syntax */
import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { useState } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { FALLBACK_ADDRESS, MUTABILITY, TRIGGER_OPTIONS } from '@/constants';
import useLocalStorage from '@/hooks/useLocalStorage';
import useToast from '@/hooks/useToast';
import { generateLocalStorageKey } from '@/lib/general';
import { decimalId, getDefaultAdminId } from '@/lib/hats';
import { handleDetailsPin } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { FormDataDetails, IHat } from '@/types';

type useMulticallCallManyHatsProps = {
  chainId?: number;
  treeId?: string;
  onchainHats?: IHat[];
};

const hasDetailsChanged = ({
  name,
  description,
  guilds,
  responsibilities,
  authorities,
  isEligibilityManual,
  revocationsCriteria,
  isToggleManual,
  deactivationsCriteria,
}: FormDataDetails) => {
  return (
    name ||
    description ||
    guilds?.length > 0 ||
    responsibilities?.length > 0 ||
    authorities?.length > 0 ||
    isEligibilityManual ||
    revocationsCriteria?.length > 0 ||
    isToggleManual ||
    deactivationsCriteria?.length > 0
  );
};

const useMulticallCallManyHats = ({
  chainId,
  treeId,
  onchainHats,
}: useMulticallCallManyHatsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const hatsClient = createHatsClient(chainId);
  const toast = useToast();
  const queryClient = useQueryClient();

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData, setStoredData] = useLocalStorage<any[]>(
    localStorageKey,
    [],
  );

  const onSubmit = async () => {
    if (!chainId || !treeId || !address || !hatsClient) return undefined;

    const calls = [] as any[];

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

      const detailsData = {
        name,
        description,
        guilds: guilds || [],
        responsibilities: _.reject(responsibilities, ['label', '']),
        authorities: _.reject(authorities, ['label', '']),
        eligibility: {
          manual: isEligibilityManual === TRIGGER_OPTIONS.MANUALLY,
          criteria: _.reject(revocationsCriteria, ['label', '']) || [],
        },
        toggle: {
          manual: isToggleManual === TRIGGER_OPTIONS.MANUALLY,
          criteria: _.reject(deactivationsCriteria, ['label', '']) || [],
        },
      };

      if (!_.includes(_.map(onchainHats, 'id'), hatId)) {
        // eslint-disable-next-line no-await-in-loop
        const details = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
        });
        const newHatData = hatsClient.createHatCallData({
          admin: BigInt(getDefaultAdminId(hatId)),
          details,
          maxSupply: maxSupply || 1,
          eligibility: eligibility || FALLBACK_ADDRESS,
          toggle: toggle || FALLBACK_ADDRESS,
          mutable: mutable === MUTABILITY.MUTABLE,
          imageURI: imageUrl,
        });
        calls.push(newHatData);
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
        const existingDetails = _.get(
          _.find(onchainHats, ['id', hatId]),
          'detailsObject.data',
        );
        // eslint-disable-next-line no-await-in-loop
        const newCid = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
          existingDetails,
        });

        const changeHatDetailsData = hatsClient.changeHatDetailsCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newDetails: newCid,
        });

        if (changeHatDetailsData) {
          calls.push(changeHatDetailsData);
        }
      }

      if (maxSupply) {
        const changeHatMaxSupplyData = hatsClient.changeHatMaxSupplyCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newMaxSupply: parseInt(maxSupply, 10),
        });

        if (changeHatMaxSupplyData) {
          calls.push(changeHatMaxSupplyData);
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
      }

      if (eligibility) {
        const changeHatEligibilityData =
          hatsClient.changeHatEligibilityCallData({
            hatId: decimalId(hatId) as unknown as bigint,
            newEligibility: eligibility,
          });

        if (changeHatEligibilityData) {
          calls.push(changeHatEligibilityData);
        }
      }

      if (toggle) {
        const changeHatToggleData = hatsClient.changeHatToggleCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newToggle: toggle,
        });

        if (changeHatToggleData) {
          calls.push(changeHatToggleData);
        }
      }

      if (mutable) {
        const makeHatImmutableData = hatsClient.makeHatImmutableCallData({
          hatId: decimalId(hatId) as unknown as bigint,
        });

        if (makeHatImmutableData) {
          calls.push(makeHatImmutableData);
        }
      }

      if (imageUrl) {
        const changeHatImageURIData = hatsClient.changeHatImageURICallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newImageURI: imageUrl,
        });

        if (changeHatImageURIData) {
          calls.push(changeHatImageURIData);
        }
      }
    }

    if (calls.length > 0) {
      setIsLoading(true);
      try {
        await hatsClient.multicall({
          account: address as Hex,
          calls,
        });

        // TODO handle optimistic image update
        const treeQueryKey = ['treeDetails', treeId, chainId];

        queryClient.invalidateQueries(treeQueryKey);
        setIsLoading(false);
        setStoredData([]);

        toast.success({
          title: 'Transaction successful',
          description: 'Hats were successfully updated',
        });
        return true;
      } catch (error: unknown) {
        console.log(error);
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
