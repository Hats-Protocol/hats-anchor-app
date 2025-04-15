'use client';

import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { useAuthGuard, useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { filter, find, first, flatten, get, includes, isEmpty, map, pick, split, toLower } from 'lodash';
import { useAllowlist, useCallModuleFunction, useEligibilityRules, useErc20Details } from 'modules-hooks';
import posthog from 'posthog-js';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppHat, CouncilMember, EligibilityRule, ModuleFunction, SupportedChains } from 'types';
import { Button, Tooltip } from 'ui';
import { Skeleton } from 'ui';
import { chainsMap, logger, parseCouncilSlug } from 'utils';
import { formatUnits, getAddress, Hex } from 'viem';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { MemberRow } from './member-row';

interface Erc20Details {
  userBalance: bigint;
  userBalanceDisplay: string;
  tokenDetails: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

const ModuleDisplay = ({
  rule,
  chainId,
  offchainCouncilData,
}: {
  rule: EligibilityRule;
  chainId: SupportedChains;
  offchainCouncilData: any;
}) => {
  const tokenParam = rule.module.id.includes('erc20') ? find(rule.liveParams, { displayType: 'erc20' }) : undefined;
  const amountParameter = rule.module.id.includes('erc20')
    ? find(rule.liveParams, { displayType: 'amountWithDecimals' })
    : undefined;
  const tokenAddress = tokenParam?.value as string;

  const { data: erc20Details, isLoading: isErc20Loading } = useErc20Details({
    contractAddress: tokenAddress ? (tokenAddress.toLowerCase() as Hex) : undefined,
    wearerAddress: '0x0000000000000000000000000000000000000000' as Hex,
    chainId,
  });

  if (toLower(rule.address) === toLower(offchainCouncilData?.membersCriteriaModule)) {
    return (
      <div className='flex h-full w-28 items-center justify-center'>
        <p className='text-center'>Compliance</p>
      </div>
    );
  }

  // ERC20 Module:
  if (rule.module.id.includes('erc20')) {
    if (isErc20Loading) {
      return (
        <div className='flex h-full w-28 items-center justify-center'>
          <p className='text-center'>ERC20</p>
        </div>
      );
    }

    const { tokenDetails } = pick(erc20Details || {}, ['tokenDetails']) as Partial<Erc20Details>;

    if (tokenDetails?.symbol && amountParameter?.value && tokenDetails.decimals !== undefined) {
      const minimumBalanceDisplay = formatUnits(amountParameter.value as bigint, tokenDetails.decimals);
      const minimumBalanceNumber = parseFloat(minimumBalanceDisplay);

      return (
        <div className='flex h-full w-28 items-center justify-center'>
          <p className='text-center'>
            Hold {minimumBalanceNumber === 1 ? '1' : minimumBalanceDisplay} {tokenDetails.symbol}
          </p>
        </div>
      );
    }

    // Show 'ERC20' as a fallback if token details aren't available/loaded
    return (
      <div className='flex h-full w-28 items-center justify-center'>
        <p className='text-center'>ERC20</p>
      </div>
    );
  }

  return (
    <div className='flex h-full w-28 items-center justify-center'>
      <p className='text-center'>{first(split(rule.module.name, ' '))}</p>
    </div>
  );
};

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
    hsg: councilDetails?.id ? (getAddress(councilDetails?.id) as Hex) : undefined,
    chainId: chainId ?? 11155111,
    enabled: !!councilDetails?.id && !!chainId,
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

  if (typeof window === 'undefined' || councilDetailsLoading || eligibilityRulesLoading) {
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
    <div className='flex flex-col px-4'>
      <div className='relative'>
        {/* Mobile scroll indicator */}
        <div className='pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent md:hidden' />

        <div className='scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 overflow-x-scroll pb-4'>
          <div className='min-w-fit'>
            <div className='flex h-14 items-center justify-between'>
              <div className='flex items-center'>
                <div className='flex h-full w-[250px] items-center p-2'>
                  <p>Council Member</p>
                </div>
              </div>

              <div className='flex items-center'>
                <div className='flex h-full w-28 items-center justify-center'>
                  <p className='text-center'>Appointed</p>
                </div>

                {map(remainingModules, (rule) => (
                  <ModuleDisplay
                    key={rule.address}
                    rule={rule}
                    chainId={chainId as SupportedChains}
                    offchainCouncilData={offchainCouncilData}
                  />
                ))}

                <div className='flex h-full w-28 items-center justify-center'>
                  <p className='text-center'>Council Member</p>
                </div>

                <div className='flex h-full w-48 items-center justify-center'>
                  <p className='text-center'>Manager Controls</p>
                </div>
              </div>
            </div>

            {!isEmpty(allowlist) ? (
              <>
                {map(allowlist, (member: CouncilMember) => {
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
                })}
              </>
            ) : (
              <div className='flex h-20 items-center justify-center gap-4'>
                <p>No members found</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
