import { hatIdDecimalToIp, hatIdHexToDecimal } from '@hatsprotocol/sdk-v1-core';
import dynamic from 'next/dynamic';
import { Hex } from 'viem';

const HatIcon = dynamic(() => import('icons').then((mod) => mod.HatIcon));

const AboutAllowlist = ({
  eligibilityHat,
  ownerHat,
  judgeHat,
}: {
  eligibilityHat: Hex | undefined;
  ownerHat: Hex | undefined;
  judgeHat: Hex | undefined;
}) => {
  if (!eligibilityHat || !ownerHat || !judgeHat) return null;

  return (
    <div className='flex flex-col gap-4'>
      <h3 className='text-lg font-bold'>About this Allowlist</h3>

      <div className='flex justify-between'>
        <p className='text-sm'>Eligibility Rule for this Hat</p>

        <div className='flex items-center gap-1'>
          <p className='text-sm'>{hatIdDecimalToIp(hatIdHexToDecimal(eligibilityHat))}</p>

          <HatIcon className='h-4 w-4' />
        </div>
      </div>

      <div className='flex justify-between'>
        <p className='text-sm'>Owner edits the allowlist</p>

        <div className='flex items-center gap-1'>
          <p className='text-sm'>{hatIdDecimalToIp(hatIdHexToDecimal(ownerHat))}</p>

          <HatIcon className='h-4 w-4' />
        </div>
      </div>

      <div className='flex justify-between'>
        <p className='text-sm'>Judge determines wearer standing</p>

        <div className='flex items-center gap-1'>
          <p className='text-sm'>{hatIdDecimalToIp(hatIdHexToDecimal(judgeHat))}</p>

          <HatIcon className='h-4 w-4' />
        </div>
      </div>
    </div>
  );
};

export { AboutAllowlist };
