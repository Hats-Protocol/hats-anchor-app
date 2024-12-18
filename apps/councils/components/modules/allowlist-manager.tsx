import { Button } from '@chakra-ui/react';
import { hatIdDecimalToHex } from '@hatsprotocol/sdk-v1-core';
import { useHatDetails } from 'hats-hooks';
import { find, get, map } from 'lodash';
import { ModuleDetails, SupportedChains } from 'types';
import { ManagerAvatar } from 'ui';

interface ModuleManagerProps {
  m: ModuleDetails;
  chainId: number | undefined;
}

const criteriaModule = '0x03aB59ff1Ab959F2663C38408dD2578D149e4cd5';

const AllowlistManager = ({ m, chainId }: ModuleManagerProps) => {
  const managerHatId = get(
    find(get(m, 'liveParameters'), { label: 'Owner Hat' }),
    'value',
  ) as bigint;

  const { data: managerHat } = useHatDetails({
    chainId: chainId as SupportedChains,
    hatId: managerHatId ? hatIdDecimalToHex(managerHatId) : undefined,
  });

  if (!m) return null;

  if (m.instanceAddress === criteriaModule) {
    return (
      <div className='flex flex-col gap-4' key={m.id}>
        <h2 className='text-lg font-semibold'>{m.name}</h2>

        <div className='flex flex-col gap-2'>
          <h2 className='text-sm font-semibold'>Compliance Managers</h2>

          <div className='flex flex-col gap-2'>
            {map(get(managerHat, 'wearers'), (wearer) => (
              <ManagerAvatar manager={wearer} key={wearer.id} />
            ))}
          </div>
        </div>

        <div className='flex'>
          <Button variant='outline'>Add Compliance Manager</Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4' key={m.id}>
      <h2 className='text-lg font-semibold'>{m.name}</h2>

      <div className='flex flex-col gap-2'>
        <h2 className='text-sm font-semibold'>Allowlist Managers</h2>

        <div className='flex flex-col gap-2'>
          {map(get(managerHat, 'wearers'), (wearer) => (
            <ManagerAvatar manager={wearer} key={wearer.id} />
          ))}
        </div>
      </div>

      <div className='flex'>
        <Button variant='outline'>Add Allowlist Manager</Button>
      </div>
    </div>
  );
};

export default AllowlistManager;
