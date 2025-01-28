'use client';

import { useMediaStyles } from 'hooks';
import { Link } from 'ui';
import { formatAddress } from 'utils';
import { useAccount, useEnsName } from 'wagmi';

const LookingForHat = () => (
  <div className='flex flex-col gap-2'>
    <p>This app is here to help you claim hats based on their eligibility module(s).</p>

    <p className='max-w-[60%]'>
      You&apos;re probably looking for a specific hat. Look out for a link here with a specific hat ID on it, like the
      Hats Protocol Community Hat:{' '}
      <Link href='/10/1.2.1.1' className='inline-block font-mono underline'>
        /10/1.2.1.1
      </Link>
    </p>
  </div>
);

const Home = () => {
  const { isClient } = useMediaStyles();

  const { address: wearerAddress } = useAccount();
  const { data: ensName } = useEnsName({
    address: wearerAddress,
    chainId: 1,
  });

  if (!isClient || !wearerAddress) {
    return (
      <div className='py-120 px-20'>
        <div className='flex flex-col gap-10'>
          <h2 className='text-2xl font-medium'>Welcome to the Hats Protocol Claims app! 🧢</h2>

          <LookingForHat />
        </div>
      </div>
    );
  }

  return (
    <div className='py-120 px-20'>
      <div className='flex flex-col gap-10'>
        <h2 className='text-2xl font-medium'>
          gm {ensName || formatAddress(wearerAddress)}, welcome to the claims app
        </h2>

        <LookingForHat />
      </div>
    </div>
  );
};

export default Home;
