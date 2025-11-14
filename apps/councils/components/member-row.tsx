'use client';

import { Ruleset } from '@hatsprotocol/modules-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { Modal, useOverlay } from 'contexts';
import { useIsAdmin } from 'hats-hooks';
import { useSafeDetails } from 'hooks';
import { every, find, get, includes, keys, map, toLower } from 'lodash';
import { EllipsisVertical } from 'lucide-react';
import { useCurrentEligibility } from 'modules-hooks';
import { BsCheckSquareFill, BsExclamationSquare, BsPencilSquare, BsXOctagonFill } from 'react-icons/bs';
import { AppHat, CouncilMember, EligibilityRule, ExtendedHSGV2, OffchainCouncilData, SupportedChains } from 'types';
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
  inAllowlist,
  inHatWearingEligibility,
  firstModule,
}: {
  member: CouncilMember;
  remainingModules: Ruleset | undefined;
  chainId: SupportedChains;
  signerHat: AppHat | undefined;
  eligibilityRules: Ruleset[] | undefined;
  offchainCouncilData: OffchainCouncilData | undefined;
  councilData: ExtendedHSGV2 | undefined;
  inAllowlist: boolean;
  inHatWearingEligibility?: boolean;
  firstModule?: EligibilityRule;
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
  const offchainWearers = getAllWearers(offchainCouncilData?.creationForm);
  const offChainDetails = find(offchainWearers, { address: member.address });
  const fullMember = { ...member, ...offChainDetails };

  const isDev = false || process.env.NODE_ENV !== 'production';

  const firstModuleIsAllowlist = firstModule?.module?.id.includes('allowlist');
  const firstModuleIsHatWearing = firstModule?.module?.id.includes('hat-wearing');

  return (
    <div
      className={cn(
        'flex h-16 justify-between border-b border-gray-200',
        isDev && !offChainDetails && 'bg-sky-50',
        isDev && !inAllowlist && !inHatWearingEligibility && 'bg-gray-200',
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
          {(() => {
            // If first module is an allowlist, check if member is in allowlist
            if (firstModuleIsAllowlist) {
              return inAllowlist ? (
                <>
                  <p className='text-functional-success'>Yes</p>
                  <BsCheckSquareFill className='text-functional-success' />
                </>
              ) : (
                <>
                  <p className='text-destructive'>No</p>
                  <BsXOctagonFill className='text-destructive' />
                </>
              );
            }

            // If first module is a hat wearing eligibility module, check if member is in hat wearing eligibility
            if (firstModuleIsHatWearing) {
              return inHatWearingEligibility ? (
                <>
                  <p className='text-functional-success'>Yes</p>
                  <BsCheckSquareFill className='text-functional-success' />
                </>
              ) : (
                <>
                  <p className='text-destructive'>No</p>
                  <BsXOctagonFill className='text-destructive' />
                </>
              );
            }

            // If first module exists but is neither allowlist nor hat wearing, check eligibility in that module
            if (firstModule) {
              const firstModuleEligibility = get(currentEligibility, firstModule.address);
              const isEligibleInFirstModule =
                get(firstModuleEligibility, 'eligible') && get(firstModuleEligibility, 'goodStanding');

              return isEligibleInFirstModule ? (
                <>
                  <p className='text-functional-success'>Yes</p>
                  <BsCheckSquareFill className='text-functional-success' />
                </>
              ) : (
                <>
                  <p className='text-destructive'>No</p>
                  <BsXOctagonFill className='text-destructive' />
                </>
              );
            }

            // Fallback to previous logic (check both allowlist and hat wearing eligibility)
            return inAllowlist || inHatWearingEligibility ? (
              <>
                <p className='text-functional-success'>Yes</p>
                <BsCheckSquareFill className='text-functional-success' />
              </>
            ) : (
              <>
                <p className='text-destructive'>No</p>
                <BsXOctagonFill className='text-destructive' />
              </>
            );
          })()}
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
            Manage
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline-blue' rounded='full' className='w-8'>
                <EllipsisVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-32 p-2' align='end'>
              {user && canEdit ? (
                <Button
                  variant='link'
                  className='text-functional-link-primary hover:text-functional-link-primary/80 flex w-full items-center justify-start'
                  onClick={editUser}
                >
                  <BsPencilSquare className='mr-2' />
                  Edit Details
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
        existingUsers={offchainCouncilData?.creationForm?.members || []}
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
