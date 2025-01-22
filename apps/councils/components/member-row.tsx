'use client';

import { Button, Checkbox, Icon } from '@chakra-ui/react';
import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useOverlay } from 'contexts';
import { get, map } from 'lodash';
import { useCurrentEligibility } from 'modules-hooks';
import { BsCheckSquareFill, BsPencilSquare, BsXSquareFill } from 'react-icons/bs';
import { AppHat, CouncilMember, OffchainCouncilData, SupportedChains } from 'types';
import { MemberAvatar } from 'ui';
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
          <MemberAvatar member={member} stack />
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
        councilId={offchainCouncilData?.creationForm?.id}
        existingUsers={offchainCouncilData?.members || []}
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

export { MemberRow };
