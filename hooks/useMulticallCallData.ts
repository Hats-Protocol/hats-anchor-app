import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import useToast from '@/hooks/useToast';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { pinJson } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { generateLocalStorageKey } from '@/lib/general';
import { decimalId, getDefaultAdminId, handleDetailsPin } from '@/lib/hats';
import { FALLBACK_ADDRESS, MUTABILITY, TRIGGER_OPTIONS } from '@/constants';
import { FormDataDetails, IHat } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Hex } from 'viem';

type useMulticallCallDataProps = {
  chainId: number | undefined;
  treeId: string | undefined;
  onchainHats: IHat[] | undefined;
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

const useMulticallCallData = ({
  chainId,
  treeId,
  onchainHats,
}: useMulticallCallDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedData, setResolvedData] = useState<any>(null);
  const hatsClient = createHatsClient(chainId);
  const toast = useToast();
  const previousResolvedDataRef = useRef<any>(null);

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData] = useLocalStorage<any[]>(localStorageKey, []);

  const computeMulticallData = async () => {
    if (!chainId || !treeId || !hatsClient) return;
    const calls = [] as Hex[];

    for (let hat of storedData) {
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
        wearers,
        id: hatId,
      } = hat;
      // console.log(eligibility, toggle);

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
        const details = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
        });
        const newHatData = hatsClient?.createHatCallData({
          admin: BigInt(getDefaultAdminId(hatId)),
          details,
          maxSupply: maxSupply || 1,
          eligibility: eligibility || FALLBACK_ADDRESS,
          toggle: toggle || FALLBACK_ADDRESS,
          mutable: mutable === MUTABILITY.MUTABLE,
          imageURI: imageUrl,
        });
        if (newHatData && newHatData.callData) {
          calls.push(newHatData.callData);
        }
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

        const newCid = await handleDetailsPin({
          chainId,
          hatId,
          newDetails: detailsData,
          existingDetails,
        });

        const changeHatDetailsData = hatsClient?.changeHatDetailsCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newDetails: newCid,
        });

        if (changeHatDetailsData?.callData) {
          calls.push(changeHatDetailsData.callData);
        }
      }

      if (maxSupply) {
        const changeHatMaxSupplyData = hatsClient?.changeHatMaxSupplyCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newMaxSupply: parseInt(maxSupply, 10),
        });

        if (changeHatMaxSupplyData?.callData) {
          calls.push(changeHatMaxSupplyData.callData);
        }
      }

      if (wearers) {
        if (_.eq(_.size(wearers), 1)) {
          const wearerAddress = _.get(_.first(wearers), 'address');
          if (wearerAddress) {
            const mintHatWearersData = hatsClient?.mintHatCallData({
              hatId: decimalId(hatId) as unknown as bigint,
              wearer: wearerAddress,
            });

            if (mintHatWearersData?.callData) {
              calls.push(mintHatWearersData.callData);
            }
          }
        } else {
          const batchMintHatWearersData = hatsClient?.batchMintHatsCallData({
            hatIds: Array(_.size(wearers)).fill(
              decimalId(hatId),
            ) as unknown as bigint[],
            wearers: _.map(wearers, 'address'),
          });

          if (batchMintHatWearersData?.callData) {
            calls.push(batchMintHatWearersData.callData);
          }
        }
      }

      if (eligibility) {
        const changeHatEligibilityData =
          hatsClient?.changeHatEligibilityCallData({
            hatId: decimalId(hatId) as unknown as bigint,
            newEligibility: eligibility,
          });

        if (changeHatEligibilityData?.callData) {
          calls.push(changeHatEligibilityData.callData);
        }
      }

      if (toggle) {
        const changeHatToggleData = hatsClient?.changeHatToggleCallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newToggle: toggle,
        });

        if (changeHatToggleData?.callData) {
          calls.push(changeHatToggleData.callData);
        }
      }

      if (mutable) {
        const makeHatImmutableData = hatsClient?.makeHatImmutableCallData({
          hatId: decimalId(hatId) as unknown as bigint,
        });

        if (makeHatImmutableData?.callData) {
          calls.push(makeHatImmutableData.callData);
        }
      }

      if (imageUrl) {
        const changeHatImageURIData = hatsClient?.changeHatImageURICallData({
          hatId: decimalId(hatId) as unknown as bigint,
          newImageURI: imageUrl,
        });

        if (changeHatImageURIData?.callData) {
          calls.push(changeHatImageURIData.callData);
        }
      }
    }
    // console.log('calls', calls);

    return hatsClient?.multicallCallData([...calls]);
  };

  const multicallData = useMemo(() => {
    return computeMulticallData();
  }, [storedData]);

  useEffect(() => {
    const resolveData = async () => {
      try {
        const data = await multicallData;

        if (!_.isEqual(data, previousResolvedDataRef.current)) {
          setResolvedData(data);
          previousResolvedDataRef.current = data;
        }
      } catch (error) {
        toast.error({
          title: `Error processing changes for Tree ID: ${treeId}`,
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
      } finally {
        setIsLoading(false);
      }
    };

    resolveData();
  }, [multicallData, toast, treeId]);

  return { resolvedData, isLoading };
};

export default useMulticallCallData;
