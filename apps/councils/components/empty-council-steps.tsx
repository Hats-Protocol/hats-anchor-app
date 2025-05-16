'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMediaStyles } from 'hooks';
import { map } from 'lodash';
import { ArrowRightCircle } from 'lucide-react';
import { Button, Card, Link, Popover, PopoverContent, PopoverTrigger } from 'ui';
import { ipfsUrl } from 'utils';
import { useAccount } from 'wagmi';

const EMPTY_COUNCIL_STEPS = [
  { title: 'Create a Council for your DAO' },
  { title: 'Share membership based access to a Safe Multisig' },
  { title: 'No code set up smart contracts control membership' },
  { title: 'Appoint trustworthy members & managers' },
  { title: 'Deploy and manage your council for only 299 USDC / month' },
];

/**
 * Component for the empty state of the councils list page
 * Handles auth and login for the user
 * @returns Component for the empty state of the councils list page
 */
const EmptyCouncilSteps = () => {
  const { user, login } = usePrivy();
  const { address: userAddress } = useAccount();
  const { isClient } = useMediaStyles();

  if (!isClient) return null;

  return (
    <div className='relative mx-auto mt-20 flex min-h-[85vh] max-w-[1000px] flex-col gap-4 px-4 md:px-0'>
      <Card className='z-10 mx-auto w-full space-y-8 bg-white/90 px-6 py-8 md:w-[750px] md:space-y-12 md:px-20 md:py-12'>
        <div className='text-2xl font-bold md:text-3xl'>
          Create and maintain subDAOs, councils, committees, and teams in 5 easy steps
        </div>

        <div className='space-y-4 md:space-y-6'>
          {map(EMPTY_COUNCIL_STEPS, (step, i) => (
            <div className='flex items-center gap-3 md:gap-4' key={step.title}>
              <div className='border-functional-link-primary/30 flex size-8 shrink-0 items-center justify-center rounded-full border text-center md:size-12'>
                <p className='text-sm font-medium md:text-lg'>{i + 1}</p>
              </div>

              <p className='text-sm font-normal md:text-lg'>{step.title}</p>
            </div>
          ))}
        </div>

        <div className='flex justify-center'>
          {/* Desktop: Direct link */}
          <div className='hidden md:block'>
            <Link href={user ? '/councils/new' : '#'}>
              <Button
                size='xl'
                rounded='full'
                onClick={!user ? () => login() : undefined}
                className='bg-functional-link-primary'
              >
                {user && !userAddress ? 'Create a Council' : 'Connect to create a Council'}
                <ArrowRightCircle className='ml-1 !size-5 text-white' />
              </Button>
            </Link>
          </div>

          {/* Mobile: Popover for login */}
          <div className='md:hidden'>
            <Popover>
              <PopoverTrigger asChild>
                <Button size='lg' rounded='full' className='bg-functional-link-primary'>
                  Connect to create a Council
                  <ArrowRightCircle className='ml-1 !size-5 text-white' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-64 text-center' align='center'>
                <p className='font-medium'>Connect Wallet</p>
                <p className='mb-3 mt-1 text-sm text-gray-500'>Connect your wallet to create and manage councils.</p>
                <Button size='sm' rounded='full' className='bg-functional-link-primary w-full' onClick={() => login()}>
                  Connect Wallet
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      <img
        src={ipfsUrl('ipfs://bafybeiay3ysw4hffk62456srnt7m7ff55zoc7pzver4ndcyrxsidhdfjoq')}
        className='absolute bottom-0 right-0 z-0 aspect-square h-[400px] opacity-30 md:h-[700px] md:opacity-40'
      />
    </div>
  );
};

export { EmptyCouncilSteps };
