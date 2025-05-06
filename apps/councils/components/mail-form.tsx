'use client';

import { COUNCIL_COPY_FIELDS, MailFormData, PLACEHOLDERS } from '@hatsprotocol/config';
import { Form, Input } from 'forms';
import { safeUrl } from 'hats-utils';
import { useToast } from 'hooks';
import { compact, find, get, isEmpty, map, size } from 'lodash';
import { ExternalLink } from 'lucide-react';
import { posthog } from 'posthog-js';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ExtendedHSGV2, OffchainCouncilData, SupportedChains } from 'types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Link } from 'ui';
import {
  camelCaseToWords,
  chainIdToString,
  chainsMap,
  customerioUrl,
  explorerUrl,
  formatAddress,
  getAllWearers,
  logger,
} from 'utils';

const PRO_APP_URL = process.env.PRO_APP_URL || 'https://pro.hatsprotocol.xyz';

const getReceivers = (offchainCouncilDetails: OffchainCouncilData | undefined, receivers: string[] | undefined) => {
  if (!offchainCouncilDetails || !receivers) return [];
  const allWearers = getAllWearers(offchainCouncilDetails.creationForm);
  const councilManagers = offchainCouncilDetails?.creationForm.admins;
  const councilCreator = find(allWearers, { address: offchainCouncilDetails?.creationForm.creator });
  const councilMembers = offchainCouncilDetails?.creationForm.members;
  const councilComplianceManagers = offchainCouncilDetails?.creationForm.complianceAdmins;

  const receiverArray = [];

  if (receivers.includes('councilMembers')) receiverArray.push(...councilMembers);
  if (receivers.includes('councilManagers')) receiverArray.push(...councilManagers);
  if (receivers.includes('councilComplianceManagers')) {
    if (!isEmpty(councilComplianceManagers)) receiverArray.push(...councilComplianceManagers);
    else receiverArray.push(...councilManagers);
  }
  if (receivers.includes('creator')) receiverArray.push(councilCreator);

  return compact(receiverArray);
};

