'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { councilsGraphqlClient, CREATE_INITIAL_FORM, CREATE_USER } from 'utils';

const NewCouncil = () => {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const hasAttemptedCreate = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (hasAttemptedCreate.current) return;
    if (!authenticated) {
      // router.push('/');
      return;
    }
    if (!user?.wallet?.address || !user?.email?.address) return;

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
          chain: 10, // Optimism
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
        console.error('Error creating council form:', error);
        hasAttemptedCreate.current = false; // Allow retry on error
        // router.push('/');
      }
    };

    createForm();
  }, [ready, authenticated, user, router]);

  if (!ready) return null;

  return null;
};

export default NewCouncil;
