'use client';

import { Button, Center } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const Home = () => {
  const router = useRouter();
  const { ready, authenticated, login, linkEmail, user } = usePrivy();
  const hasTriggeredLogin = useRef(false);
  const hasTriggeredEmailLink = useRef(false);

  useEffect(() => {
    if (!ready) return;

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
  }, [ready, authenticated, user?.email, login, linkEmail, router]);

  if (!ready) {
    return (
      <Center minH='100vh'>
        <Button isLoading variant='whiteFilled'>
          Loading...
        </Button>
      </Center>
    );
  }

  return null;
};

export default Home;
