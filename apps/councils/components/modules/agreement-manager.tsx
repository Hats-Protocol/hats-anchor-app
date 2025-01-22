import { Button } from '@chakra-ui/react';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, map, size, split } from 'lodash';
import { CouncilMember, ModuleDetails, OffchainCouncilData, SupportedChains } from 'types';
import { MemberAvatar } from 'ui';
import { getAllWearers, logger } from 'utils';
import { getAddress } from 'viem';

import { AddUserModal } from '../add-user-modal';
import { UpdateAgreementModal } from '../update-agreement-modal';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
  offchainCouncilDetails: OffchainCouncilData | undefined;
}

const AgreementManager = ({ m, chainId, offchainCouncilDetails }: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const ownerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;
  const isAdminHat = size(split(hatIdDecimalToIp(ownerHatId), '.')) === 2;
  logger.debug('isAdminHat', { ownerHatId: ownerHatId ? hatIdDecimalToIp(ownerHatId) : undefined, isAdminHat });

  const { data: ownerHat, details: ownerHatDetails } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
  });
  // const hatDetails = ownerHat?.detailsMetadata;
  const hatName = ownerHatDetails?.name;
  const allWearers = getAllWearers(offchainCouncilDetails);

  console.log('allWearers', allWearers);

  if (!m) return null;

  return (
    <div className='flex flex-col gap-4' key={m.id}>
      <h2 className='text-lg font-semibold'>{m.name}</h2>

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1'>
          {isAdminHat ? (
            <h2 className='text-sm font-medium'>Delegated to Council Managers</h2>
          ) : (
            <h2 className='text-sm font-semibold'>Agreement Managers</h2>
          )}
        </div>

        <div className='flex flex-col gap-2'>
          {map(get(ownerHat, 'wearers'), (wearer) => {
            const offchainDetails = find(allWearers, { address: getAddress(wearer.id) });

            return <MemberAvatar member={{ ...offchainDetails, ...wearer } as CouncilMember} key={wearer.id} />;
          })}
        </div>
      </div>

      <div className='flex gap-2'>
        <Button variant='outline' onClick={() => setModals?.({ updateAgreement: true })}>
          Edit Agreement
        </Button>

        <Button variant='outline' onClick={() => setModals?.({ 'addUser-agreement': true })} isDisabled>
          Add Agreement Manager
        </Button>
      </div>

      <UpdateAgreementModal moduleDetails={m} chainId={chainId} />

      <AddUserModal
        type='agreement'
        userLabel='Agreement Manager'
        chainId={chainId as SupportedChains}
        councilId={offchainCouncilDetails?.creationForm?.id}
        existingUsers={allWearers as CouncilMember[]}
      />
    </div>
  );
};

export default AgreementManager;
