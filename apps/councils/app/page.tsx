'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Skeleton } from 'ui';

const Home = () => {
  const router = useRouter();
  const { user, authenticated, ready, login, linkEmail, isModalOpen } = usePrivy();
  const hasTriggeredLogin = useRef(false);
  const hasTriggeredEmailLink = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (!isModalOpen && !authenticated) {
      hasTriggeredLogin.current = false;
    }

    if (!isModalOpen && !user?.email) {
      hasTriggeredEmailLink.current = false;
    }

    const handleAuth = async () => {
      if (!authenticated && !hasTriggeredLogin.current) {
        hasTriggeredLogin.current = true;
        login();
        return;
      }

      if (authenticated && !user?.email && !hasTriggeredEmailLink.current) {
        hasTriggeredEmailLink.current = true;
        linkEmail();
        return;
      }

      if (authenticated && user?.email) {
        router.push('/councils/new');
      }
    };

    handleAuth();
  }, [ready, authenticated, user?.email, login, linkEmail, router, isModalOpen]);

  if (!ready) {
    return (
      <div className='grid-cols-20 grid pb-24 pt-24'>
        <div className='col-span-10 col-start-3 grid'>
          <Skeleton className='w-100 min-h-[500px] p-4' />
        </div>

        <div className='col-start-14 col-span-6 grid'>
          <Skeleton className='h-100 w-100' />
        </div>
      </div>
    );
  }

  return (
    <div className='grid-cols-20 grid pb-24 pt-24'>
      <div className='col-span-10 col-start-3 grid'>
        <Skeleton className='w-100 min-h-[500px] p-4' />
      </div>

      <div className='col-start-14 col-span-6 grid'>
        <Skeleton className='h-100 w-100' />
      </div>
    </div>
  );
};

export default Home;
