import { Button } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, map } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { ManagerAvatar } from 'ui';

import { AddUserModal } from '../add-user-modal';
import { UpdateAgreementModal } from '../update-agreement-modal';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
}

const AgreementManager = ({ m, chainId }: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const ownerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;

  const { data: ownerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: ownerHatId ? hatIdDecimalToHex(ownerHatId) : undefined,
  });

  if (!m) return null;

  return (
    <div className='flex flex-col gap-4' key={m.id}>
      <h2 className='text-lg font-semibold'>{m.name}</h2>

      <div className='flex flex-col gap-2'>
        <h2 className='text-sm font-semibold'>Agreement Managers</h2>

        <div className='flex flex-col gap-2'>
          {map(get(ownerHat, 'wearers'), (wearer) => (
            <ManagerAvatar manager={wearer} key={wearer.id} />
          ))}
        </div>
      </div>

      <div className='flex gap-2'>
        <Button variant='outline' onClick={() => setModals?.({ updateAgreement: true })}>
          Edit Agreement
        </Button>

        <Button variant='outline' onClick={() => setModals?.({ 'addUser-agreement': true })}>
          Add Agreement Manager
        </Button>
      </div>

      <UpdateAgreementModal />

      <AddUserModal type='agreement' userLabel='Agreement Manager' chainId={chainId as SupportedChains} />
    </div>
  );
};

export default AgreementManager;
