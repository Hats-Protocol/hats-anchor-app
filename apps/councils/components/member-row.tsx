'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { Modal, useOverlay } from 'contexts';
import { useIsAdmin } from 'hats-hooks';
import { useSafeDetails } from 'hooks';
import { every, find, get, includes, keys, map, toLower } from 'lodash';
import { EllipsisVertical } from 'lucide-react';
import { useCurrentEligibility } from 'modules-hooks';
import posthog from 'posthog-js';
import { UseFormReturn } from 'react-hook-form';
import { BsCheckSquareFill, BsExclamationSquare, BsPencilSquare, BsXOctagonFill } from 'react-icons/bs';
import { AppHat, CouncilMember, ExtendedHSGV2, OffchainCouncilData, SupportedChains } from 'types';
import { Button, cn, MemberAvatar } from 'ui';
import { Popover, PopoverContent, PopoverTrigger } from 'ui';
import { getAllWearers } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AddUserModal } from './add-user-modal';
import { MemberStatusModal } from './member-status-modal';

const MemberRow = ({
  member,
  remainingModules,
  chainId,
  signerHat,
  eligibilityRules,
  offchainCouncilData,
  councilData,
  form,
  inAllowlist,
}: {
  member: CouncilMember;
  remainingModules: Ruleset | undefined;
  chainId: SupportedChains;
  signerHat: AppHat | undefined;
  eligibilityRules: Ruleset[] | undefined;
  offchainCouncilData: OffchainCouncilData | undefined;
  councilData: ExtendedHSGV2 | undefined;
  form: UseFormReturn;
  inAllowlist: boolean;
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
  const isEligible = every(
    keys(currentEligibility),
    (key) => get(currentEligibility, key)?.eligible && get(currentEligibility, key)?.goodStanding,
  );
  const isWearer = includes(map(get(signerHat, 'wearers'), 'id'), toLower(member.address));
  if (!member) return null;

  const canEdit = (!!userAddress && toLower(member.address) === toLower(userAddress)) || isAdmin; // user can edit their own details

  const editUser = () => {
    setModals?.({ [`editUser-member-${member.address}`]: true });
  };

  const updateMemberStatus = () => {
    setModals?.({ [`member-status-${member.address}`]: true });
  };

  const viewUser = () => {
    setModals?.({ [`viewUser-member-${member.address}`]: true });
  };
  const offchainWearers = getAllWearers(offchainCouncilData);
  const offChainDetails = find(offchainWearers, { address: member.address });
  const fullMember = { ...member, ...offChainDetails };

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  return (
    <div
      className={cn(
        'flex h-16 justify-between border-b border-gray-200',
        isDev && !offChainDetails && 'bg-sky-50',
        isDev && !inAllowlist && 'bg-gray-200',
      )}
    >
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
          {inAllowlist ? (
            <>
              <p className='text-functional-success'>Yes</p>
              <BsCheckSquareFill className='text-functional-success' />
            </>
          ) : (
            <>
              <p className='text-destructive'>No</p>
              <BsXOctagonFill className='text-destructive' />
            </>
          )}
        </div>

        {map(remainingModules, (rule) => {
          const moduleEligibility = get(currentEligibility, rule.address);
          const moduleEligible = get(moduleEligibility, 'eligible') && get(moduleEligibility, 'goodStanding');
          return (
            <div
              className='flex h-full w-28 items-center justify-center gap-1'
              key={`${rule.address}-${member.address}`}
            >
              {moduleEligible ? (
                <>
                  <p className='text-functional-success'>Yes</p>
                  <BsCheckSquareFill className='text-functional-success' />
                </>
              ) : (
                <>
                  <p className='text-destructive'>No</p>

                  <BsXOctagonFill className='text-destructive' />
                </>
              )}
            </div>
          );
        })}

        <div className='flex h-full w-28 items-center justify-center gap-1'>
          {isEligible && isWearer ? (
            <>
              <p className='text-functional-success'>Yes</p>
              <BsCheckSquareFill className='text-functional-success' />
            </>
          ) : isSigner ? (
            <>
              <p className='text-destructive'>No</p>
              <BsExclamationSquare className='text-destructive' />
            </>
          ) : (
            <>
              <p className='text-destructive'>No</p>
              <BsXOctagonFill className='text-destructive' />
            </>
          )}
        </div>

        <div className='flex h-full w-48 items-center justify-center gap-4'>
          <Button variant='outline-blue' rounded='full' onClick={updateMemberStatus}>
            Status
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline-blue' rounded='full'>
                <EllipsisVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-32 p-2'>
              {user && canEdit ? (
                <Button
                  variant='link'
                  className='text-functional-link-primary hover:text-functional-link-primary/80 flex w-full items-center justify-start'
                  onClick={editUser}
                >
                  <BsPencilSquare className='mr-2' />
                  Edit
                </Button>
              ) : (
                <Button
                  variant='link'
                  className='text-functional-link-primary hover:text-functional-link-primary/80 w-full justify-start'
                  onClick={viewUser}
                >
                  Details
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Modal name={`viewUser-member-${member.address}`} title='View Council Member' size='md'>
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
      <MemberStatusModal
        user={fullMember}
        userLabel='Council Member'
        chainId={chainId as SupportedChains}
        selectedHat={signerHat}
        eligibilityRules={eligibilityRules || undefined}
        currentEligibility={currentEligibility || undefined}
        offchainCouncilData={offchainCouncilData}
        councilData={councilData}
      />
    </div>
  );
};

export { MemberRow };
