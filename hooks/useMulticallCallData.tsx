import _ from 'lodash';
import { useMemo } from 'react';

import useToast from '@/hooks/useToast';
import { hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { pinJson } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { getStoredHatsChanges } from '@/lib/general';
import { decimalId } from '@/lib/hats';
import { TRIGGER_OPTIONS } from '@/constants';
import { FormDataDetails } from '@/types';

type useMulticallCallDataProps = {
  chainId: number;
  treeId?: string;
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
  const hatsClient = createHatsClient(chainId);
  const toast = useToast();
  const allStoredHatsChanges = getStoredHatsChanges({
    chainId,
    treeId,
  });

  const computeMulticallData = async () => {
    const calls = [];

    for (let change of allStoredHatsChanges) {
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

        if (newCid) {
          calls.push(
            hatsClient.changeHatDetailsCallData({
              hatId: decimalId(id) as unknown as bigint,
              newDetails: newCid,
            }),
          );
        }
      }

      if (maxSupply) {
        calls.push(
          hatsClient.changeHatMaxSupplyCallData({
            hatId: decimalId(id) as unknown as bigint,
            newMaxSupply: parseInt(maxSupply, 10),
          }),
        );
      }

      if (eligibility) {
        calls.push(
          hatsClient.changeHatEligibilityCallData({
            hatId: decimalId(id) as unknown as bigint,
            newEligibility: eligibility,
          }),
        );
      }

      if (toggle) {
        calls.push(
          hatsClient.changeHatToggleCallData({
            hatId: decimalId(id) as unknown as bigint,
            newToggle: toggle,
          }),
        );
      }

      if (mutable) {
        calls.push(
          hatsClient.makeHatImmutableCallData({
            hatId: decimalId(id) as unknown as bigint,
          }),
        );
      }

      if (imageUrl) {
        calls.push(
          hatsClient.changeHatImageURICallData({
            hatId: decimalId(id) as unknown as bigint,
            newImageURI: imageUrl,
          }),
        );
      }
    }

    return hatsClient.multicallCallData(calls);
  };

  const multicallData = useMemo(computeMulticallData, [allStoredHatsChanges]);

  const onSubmit = async () => {
    try {
      return multicallData; // return the memoized multicall data
    } catch (error: unknown) {
      toast.error({
        title: `Error processing changes for Tree ID: ${treeId}`,
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
      return;
    }
  };

  return { onSubmit, multicallData };
};

export default useMulticallCallData;
