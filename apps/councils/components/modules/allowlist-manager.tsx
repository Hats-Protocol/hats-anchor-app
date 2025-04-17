import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useAllWearers, useHatDetails, useIsAdmin } from 'hats-hooks';
import { useToast, useWaitForSubgraph } from 'hooks';
import { find, get, map, size, split } from 'lodash';
import posthog from 'posthog-js';
import { useState } from 'react';
import type { CouncilMember, ModuleDetails, OffchainCouncilData, SupportedChains } from 'types';
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

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
  criteriaModule: Hex;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
  primarySignerHat: Hex | undefined;
}

// Selection Module has already been removed from the list when populating these Managers

const AllowlistManager = ({
  m,
  chainId,
  // slug,
  criteriaModule,
  offchainCouncilDetails,
  primarySignerHat,
}: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const { toast } = useToast();
  const { data: walletClient } = useWalletClient();
  const { handlePendingTx } = useOverlay();
  const waitForSubgraph = useWaitForSubgraph({ chainId: chainId as SupportedChains });
  const queryClient = useQueryClient();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const managerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;
  const isAdminHat = size(split(hatIdDecimalToIp(managerHatId), '.')) === 2;
  logger.debug('isAdminHat', { managerHatId: managerHatId ? hatIdDecimalToIp(managerHatId) : undefined, isAdminHat });
  const isCompliance = m.instanceAddress === criteriaModule;

  const { data: managerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: managerHatId ? hatIdDecimalToHex(managerHatId) : undefined,
  });
  const { wearers: managers } = useAllWearers({
    selectedHat: managerHat,
    chainId: chainId as SupportedChains,
  });
  const userIsAdmin = useIsAdmin({ address: userAddress as Hex, hatId: primarySignerHat, chainId });
  // const hatDetails = managerHat?.detailsMetadata;
  // const hatName = hatDetails ? get(JSON.parse(hatDetails), 'data.name') : undefined;
  const allWearers = getAllWearers(offchainCouncilDetails);

  const allowlistManagerLoading = useState(false);
  const [, setManagerLoading] = allowlistManagerLoading;

  const addAllowlistManager = async (data: CouncilMember | undefined) => {
    if (!data || !userAddress) {
      toast({ title: 'No address or user found', variant: 'destructive' });
      setManagerLoading(false);
      return;
    }

    return createHatsClient(chainId ?? 11155111, walletClient)
      .then((hatsClient) => {
        if (!hatsClient) {
          toast({ title: 'Failed to create hats client', variant: 'destructive' });
          setManagerLoading(false);
          return;
        }

        hatsClient
          .mintHat({
            account: userAddress,
            hatId: BigInt(managerHatId),
            wearer: data.address,
          })
          .then((result) => {
            if (!result?.transactionHash) return;

            handlePendingTx?.({
              hash: result?.transactionHash,
              txChainId: chainId ?? 11155111,
              txDescription: `Added ${data.name || formatAddress(data.address)} as an ${
                isCompliance ? 'allowlist' : 'compliance'
              } manager`,
              waitForSubgraph,
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['councilDetails'] });
                queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
                setManagerLoading(false);

                // sendTelegramMessage(
                //   `New ${isCompliance ? 'allowlist' : 'compliance'} manager added: ${data.name} (${tgFormatAddress(data.address)}) https://pro.hatsprotocol.xyz/council/${slug}`,
                // );

                if (offchainCouncilDetails?.hsg) {
                  posthog.capture('Added Allowlist Manager', {
                    councilId: offchainCouncilDetails.hsg,
                    chainId,
                    type: isCompliance ? 'allowlistAdmin' : 'complianceAdmin',
                    userAddress: data.address,
                  });
                }

                setModals?.({});
              },
            });
          })
          .catch((error) => {
            logger.debug('Failed to add compliance manager', { error });
            toast({ title: 'Failed to add compliance manager', variant: 'destructive' });
            setManagerLoading(false);
          });
      })
      .catch((error) => {
        logger.debug('Failed to create Hats client', { error });
        toast({ title: 'Failed to create Hats client', variant: 'destructive' });
        setManagerLoading(false);
      });
  };

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!m) return null;

  logger.debug('criteriaModule', { instanceAddress: m.instanceAddress, criteriaModule });

  if (isCompliance) {
    return (
      <div className='space-y-6' id={m.instanceAddress}>
        <h2 className='text-2xl font-bold'>Compliance Management</h2>

        <div className='space-y-4'>
          <div className='space-y-1'>
            {isAdminHat ? (
              <h2 className='font-medium'>Delegated to Council Managers</h2>
            ) : (
              <h2 className='font-bold'>Compliance Managers</h2>
            )}
            <p className='text-sm'>Conducts compliance checks</p>
          </div>

          <div className='flex flex-col gap-4'>
            {map(managers, (wearer) => {
              const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

              return (
                <div key={wearer.id} className={cn(isDev && !offchainDetails && 'bg-functional-link-primary/10')}>
                  <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} />
                </div>
              );
            })}
          </div>

          {!!user && userIsAdmin && (
            <div className='mt-2 flex'>
              {currentChainId === chainId ? (
                <div className='relative'>
                  <Tooltip label={isAdminHat ? 'Soon you can replace the council managers' : undefined}>
                    <Button
                      variant='outline-blue'
                      rounded='full'
                      onClick={() => setModals?.({ 'addUser-complianceAdmin': true })}
                      disabled={isAdminHat}
                    >
                      Add Compliance Manager
                    </Button>
                  </Tooltip>

                  {isAdminHat && (
                    <span className='bg-functional-success absolute -right-2 -top-2 flex h-4 w-10 items-center justify-center rounded-full text-xs font-bold text-white'>
                      soon
                    </span>
                  )}
                </div>
              ) : (
                <Button variant='outline' rounded='full' onClick={() => switchChain({ chainId: chainId ?? 11155111 })}>
                  Switch to {chainsMap(chainId ?? 11155111)?.name}
                </Button>
              )}
            </div>
          )}
        </div>

        <AddUserModal
          type='complianceAdmin'
          userLabel='Compliance Manager'
          chainId={chainId as SupportedChains}
          councilId={offchainCouncilDetails?.creationForm?.id}
          existingUsers={allWearers as CouncilMember[]}
          afterSuccess={addAllowlistManager}
          addUserLoading={allowlistManagerLoading}
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6' id={m.instanceAddress}>
      <h2 className='text-2xl font-bold'>{m.name}</h2>

      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='font-bold'>Allowlist Management</h2>
          {isAdminHat ? (
            <h2 className='font-medium'>Delegated to Council Managers</h2>
          ) : (
            <h2 className='font-medium'>Allowlist Managers</h2>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          {map(get(managerHat, 'wearers'), (wearer) => {
            const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

            return <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} key={wearer.id} />;
          })}
        </div>

        {!!user && userIsAdmin && (
          <div className='mt-2 flex'>
            {currentChainId === chainId ? (
              <Button
                variant='outline-blue'
                rounded='full'
                onClick={() => setModals?.({ ['addUser-allowlistAdmin']: true })}
                disabled
              >
                Add Allowlist Manager
              </Button>
            ) : (
              <Button variant='outline' rounded='full' onClick={() => switchChain({ chainId: chainId ?? 11155111 })}>
                Switch to {chainsMap(chainId ?? 11155111)?.name}
              </Button>
            )}
          </div>
        )}
      </div>

      <AddUserModal
        type='allowlistAdmin'
        userLabel='Allowlist Manager'
        chainId={chainId as SupportedChains}
        councilId={offchainCouncilDetails?.creationForm?.id}
        existingUsers={allWearers as CouncilMember[]}
        afterSuccess={addAllowlistManager}
        addUserLoading={allowlistManagerLoading}
      />
    </div>
  );
};

export { AllowlistManager };
