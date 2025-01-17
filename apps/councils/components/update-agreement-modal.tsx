import { Button } from '@chakra-ui/react';
import { WriteFunction } from '@hatsprotocol/modules-sdk';
import { Modal } from 'contexts';
import { DatePicker, MarkdownEditor } from 'forms';
import useAgreement from 'libs/modules-hooks/src/useAgreementDetails';
import { find } from 'lodash';
import { useAgreementClaim, useAgreementDetails, useCallModuleFunction } from 'modules-hooks';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ModuleDetails, ModuleFunction, SupportedChains } from 'types';

export function UpdateAgreementModal({
  moduleDetails,
  chainId,
}: {
  moduleDetails: ModuleDetails;
  chainId: number | undefined;
}) {
  const form = useForm();
  const { handleSubmit, reset, watch } = form;
  const updatedAgreement = watch('agreement');

  const { mutateAsync: callModuleFn } = useCallModuleFunction({ chainId: chainId as SupportedChains });

  const { agreement } = useAgreementClaim({
    moduleParameters: moduleDetails.liveParameters,
  });

  const onSubmit = (data: any) => {
    console.log(data);
    const localGracePeriod = new Date(data.gracePeriod).getTime() / 1000;

    callModuleFn({
      moduleId: moduleDetails.implementationAddress,
      instance: moduleDetails.instanceAddress,
      func: find(moduleDetails.writeFunctions, (f: WriteFunction) => f.label === 'setAgreement') as ModuleFunction,
      args: [data.agreement, BigInt(localGracePeriod)],
    });
  };

  useEffect(() => {
    if (!agreement) return;
    const thirtyDaysFromNow = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();

    reset({ agreement, gracePeriod: thirtyDaysFromNow });
  }, [agreement]);

  return (
    <Modal name='updateAgreement' title='Update Agreement'>
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
          <Button type='submit' variant='primary' isDisabled={agreement === updatedAgreement}>
            Update Agreement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
