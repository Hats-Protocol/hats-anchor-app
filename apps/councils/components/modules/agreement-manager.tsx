import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useToast, useWaitForSubgraph } from 'hooks';
import { find, get, map, size, split, toLower } from 'lodash';
import { useState } from 'react';
import { CouncilMember, ModuleDetails, OffchainCouncilData, SupportedChains } from 'types';
import { Button, MemberAvatar, Tooltip } from 'ui';
import { createHatsClient, formatAddress, getAllWearers, logger, sendTelegramMessage, tgFormatAddress } from 'utils';
import { getAddress } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

import { AddUserModal } from '../add-user-modal';
import { UpdateAgreementModal } from '../update-agreement-modal';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
}

const AgreementManager = ({ m, chainId, slug, offchainCouncilDetails }: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { handlePendingTx } = useOverlay();
  const queryClient = useQueryClient();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId ?? 11155111 });
  const { user } = usePrivy();
  const { toast } = useToast();
  const ownerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;
  const isAdminHat = size(split(hatIdDecimalToIp(ownerHatId), '.')) === 2;
  logger.debug('isAdminHat', { ownerHatId: ownerHatId ? hatIdDecimalToIp(ownerHatId) : undefined, isAdminHat });

  const { data: ownerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
  });
  // const hatDetails = ownerHat?.detailsMetadata;
  const agreementManagers = get(ownerHat, 'wearers');
  // const hatName = ownerHatDetails?.name;
  const allWearers = getAllWearers(offchainCouncilDetails);
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

                sendTelegramMessage(
                  `New agreement manager added: ${tgFormatAddress(data.address)} https://pro.hatsprotocol.xyz/council/${slug}/manage`,
                );

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

  if (!m) return null;

  return (
    <div className='flex flex-col gap-6' id={m.instanceAddress}>
      <h2 className='text-2xl font-bold'>Agreement Manager</h2>

      <div className='space-y-4'>
        <div className='space-y-1'>
          {isAdminHat ? (
            <h2 className='font-medium'>Delegated to Council Managers</h2>
          ) : (
            <h2 className='font-bold'>Agreement Managers</h2>
          )}
          <p className='text-sm'>Writes an agreement and controls adherence</p>
        </div>

        <div className='flex flex-col gap-2'>
          {map(agreementManagers, (wearer) => {
            const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

            return <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} key={wearer.id} />;
          })}
        </div>

        {user && !!userIsAgreementManager && (
          <div className='mt-2 flex gap-2'>
            <Button variant='outline-blue' rounded='full' onClick={() => setModals?.({ updateAgreement: true })}>
              Edit Agreement
            </Button>

            <div className='relative'>
              <Tooltip label={isAdminHat ? 'Soon you can replace the council managers' : undefined}>
                <Button
                  variant='outline-blue'
                  rounded='full'
                  onClick={() => setModals?.({ 'addUser-agreementAdmin': true })}
                  disabled={isAdminHat}
                >
                  Add Agreement Manager
                </Button>
              </Tooltip>

              {isAdminHat && (
                <span className='bg-functional-success absolute -right-2 -top-2 flex h-4 w-10 items-center justify-center rounded-full text-xs font-bold text-white'>
                  soon
                </span>
              )}
            </div>
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
