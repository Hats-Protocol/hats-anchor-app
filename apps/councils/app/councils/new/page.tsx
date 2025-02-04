'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { CouncilMember } from 'types';
import { Skeleton } from 'ui';
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
          createUser: CouncilMember;
        } = await councilsGraphqlClient.request(CREATE_USER, {
          address: user!.wallet!.address,
          email: user!.email!.address,
          name: user!.email!.address.split('@')[0],
        });

        // Then create the council form
        const result: {
          createCouncilCreationForm: { id: string };
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
    <div className='grid-cols-20 grid min-h-screen w-full pb-24 pt-24'>
      <div className='col-span-10 col-start-3 grid'>
        <Skeleton className='bg-functional-link-primary/10 min-h-[500px] w-full p-4' />
      </div>

      <div className='col-start-14 col-span-6 grid'>
        <Skeleton className='bg-functional-link-primary/10 h-full w-full' />
      </div>
    </div>
  );
};

export default NewCouncil;
