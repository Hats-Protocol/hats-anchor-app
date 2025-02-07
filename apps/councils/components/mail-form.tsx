'use client';

import { Form, Input } from 'forms';
import { useToast } from 'hooks';
import { get, map } from 'lodash';
import { posthog } from 'posthog-js';
import { useForm } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from 'ui';
import { logger } from 'utils';

interface MailFormData {
  to: string;
  address: string;
}

const PLACEHOLDERS = {
  creator_name: 'Vitalik',
  council_name: 'Protocol Council',
  org_name: 'Ethereum',
  member_title: 'Council Member',
  compliance_title: 'Compliance Manager',
};

const MAIL_BUTTONS = [
  {
    label: 'Initial invitation to council member',
    messageId: 'invite_council_member',
  },
  {
    label: 'Reminder to join a council for council member',
    messageId: 'reminder_to_join_council',
    fields: [
      { name: 'creator_name', label: 'Creator Name' },
      { name: 'council_name', label: 'Council Name' },
    ],
  },
  {
    label: 'Notify compliance manager after council is deployed',
    messageId: 'notify_compliance_manager_after_deploy',
    fields: [
      { name: 'creator_name', label: 'Creator Name' },
      { name: 'council_name', label: 'Council Name' },
      { name: 'org_name', label: 'Organization Name' },
      { name: 'compliance_title', label: 'Compliance Title' }, // what is compliance manager called
      { name: 'member_title', label: 'Member Title' }, // what is council member called
    ],
  },
  {
    label: 'Council setup is complete',
    messageId: 'council_setup_complete',
  },
  {
    label: 'Council deployed',
    messageId: 'council_deployed',
  },
];

const MailForm = () => {
  const localForm = useForm<MailFormData>();
  const { toast } = useToast();
  const {
    formState: { isValid },
    getValues,
  } = localForm;

  const notifyEndpoint = async (data: MailFormData, messageId: string) => {
    return fetch('/api/request-notify', {
      method: 'POST',
      body: JSON.stringify({ ...data, messageId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive',
          });
        }

        toast({
          title: 'Email sent',
          description: 'Email sent successfully',
        });
      })
      .catch((err) => {
        logger.error(err);
        toast({
          title: 'Error',
          description: 'Failed to send email',
          variant: 'destructive',
        });
      });
  };

  const handleSend = async (messageId: string) => {
    const data = getValues();
    notifyEndpoint(data, messageId); //
  };

  const isDev = process.env.NODE_ENV !== 'production' || posthog.isFeatureEnabled('dev');

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
        {map(MAIL_BUTTONS, (button) => (
          <div key={button.messageId} className='flex flex-col gap-2'>
            <Accordion type='single' collapsible>
              <AccordionItem value={button.messageId}>
                <AccordionTrigger className='hover:no-underline'>{button.label} details</AccordionTrigger>
                <AccordionContent className='space-y-3 bg-white/40 p-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-2'>
                      <p>ID:</p>
                      <pre className='text-sm text-gray-500'>{button.messageId}</pre>
                    </div>

                    <Button
                      variant='outline'
                      onClick={isValid ? () => handleSend(button.messageId) : undefined}
                      disabled={!isValid}
                    >
                      Send
                    </Button>
                  </div>

                  <Form {...localForm}>
                    <div className='flex flex-col gap-2'>
                      {map(button.fields, (field) => (
                        <Input
                          key={field.name}
                          name={field.name}
                          label={field.label}
                          localForm={localForm}
                          placeholder={get(PLACEHOLDERS, field.name)}
                          isDisabled={!isValid}
                        />
                      ))}
                    </div>
                  </Form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export { MailForm };
