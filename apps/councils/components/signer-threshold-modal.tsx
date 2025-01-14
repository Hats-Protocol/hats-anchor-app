import { Button } from '@chakra-ui/react';
import { Modal } from 'contexts';
import { SignerThresholdSubForm } from 'forms';
import { get } from 'lodash';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppHat, HatSignerGateV2 } from 'types';

export function SignerThresholdModal({
  signer,
  signerHat,
}: {
  signer: HatSignerGateV2 | undefined;
  signerHat: AppHat | undefined;
}) {
  const form = useForm();
  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (!signer) return;

    reset({
      thresholdType: 'ABSOLUTE', // TODO handle in v2
      confirmationsRequired: signer.minThreshold, // TODO handle relative threshold in v2
      maxMembers: get(signerHat, 'maxSupply'),
    });
  }, [signer, signerHat, reset]);

  const onSubmit = (data: any) => {
    // TODO submit update
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
