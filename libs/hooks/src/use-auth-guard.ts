'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef } from 'react';
import { logger } from 'utils';
import { useAccount } from 'wagmi';

// This hook can be dropped in to individual client-side components
// We can also do at the full page level, but if we want server side we'll need another approach
// We can export the specific states from this, such as isReady and isAuthorized, and add specific UI states to the consuming components if needed

export const useAuthGuard = () => {
  const { login, user, authenticated, ready, isModalOpen } = usePrivy();
  const { address: userAddress } = useAccount();
  const hasTriggeredLogin = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    console.log('AuthGuard Effect:', {
      ready,
      authenticated,
      user,
      userAddress,
      hasTriggeredLogin: hasTriggeredLogin.current,
      isModalOpen,
    });

    if (!ready) return;

    if (!isModalOpen && (!authenticated || !userAddress)) {
      console.log('AuthGuard: Resetting hasTriggeredLogin');
      hasTriggeredLogin.current = false;
    }

    const handleAuth = async () => {
      if ((!authenticated || !userAddress) && !hasTriggeredLogin.current) {
        console.log('AuthGuard: Triggering login');
        hasTriggeredLogin.current = true;
        try {
          await login();
        } catch (error) {
          logger.error(error);
          hasTriggeredLogin.current = false;
        }
        return;
      }
    };

    if (!isMounted.current) {
      console.log('AuthGuard: First mount, checking auth');
      isMounted.current = true;
      handleAuth();
    }
    return () => {
      isMounted.current = false;
    };
  }, [ready, authenticated, login, isModalOpen, user?.wallet, userAddress]);

  const isAuthorized = authenticated && !!userAddress;
  console.log('AuthGuard Return:', { isAuthorized, ready, userAddress });

  return {
    isAuthorized,
    isReady: ready,
  };
};
