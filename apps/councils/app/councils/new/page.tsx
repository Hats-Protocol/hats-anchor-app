'use client';

import { Center, Spinner } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { councilsGraphqlClient, CREATE_INITIAL_FORM, CREATE_USER, logger } from 'utils';
import { useChainId } from 'wagmi';

const NewCouncil = () => {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const chainId = useChainId();
  const hasAttemptedCreate = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (hasAttemptedCreate.current) return;
    if (!authenticated) return;
    if (!user?.wallet?.address || !user?.email?.address) return;
    if (!chainId) return;

    const createForm = async () => {
      try {
        hasAttemptedCreate.current = true;

        // First create or update the user
        const userResult: {
          createUser: {
            id: string;
            address: string;
            email: string;
            name: string;
          };
        } = await councilsGraphqlClient.request(CREATE_USER, {
          address: user!.wallet!.address,
          email: user!.email!.address,
          name: user!.email!.address.split('@')[0],
        });

        // Then create the council form
        const result: {
          createCouncilCreationForm: {
            id: string;
          };
        } = await councilsGraphqlClient.request(CREATE_INITIAL_FORM, {
          creator: user!.wallet!.address,
          chain: chainId,
          admins: [
            {
              id: userResult.createUser.id,
              address: userResult.createUser.address,
              email: userResult.createUser.email,
              name: userResult.createUser.name,
            },
          ],
        });

        const formId = result.createCouncilCreationForm.id;
        router.push(`/councils/new/details?draftId=${formId}`);
      } catch (error) {
        logger.error('Error creating council form:', error);
        hasAttemptedCreate.current = false;
      }
    };

    createForm();
  }, [ready, authenticated, user, chainId, router]);

  return (
    <Center minH='100vh'>
      <Spinner size='xl' />
    </Center>
  );
};

export default NewCouncil;
