'use client';

import { hatIdDecimalToHex, hatIdDecimalToIp } from '@hatsprotocol/sdk-v1-core';

import HatCreateCard from './HatCreateCard';

const InlineHatCard = ({ hatId }: { hatId: bigint }) => {
  console.log('hatId', hatId);

  return (
    <div className='flex gap-2 relative'>
      <HatCreateCard id={hatIdDecimalToHex(hatId)} />

      <div>{hatIdDecimalToIp(hatId)}</div>
    </div>
  );
};

export default InlineHatCard;
