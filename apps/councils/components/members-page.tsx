'use client';

import { Button, Checkbox, Icon, Tooltip } from '@chakra-ui/react';
import { Ruleset, WriteFunction } from '@hatsprotocol/modules-sdk';
import { useOverlay } from 'contexts';
import { useCouncilDetails, useOffchainCouncilDetails } from 'hooks';
import { filter, find, first, flatten, get, map, split, toLower } from 'lodash';
import { useAllowlist, useCallModuleFunction, useCurrentEligibility, useEligibilityRules } from 'modules-hooks';
import { BsCheckSquareFill, BsPencilSquare } from 'react-icons/bs';
import { AppHat, CouncilMember, ModuleFunction, SupportedChains } from 'types';
import { Skeleton } from 'ui';
import { formatAddress, parseCouncilSlug } from 'utils';
import { Hex } from 'viem';

import { AddUserModal } from './add-user-modal';

// TODO hardcode
const selectionModuleAddress = '0x8250a44405C4068430D3B3737721D47bB614E7D2';
const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const MemberRow = ({
  member,
  remainingModules,
  chainId,
  signerHat,
  eligibilityRules,
}: {
  member: CouncilMember;
  remainingModules: Ruleset | undefined;
  chainId: SupportedChains;
  signerHat: AppHat | undefined;
  eligibilityRules: Ruleset[] | undefined;
}) => {
  const { setModals } = useOverlay();
  const { data: currentEligibility } = useCurrentEligibility({
    chainId: (chainId ?? 11155111) as SupportedChains,
    selectedHat: signerHat,
    wearerAddress: member.address as Hex,
    eligibilityRules,
  });

  if (!member) return null;

  const viewUser = () => {
    setModals?.({ [`editUser-member-${member.address}`]: true });
  };

  const removeUser = () => {
    // TODO
  };

  // TODO member is missing profile data for details edit form

  return (
    <div className='flex h-16 justify-between border-b border-gray-200' key={member.address}>
      <div className='flex items-center'>
        <div className='flex w-12 items-center justify-center'>
          <Checkbox />
        </div>
        <div className='flex h-full w-[250px] items-center p-2' key={member.address}>
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
                  <Icon as={BsCheckSquareFill} color='red.500' key={`${rule.address}-${member.address}`} />
                </>
              )}
            </div>
          );
        })}

        <div className='flex h-full w-48 items-center justify-center gap-4'>
          <Button variant='link' color='blue.500' leftIcon={<Icon as={BsPencilSquare} />} onClick={viewUser}>
            Details
          </Button>

          <Button variant='link' color='Functional-Error' onClick={removeUser}>
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
    </div>
  );
};

const MembersPage = ({ slug }: { slug: string }) => {
  const { setModals } = useOverlay();
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
  const { data: offchainCouncilData, isLoading: isLoadingOffchainCouncilData } = useOffchainCouncilDetails({
    id: address,
    chainId: chainId ?? 11155111,
  });
  console.log('offchainCouncilData', offchainCouncilData);

  // TODO fetch module labels
  // TODO more profile data about allowlist members
  const { data: allowlist } = useAllowlist({
    id: selectionModuleAddress,
    chainId: (chainId ?? 11155111) as SupportedChains,
  });

  const remainingModules = filter(
    first(eligibilityRules), // TODO hardcode "flatten" outer Rulesets
    (rule) => toLower(rule.address) !== toLower(selectionModuleAddress),
  );

  const selectionModule = find(
    flatten(eligibilityRules),
    (rule) => toLower(rule.address) === toLower(selectionModuleAddress),
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
    // TODO handle pending tx state
    await callModuleFn({
      moduleId: get(selectionModule, 'module.implementationAddress'),
      instance: get(selectionModule, 'address'),
      func: addAccount as ModuleFunction,
      args: { Account: user.address },
      onSuccess: () => {
        // TODO close modal
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
            if (toLower(rule.address) === toLower(criteriaModule)) {
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

      {map(allowlist, (member: CouncilMember) => (
        <MemberRow
          key={member.address}
          member={member}
          remainingModules={remainingModules}
          chainId={chainId as SupportedChains}
          signerHat={primarySignerHat as AppHat}
          eligibilityRules={eligibilityRules || undefined}
        />
      ))}

      <div className='flex pt-8'>
        <Tooltip label={!addAccount ? 'Could not find selection module' : undefined}>
          <Button variant='outline' onClick={() => setModals?.({ 'addUser-member': true })} isDisabled={!addAccount}>
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
