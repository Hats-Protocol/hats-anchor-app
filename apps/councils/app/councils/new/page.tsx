/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAuthGuard } from 'hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Suspense } from 'react';
import { Skeleton } from 'ui';
import { CREATE_COUNCIL_FORM, CREATE_USER, getCouncilsGraphqlClient, logger } from 'utils';
import { useChainId } from 'wagmi';

// TODO fix non-null assertion

const NewCouncilContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authenticated, ready, getAccessToken } = usePrivy();
  const chainId = useChainId();
  const hasAttemptedCreate = useRef(false);

  useAuthGuard();

  useEffect(() => {
    if (!ready) return;
    if (hasAttemptedCreate.current) return;
    if (!authenticated) return;
    if (!user?.wallet?.address || !user?.email?.address) return;
    if (!chainId) return;

    const createForm = async () => {
      try {
        hasAttemptedCreate.current = true;
        const accessToken = await getAccessToken();

        // First create or update the user
        const userResult: {
          createUser: {
            id: string;
            address: string;
            email: string;
            name: string;
          };
        } = await getCouncilsGraphqlClient(accessToken ?? undefined).request(CREATE_USER, {
          address: user!.wallet!.address,
          email: user!.email!.address,
          name: user!.email!.address.split('@')[0],
        });

        // Then create the council form
        const result: {
          createCouncilCreationForm: { id: string };
        } = await getCouncilsGraphqlClient(accessToken ?? undefined).request(CREATE_COUNCIL_FORM, {
          creator: user!.wallet!.address,
          chain: chainId,
          // TODO handle existing admins for second councils
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
        // Preserve the organizationName query parameter if it exists
        const orgName = searchParams.get('organizationName');
        const queryString = new URLSearchParams();
        queryString.set('draftId', formId);
        if (orgName) {
          queryString.set('organizationName', orgName);
        }
        router.push(`/councils/new/details?${queryString.toString()}`);
      } catch (error) {
        logger.error('Error creating council form:', error);
      }
    };

    createForm();
  }, [ready, authenticated, user, chainId, router, getAccessToken, searchParams]);

  if (!ready || !authenticated) {
    return <Skeleton className='h-100 w-100' />;
  }

  return null;
};

export default function NewCouncilPage() {
  return (
    <Suspense>
      <NewCouncilContent />
    </Suspense>
  );
}
