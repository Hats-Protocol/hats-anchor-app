import { useQueryClient } from '@tanstack/react-query';
import { Modal, useOverlay } from 'contexts';
import { DurationInput, Form, MarkdownEditor } from 'forms';
// import { useToast } from 'hooks';
import { find } from 'lodash';
import { useAgreementClaim, useCallModuleFunction } from 'modules-hooks';
import posthog from 'posthog-js';
import { useEffect, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import showdown from 'showdown';
import { ModuleDetails, ModuleFunction, SupportedChains } from 'types';
import { Button } from 'ui';
import { fetchToken, handleAgreementPin, logger } from 'utils';

function UpdateAgreementModal({
  moduleDetails,
  chainId,
}: {
  moduleDetails: ModuleDetails;
  chainId: number | undefined;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm(); // TODO leverage yup resolver for required validation(s)
  const {
    handleSubmit,
    reset,
    formState: { isValid },
  } = form;
  const { setModals } = useOverlay();
  // const { toast } = useToast();

  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });

  const queryClient = useQueryClient();
  const { agreement } = useAgreementClaim({
    moduleParameters: moduleDetails.liveParameters,
  });

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);

    // need to convert html to markdown before pinning
    const converter = new showdown.Converter();
    const agreementMarkdown = converter.makeMarkdown(data.agreement);

    const token = await fetchToken();
    const agreementHash = await handleAgreementPin({
      agreement: agreementMarkdown,
      address: moduleDetails.instanceAddress,
      chainId,
      token,
    });
    logger.debug({ agreementHash, gracePeriod: data.gracePeriod });

    callModuleFn({
      moduleId: moduleDetails.implementationAddress,
      instance: moduleDetails.instanceAddress,
      func: find(moduleDetails.writeFunctions, { functionName: 'setAgreement' }) as ModuleFunction,
      args: { Agreement: agreementHash, 'Grace Period': BigInt(data.gracePeriod) },
      onSuccess: () => {
        // console.log('success');
        setIsLoading(false);
        // invalidate agreement claim query
        queryClient.invalidateQueries({ queryKey: ['agreement'] });
        setModals?.({});
        posthog.capture('Updated Agreement', {
          chainId,
          moduleAddress: moduleDetails.instanceAddress,
          agreementHash,
          gracePeriod: data.gracePeriod,
        });
      },
      onDecline: () => {
        setIsLoading(false);
      },
      // onError: () => {
      //   setIsLoading(false);
      // },
    });
  };

  useEffect(() => {
    if (!agreement) return;
    const thirtyDaysFromNow = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();

    reset({ agreement, gracePeriod: thirtyDaysFromNow });
    // intentionally exclude reset from dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agreement]);

  return (
    <Modal name='updateAgreement' title='Update Agreement' size='xl'>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-4'>
            <MarkdownEditor name='agreement' placeholder='Agreement text' localForm={form} />

            <div className='w-full'>
              <DurationInput
                name='gracePeriod'
                label='Grace expires'
                subLabel='Current wearers will have until grace expires to sign the new agreement'
                placeholder='Grace period expires on..'
                defaultTimeValue={30}
                defaultTimeUnit='days'
                localForm={form}
              />
            </div>
          </div>

          <div className='mt-6 flex justify-end'>
            <Button type='submit' rounded='full' disabled={!isValid || isLoading}>
              {isLoading ? 'Updating…' : 'Update Agreement'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

export { UpdateAgreementModal };
