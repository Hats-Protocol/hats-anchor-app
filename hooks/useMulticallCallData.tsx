import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import useToast from '@/hooks/useToast';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { pinJson } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { generateLocalStorageKey, getStoredHatsChanges } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { TRIGGER_OPTIONS } from '@/constants';
import { FormDataDetails } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Hex } from 'viem';

type useMulticallCallDataProps = {
  chainId: number;
  treeId: string;
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
    guilds.length > 0 ||
    responsibilities.length > 0 ||
    authorities.length > 0 ||
    isEligibilityManual ||
    revocationsCriteria.length > 0 ||
    isToggleManual ||
    deactivationsCriteria.length > 0
  );
};

const useMulticallCallData = ({
  chainId,
  treeId,
}: useMulticallCallDataProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedData, setResolvedData] = useState<any>(null);
  const hatsClient = createHatsClient(chainId);
  const toast = useToast();
  const previousResolvedDataRef = useRef<any>(null);

  const localStorageKey = generateLocalStorageKey(chainId, treeId);
  const [storedData] = useLocalStorage<any[]>(localStorageKey, []);

  const computeMulticallData = async () => {
    const calls = [] as Hex[];

    for (let change of storedData) {
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
        id,
      } = change;

      const detailsName = `details_${_.toString(chainId)}_${hatIdDecimalToIp(
        BigInt(id),
      )}`;

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
        const newDetailsData = {
          name,
          description,
          guilds,
          responsibilities,
          authorities,
          eligibility: {
            manual: isEligibilityManual === TRIGGER_OPTIONS.MANUALLY,
            criteria: revocationsCriteria,
          },
          toggle: {
            manual: isToggleManual === TRIGGER_OPTIONS.MANUALLY,
            criteria: deactivationsCriteria,
          },
        };

        const newCid = `ipfs://${await pinJson(
          {
            type: '1.0',
            data: newDetailsData,
          },
          { name: detailsName },
        )}`;

        const changeHatDetailsData = hatsClient.changeHatDetailsCallData({
          hatId: decimalId(id) as unknown as bigint,
          newDetails: newCid,
        });

        if (changeHatDetailsData && changeHatDetailsData.callData) {
          calls.push(changeHatDetailsData.callData);
        }
      }

      if (maxSupply) {
        const changeHatMaxSupplyData = hatsClient.changeHatMaxSupplyCallData({
          hatId: decimalId(id) as unknown as bigint,
          newMaxSupply: parseInt(maxSupply, 10),
        });

        if (changeHatMaxSupplyData && changeHatMaxSupplyData.callData) {
          calls.push(changeHatMaxSupplyData.callData);
        }
      }

      if (eligibility) {
        const changeHatEligibilityData =
          hatsClient.changeHatEligibilityCallData({
            hatId: decimalId(id) as unknown as bigint,
            newEligibility: eligibility,
          });

        if (changeHatEligibilityData && changeHatEligibilityData.callData) {
          calls.push(changeHatEligibilityData.callData);
        }
      }

      if (toggle) {
        const changeHatToggleData = hatsClient.changeHatToggleCallData({
          hatId: decimalId(id) as unknown as bigint,
          newToggle: toggle,
        });

        if (changeHatToggleData && changeHatToggleData.callData) {
          calls.push(changeHatToggleData.callData);
        }
      }

      if (mutable) {
        const makeHatImmutableData = hatsClient.makeHatImmutableCallData({
          hatId: decimalId(id) as unknown as bigint,
        });

        if (makeHatImmutableData && makeHatImmutableData.callData) {
          calls.push(makeHatImmutableData.callData);
        }
      }

      if (imageUrl) {
        const changeHatImageURIData = hatsClient.changeHatImageURICallData({
          hatId: decimalId(id) as unknown as bigint,
          newImageURI: imageUrl,
        });

        if (changeHatImageURIData && changeHatImageURIData.callData) {
          calls.push(changeHatImageURIData.callData);
        }
      }
    }

    return hatsClient.multicallCallData([...calls]);
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
        console.error('Error:', error);
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
