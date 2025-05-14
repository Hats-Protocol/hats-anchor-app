'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useAllWearers, useHatDetails, useIsAdmin } from 'hats-hooks';
import { useToast, useWaitForSubgraph } from 'hooks';
import { find, get, isEmpty, map, size, split, toLower } from 'lodash';
import posthog from 'posthog-js';
import { useState } from 'react';
import { CouncilMember, ModuleDetails, OffchainCouncilData, SupportedChains } from 'types';
import { Button, cn, MemberAvatar, Tooltip } from 'ui';
import {
  chainsMap,
  createHatsClient,
  formatAddress,
  getAllWearers,
  logger,
  // sendTelegramMessage,
  // tgFormatAddress,
} from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain, useWalletClient } from 'wagmi';

import { AddUserModal } from '../add-user-modal';
import { UpdateAgreementModal } from '../update-agreement-modal';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
  primarySignerHat: Hex | undefined;
}

const AgreementManager = ({ m, chainId, offchainCouncilDetails, primarySignerHat }: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId ?? 11155111 });
  const { user } = usePrivy();
  const { toast } = useToast();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const ownerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;
  const isAdminHat = size(split(hatIdDecimalToIp(ownerHatId), '.')) === 2;

  const { data: ownerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
  });
  const { wearers: agreementManagers } = useAllWearers({
    selectedHat: ownerHat,
    chainId: chainId as SupportedChains,
  });
  const userIsAdmin = useIsAdmin({ address: userAddress as Hex, hatId: primarySignerHat, chainId });
  const allWearers = getAllWearers(offchainCouncilDetails?.creationForm);
  const userIsAgreementManager = !!find(agreementManagers, { id: toLower(userAddress) });

  const addAgreementManagerLoading = useState(false);
  const [, setAddManagerLoading] = addAgreementManagerLoading;
  const addAgreementManager = async (data: CouncilMember | undefined) => {
    if (!data || !userAddress) {
      toast({ title: 'No address or user found', variant: 'destructive' });
      setAddManagerLoading(false);
      return;
    }

    return createHatsClient(chainId ?? 11155111, walletClient)
      .then((hatsClient) => {
        if (!hatsClient) {
          toast({ title: 'Failed to create hats client', variant: 'destructive' });
          setAddManagerLoading(false);
          return;
        }

        hatsClient
          .mintHat({
            account: userAddress,
            hatId: BigInt(ownerHatId),
            wearer: data.address,
          })
          .then((result) => {
            if (!result?.transactionHash) return;

            handlePendingTx?.({
              hash: result?.transactionHash,
              txChainId: chainId ?? 11155111,
              txDescription: `Added ${data.name || formatAddress(data.address)} as an agreement manager`,
              waitForSubgraph,
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
                queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
                setAddManagerLoading(false);

                // sendTelegramMessage(
                //   `New agreement manager added: ${tgFormatAddress(data.address)} https://pro.hatsprotocol.xyz/council/${slug}/manage`,
                // );

                if (offchainCouncilDetails?.hsg) {
                  posthog.capture('Added Agreement Manager', {
                    chainId,
                    councilAddress: getAddress(offchainCouncilDetails.hsg),
                    moduleAddress: m.instanceAddress,
                    userAddress: data.address,
                  });
                }

                setModals?.({});
              },
            });
          })
          .catch((error) => {
            logger.debug('Failed to add agreement manager', { error });
            toast({ title: 'Failed to add agreement manager', variant: 'destructive' });
            setAddManagerLoading(false);
          });
      })
      .catch((error) => {
        logger.debug('Failed to create Hats client', { error });
        toast({ title: 'Failed to create Hats client', variant: 'destructive' });
        setAddManagerLoading(false);
      });
  };

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!m) return null;

  return (
    <div className='flex flex-col gap-6' id={m.instanceAddress}>
      <h2 className='text-2xl font-bold'>Agreement Management</h2>

      <div className='space-y-4'>
        <div className='space-y-1'>
          {isAdminHat ? (
            <h2 className='font-medium'>Delegated to Council Managers</h2>
          ) : (
            <h2 className='font-bold'>Agreement Managers</h2>
          )}
          <p className='text-sm'>Writes an agreement and controls adherence</p>
        </div>

        <div className='flex flex-col gap-4'>
          {isEmpty(agreementManagers) && <p className='mt-2 text-sm'>No agreement managers</p>}
          {map(agreementManagers, (wearer) => {
            const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

            return (
              <div key={wearer.id} className={cn(isDev && !offchainDetails && 'bg-functional-link-primary/10')}>
                <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} />
              </div>
            );
          })}
        </div>

        {!!user && (userIsAgreementManager || userIsAdmin) && (
          <div className='mt-2 flex gap-2'>
            {currentChainId === chainId ? (
              <>
                {userIsAgreementManager && (
                  <Button variant='outline-blue' rounded='full' onClick={() => setModals?.({ updateAgreement: true })}>
                    Edit Agreement
                  </Button>
                )}

                {userIsAdmin && (
                  <div className='relative'>
                    <Tooltip label={isAdminHat ? 'Soon you can replace the council managers' : undefined}>
                      <span className='pointer-events-auto inline-block'>
                        <Button
                          variant='outline-blue'
                          rounded='full'
                          onClick={() => setModals?.({ 'addUser-agreementAdmin': true })}
                          disabled={isAdminHat}
                        >
                          Add Agreement Manager
                        </Button>
                      </span>
                    </Tooltip>

                    {isAdminHat && (
                      <span className='bg-functional-success absolute -right-2 -top-2 flex h-4 w-10 items-center justify-center rounded-full text-xs font-bold text-white'>
                        soon
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Button variant='outline' rounded='full' onClick={() => switchChain({ chainId: chainId ?? 11155111 })}>
                Switch to {chainsMap(chainId ?? 11155111)?.name}
              </Button>
            )}
          </div>
        )}
      </div>

      <UpdateAgreementModal moduleDetails={m} chainId={chainId} />

      <AddUserModal
        type='agreementAdmin'
        userLabel='Agreement Manager'
        chainId={chainId as SupportedChains}
        councilId={offchainCouncilDetails?.creationForm?.id}
        existingUsers={agreementManagers as CouncilMember[]}
        afterSuccess={addAgreementManager}
        addUserLoading={addAgreementManagerLoading}
      />
    </div>
  );
};

export { AgreementManager };
