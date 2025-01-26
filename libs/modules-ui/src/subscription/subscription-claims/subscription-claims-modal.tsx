'use client';

import { ModuleParameter } from '@hatsprotocol/modules-sdk';
import { PublicLockV14 } from '@unlock-protocol/contracts';
import { Modal, useEligibility } from 'contexts';
import { map } from 'lodash';
import { useLockFromHat } from 'modules-hooks';
import { ModuleDetails } from 'types';
import { getDuration } from 'utils';
import { Hex } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

import { AllowanceActions } from './allowance-actions';

export const SubscriptionClaimsModal = ({
  moduleDetails,
  moduleParameters,
}: {
  moduleDetails: ModuleDetails;
  moduleParameters: ModuleParameter[] | undefined;
}) => {
  const { chainId } = useEligibility();

  const { address } = useAccount();
  const { lockAddress, duration, symbol } = useLockFromHat({
    moduleParameters,
    chainId,
  });

  const lockContract = {
    address: lockAddress,
    abi: PublicLockV14.abi,
    chainId,
  } as const;
  const contracts = [
    {
      ...lockContract,
      functionName: 'balanceOf',
      args: [address as Hex],
    },
  ];
  const { data: contractData } = useReadContracts({
    contracts: contracts as any,
  });

  const [keyBalance] = map(contractData, 'result') as [bigint];
  const activeSubscription = !!keyBalance && keyBalance > BigInt(0);

  const durationText = getDuration(duration);

  if (!moduleDetails) return null;

  // CURRENTLY ONLY USED ON MOBILE CLAIMS APP, ADJUST FOR OTHER USES

  return (
    <Modal name={`${moduleDetails?.instanceAddress}-subscriptionManagerClaims`}>
      <div className='space-y-2'>
        <h3 className='text-lg font-medium'>Subscribe to claim this Hat</h3>

        <div className='space-y-2'>
          <p>
            To enable a {durationText.adjective} withdrawal of the subscription fee, you pre-approved Unlock Protocol to
            withdraw {symbol} from the address that you use to claim the role.
          </p>
          <p>You can adjust the authorized amount to control the duration of your subscription.</p>
          <p>
            If the authorization runs out or the {durationText.adjective} fee is not covered in your wallet, you will
            lose your Hat and its privileges.
          </p>
        </div>

        <AllowanceActions
          moduleDetails={moduleDetails}
          moduleParameters={moduleDetails?.liveParameters}
          activeSubscription={activeSubscription}
        />
      </div>
    </Modal>
  );
};
