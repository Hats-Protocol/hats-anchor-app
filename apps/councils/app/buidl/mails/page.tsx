import { MailForm } from '../../../components/mail-form';

const Mails = () => {
  return (
    <div className='mx-auto flex max-w-screen-md flex-col gap-6 pt-8'>
      <h1 className='text-center text-2xl font-bold'>Mail Test</h1>

      <MailForm />
    </div>
  );
};

export default Mails;
