'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef } from 'react';

export const useAuthGuard = () => {
  const { login, user, authenticated, ready, isModalOpen } = usePrivy();
  const hasTriggeredLogin = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (!isModalOpen && !authenticated) {
      hasTriggeredLogin.current = false;
    }

    const handleAuth = async () => {
      if (!authenticated && !hasTriggeredLogin.current) {
        hasTriggeredLogin.current = true;
        login();
        return;
      }
    };

    handleAuth();
  }, [ready, authenticated, login, isModalOpen]);

  return {
    isAuthorized: authenticated && user?.wallet,
    isReady: ready,
  };
};
