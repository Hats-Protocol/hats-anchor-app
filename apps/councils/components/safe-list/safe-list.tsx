'use client';

import { Box, Divider, Heading, HStack, Stack } from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { useHatDetails } from 'hats-hooks';
import { get, groupBy, map } from 'lodash';
import { SupportedChains } from 'types';
import { ipfsUrl } from 'utils';

import { SafeCard } from './safe-card';

const LOADING_SAFES = [
  { hats: [{ id: '1' }] },
  { hats: [{ id: '2' }] },
  { hats: [{ id: '3' }] },
  { hats: [{ id: '4' }] },
  { hats: [{ id: '5' }] },
];

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
    <HStack pb={4}>
      <Box
        boxSize='35px'
        backgroundImage={adminHatImage !== '#' ? adminHatImage : '/icon.jpeg'}
        backgroundSize='cover'
        border='1px gray.400'
        borderRadius='md'
      />
      <Heading size='lg' variant='medium'>
        {adminHatName}
      </Heading>
    </HStack>
  );
};

const SafeList = () => {
  const { hatsWithSafesInfo, chainId } = useTreasury();

  const groupedByAdmin = groupBy(hatsWithSafesInfo, (h: any) => get(h, 'hats.[0].admin.id'));

  return (
    <Stack w={{ base: '90%', md: '60%' }} mx='auto' spacing={4}>
      {map(groupedByAdmin, (hats, adminId) => (
        <Stack key={adminId}>
          <AdminHatHeader adminId={adminId} chainId={chainId} />

          <Stack spacing={4}>
            {map(hats, (h: any) => (
              <SafeCard
                key={get(h, 'hats.[0].id')}
                hats={h.hats}
                signerSafe={h.hsgConfig}
                safeInfo={h.safeInfo}
                chainId={chainId}
              />
            ))}
          </Stack>

          <Divider my={6} />
        </Stack>
      ))}
    </Stack>
  );
};

export { SafeList };
