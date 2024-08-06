'use client';

import { Stack } from '@chakra-ui/react';
import { useTreasury } from 'contexts';
import { get, map } from 'lodash';

import SafeCard from './SafeCard';

const LOADING_SAFES = [
  { hats: [{ id: '1' }] },
  { hats: [{ id: '2' }] },
  { hats: [{ id: '3' }] },
  { hats: [{ id: '4' }] },
  { hats: [{ id: '5' }] },
];

const SafeList = () => {
  const { hatsWithSafesInfo, chainId } = useTreasury();

  return (
    <Stack w={{ base: '90%', md: '60%' }} mx='auto' spacing={4}>
      {map(hatsWithSafesInfo || LOADING_SAFES, (h: any) => (
        <SafeCard
          key={get(h, 'hats.[0].id')}
          hats={h.hats}
          signerSafe={h.hsgConfig}
          safeInfo={h.safeInfo}
          chainId={chainId}
        />
      ))}
    </Stack>
  );
};

export default SafeList;
