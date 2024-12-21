'use client';

import { Button } from '@chakra-ui/react';

export const MailForm = () => {
  const handleSendInvite = async () => {
    fetch('/request-notify', {
      method: 'POST',
      body: JSON.stringify({ identifier: '123' }),
    });
  };

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <Button onClick={handleSendInvite} variant='outline'>
          Send &quot;You&apos;ve been invited&quot;
        </Button>
      </div>
      <div>
        <Button variant='outline'>
          Send &quot;You&apos;ve been added to a council&quot;
        </Button>
      </div>
      <div>
        <Button variant='outline'>
          Send &quot;You&apos;ve been removed from a council&quot;
        </Button>
      </div>
    </div>
  );
};
