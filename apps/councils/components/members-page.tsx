'use client';

import { Button, Checkbox, Icon, Tooltip } from '@chakra-ui/react';
import { Ruleset, WriteFunction } from '@hatsprotocol/modules-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useOverlay } from 'contexts';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { filter, find, first, flatten, get, isEmpty, map, split, toLower } from 'lodash';
import { useAllowlist, useCallModuleFunction, useCurrentEligibility, useEligibilityRules } from 'modules-hooks';
import { BsCheckSquareFill, BsPencilSquare, BsXSquareFill } from 'react-icons/bs';
import { AppHat, CouncilMember, ModuleFunction, OffchainCouncilData, SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { formatAddress, logger, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { RemoveUserModal } from './remove-user-modal';

const MemberRow = ({
  member,
  remainingModules,
  chainId,
  signerHat,
  eligibilityRules,
  offchainCouncilData,
}: {
  member: CouncilMember;
  remainingModules: Ruleset | undefined;
  chainId: SupportedChains;
  signerHat: AppHat | undefined;
  eligibilityRules: Ruleset[] | undefined;
  offchainCouncilData: OffchainCouncilData | undefined;
}) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { data: currentEligibility } = useCurrentEligibility({
    chainId: (chainId ?? 11155111) as SupportedChains,
    selectedHat: signerHat,
    wearerAddress: member.address as Hex,
    eligibilityRules,
  });

  if (!member) return null;

  const canEdit = !!userAddress && true; // TODO handle who can edit users details (admins/themselves)

  const viewUser = () => {
    setModals?.({ [`editUser-member-${member.address}`]: true });
  };

  const removeUser = () => {
    setModals?.({ [`removeUser-member-${member.address}`]: true });
  };

  // TODO member is missing profile data for details edit form

  return (
    <div className='flex h-16 justify-between border-b border-gray-200'>
      <div className='flex items-center'>
        <div className='flex w-12 items-center justify-center'>
          <Checkbox />
        </div>
        <div className='flex h-full w-[250px] items-center p-2'>
          <p>{formatAddress(member.address)}</p>
        </div>
      </div>

      <div className='flex items-center'>
        <div className='flex h-full w-28 items-center justify-center gap-1'>
          <p className='text-green-700'>Yes</p>
          <Icon as={BsCheckSquareFill} color='green.500' />
        </div>

        {map(remainingModules, (rule) => {
          const moduleEligibility = get(currentEligibility, rule.address);
          const isEligible = get(moduleEligibility, 'eligible') && get(moduleEligibility, 'goodStanding');
          return (
            <div className='flex h-full w-28 items-center justify-center gap-1' key={rule.address}>
              {isEligible ? (
                <>
                  <p className='text-green-700'>Yes</p>
                  <Icon as={BsCheckSquareFill} color='green.500' key={`${rule.address}-${member.address}`} />
                </>
              ) : (
                <>
                  <p className='text-red-700'>No</p>
                  <Icon as={BsXSquareFill} color='red.500' key={`${rule.address}-${member.address}`} />
                </>
              )}
            </div>
          );
        })}

        <div className='flex h-full w-48 items-center justify-center gap-4'>
          <Button
            variant='link'
            color='blue.500'
            leftIcon={canEdit ? <Icon as={BsPencilSquare} /> : undefined}
            onClick={viewUser}
          >
            {canEdit ? 'Edit' : 'Details'}
          </Button>

          <Button variant='link' color='Functional-Error' onClick={removeUser} isDisabled={!userAddress}>
            Remove
          </Button>
        </div>
      </div>

      <AddUserModal
        type='member'
        editingUser={member}
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
      />
      <RemoveUserModal
        type='member'
        user={member}
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
        eligibilityRules={eligibilityRules || undefined}
        currentEligibility={currentEligibility || undefined}
        offchainCouncilData={offchainCouncilData}
      />
    </div>
  );
};

const MembersPage = ({ slug }: { slug: string }) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const queryClient = useQueryClient();
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
    hsg: address,
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
  const addAccount = find(
    get(selectionModule, 'module.writeFunctions'),
    (fn: WriteFunction) => fn.functionName === 'addAccount',
  );

  const { mutateAsync: callModuleFn } = useCallModuleFunction({
    chainId: chainId as SupportedChains,
  });

  const addUserToCouncil = async (user: CouncilMember | undefined) => {
    if (!user?.address || !addAccount) return;

    console.log(user, user.address);
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
        map(allowlist, (member: CouncilMember) => (
          <MemberRow
            key={member.address}
            member={member}
            remainingModules={remainingModules}
            chainId={chainId as SupportedChains}
            signerHat={primarySignerHat as AppHat}
            eligibilityRules={eligibilityRules || undefined}
            offchainCouncilData={offchainCouncilData || undefined}
          />
        ))
      ) : (
        <div className='flex h-20 items-center justify-center gap-4'>
          <p>No members found</p>
        </div>
      )}

      <div className='flex pt-8'>
        <Tooltip label={!addAccount ? 'Could not find selection module' : undefined}>
          <Button
            variant='outline'
            onClick={() => setModals?.({ 'addUser-member': true })}
            isDisabled={!addAccount || !userAddress}
          >
            Add Member
          </Button>
        </Tooltip>
      </div>

      <AddUserModal
        type='member'
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
        afterSuccess={addUserToCouncil}
      />
    </div>
  );
};

export default MembersPage;
