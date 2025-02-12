import { HatDeco } from 'ui';

import { MailForms } from '../../../components/mail-forms';

const Mails = () => {
  return (
    <div className='mx-auto flex max-w-screen-md flex-col gap-6 pt-8'>
      <h1 className='text-center text-2xl font-bold'>Mail Room</h1>

      <MailForms />

      <HatDeco />
    </div>
  );
};

export default Mails;
