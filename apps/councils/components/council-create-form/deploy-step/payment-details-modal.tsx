'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useMutation } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { AddressInput, Form, FormDescription, Input } from 'forms';
import { useTokenDetails } from 'hooks';
import { get, toLower, toNumber } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import type { CouncilFormData, SupportedChains } from 'types';
import {
  chainsMap,
  CREATE_USER,
  getCouncilsGraphqlClient,
  isValidEmail,
  logger,
  tokenImageHandler,
  UPDATE_PAYER,
} from 'utils';
import { zeroAddress } from 'viem';

import { NextStepButton } from '../../next-step-button';

interface PaymentDetailsModalProps {
  form: UseFormReturn<CouncilFormData>;
  draftId: string;
  canEdit?: boolean;
}

export function PaymentDetailsModal({ form: parentForm, draftId, canEdit = true }: PaymentDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const selectedChain = parentForm.watch('chain')?.value;
  const chainId = toNumber(selectedChain);
  const { modals, setModals } = useOverlay();
  const { getAccessToken } = usePrivy();

  const { data: tokenData } = useTokenDetails({
    symbol: toLower('USDC'),
  });

  const tokenImage = tokenImageHandler({
    symbol: 'USDC',
    primaryImage: get(tokenData, 'avatar'),
    chainId,
  });

  const modalForm = useForm({
    defaultValues: {
      address: '',
      email: '',
      name: '',
      telegram: '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const isFormValid = () => {
    const values = modalForm.getValues();
    return !!values.name && values.name.length > 0 && isValidEmail(values.email);
  };

  const createUserMutation = useMutation({
    mutationFn: async (variables: { address: string; email: string; name?: string; telegram?: string }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request<{
        createUser: {
          id: string;
          address: string;
          email: string;
          name?: string;
          telegram?: string;
        };
      }>(CREATE_USER, variables);
      return result.createUser;
    },
  });

  const updatePayerMutation = useMutation({
    mutationFn: async (variables: {
      id: string;
      payer: {
        id: string;
        address: string;
        email: string;
        name?: string;
        telegram?: string;
      };
    }) => {
      const accessToken = await getAccessToken();
      const result = await getCouncilsGraphqlClient(accessToken ?? undefined).request(UPDATE_PAYER, variables);
      return result;
    },
  });

  const handleSubmit = async (data: { address: string; email: string; name?: string; telegram?: string }) => {
    setLoading(true);
    if (!canEdit) return;
    // if (!isAddress(data.address)) {
    //   setFormError('Please enter a valid Ethereum address');
    //   return;
    // }
    const overrideNullAddress = {
      ...data,
      address: data.address === '' ? zeroAddress : data.address,
    };

    try {
      const userData = await createUserMutation.mutateAsync(overrideNullAddress);

      await updatePayerMutation.mutateAsync({
        id: draftId,
        payer: userData,
      });
      if (!parentForm.getValues('payer')) {
        // const message = `💰 Invoice details added for *${councilName}* on ${chainsMap(chainId)?.name} \\| `;
        // const councilLink = `[View Council](${url}/councils/new/payment?draftId=${draftId}) 💰`;
        // const userKeys = reject(keys(userData), (key) => key === 'id');
        // const userDetails = compact(
        //   map(userKeys, (key) => {
        //     if (key === 'address' && get(userData, 'address')) {
        //       return `\n> Address: ${tgFormatAddress(get(userData, 'address'))}`;
        //     }
        //     if (get(userData, key)) {
        //       return `\n> ${capitalize(key)}: ${get(userData, key).replace('.', '\\.')}`;
        //     }
        //     return undefined;
        //   }),
        // );
        // TODO re-enable, this is currently failing without the API endpoint
        // await sendTelegramMessage(`${message} ${councilLink} ${userDetails.join('')}`).catch((error) => {
        //   logger.error('Error sending telegram message:', error);
        // });
      }

      parentForm.setValue('payer', userData);
      setFormError(null);
      setLoading(false);
      modalForm.reset();
      setModals?.({});
    } catch (error) {
      setFormError('Failed to save payment details. Please try again.');
      logger.error('Error saving payment details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modals?.paymentDetailsModal) {
      setFormError(null);
      const currentPayer = parentForm.getValues('payer');
      if (currentPayer) {
        modalForm.reset({
          address: currentPayer.address,
          email: currentPayer.email,
          name: currentPayer.name,
          telegram: currentPayer.telegram,
        });
      }
    }
  }, [modals?.paymentDetailsModal, parentForm, modalForm]);

  return (
    <Modal name='paymentDetailsModal' title='Invoicing Details' size='xl'>
      <Form {...modalForm}>
        <form onSubmit={modalForm.handleSubmit(handleSubmit)} className='relative rounded-lg bg-white'>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <h3 className='text-base font-bold text-gray-900'>Monthly</h3>
              <p className='text-gray-600'>
                Provide invoice contact information here and we&apos;ll reach out to setup a recurring payment system
                that fits your preferences.
              </p>

              <div className='mt-4 flex items-center gap-2'>
                <img src={tokenImage} className='size-5' alt='USDC logo' />
                <p className='flex items-center gap-2 text-lg font-medium text-black/90'>299 USDC / month</p>
              </div>
            </div>

            <div className='space-y-2'>
              <Input
                name='email'
                label='Email'
                labelNote='Hidden'
                variant='councils'
                localForm={modalForm}
                placeholder='Email address'
                options={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                isDisabled={!canEdit}
              />
            </div>

            <div className='space-y-2'>
              <Input
                name='name'
                label='Your Name'
                variant='councils'
                localForm={modalForm}
                placeholder='Full name'
                isDisabled={!canEdit}
              />
            </div>

            <div className='space-y-2'>
              <AddressInput
                name='address'
                label={`${chainsMap(chainId)?.name} Account`}
                labelNote='Optional'
                variant='councils'
                localForm={modalForm}
                hideAddressButtons
                chainId={chainId as SupportedChains}
                isDisabled={!canEdit}
              />
            </div>
            <div className='space-y-2'>
              <Input
                name='telegram'
                label='Telegram Handle'
                labelNote='Optional'
                variant='councils'
                localForm={modalForm}
                placeholder='@username'
                isDisabled={!canEdit}
              />
            </div>
          </div>

          <div className='mt-8'>
            {formError && <FormDescription className='text-destructive mb-4'>{formError}</FormDescription>}
            <div className='flex justify-end'>
              <NextStepButton type='submit' disabled={!isFormValid() || !canEdit || loading} withIcon={false}>
                {loading ? 'Submitting…' : 'Submit details'}
              </NextStepButton>
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
