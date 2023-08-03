import _ from 'lodash';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import useToast from '@/hooks/useToast';
import { decimalId, hatIdToHex, prettyIdToIp, toTreeId } from '@/lib/hats';
import { calculateCid, pinJson } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { IHat } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import useTreeDetails from './useTreeDetails';

type UseSubmitHatChangesProps = {
  hatData: IHat;
  chainId: number;
  newImageURI: string;
  dirtyFields: any;
  newDetailsData: any;
  maxSupply: number;
  eligibility: `0x${string}`;
  toggle: `0x${string}`;
  eligibilityResolvedAddress?: `0x${string}` | null;
  toggleResolvedAddress?: `0x${string}` | null;
  imageUrl: string;
};

const useSubmitHatChanges = ({
  hatData,
  chainId,
  newImageURI,
  dirtyFields,
  newDetailsData,
  maxSupply,
  eligibility,
  toggle,
  eligibilityResolvedAddress,
  toggleResolvedAddress,
  imageUrl,
}: UseSubmitHatChangesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const account = useAccount();
  const hatsClient = createHatsClient(chainId);
  const toast = useToast();
  const queryClient = useQueryClient();

  const onSubmit = async () => {
    const calls = [];

    const detailsName = `details_${_.toString(chainId)}_${prettyIdToIp(
      _.get(hatData, 'admin.id'),
    )}`;
    const newCidResult = await pinJson(
      {
        type: '1.0',
        data: newDetailsData,
      },
      {
        name: detailsName,
      },
    );
    const newCid = `ipfs://${newCidResult}`;

    if (hatData.details !== newCid) {
      try {
        const callData = hatsClient.changeHatDetailsCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newDetails: newCid,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (
      dirtyFields.imageUrl ||
      (imageUrl && newImageURI && imageUrl !== newImageURI)
    ) {
      try {
        const callData = hatsClient.changeHatImageURICallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newImageURI,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.maxSupply) {
      try {
        const callData = hatsClient.changeHatMaxSupplyCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newMaxSupply: maxSupply as number,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.eligibility) {
      try {
        const callData = hatsClient.changeHatEligibilityCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newEligibility: eligibilityResolvedAddress ?? eligibility,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.toggle) {
      try {
        const callData = hatsClient.changeHatToggleCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newToggle: toggleResolvedAddress ?? toggle,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (dirtyFields.mutable) {
      try {
        const callData = hatsClient.makeHatImmutableCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });
        return;
      }
    }

    if (calls.length > 0) {
      setIsLoading(true);
      try {
        await hatsClient.multicall({
          account: account.address as `0x${string}`,
          calls,
        });

        const hatQueryKey = ['hatDetails', hatIdToHex(hatData?.id), chainId];
        const treeId = toTreeId(hatData?.id);
        const treeQueryKey = ['treeDetails', treeId, chainId];

        console.log('invalidateQuery', hatQueryKey, [
          'treeDetails',
          treeId,
          chainId,
        ]);

        queryClient.setQueryData(['hatDetailsField', newCid], newDetailsData);

        console.log('start invalidate');
        queryClient.invalidateQueries(hatQueryKey);
        queryClient.invalidateQueries(treeQueryKey);
        queryClient.invalidateQueries(['hatDetailsField', newCid]);
        console.log('end invalidate');
        setIsLoading(false);

        toast.success({
          title: 'Transaction successful',
          description: 'Hat was successfully updated',
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
  };

  return { onSubmit, isLoading };
};

export default useSubmitHatChanges;
