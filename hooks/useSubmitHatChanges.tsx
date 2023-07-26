import _ from 'lodash';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import useToast from '@/hooks/useToast';
import { decimalId, prettyIdToIp } from '@/lib/hats';
import { pinJson } from '@/lib/ipfs';
import { createHatsClient } from '@/lib/web3';
import { IHat } from '@/types';

type UseSubmitHatChangesProps = {
  hatData: IHat;
  chainId: number;
  newImageURI: string;
  newDetails: string;
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
  newDetails,
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

  const onSubmit = async () => {
    const calls = [];

    if (hatData.details !== newDetails) {
      try {
        const callData = await hatsClient.changeHatDetailsCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newDetails,
        });

        const detailsName = `details_${_.toString(chainId)}_${prettyIdToIp(
          _.get(hatData, 'admin.id'),
        )}`;

        await pinJson(
          {
            type: '1.0',
            data: newDetailsData,
          },
          {
            name: detailsName,
          },
        );

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
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
        const callData = await hatsClient.changeHatImageURICallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newImageURI,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
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
        const callData = await hatsClient.changeHatMaxSupplyCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newMaxSupply: maxSupply as number,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
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
        const callData = await hatsClient.changeHatEligibilityCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newEligibility: eligibilityResolvedAddress ?? eligibility,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
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
        const callData = await hatsClient.changeHatToggleCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
          newToggle: toggleResolvedAddress ?? toggle,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
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
        const callData = await hatsClient.makeHatImmutableCallData({
          hatId: decimalId(hatData?.id) as unknown as bigint,
        });

        calls.push(callData);
      } catch (error: unknown) {
        toast.error({
          title: 'Error occured',
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
        setIsLoading(false);

        toast.success({
          title: 'Transaction successful',
          description: 'Hat was successfully updated',
        });
      } catch (error: unknown) {
        toast.error({
          title: 'Error occurred!',
          description:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
        });

        setIsLoading(false);
      }
    }
  };

  return { onSubmit, isLoading };
};

export default useSubmitHatChanges;
