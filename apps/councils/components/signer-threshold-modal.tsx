import { Button } from '@chakra-ui/react';
import { Modal } from 'contexts';
import { SignerThresholdSubForm } from 'forms';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HatSignerGate } from 'types';

export function SignerThresholdModal({ signer }: { signer: HatSignerGate | undefined }) {
  const form = useForm();
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (!signer) return;

    reset({
      thresholdType: 'ABSOLUTE', // TODO handle in v2
      confirmationsRequired: signer.minThreshold, // TODO handle relative threshold in v2
      maxMembers: signer.maxSigners,
    });
  }, [signer, reset]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  if (!signer) return null;

  return (
    <Modal name='hsgThreshold' title='Signer Threshold'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-4'>
          <SignerThresholdSubForm form={form} />
        </div>

        <div className='flex justify-end py-6'>
          <Button type='submit' variant='primary'>
            Update Threshold
          </Button>
        </div>
      </form>
    </Modal>
  );
}
