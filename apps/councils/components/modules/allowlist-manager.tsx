import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { usePrivy } from '@privy-io/react-auth';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, map, size, split } from 'lodash';
import { useState } from 'react';
import type { CouncilMember, ModuleDetails, OffchainCouncilData, SupportedChains } from 'types';
import { Button, MemberAvatar } from 'ui';
import { getAllWearers, logger } from 'utils';
import { getAddress, Hex } from 'viem';
import { useAccount } from 'wagmi';

import { AddUserModal } from '../add-user-modal';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
  criteriaModule: Hex;
  offchainCouncilDetails: OffchainCouncilData | undefined;
  slug: string;
}

const AllowlistManager = ({ m, chainId, slug, criteriaModule, offchainCouncilDetails }: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const { address: userAddress } = useAccount();
  const { user } = usePrivy();
  const managerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;
  const isAdminHat = size(split(hatIdDecimalToIp(managerHatId), '.')) === 2;
  logger.debug('isAdminHat', { managerHatId: managerHatId ? hatIdDecimalToIp(managerHatId) : undefined, isAdminHat });

  const { data: managerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: managerHatId ? hatIdDecimalToHex(managerHatId) : undefined,
  });
  // const hatDetails = managerHat?.detailsMetadata;
  // const hatName = hatDetails ? get(JSON.parse(hatDetails), 'data.name') : undefined;
  const allWearers = getAllWearers(offchainCouncilDetails);

  const allowlistManagerLoading = useState(false);
  const [, setManagerLoading] = allowlistManagerLoading;

  const addAllowlistManager = async (data: CouncilMember | undefined) => {
    setManagerLoading(false);
  };

  if (!m) return null;
  logger.debug('criteriaModule', { instanceAddress: m.instanceAddress, criteriaModule });

  if (m.instanceAddress === criteriaModule) {
    return (
      <div className='space-y-6' id={m.instanceAddress}>
        <h2 className='text-2xl font-bold'>Compliance Management</h2>

        <div className='space-y-4'>
          <div className='space-y-1'>
            {isAdminHat ? (
              <h2 className='font-medium'>Delegated to Council Managers</h2>
            ) : (
              <h2 className='font-bold'>Compliance Managers</h2>
            )}
            <p className='text-sm'>Conducts compliance checks</p>
          </div>

          <div className='flex flex-col gap-2'>
            {map(get(managerHat, 'wearers'), (wearer) => {
              const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

              return <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} key={wearer.id} />;
            })}
          </div>

          {userAddress && user && (
            <div className='mt-2 flex'>
              <Button
                variant='outline-blue'
                rounded='full'
                onClick={() => setModals?.({ 'addUser-complianceAdmin': true })}
                disabled
              >
                Add Compliance Manager
              </Button>
            </div>
          )}
        </div>

        <AddUserModal
          type='complianceAdmin'
          userLabel='Compliance Manager'
          chainId={chainId as SupportedChains}
          councilId={offchainCouncilDetails?.creationForm?.id}
          existingUsers={allWearers as CouncilMember[]}
          afterSuccess={addAllowlistManager}
          addUserLoading={allowlistManagerLoading}
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6' id={m.instanceAddress}>
      <h2 className='text-2xl font-bold'>{m.name}</h2>

      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='font-bold'>Allowlist Management</h2>
          {isAdminHat ? (
            <h2 className='font-medium'>Delegated to Council Managers</h2>
          ) : (
            <h2 className='font-bold'>Allowlist Managers</h2>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          {map(get(managerHat, 'wearers'), (wearer) => {
            const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

            return <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} key={wearer.id} />;
          })}
        </div>

        {userAddress && user && (
          <div className='mt-2 flex'>
            <Button variant='outline' onClick={() => setModals?.({ ['addUser-allowlistAdmin']: true })} disabled>
              Add Allowlist Manager
            </Button>
          </div>
        )}
      </div>

      <AddUserModal
        type='allowlistAdmin'
        userLabel='Allowlist Manager'
        chainId={chainId as SupportedChains}
        councilId={offchainCouncilDetails?.creationForm?.id}
        existingUsers={allWearers as CouncilMember[]}
        afterSuccess={addAllowlistManager}
        addUserLoading={allowlistManagerLoading}
      />
    </div>
  );
};

export { AllowlistManager };
