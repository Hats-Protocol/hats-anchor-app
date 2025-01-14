'use client';

import { Center, Spinner } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

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
      <Center minH='100vh'>
        <Spinner size='xl' />
      </Center>
    );
  }

  return (
    <Center minH='100vh'>
      <Spinner size='xl' />
    </Center>
  );
};

export default Home;
