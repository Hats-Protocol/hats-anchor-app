'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { useOverlay } from 'contexts';
import { get, map } from 'lodash';
import { useCurrentEligibility } from 'modules-hooks';
import { UseFormReturn } from 'react-hook-form';
import { BsCheckSquareFill, BsPencilSquare, BsXSquareFill } from 'react-icons/bs';
import { AppHat, CouncilMember, OffchainCouncilData, SupportedChains } from 'types';
import { BaseCheckbox, Button, MemberAvatar } from 'ui';
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
  form,
}: {
  member: CouncilMember;
  remainingModules: Ruleset | undefined;
  chainId: SupportedChains;
  signerHat: AppHat | undefined;
  eligibilityRules: Ruleset[] | undefined;
  offchainCouncilData: OffchainCouncilData | undefined;
  form: UseFormReturn;
}) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { data: currentEligibility } = useCurrentEligibility({
    chainId: (chainId ?? 11155111) as SupportedChains,
    selectedHat: signerHat,
    wearerAddress: member.address as Hex,
    eligibilityRules,
  });
  const { watch, setValue } = form;
  const isSelected = watch(member.address);

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
          <BaseCheckbox
            name={member.address}
            checked={isSelected}
            onChange={() => setValue(member.address, !isSelected)}
          />
        </div>
        <div className='flex h-full w-[250px] items-center p-2'>
          <MemberAvatar member={member} stack />
        </div>
      </div>

      <div className='flex items-center'>
        <div className='flex h-full w-28 items-center justify-center gap-1'>
          <p className='text-functional-success'>Yes</p>
          <BsCheckSquareFill className='text-functional-success' />
        </div>

        {map(remainingModules, (rule) => {
          const moduleEligibility = get(currentEligibility, rule.address);
          const isEligible = get(moduleEligibility, 'eligible') && get(moduleEligibility, 'goodStanding');
          return (
            <div className='flex h-full w-28 items-center justify-center gap-1' key={rule.address}>
              {isEligible ? (
                <>
                  <p className='text-functional-success'>Yes</p>
                  <BsCheckSquareFill className='text-functional-success' key={`${rule.address}-${member.address}`} />
                </>
              ) : (
                <>
                  <p className='text-destructive'>No</p>

                  <BsXSquareFill className='text-destructive' key={`${rule.address}-${member.address}`} />
                </>
              )}
            </div>
          );
        })}

        <div className='flex h-full w-48 items-center justify-center gap-4'>
          <Button variant='link' size='link' className='text-functional-link-primary' onClick={viewUser}>
            {canEdit && <BsPencilSquare />}
            {canEdit ? 'Edit' : 'Details'}
          </Button>

          <Button variant='link' size='link' className='text-destructive' onClick={removeUser} disabled={!userAddress}>
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
