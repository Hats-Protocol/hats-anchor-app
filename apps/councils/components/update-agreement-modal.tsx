import { Button } from '@chakra-ui/react';
import { Modal } from 'contexts';
import { MarkdownEditor } from 'forms';
import { useForm } from 'react-hook-form';

export function UpdateAgreementModal() {
  const form = useForm();
  const { handleSubmit } = form;

  const onSubmit = (data: any) => {
    console.log(data);
  };
  // TODO set previous value

  return (
    <Modal name='updateAgreement' title='Update Agreement'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MarkdownEditor name='agreement' placeholder='Agreement text' localForm={form} />

        <div className='mt-6 flex justify-end'>
          <Button type='submit' variant='primary'>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