const MailForm = ({
  mailForm,
  form,
  offchainCouncilDetails,
  councilDetails,
}: {
  mailForm: MailFormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: UseFormReturn<any>; // Pick<MailFormData, 'fields'>
  offchainCouncilDetails?: OffchainCouncilData;
  councilDetails?: ExtendedHSGV2;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const freshForm = useForm();
  const localForm = form ?? freshForm;
  const { toast } = useToast();
  const {
    formState: { isValid },
    getValues,
    reset,
    // watch,
  } = localForm;

  const notifyEndpoint = async (data: MailFormData, notificationId: string) => {
    setIsLoading(true);

    const receivers = getReceivers(offchainCouncilDetails, mailForm.receivers);
    console.log('receivers', receivers);
    if (!receivers || isEmpty(receivers)) {
      toast({
        title: 'Error',
        description: 'No receivers found',
        variant: 'destructive',
      });
      return;
    }
    // for notificationId, get correct receiver array
    const notifications = map(receivers, (receiver) => ({
      ...data,
      notificationId,
      councilId: offchainCouncilDetails?.id,
      userId: receiver.id,
      email: receiver.email,
      name: receiver.name,
      // TODO change this if compliance manager accessory used in email not sent to themselves
      complianceManagerAccessory: size(receivers) > 1 ? 'a' : 'the',
      address: formatAddress(receiver.address),
    }));

    return fetch('/api/request-notify', {
      method: 'POST',
      body: JSON.stringify({ notifications }),
    })
      .then((res) =>
        res.json().catch((err) => {
          logger.error(err);
          toast({
            title: 'Error',
            description: 'Failed to send email',
            variant: 'destructive',
          });
        }),
      )
      .then((data) => {
        if (data.success === false) {
          toast({
            title: 'Error',
            description: data.message,
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: `Email${receivers.length > 1 ? 's' : ''} queued`,
          description: `Email${receivers.length > 1 ? 's' : ''} queued for ${receivers.length > 0 ? receivers.length : 1} recipient${
            receivers.length > 1 ? 's' : ''
          }`,
        });
      })
      .catch((err) => {
        logger.error(err);
        toast({
          title: 'Error',
          description: 'Failed to send email',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsLoading(false);
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
    const chainId = offchainCouncilDetails.creationForm.chain as unknown as number;
    const allWearers = getAllWearers(offchainCouncilDetails.creationForm);
    const creator = find(allWearers, { address: offchainCouncilDetails.creationForm.creator });
    const useCouncilManagers = size(offchainCouncilDetails.creationForm.complianceAdmins) === 0;
    const complianceManagers = useCouncilManagers
      ? offchainCouncilDetails.creationForm.admins
      : offchainCouncilDetails.creationForm.complianceAdmins;

    reset({
      creatorName: creator?.name || formatAddress(offchainCouncilDetails.creationForm.creator),
      creatorEmail: creator?.email,
      councilName: councilName,
      orgName: organizationName,
      chainName: chainsMap(chainId).name,
      councilMembersLink: `${PRO_APP_URL}/councils/${chainIdToString(chainId ?? 10)}:${councilAddress}/members`,
      councilJoinLink: `${PRO_APP_URL}/councils/${chainIdToString(chainId ?? 10)}:${councilAddress}/join`,

      // not shown in form, but passed to email data
      councilMembers: map(offchainCouncilDetails.creationForm.members, ({ name, address }) => ({
        name,
        address: formatAddress(address),
      })),
      councilSafeLink: safeUrl(chainId as SupportedChains, councilDetails.safe),
      subscriptionInfo: '299 USDC per month paid via invoice to follow',
      deployTransactionLink: `${explorerUrl(chainId)}/tx/0x`, // only available with deploy event

      // copy
      complianceTitle: PLACEHOLDERS.complianceTitle,
      memberTitle: PLACEHOLDERS.memberTitle,
      memberName: PLACEHOLDERS.memberName,
      councilTitle: PLACEHOLDERS.councilTitle,
      councilTitleUpper: PLACEHOLDERS.councilTitleUpper,
      complianceManagerAccessory: size(complianceManagers) > 1 ? 'a' : 'the',
    });
    // don't include reset in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offchainCouncilDetails, councilDetails]);

  const isDev = posthog.isFeatureEnabled('dev') || process.env.NODE_ENV !== 'production';

  if (!isDev) return null;

  return (
    <div key={mailForm.messageId} className='flex flex-col gap-2'>
      <Accordion type='single' collapsible>
        <AccordionItem value={mailForm.messageId}>
          <AccordionTrigger className='px-4 hover:bg-blue-50 hover:no-underline'>
            <p>{mailForm.label}</p>
          </AccordionTrigger>

          <AccordionContent className='bg-functional-link-primary/10 space-y-3 p-2'>
            <Form {...localForm}>
              <form>
                <div className='flex items-center justify-between'>
                  <div className='flex gap-2'>
                    <p>ID:</p>
                    <pre className='bg-functional-link-primary/70 px-2 text-sm text-white/80'>{mailForm.messageId}</pre>
                  </div>

                  <Button
                    variant='outline'
                    onClick={isValid ? () => handleSend(mailForm.messageId) : undefined}
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </Button>
                </div>

                <div className='my-2 flex items-center justify-between'>
                  <p>Sent to {map(mailForm.receivers, (r) => camelCaseToWords(r)).join(', ')}</p>

                  <Link
                    href={customerioUrl(mailForm.cioId)}
                    className='text-functional-link-primary flex items-center gap-1 text-xs'
                    isExternal
                  >
                    View in Customer.io
                    <ExternalLink className='size-3' />
                  </Link>
                </div>

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

                <Accordion type='single' collapsible className='mt-2 bg-slate-50'>
                  <AccordionItem value='councilCopy'>
                    <AccordionTrigger className='px-2 hover:no-underline'>Council Copy</AccordionTrigger>
                    <AccordionContent className='space-y-2 px-2'>
                      {map(COUNCIL_COPY_FIELDS, (field) => (
                        <Input key={field.name} name={field.name} label={field.label} localForm={localForm} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </form>
            </Form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export { MailForm };
