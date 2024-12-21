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

const AgreementManager = ({ m, chainId }: ModuleManagerProps) => {
  const ownerHatId = get(
    find(get(m, 'liveParameters'), { label: 'Owner Hat' }),
    'value',
  ) as bigint;

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
        <Button variant='outline'>Edit Agreement</Button>
        <Button variant='outline'>Add Agreement Manager</Button>
      </div>
    </div>
  );
};

export default AgreementManager;
