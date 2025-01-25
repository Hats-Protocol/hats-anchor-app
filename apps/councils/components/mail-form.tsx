'use client';

import { Button } from '@chakra-ui/react';
import { Form, Input } from 'forms';
import { useForm } from 'react-hook-form';

export const MailForm = () => {
  const localForm = useForm();
  const {
    formState: { isValid },
    handleSubmit,
  } = localForm;

  const notifyEndpoint = (data: any, messageId: number) => {
    fetch('/request-notify', {
      method: 'POST',
      body: JSON.stringify({ ...data, msgId: messageId }),
    });
  };

  // TODO handle actual transactional message ids
  const handleSendInvite = async (data: any) => {
    console.log(data);
    notifyEndpoint(data, 1);
  };

  const handleSendAdded = async (data: any) => {
    console.log(data);
    notifyEndpoint(data, 2);
  };

  const handleSendRemoved = async (data: any) => {
    console.log(data);
    notifyEndpoint(data, 3);
  };

  return (
    <div className='flex flex-col gap-4'>
      <Form {...localForm}>
        <form>
          <Input
            name='to'
            label='Email'
            placeholder='v@hatsprotocol.xyz'
            localForm={localForm}
            options={{
              required: true,
              validate: (value) => value.endsWith('@hatsprotocol.xyz') || 'Must be a Hats Protocol email',
            }}
          />
        </form>
      </Form>

      <div>
        <Button variant='outline' onClick={handleSubmit(handleSendInvite)} isDisabled={!isValid}>
          Send &quot;You&apos;ve been invited&quot;
        </Button>
      </div>
      <div>
        <Button variant='outline' onClick={handleSubmit(handleSendAdded)} isDisabled={!isValid}>
          Send &quot;You&apos;ve been added to a council&quot;
        </Button>
      </div>
      <div>
        <Button variant='outline' onClick={handleSubmit(handleSendRemoved)} isDisabled={!isValid}>
          Send &quot;You&apos;ve been removed from a council&quot;
        </Button>
      </div>
    </div>
  );
};
