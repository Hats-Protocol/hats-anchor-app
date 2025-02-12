'use client';

import { MailFormData, PLACEHOLDERS } from '@hatsprotocol/config';
import { Form, Input } from 'forms';
import { useToast } from 'hooks';
import { find, get, map } from 'lodash';
import { posthog } from 'posthog-js';
import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ExtendedHSGV2, OffchainCouncilData } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from 'ui';
import { chainsMap, chainStringToId, formatAddress, getAllWearers, logger } from 'utils';

// Pick<MailFormData, 'fields'>

const MailForm = ({
  mailForm,
  form,
  offchainCouncilDetails,
  councilDetails,
}: {
  mailForm: MailFormData;
  form?: UseFormReturn<any>;
  offchainCouncilDetails?: OffchainCouncilData;
  councilDetails?: ExtendedHSGV2;
}) => {
  const freshForm = useForm();
  const localForm = form ?? freshForm;
  const { toast } = useToast();
  const {
    formState: { isValid },
    getValues,
    reset,
    watch,
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

  useEffect(() => {
    if (!offchainCouncilDetails || !councilDetails) return;

    const councilAddress = councilDetails.id;
    const councilName = offchainCouncilDetails.creationForm.councilName;
    const organizationName = offchainCouncilDetails.creationForm.organizationName;
    const chain = offchainCouncilDetails.creationForm.chain;
    const chainId = chainStringToId(chain?.value);
    const allWearers = getAllWearers(offchainCouncilDetails);
    const creator = find(allWearers, { address: offchainCouncilDetails.creationForm.creator });

    reset({
      creator_name: creator?.name || formatAddress(offchainCouncilDetails.creationForm.creator),
      // address: councilAddress,
      council_name: councilName,
      org_name: organizationName,
      chain_name: chainsMap(chainId ?? 10).name,
      council_members_link: `https://hatsprotocol.xyz/councils/${chainsMap(chainId ?? 10).name}:${councilAddress}`,
      compliance_title: 'Compliance Checker',
      member_title: 'Council Member',
    });
  }, [offchainCouncilDetails, councilDetails]);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!isDev) return null;

  return (
    <div key={mailForm.messageId} className='flex flex-col gap-2'>
      <Accordion type='single' collapsible>
        <AccordionItem value={mailForm.messageId}>
          <AccordionTrigger className='px-4 hover:bg-blue-50 hover:no-underline'>
            {mailForm.label} details
          </AccordionTrigger>
          <AccordionContent className='space-y-3 bg-white/40 p-2'>
            <div className='flex items-center justify-between'>
              <div className='flex gap-2'>
                <p>ID:</p>
                <pre className='bg-functional-link-primary/70 px-2 text-sm text-white/80'>{mailForm.messageId}</pre>
              </div>

              <Button
                variant='outline'
                onClick={isValid ? () => handleSend(mailForm.messageId) : undefined}
                disabled={!isValid}
              >
                Send
              </Button>
            </div>

            <Form {...localForm}>
              <div className='flex flex-col gap-2'>
                {map(mailForm.fields, (field) => (
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
  );
};

export { MailForm };
