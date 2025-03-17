'use client';

import { useOverlay, useSelectedHat, useTreeForm } from 'contexts';
import { useHatContractWrite } from 'hats-hooks';
import { useDebounce, useWaitForSubgraph } from 'hooks';
import { toNumber } from 'lodash';
import { useForm } from 'react-hook-form';
import { FaRegQuestionCircle, FaRegUserCircle } from 'react-icons/fa';
import { idToIp, toTreeId } from 'shared';
import { Button, Label, RadioGroup, RadioGroupItem } from 'ui';
import { formatAddress } from 'utils';
import { Hex } from 'viem';
import { useEnsName } from 'wagmi';

const HatWearerStatusForm = ({
  wearer,
  eligibility,
}: {
  wearer: Hex | undefined;
  eligibility: string; // form value
}) => {
  // const currentNetworkId = useChainId();
  // const { address } = useAccount();
  const { setModals, handlePendingTx } = useOverlay();
  const localForm = useForm({ mode: 'onBlur' });
  const { handleSubmit, watch, setValue } = localForm;
  const { chainId } = useTreeForm();
  const { selectedHat } = useSelectedHat();

  const hatId = selectedHat?.id;
  const standing = useDebounce<string>(watch('standing', 'Good Standing'));

  const { data: wearerName } = useEnsName({
    address: wearer,
    chainId: 1,
  });

  const getSuccessToastDescription = () => {
    if (eligibility !== 'Eligible') {
      return `Removed hat ${idToIp(hatId)} from ${formatAddress(wearerName)}${
        standing === 'Good Standing' ? '' : ' and set bad standing'
      }`;
    }

    return '';
  };

  const txDescription = getSuccessToastDescription();

  const waitForSubgraph = useWaitForSubgraph({ chainId });

  const { writeAsync, isLoading } = useHatContractWrite({
    functionName: 'setHatWearerStatus',
    args: [hatId, wearer, eligibility === 'Eligible', standing === 'Good Standing'],
    chainId,
    queryKeys: [
      ['hatDetails', { id: hatId, chainId }],
      ['treeDetails', toNumber(toTreeId(hatId))],
    ],
    txDescription,
    handlePendingTx,
    waitForSubgraph,
    successToastData: {
      title: 'Wearer Status Updated',
      description: txDescription,
    },
    // TODO move to submit check
    // enabled:
    //   !!wearer &&
    //   !!hatId &&
    //   isAddress(wearer) &&
    //   _.toLower(address) === selectedHat.eligibility &&
    //   chainId === currentNetworkId,
  });

  const onSubmit = async () => {
    // TODO handle loading state
    await writeAsync?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-8'>
        <p>Are you sure? The revoked Hats will lose all permissions instantly.</p>

        <div className='flex flex-col items-start'>
          <p className='text-sm uppercase'>Revoking hat of:</p>
          <div className='flex items-center gap-2'>
            <FaRegUserCircle />
            <p>{wearerName || formatAddress(wearer)}</p>
            {wearerName && <p className='text-sm'>({formatAddress(wearer)})</p>}
          </div>
        </div>

        <div className='flex flex-col items-start'>
          <div className='flex items-center gap-2'>
            <p>WEARER STANDING</p>
            <FaRegQuestionCircle />
          </div>
          <p className='text-sm text-gray-600'>
            Changes of wearer standing are being recorded on chain. To change it back to good you will have to submit a
            smart contract transaction.
          </p>
        </div>

        <RadioGroup
          defaultValue='Good Standing'
          onValueChange={(value) => setValue('standing', value)}
          className='flex gap-4'
        >
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='Good Standing' id='good-standing' />
            <Label htmlFor='good-standing'>Good Standing</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='Bad Standing' id='bad-standing' />
            <Label htmlFor='bad-standing'>Bad Standing</Label>
          </div>
        </RadioGroup>

        <div className='flex justify-end gap-3'>
          <Button onClick={() => setModals?.({})}>Cancel</Button>

          <Button
            type='submit'
            disabled={!wearer || isLoading || !writeAsync}
            variant={standing === 'Good Standing' ? 'default' : 'destructive'}
          >
            Revoke Hat Token in {standing}
          </Button>
        </div>
      </div>
    </form>
  );
};

export { HatWearerStatusForm };
