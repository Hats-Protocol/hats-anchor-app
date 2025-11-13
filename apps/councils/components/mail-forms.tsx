'use client';

import { MAIL_FORMS } from '@hatsprotocol/config';
import { Form, Input } from 'forms';
import { map } from 'lodash';
import { useForm } from 'react-hook-form';

import { MailForm } from './mail-form';

interface MailFormsData {
  to: string;
  address: string;
}

const MailForms = () => {
  const localForm = useForm<MailFormsData>();

  const isDev = false || process.env.NODE_ENV !== 'production';

  if (!isDev) return null;

  return (
    <div className='flex flex-col gap-4'>
      <Form {...localForm}>
        <form className='flex flex-col gap-4'>
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

          <Input
            name='address'
            label='Address'
            placeholder='0x123...'
            localForm={localForm}
            options={{ required: true }}
          />
        </form>
      </Form>

      <div className='mt-6 flex flex-col gap-4'>
        {map(MAIL_FORMS, (mailForm) => (
          <MailForm key={mailForm.messageId} mailForm={mailForm} form={localForm} />
        ))}
      </div>
    </div>
  );
};

export { MailForms };
