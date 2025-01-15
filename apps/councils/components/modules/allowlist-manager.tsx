import { Button } from '@chakra-ui/react';
import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';
import { useOverlay } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { find, get, map, size, split } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { ManagerAvatar } from 'ui';
import { logger } from 'utils';
import { Hex } from 'viem';

import { AddUserModal } from '../add-user-modal';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
  criteriaModule: Hex;
}

const AllowlistManager = ({ m, chainId, criteriaModule }: ModuleManagerProps) => {
  const { setModals } = useOverlay();
  const managerHatId = get(find(get(m, 'liveParameters'), { label: 'Owner Hat' }), 'value') as bigint;
  const isAdminHat = size(split(hatIdDecimalToIp(managerHatId), '.')) === 2;
  logger.debug('isAdminHat', { managerHatId: managerHatId ? hatIdDecimalToIp(managerHatId) : undefined, isAdminHat });

  const { data: managerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: managerHatId ? hatIdDecimalToHex(managerHatId) : undefined,
  });
  // const hatDetails = managerHat?.detailsMetadata;
  // const hatName = hatDetails ? get(JSON.parse(hatDetails), 'data.name') : undefined;

  if (!m) return null;
  logger.debug('criteriaModule', { instanceAddress: m.instanceAddress, criteriaModule });

  if (m.instanceAddress === criteriaModule) {
    return (
      <div className='flex flex-col gap-4' key={m.id}>
        <h2 className='text-lg font-semibold'>Compliance Management</h2>

        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-1'>
            <h2 className='text-sm font-semibold'>Compliance Managers</h2>
            {isAdminHat && <p className='text-xs italic text-gray-500'>(Delegated to Council Managers)</p>}
          </div>

          <div className='flex flex-col gap-2'>
            {map(get(managerHat, 'wearers'), (wearer) => (
              <ManagerAvatar manager={wearer} key={wearer.id} />
            ))}
          </div>
        </div>

        <div className='flex'>
          <Button variant='outline' onClick={() => setModals?.({ 'addUser-compliance': true })} isDisabled>
            Add Compliance Manager
          </Button>
        </div>

        <AddUserModal type='compliance' userLabel='Compliance Manager' chainId={chainId as SupportedChains} />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4' key={m.id}>
      <h2 className='text-lg font-semibold'>{m.name}</h2>

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-1'>
          <h2 className='text-sm font-semibold'>Allowlist Managers</h2>
          {isAdminHat && <p className='text-xs italic text-gray-500'>(Delegated to Council Managers)</p>}
        </div>

        <div className='flex flex-col gap-2'>
          {map(get(managerHat, 'wearers'), (wearer) => (
            <ManagerAvatar manager={wearer} key={wearer.id} />
          ))}
        </div>
      </div>

      <div className='flex'>
        <Button variant='outline' onClick={() => setModals?.({ ['addUser-allowlist']: true })} isDisabled>
          Add Allowlist Manager
        </Button>
      </div>

      <AddUserModal type='allowlist' userLabel='Allowlist Manager' chainId={chainId as SupportedChains} />
    </div>
  );
};

export default AllowlistManager;
