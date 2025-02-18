'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useRef } from 'react';
import { logger } from 'utils';
import { useAccount } from 'wagmi';

// This hook can be dropped in to individual client-side components
// We can also do at the full page level, but if we want server side we'll need another approach
// We can export the specific states from this, such as isReady and isAuthorized, and add specific UI states to the consuming components if needed

export const useAuthGuard = () => {
  const { login, user, authenticated, ready, isModalOpen, logout, linkEmail } = usePrivy();
  const { address: userAddress } = useAccount();
  const hasTriggeredLogin = useRef(false);
  const isMounted = useRef(false);

  // Handle MetaMask lock state
  useEffect(() => {
    if (authenticated && user?.wallet && !userAddress) {
      logger.info('MetaMask locked detected, logging out of Privy');
      logout();
    }
  }, [authenticated, user?.wallet, userAddress, logout]);

  // if !user.email, call the linkEmail() function from Privy
  useEffect(() => {
    if (authenticated && !user?.email) {
      linkEmail();
    }
  }, [authenticated, user?.email]);

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

  // Different auth states
  const isWalletLocked = authenticated && user?.wallet && !userAddress;
  const isFullyAuthenticated = authenticated && user?.wallet && userAddress;
  const needsLogin = !authenticated || !user;

  return {
    isAuthorized: isFullyAuthenticated,
    isReady: ready,
    isWalletLocked,
    needsLogin,
    login,
  };
};
