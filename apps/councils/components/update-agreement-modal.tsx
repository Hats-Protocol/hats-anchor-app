import { Modal, useOverlay } from 'contexts';
import { DatePicker, Form, MarkdownEditor } from 'forms';
import { useToast } from 'hooks';
import { find } from 'lodash';
import { useAgreementClaim, useCallModuleFunction } from 'modules-hooks';
import { useEffect, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
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
  const { toast } = useToast();

  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });

  const { agreement } = useAgreementClaim({
    moduleParameters: moduleDetails.liveParameters,
  });

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    const localGracePeriod = Math.floor(new Date(data.gracePeriod).getTime() / 1000);
    if (!localGracePeriod) {
      toast({ title: 'Please select a valid grace period' });
      setIsLoading(false);
      return;
    }
    const token = await fetchToken();
    const agreementHash = await handleAgreementPin({
      agreement: data.agreement,
      address: moduleDetails.instanceAddress,
      chainId,
      token,
    });
    logger.debug({ agreementHash, gracePeriod: data.gracePeriod });

    callModuleFn({
      moduleId: moduleDetails.implementationAddress,
      instance: moduleDetails.instanceAddress,
      func: find(moduleDetails.writeFunctions, { functionName: 'setAgreement' }) as ModuleFunction,
      args: { Agreement: agreementHash, 'Grace Period': BigInt(localGracePeriod) },
      onSuccess: () => {
        console.log('success');
        setIsLoading(false);
        // invalidate agreement claim query
        setModals?.({});
      },
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
    <Modal name='updateAgreement' title='Update Agreement'>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-4'>
            <MarkdownEditor name='agreement' placeholder='Agreement text' localForm={form} />

            <div className='w-full md:w-1/2'>
              <DatePicker
                name='gracePeriod'
                label='Grace expires'
                info='Current wearers will have until grace expires to sign the new agreement'
                placeholder='Grace period expires on..'
                localForm={form}
              />
            </div>
          </div>

          <div className='mt-6 flex justify-end'>
            <Button type='submit' rounded='full' disabled={!isValid || isLoading}>
              {isLoading ? 'Updating...' : 'Update Agreement'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}

export { UpdateAgreementModal };
