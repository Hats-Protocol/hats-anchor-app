'use client';

import { useTreasury } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { get, groupBy, map } from 'lodash';
import { SupportedChains } from 'types';
import { ipfsUrl } from 'utils';

import { SafeCard } from './safe-card';

// const LOADING_SAFES = [
//   { hats: [{ id: '1' }] },
//   { hats: [{ id: '2' }] },
//   { hats: [{ id: '3' }] },
//   { hats: [{ id: '4' }] },
//   { hats: [{ id: '5' }] },
// ];

const AdminHatHeader = ({ adminId, chainId }: { adminId: string; chainId: number | undefined }) => {
  const { data: adminHat } = useHatDetails({
    hatId: adminId,
    chainId: chainId as SupportedChains,
  });
  const adminHatDetails = get(adminHat, 'detailsMetadata');
  const adminHatName = adminHatDetails ? get(JSON.parse(adminHatDetails), 'data.name') : get(adminHat, 'details');
  const adminHatImage = ipfsUrl(get(adminHat, 'nearestImage'));

  if (!chainId) return null;
  return (
    <div className='flex items-center space-x-2'>
      <div
        className='h-10 w-10 rounded-md border border-gray-400 bg-cover'
        style={{ backgroundImage: adminHatImage !== '#' ? adminHatImage : '/icon.jpeg' }}
      />
      <h4 className='text-lg font-medium'>{adminHatName}</h4>
    </div>
  );
};

const SafeList = () => {
  const { hatsWithSafesInfo, chainId } = useTreasury();

  const groupedByAdmin = groupBy(hatsWithSafesInfo, (h: any) => get(h, 'hats.[0].admin.id'));

  return (
    <div className='mx-auto w-[90%] space-y-4 md:w-[60%]'>
      {map(groupedByAdmin, (hats, adminId) => (
        <div key={adminId}>
          <AdminHatHeader adminId={adminId} chainId={chainId} />

          <div className='space-y-4'>
            {map(hats, (h: any) => (
              <SafeCard
                key={get(h, 'hats.[0].id')}
                hats={h.hats}
                signerSafe={h.hsgConfig}
                safeInfo={h.safeInfo}
                chainId={chainId}
              />
            ))}
          </div>

          {/* <Divider my={6} /> */}
        </div>
      ))}
    </div>
  );
};

export { SafeList };
