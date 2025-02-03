'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { Modal, useOverlay } from 'contexts';
import { useIsAdmin } from 'hats-hooks';
import { useSafeDetails } from 'hooks';
import { find, get, includes, map } from 'lodash';
import { useCurrentEligibility } from 'modules-hooks';
import { UseFormReturn } from 'react-hook-form';
import { BsCheckSquareFill, BsPencilSquare, BsXSquareFill } from 'react-icons/bs';
import { AppHat, CouncilMember, ExtendedHSGV2, OffchainCouncilData, SupportedChains } from 'types';
import { Button, MemberAvatar } from 'ui';
import { getAllWearers } from 'utils';
import { getAddress, Hex } from 'viem';
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
  councilData,
  form,
}: {
  member: CouncilMember;
  remainingModules: Ruleset | undefined;
  chainId: SupportedChains;
  signerHat: AppHat | undefined;
  eligibilityRules: Ruleset[] | undefined;
  offchainCouncilData: OffchainCouncilData | undefined;
  councilData: ExtendedHSGV2 | undefined;
  form: UseFormReturn;
}) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const { data: currentEligibility } = useCurrentEligibility({
    chainId: (chainId ?? 11155111) as SupportedChains,
    selectedHat: signerHat,
    wearerAddress: member.address as Hex,
    eligibilityRules,
  });
  const { data: safeOwners } = useSafeDetails({
    safeAddress: councilData?.safe as Hex,
    chainId: chainId as SupportedChains,
  });
  const isAdmin = useIsAdmin({
    chainId: chainId as SupportedChains,
    address: userAddress as Hex,
    hatId: signerHat?.id,
  });
  const isSigner = member?.id ? includes(safeOwners, getAddress(member.address)) : undefined;

  if (!member) return null;

  const canEdit = (!!userAddress && member.address.toLowerCase() === userAddress.toLowerCase()) || isAdmin; // user can edit their own details

  const editUser = () => {
    setModals?.({ [`editUser-member-${member.address}`]: true });
  };

  const removeUser = () => {
    setModals?.({ [`removeUser-member-${member.address}`]: true });
  };

  const viewUser = () => {
    setModals?.({ [`viewUser-member-${member.address}`]: true });
  };
  const offchainWearers = getAllWearers(offchainCouncilData);
  const offChainDetails = find(offchainWearers, { address: member.address });
  const fullMember = { ...member, ...offChainDetails };

  // TODO member is missing profile data for details edit form

  return (
    <div className='flex h-16 justify-between border-b border-gray-200'>
      <div className='flex items-center'>
        {/* <div className='flex w-12 items-center justify-center'>
          <BaseCheckbox
            name={member.address}
            checked={isSelected}
            onChange={() => setValue(member.address, !isSelected)}
          />
        </div> */}
        <div className='flex h-full w-[250px] items-center p-2'>
          <MemberAvatar member={fullMember} stack />
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
            <div
              className='flex h-full w-28 items-center justify-center gap-1'
              key={`${rule.address}-${member.address}`}
            >
              {isEligible ? (
                <>
                  <p className='text-functional-success'>Yes</p>
                  <BsCheckSquareFill className='text-functional-success' />
                </>
              ) : (
                <>
                  <p className='text-destructive'>No</p>

                  <BsXSquareFill className='text-destructive' />
                </>
              )}
            </div>
          );
        })}

        <div className='flex h-full w-28 items-center justify-center gap-1'>
          {isSigner ? (
            <>
              <p className='text-functional-success'>Yes</p>
              <BsCheckSquareFill className='text-functional-success' />
            </>
          ) : (
            <>
              <p className='text-destructive'>No</p>
              <BsXSquareFill className='text-destructive' />
            </>
          )}
        </div>

        <div className='flex h-full w-48 items-center justify-center gap-4'>
          {user && canEdit ? (
            <Button
              variant='link'
              className='text-functional-link-primary hover:text-functional-link-primary/80'
              onClick={editUser}
            >
              <BsPencilSquare />
              Edit
            </Button>
          ) : (
            <Button variant='link' className='text-functional-link-primary' onClick={viewUser}>
              Details
            </Button>
          )}

          {user &&
            canEdit &&
            (isSigner ? (
              <Button variant='link' className='text-destructive' onClick={removeUser}>
                Remove
              </Button>
            ) : (
              <Button variant='link' className='text-functional-link-primary' onClick={removeUser}>
                Status
              </Button>
            ))}
        </div>
      </div>

      <Modal name={`viewUser-member-${member.address}`} title='View Council Member'>
        <div className='space-y-6'>
          <MemberAvatar member={member} stack />

          <div className='flex justify-end'>
            <Button onClick={() => setModals?.({})}>Ok</Button>
          </div>
        </div>
      </Modal>
      <AddUserModal
        type='member'
        editingUser={fullMember}
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
        councilId={offchainCouncilData?.creationForm?.id}
        existingUsers={offchainCouncilData?.members || []}
      />
      <RemoveUserModal
        type='member'
        user={fullMember}
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
        eligibilityRules={eligibilityRules || undefined}
        currentEligibility={currentEligibility || undefined}
        offchainCouncilData={offchainCouncilData}
        councilData={councilData}
      />
    </div>
  );
};

export { MemberRow };
