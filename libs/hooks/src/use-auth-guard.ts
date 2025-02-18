'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef } from 'react';
import { logger } from 'utils';

// This hook can be dropped in to individual client-side components
// We can also do at the full page level, but if we want server side we'll need another approach
// We can export the specific states from this, such as isReady and isAuthorized, and add specific UI states to the consuming components if needed

export const useAuthGuard = () => {
  const { login, user, authenticated, ready, isModalOpen } = usePrivy();
  const hasTriggeredLogin = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (!isModalOpen && !authenticated) {
      hasTriggeredLogin.current = false;
    }

    const handleAuth = async () => {
      if (!authenticated && !hasTriggeredLogin.current) {
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
      isMounted.current = true;
      handleAuth();
    }
    return () => {
      isMounted.current = false;
    };
  }, [ready, authenticated, login, isModalOpen]);

  return {
    isAuthorized: authenticated && user?.wallet,
    isReady: ready,
  };
};
