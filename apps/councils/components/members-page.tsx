'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { filter, find, first, flatten, get, isEmpty, keys, map, split, toLower } from 'lodash';
import { useAllowlist, useCallModuleFunction, useEligibilityRules } from 'modules-hooks';
import { useForm } from 'react-hook-form';
import { AppHat, CouncilMember, ModuleFunction, SupportedChains } from 'types';
import { Button, Tooltip } from 'ui';
import { Skeleton } from 'ui';
import { logger, parseCouncilSlug } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { MemberRow } from './member-row';

const MembersPage = ({ slug }: { slug: string }) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const queryClient = useQueryClient();
  const form = useForm();
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

  // TODO fetch module labels
  // TODO more profile data about allowlist members
  const { data: rawAllowlist } = useAllowlist({
    id: offchainCouncilData?.membersSelectionModule,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });
  const allowlist = filter(rawAllowlist, (member) => member.eligible && !member.badStanding);
  logger.debug('Selection Allowlist', allowlist);

  const remainingModules = filter(
    flatten(eligibilityRules), // TODO hardcoded "flatten" outer Rulesets
    (rule) => toLower(rule.address) !== toLower(offchainCouncilData?.membersSelectionModule),
  );

  const selectionModule = find(
    flatten(eligibilityRules),
    (rule) => toLower(rule.address) === toLower(offchainCouncilData?.membersSelectionModule),
  );
  const complianceModule = find(
    flatten(eligibilityRules),
    (rule) => toLower(rule.address) === toLower(offchainCouncilData?.membersCriteriaModule),
  );
  const addAccount = find(get(selectionModule, 'module.writeFunctions'), {
    functionName: 'addAccount',
  });
  const addAccounts = find(get(complianceModule, 'module.writeFunctions'), {
    functionName: 'addAccounts',
  });

  const { mutateAsync: callModuleFn } = useCallModuleFunction({
    chainId: chainId as SupportedChains,
  });

  const updateComplianceForSelected = async () => {
    console.log(form.getValues());
    // TODO
    const values = form.getValues();
    const onlyAddresses = keys(values).filter((key) => values[key]);

    await callModuleFn({
      moduleId: get(complianceModule, 'module.implementationAddress'),
      instance: get(complianceModule, 'address'),
      func: addAccounts as ModuleFunction,
      args: { Accounts: onlyAddresses },
      onSuccess: () => {
        logger.info('updated compliance for selected users');
        setModals?.({});
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['eligibilityRules'] });
        // reset form values
      },
    });
  };

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
        // TODO close modal
        setModals?.({});
        queryClient.invalidateQueries({ queryKey: ['offchainCouncilDetails'] });
        queryClient.invalidateQueries({ queryKey: ['allowlistDetails'] });
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
      <div className='flex h-12 items-center justify-between border-b border-t border-gray-200'>
        <div className='flex items-center'>
          <div className='w-12' />
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
            />
          );
        })
      ) : (
        <div className='flex h-20 items-center justify-center gap-4'>
          <p>No members found</p>
        </div>
      )}

      <div className='flex gap-2 pt-8'>
        <Tooltip label={!addAccount ? 'Could not find selection module' : undefined}>
          <Button
            variant='outline'
            onClick={() => setModals?.({ 'addUser-member': true })}
            disabled={!addAccount || !userAddress}
          >
            Add Member
          </Button>
        </Tooltip>

        <Button variant='outline' disabled={!userAddress} onClick={updateComplianceForSelected}>
          Update Compliance
        </Button>
      </div>

      <AddUserModal
        type='member'
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
        afterSuccess={addUserToCouncil}
        councilId={offchainCouncilData?.creationForm?.id}
        existingUsers={offchainCouncilData?.creationForm?.members || []}
      />
    </div>
  );
};

export { MembersPage };
