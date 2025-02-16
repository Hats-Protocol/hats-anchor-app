'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useAuthGuard, useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { filter, find, first, flatten, get, includes, isEmpty, map, split, toLower } from 'lodash';
import { useAllowlist, useCallModuleFunction, useEligibilityRules } from 'modules-hooks';
import posthog from 'posthog-js';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppHat, CouncilMember, ModuleFunction, SupportedChains } from 'types';
import { Button, Tooltip } from 'ui';
import { Skeleton } from 'ui';
import { chainsMap, logger, parseCouncilSlug } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { MemberRow } from './member-row';

const MembersPage = ({ slug }: { slug: string }) => {
  const { setModals } = useOverlay();
  const addUserLoading = useState(false);
  const [, setIsLoading] = addUserLoading;
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const queryClient = useQueryClient();
  const form = useForm();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { chainId, address } = parseCouncilSlug(slug);
  const { data: councilDetails, isLoading: councilDetailsLoading } = useCouncilDetails({
    chainId: chainId ?? 11155111,
    address,
  });
  const primarySignerHat = get(councilDetails, 'signerHats[0]');
  const { data: eligibilityRules, isLoading: eligibilityRulesLoading } = useEligibilityRules({
    address: toLower(get(primarySignerHat, 'eligibility')) as Hex,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const { data: offchainCouncilData } = useOffchainCouncilDetails({
    hsg: address as Hex,
    chainId: chainId ?? 11155111,
  });

  useAuthGuard();

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  const { data: rawAllowlist } = useAllowlist({
    id: offchainCouncilData?.membersSelectionModule,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const filteredAllowlist = filter(rawAllowlist, (member) => member.eligible && !member.badStanding);
  const allowlist = isDev ? rawAllowlist : filteredAllowlist;
  logger.debug('Selection Allowlist', allowlist);

  const remainingModules = filter(
    flatten(eligibilityRules), // TODO hardcoded "flatten" outer Rulesets
    (rule) => toLower(rule.address) !== toLower(offchainCouncilData?.membersSelectionModule),
  );

  const selectionModule = find(
    flatten(eligibilityRules),
    (rule) => toLower(rule.address) === toLower(offchainCouncilData?.membersSelectionModule),
  );
  const addAccount = find(get(selectionModule, 'module.writeFunctions'), {
    functionName: 'addAccount',
  });

  const allowlistManagerHatId = get(
    find(get(selectionModule, 'liveParams'), {
      label: 'Owner Hat',
    }),
    'value',
  ) as bigint;
  const { data: allowlistManagerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: allowlistManagerHatId ? hatIdDecimalToHex(allowlistManagerHatId) : undefined,
  });
  const userIsAllowlistManager = includes(map(get(allowlistManagerHat, 'wearers'), 'id'), toLower(userAddress));

  const { mutateAsync: callModuleFn } = useCallModuleFunction({
    chainId: chainId as SupportedChains,
  });

  const addUserToCouncil = async (user: CouncilMember | undefined) => {
    if (!user?.address || !addAccount) return;

    // TODO handle pending tx state
    await callModuleFn({
      moduleId: get(selectionModule, 'module.implementationAddress'),
      instance: get(selectionModule, 'address'),
      func: addAccount as ModuleFunction,
      args: { Account: user.address },
      onSuccess: () => {
        logger.info('added user to council');
        setIsLoading(false);
        // TODO close modal
        setModals?.({});
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilData'] });
        queryClient.invalidateQueries({ queryKey: ['allowlistDetails'] });

        posthog.capture('Added Council User', {
          councilId: offchainCouncilData?.id,
          chainId,
          type: 'member',
          userAddress: user?.address,
        });
      },
    });
  };

  if (councilDetailsLoading || eligibilityRulesLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <Skeleton className='h-12 w-full' />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className='h-16 w-full' key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex h-14 items-center justify-between border-b border-gray-200'>
        <div className='flex items-center'>
          <div className='flex h-full w-[250px] items-center p-2'>
            <p>Council Member</p>
          </div>
        </div>

        <div className='flex items-center'>
          <div className='flex h-full w-28 items-center justify-center'>
            <p className='text-center'>Appointed</p>
          </div>

          {map(remainingModules, (rule) => {
            if (toLower(rule.address) === toLower(offchainCouncilData?.membersCriteriaModule)) {
              return (
                <div className='flex h-full w-28 items-center justify-center' key={rule.address}>
                  <p className='text-center'>Compliance</p>
                </div>
              );
            }

            return (
              <div className='flex h-full w-28 items-center justify-center' key={rule.address}>
                <p className='text-center'>{first(split(rule.module.name, ' '))}</p>
              </div>
            );
          })}

          <div className='flex h-full w-28 items-center justify-center'>
            <p className='text-center'>Council Member</p>
          </div>

          <div className='flex h-full w-48 items-center justify-center'>
            <p className='text-center'>Manager Controls</p>
          </div>
        </div>
      </div>

      {!isEmpty(allowlist) ? (
        map(allowlist, (member: CouncilMember) => {
          const offchainDetails = find(get(offchainCouncilData, 'creationForm.members'), {
            address: getAddress(member.address),
          });

          return (
            <MemberRow
              key={member.address}
              member={{ ...member, ...offchainDetails }}
              remainingModules={remainingModules}
              chainId={chainId as SupportedChains}
              signerHat={primarySignerHat as AppHat}
              eligibilityRules={eligibilityRules || undefined}
              offchainCouncilData={offchainCouncilData || undefined}
              form={form}
              councilData={councilDetails || undefined}
              inAllowlist={includes(map(filteredAllowlist, 'address'), toLower(member.address))}
            />
          );
        })
      ) : (
        <div className='flex h-20 items-center justify-center gap-4'>
          <p>No members found</p>
        </div>
      )}

      {user && userIsAllowlistManager && (
        <>
          <div className='flex justify-end gap-2 pt-8'>
            {currentChainId === chainId ? (
              <Tooltip label={!addAccount ? 'Could not find selection module' : undefined}>
                <Button
                  variant='outline-blue'
                  rounded='full'
                  onClick={() => setModals?.({ 'addUser-member': true })}
                  disabled={!addAccount || !userAddress}
                >
                  Add a Council Member
                </Button>
              </Tooltip>
            ) : (
              <Button variant='outline' rounded='full' onClick={() => switchChain({ chainId: chainId ?? 11155111 })}>
                Switch to {chainsMap(chainId ?? 11155111)?.name}
              </Button>
            )}
          </div>

          <AddUserModal
            type='member'
            userLabel='Council Member'
            chainId={chainId as SupportedChains}
            afterSuccess={addUserToCouncil}
            councilId={offchainCouncilData?.creationForm?.id}
            existingUsers={offchainCouncilData?.creationForm?.members || []}
            addUserLoading={addUserLoading}
          />
        </>
      )}
    </div>
  );
};

export { MembersPage };
