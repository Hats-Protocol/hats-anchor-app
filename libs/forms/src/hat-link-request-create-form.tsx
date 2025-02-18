'use client';

import { hatIdDecimalToIp, hatIdHexToDecimal, hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useOverlay, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, useWaitForSubgraph } from 'hooks';
import { first, isEmpty } from 'lodash';
import { useForm } from 'react-hook-form';
import { Button } from 'ui';
import { Hex } from 'viem';
import { useChainId } from 'wagmi';

import { Select } from './components';

// TODO fix select

const HatLinkRequestCreateForm = ({ newAdmin, wearerTopHats }: { newAdmin: string; wearerTopHats: Hex[] }) => {
  const currentChainId = useChainId();
  const { handlePendingTx } = useOverlay();
  const { chainId } = useTreeForm();
  const localForm = useForm({
    mode: 'all',
    defaultValues: {
      newAdmin: hatIdHexToDecimal(newAdmin),
      topHatDomain: first(wearerTopHats),
    },
  });
  const { handleSubmit, watch } = localForm;

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  // first(wearerTopHats) is the default value for topHatDomain
  const topHatDomain = useDebounce<Hex | undefined>(watch('topHatDomain'));

  const { writeAsync } = useHatContractWrite({
    functionName: 'requestLinkTopHatToTree',
    args: topHatDomain ? [hatIdToTreeId(BigInt(topHatDomain)), hatIdHexToDecimal(newAdmin)] : [],
    chainId,
    successToastData: {
      title: 'Successfully Requested to Link!',
      description:
        topHatDomain &&
        newAdmin &&
        `Successfully requested to link top hat ${hatIdDecimalToIp(
          BigInt(topHatDomain),
        )} to ${hatIdDecimalToIp(BigInt(newAdmin))}`,
    },
    queryKeys: [['hatDetails'], ['treeDetails']],
    handlePendingTx,
    waitForSubgraph,
  });

  const onSubmit = async () => {
    try {
      await writeAsync?.();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  if (isEmpty(wearerTopHats)) {
    return (
      <div className='space-y-4'>
        <p>
          Ask the wearer of this hat to become the admin of a Top Hat that you are wearing. You will lose admin control
          of this Top Hat!
        </p>
        <p>You are not wearing any Top Hats that can be linked to this tree.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-4'>
        <p>
          Ask the wearer of this hat to become the admin of a Top Hat that you are wearing. You will lose admin control
          of this Top Hat!
        </p>
        <div className='flex items-center gap-2'>
          <p className='font-medium'>New Admin:</p>
          <p>ID {hatIdDecimalToIp(BigInt(newAdmin))}</p>
        </div>
        <Select label='Enter domain of the Top Hat to be linked' name='topHatDomain' localForm={localForm} options={[]}>
          {/* {map(wearerTopHats, (hat: Hex) => (
            <option value={hat} key={hat}>
              {hatIdDecimalToIp(BigInt(hat))}
            </option>
          ))} */}
        </Select>

        <div className='flex justify-end'>
          <Button type='submit' disabled={!writeAsync || chainId !== currentChainId}>
            Request
          </Button>
        </div>
      </div>
    </form>
  );
};

export { HatLinkRequestCreateForm };
